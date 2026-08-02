import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import usePurchasesStore from "../../purchases/hooks/usePurchasesStore";
import { getSupplierOutstandingDebt } from "../../purchases/utils/purchaseCalculations";
import { formatMoney } from "../../purchases/utils/purchaseMoney";
import { exportReportToCsv } from "../../purchases/utils/reportExport";
import {
  computeSupplierOperationalMetrics,
  computeSupplierScore,
  getCategoryLabel,
  hasSupplierPermission,
  parseSuppliersCsv,
  SUPPLIER_PERMISSIONS,
  SUPPLIER_STATUS_LABELS,
  SUPPLIER_STATUSES,
  supplierCurrentUser,
  useSuppliers,
} from "../suppliersApi";

const DEFAULT_PAGE_SIZE = 8;
const PAGE_SIZE_OPTIONS = [8, 16, 32];

const INITIAL_FILTERS = {
  search: "",
  category: "all",
  status: "all",
  showArchived: false,
  sortBy: "name",
  sortDirection: "asc",
};

const SUPPLIER_EXPORT_COLUMNS = [
  { key: "name", label: "Nom", value: (row) => row.name },
  {
    key: "category",
    label: "Kategoriya",
    value: (row) => getCategoryLabel(row.categories?.[0]) || row.category,
  },
  { key: "phone", label: "Telefon", value: (row) => row.phone },
  { key: "email", label: "Email", value: (row) => row.email },
  { key: "stir", label: "STIR", value: (row) => row.stir },
  {
    key: "status",
    label: "Holat",
    value: (row) => SUPPLIER_STATUS_LABELS[row.status] || "Noma'lum holat",
  },
  { key: "leadTimeDays", label: "Yetkazish (kun)", value: (row) => row.leadTimeDays },
  { key: "creditLimit", label: "Kredit limiti", value: (row) => row.creditLimit },
];

const isRecentOperationalSupplier = (supplier, orders) => {
  if (supplier.archived || supplier.status !== SUPPLIER_STATUSES.active) return false;

  const lastOrder = orders
    .filter((order) => order.supplierId === supplier.id)
    .map((order) => new Date(order.createdAt || order.expectedDate || 0).getTime())
    .filter(Number.isFinite)
    .sort((a, b) => b - a)[0];

  if (!lastOrder) return false;

  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;

  return Date.now() - lastOrder <= ninetyDaysMs;
};

const compareCounts = (current, previous) => {
  if (!previous && !current) return { change: "0%", trend: "up", previous: "Oldingi davrda o'zgarish yo'q" };
  if (!previous) return { change: "+100%", trend: "up", previous: "Oldingi davrda 0 ta" };

  const percent = Math.round(((current - previous) / previous) * 100);

  return {
    change: `${percent >= 0 ? "+" : ""}${percent}%`,
    trend: percent < 0 ? "down" : "up",
    previous: `Oldingi davr: ${previous}`,
  };
};

const buildPeriodStats = (suppliers) => {
  const now = Date.now();
  const periodMs = 30 * 24 * 60 * 60 * 1000;
  const currentStart = now - periodMs;
  const previousStart = now - periodMs * 2;

  return suppliers.reduce(
    (acc, supplier) => {
      const createdAt = new Date(supplier.createdAt || 0).getTime();

      if (!Number.isFinite(createdAt)) return acc;
      if (createdAt >= currentStart) acc.current += 1;
      else if (createdAt >= previousStart) acc.previous += 1;

      return acc;
    },
    { current: 0, previous: 0 },
  );
};

const buildFilterSummary = (filters, quickFilter) => {
  const chips = [];

  if (quickFilter && quickFilter !== "all") {
    const labels = {
      active: "KPI: faol",
      blocked: "KPI: bloklangan",
      archived: "KPI: arxivlangan",
      rating: "KPI: reyting",
    };
    chips.push(labels[quickFilter]);
  }
  if (filters.search.trim()) chips.push(`Qidiruv: ${filters.search.trim()}`);
  if (filters.category !== "all") chips.push(`Kategoriya: ${getCategoryLabel(filters.category) || "Noma'lum kategoriya"}`);
  if (filters.status !== "all") chips.push(`Holat: ${SUPPLIER_STATUS_LABELS[filters.status] || "Noma'lum holat"}`);
  if (filters.showArchived) chips.push("Arxivlanganlar ko'rsatilmoqda");

  return chips.filter(Boolean);
};

export const useSuppliersController = ({ navigate, notify }) => {
  const { suppliers, actions } = useSuppliers();
  const { orders, receipts, returns, invoices } = usePurchasesStore();
  const importInputRef = useRef(null);

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [quickFilter, setQuickFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selectedIds, setSelectedIds] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [archiveRequest, setArchiveRequest] = useState(null);
  const [bulkArchiveRequest, setBulkArchiveRequest] = useState(false);
  const [busy, setBusy] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const can = (permission) =>
    hasSupplierPermission(supplierCurrentUser.role, permission);

  const supplierScoreById = useMemo(() => {
    const scores = new Map();

    suppliers.forEach((supplier) => {
      const metrics = computeSupplierOperationalMetrics(
        { orders, receipts, returns, invoices },
        supplier.id,
      );

      scores.set(supplier.id, computeSupplierScore(supplier, metrics));
    });

    return scores;
  }, [suppliers, orders, receipts, returns, invoices]);

  const getScore = (supplierId) => supplierScoreById.get(supplierId) ?? 0;
  const getDebt = useCallback(
    (supplierId) => getSupplierOutstandingDebt(invoices, supplierId),
    [invoices],
  );

  const setFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setQuickFilter("custom");
    setPage(1);
    setSelectedIds([]);
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setQuickFilter("all");
    setPage(1);
    setSelectedIds([]);
  };

  const applyQuickFilter = (value) => {
    setSelectedIds([]);
    setPage(1);
    setQuickFilter((current) => (current === value ? "all" : value));

    setFilters((current) => {
      if (quickFilter === value) return INITIAL_FILTERS;

      if (value === "active") {
        return { ...current, status: SUPPLIER_STATUSES.active, showArchived: false, sortBy: "name", sortDirection: "asc" };
      }
      if (value === "blocked") {
        return { ...current, status: SUPPLIER_STATUSES.blocked, showArchived: false, sortBy: "name", sortDirection: "asc" };
      }
      if (value === "archived") {
        return { ...current, status: "all", showArchived: true, sortBy: "name", sortDirection: "asc" };
      }
      if (value === "rating") {
        return { ...current, status: "all", showArchived: false, sortBy: "score", sortDirection: "desc" };
      }

      return INITIAL_FILTERS;
    });
  };

  const filteredSuppliers = useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    const base = suppliers.filter((supplier) => {
      const matchesQuery =
        !query ||
        [supplier.name, supplier.phone, supplier.email, supplier.stir, supplier.contactPerson]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      const matchesCategory =
        filters.category === "all" ||
        supplier.categories?.includes(filters.category);

      const matchesStatus =
        filters.status === "all" || supplier.status === filters.status;

      const matchesArchived =
        quickFilter === "archived" ? supplier.archived : filters.showArchived || !supplier.archived;

      return matchesQuery && matchesCategory && matchesStatus && matchesArchived;
    });

    const direction = filters.sortDirection === "desc" ? -1 : 1;
    const sorters = {
      name: (supplier) => supplier.name?.toLowerCase() || "",
      score: (supplier) => supplierScoreById.get(supplier.id) ?? 0,
      leadTimeDays: (supplier) => Number(supplier.leadTimeDays) || 0,
      debt: (supplier) => getDebt(supplier.id),
      status: (supplier) => SUPPLIER_STATUS_LABELS[supplier.status] || supplier.status || "",
    };
    const getter = sorters[filters.sortBy] || sorters.name;

    return [...base].sort((a, b) => {
      const first = getter(a);
      const second = getter(b);
      if (typeof first === "number" && typeof second === "number") {
        return (first - second) * direction;
      }

      return String(first).localeCompare(String(second), "uz") * direction;
    });
  }, [suppliers, filters, quickFilter, supplierScoreById, getDebt]);

  const totalPages = Math.max(1, Math.ceil(filteredSuppliers.length / pageSize));

  useEffect(() => {
    setPage((current) => Math.min(Math.max(current, 1), totalPages));
  }, [totalPages]);

  const pagedSuppliers = filteredSuppliers.slice((page - 1) * pageSize, page * pageSize);
  const selectedSuppliers = suppliers.filter((supplier) => selectedIds.includes(supplier.id));
  const filterSummary = buildFilterSummary(filters, quickFilter);

  const kpis = useMemo(() => {
    const notArchived = suppliers.filter((supplier) => !supplier.archived);
    const periodStats = buildPeriodStats(notArchived);
    const periodCompare = compareCounts(periodStats.current, periodStats.previous);
    const activeCount = notArchived.filter((supplier) =>
      isRecentOperationalSupplier(supplier, orders),
    ).length;
    const blockedCount = notArchived.filter(
      (supplier) => supplier.status === SUPPLIER_STATUSES.blocked,
    ).length;
    const archivedCount = suppliers.filter((supplier) => supplier.archived).length;
    const avgScore = notArchived.length
      ? Math.round(
          notArchived.reduce(
            (sum, supplier) => sum + (supplierScoreById.get(supplier.id) ?? 0),
            0,
          ) / notArchived.length,
        )
      : 0;

    return [
      {
        id: "all",
        title: "Jami yetkazib beruvchi",
        value: String(notArchived.length),
        change: periodCompare.change,
        previous: periodCompare.previous,
        trend: periodCompare.trend,
        tone: "blue",
      },
      {
        id: "active",
        title: "Operatsion faol",
        value: String(activeCount),
        change: `${Math.round((activeCount / Math.max(notArchived.length, 1)) * 100)}%`,
        previous: "Status va oxirgi 90 kunlik xarid asosida",
        trend: "up",
        tone: "green",
      },
      {
        id: "blocked",
        title: "Bloklangan",
        value: String(blockedCount),
        change: `${blockedCount}`,
        previous: "Xarid operatsiyasi cheklangan",
        trend: blockedCount ? "down" : "up",
        tone: "orange",
      },
      {
        id: "archived",
        title: "Arxivlangan",
        value: String(archivedCount),
        change: `${archivedCount}`,
        previous: "Soft-delete lifecycle",
        trend: archivedCount ? "down" : "up",
        tone: "slate",
      },
      {
        id: "rating",
        title: "O'rtacha reyting",
        value: `${avgScore}/100`,
        change: avgScore >= 80 ? "Yuqori" : avgScore >= 50 ? "O'rta" : "Past",
        previous: "Composite score formulasi bo'yicha",
        trend: avgScore >= 50 ? "up" : "down",
        tone: "purple",
      },
    ];
  }, [suppliers, orders, supplierScoreById]);

  const handleSort = (sortBy) => {
    setFilters((current) => ({
      ...current,
      sortBy,
      sortDirection:
        current.sortBy === sortBy && current.sortDirection === "asc" ? "desc" : "asc",
    }));
  };

  const toggleSelect = (id) =>
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  const toggleSelectPage = (checked) =>
    setSelectedIds((current) => {
      const pageIds = pagedSuppliers.map((supplier) => supplier.id);
      if (!checked) return current.filter((id) => !pageIds.includes(id));

      return Array.from(new Set([...current, ...pageIds]));
    });

  const selectAllFiltered = () =>
    setSelectedIds(filteredSuppliers.map((supplier) => supplier.id));

  const buildExportPayload = () => {
    const rows = selectedIds.length ? selectedSuppliers : filteredSuppliers;

    return {
      title: "Yetkazib beruvchilar ro'yxati",
      subtitle: `Jami ${rows.length} ta yozuv`,
      columns: SUPPLIER_EXPORT_COLUMNS,
      rows,
      filename: "suppliers",
    };
  };

  const exportSelectedCsv = () => exportReportToCsv(buildExportPayload());

  const handleCreate = (payload) => {
    setBusy(true);
    const result = actions.createSupplier(payload);
    setBusy(false);

    const created = result?.supplier || result;

    if (created) {
      setCreateOpen(false);
      notify.success(`"${created.name}" yetkazib beruvchi sifatida qo'shildi.`);
      navigate(`/suppliers/${created.id}`);
      return;
    }

    notify.error(result?.error || "Yetkazib beruvchi yaratilmadi.");
  };

  const archiveSupplier = (supplier, reason = "") => {
    const result = actions.archiveSupplier(supplier.id, reason);

    if (result?.ok === false) {
      notify.error(result.error);
      return;
    }

    notify.success(`"${supplier.name}" arxivlandi.`);
    setArchiveRequest(null);
  };

  const restoreSupplier = (supplier) => {
    const result = actions.restoreSupplier(supplier.id);

    if (result?.ok === false) {
      notify.error(result.error);
      return;
    }

    notify.success(`"${supplier.name}" arxivdan tiklandi.`);
  };

  const runBulkArchive = (reason = "") => {
    setBusy(true);
    const results = selectedIds.map((id) => actions.archiveSupplier(id, reason));
    const failed = results.filter((result) => result?.ok === false);

    setBusy(false);
    setBulkArchiveRequest(false);

    if (failed.length) {
      notify.error(`${failed.length} ta yozuv arxivlanmadi.`);
      return;
    }

    notify.success(`${selectedIds.length} ta yetkazib beruvchi arxivlandi.`);
    setSelectedIds([]);
  };

  const handleImportFile = (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!["csv", "txt"].includes(extension)) {
      const result = {
        created: 0,
        skipped: 1,
        errors: ["XLSX import adapteri uchun kutubxona ulanmagan. Hozircha CSV fayl yuklang."],
        stage: "format",
      };
      setImportResult(result);
      notify.error("Fayl formati hozircha qo'llab-quvvatlanmaydi.");
      return;
    }

    setBusy(true);
    const reader = new FileReader();

    reader.onload = () => {
      const rows = parseSuppliersCsv(String(reader.result || ""));
      const result = actions.importSuppliers(rows);

      setBusy(false);
      setImportResult({ ...result, stage: "completed" });

      if (result.created) {
        notify.success(`${result.created} ta yetkazib beruvchi import qilindi.`);
      } else {
        notify.error("Hech qanday yetkazib beruvchi import qilinmadi.");
      }
    };

    reader.onerror = () => {
      setBusy(false);
      const result = {
        created: 0,
        skipped: 1,
        errors: ["Fayl o'qilmadi. Qaytadan urinib ko'ring."],
        stage: "read",
      };
      setImportResult(result);
      notify.error(result.errors[0]);
    };

    reader.readAsText(file);
  };

  return {
    suppliers,
    filters,
    filterSummary,
    quickFilter,
    page,
    pageSize,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    totalPages,
    pagedSuppliers,
    filteredCount: filteredSuppliers.length,
    selectedIds,
    selectedSuppliers,
    createOpen,
    archiveRequest,
    bulkArchiveRequest,
    busy,
    importInputRef,
    importResult,
    kpis,
    permissions: {
      canCreate: can(SUPPLIER_PERMISSIONS.create),
      canImport: can(SUPPLIER_PERMISSIONS.import),
      canExport: can(SUPPLIER_PERMISSIONS.export),
      canBulk: can(SUPPLIER_PERMISSIONS.bulk),
      canArchive: can(SUPPLIER_PERMISSIONS.archive),
      canRestore: can(SUPPLIER_PERMISSIONS.restore),
    },
    getDebt,
    getScore,
    formatMoney,
    setFilter,
    resetFilters,
    applyQuickFilter,
    setPage,
    setPageSize: (value) => {
      setPageSize(Number(value) || DEFAULT_PAGE_SIZE);
      setPage(1);
    },
    setCreateOpen,
    setArchiveRequest,
    setBulkArchiveRequest,
    setImportResult,
    handleSort,
    toggleSelect,
    toggleSelectPage,
    clearSelection: () => setSelectedIds([]),
    selectAllFiltered,
    buildExportPayload,
    exportSelectedCsv,
    handleCreate,
    archiveSupplier,
    restoreSupplier,
    runBulkArchive,
    handleImportFile,
  };
};
