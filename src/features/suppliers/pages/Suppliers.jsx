// Task 1: Suppliers ro'yxati sahifasi — qidiruv, filtr, pagination, KPI.
// Dashboard modulidagi StatCard qayta ishlatiladi (Task 6: mavjud
// komponentlarni qayta ishlatish).

import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Archive, Download, Plus, ShieldAlert, Star, Upload, Users } from "lucide-react";

import PageHeader from "../../../components/layout/PageHeader/PageHeader";
import { Button } from "../../../components/ui/Button/Button";
import { Loading } from "../../../components/ui/Loading/Loading";
import { Modal } from "../../../components/ui/Modal/Modal";
import { useNotification } from "../../../components/ui/Notification/NotificationContext";
import StatCard from "../../dashboard/components/StatCard/StatCard";
import AIWorkspace from "../../purchases/ai/components/AIWorkspace/AIWorkspace";
import usePurchasesStore from "../../purchases/hooks/usePurchasesStore";
import { getSupplierOutstandingDebt } from "../../purchases/utils/purchaseCalculations";
import { formatMoney } from "../../purchases/utils/purchaseMoney";
import ReportExportMenu from "../../purchases/components/ReportExportMenu/ReportExportMenu";
import { exportReportToCsv } from "../../purchases/utils/reportExport";
import SupplierConfirmDialog from "../components/SupplierConfirmDialog/SupplierConfirmDialog";
import SupplierFilters from "../components/SupplierFilters/SupplierFilters";
import SupplierForm from "../components/SupplierForm/SupplierForm";
import SupplierTable from "../components/SupplierTable/SupplierTable";
import {
  computeSupplierOperationalMetrics,
  computeSupplierScore,
  getCategoryLabel,
  hasSupplierPermission,
  parseSuppliersCsv,
  SUPPLIER_PERMISSIONS,
  SUPPLIER_STATUSES,
  supplierCurrentUser,
  useSuppliers,
} from "../suppliersApi";
import NotificationBell from "../../purchases/notifications/components/NotificationBell/NotificationBell";

import "./Suppliers.scss";

const SUPPLIER_EXPORT_COLUMNS = [
  { key: "name", label: "Nom", value: (row) => row.name },
  { key: "category", label: "Kategoriya", value: (row) => getCategoryLabel(row.categories?.[0]) || row.category },
  { key: "phone", label: "Telefon", value: (row) => row.phone },
  { key: "email", label: "Email", value: (row) => row.email },
  { key: "stir", label: "STIR", value: (row) => row.stir },
  { key: "status", label: "Holat", value: (row) => row.status },
  { key: "leadTimeDays", label: "Yetkazish (kun)", value: (row) => row.leadTimeDays },
  { key: "creditLimit", label: "Kredit limiti", value: (row) => row.creditLimit },
];

const PAGE_SIZE = 8;

const Suppliers = () => {
  const navigate = useNavigate();
  const notify = useNotification();
  const { suppliers, actions } = useSuppliers();
  const { orders, receipts, returns, invoices } = usePurchasesStore();

  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    status: "all",
    showArchived: false,
  });
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkArchiveRequest, setBulkArchiveRequest] = useState(false);
  const [archiveRequest, setArchiveRequest] = useState(null);
  const [busy, setBusy] = useState(false);
  const importInputRef = useRef(null);

  // RBAC (PDF §84): bitta hardcoded actor (owner) — Purchases modulidagi
  // bilan bir xil cheklov, real login ulanganda `supplierCurrentUser.role`
  // haqiqiy foydalanuvchidan keladi, quyidagi tekshiruvlar o'zgarishsiz
  // ishlaydi.
  const can = (permission) =>
    hasSupplierPermission(supplierCurrentUser.role, permission);
  // Quick-filter kartalari uchun faqat "reyting bo'yicha saralash" o'lchovi
  // mavjud filtr state'ida yo'q edi — shu bitta yengil bayroq qo'shildi.
  // Status asosidagi 3 karta esa mavjud `filters.status` (yagona manba,
  // SupplierFilters dropdown bilan bir xil) ni to'g'ridan-to'g'ri yozadi —
  // yangi/dublikat state yaratilmaydi.
  const [sortByRating, setSortByRating] = useState(false);

  const setFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
    setSelectedIds([]);
  };

  // Status-kartalar: "faqat bitta karta aktiv" qoidasi uchun reyting
  // saralashni o'chiradi va mavjud status filtrini (dropdown bilan bir xil
  // state) yagona manba sifatida yangilaydi.
  const toggleStatusCard = (value) => {
    setSortByRating(false);
    setFilter("status", filters.status === value ? "all" : value);
  };

  // Reyting kartasi: status filtrini "all"ga qaytaradi (faqat bitta karta
  // aktiv bo'lishi uchun) va joriy (allaqachon filtrlangan) ro'yxatni
  // reyting bo'yicha saralaydi — yangi massiv/so'rov yaratilmaydi.
  const toggleRatingSort = () => {
    setFilter("status", "all");
    setSortByRating((current) => !current);
  };

  const getDebt = (supplierId) =>
    getSupplierOutstandingDebt(invoices, supplierId);

  // Supplier Score (Enterprise): ro'yxat/KPI/saralash — barchasi shu YAGONA
  // hisoblash funksiyasidan foydalanadi (suppliersApi.js), Supplier profili
  // bilan bir xil formula (Consistency: "Duplicate logic bo'lmasin").
  //
  // Performance/Hook Quality fix: ilgari shu hisoblash (har supplier uchun
  // to'liq orders/receipts/returns/invoices bo'yicha filtrlash) ikkita
  // ALOHIDA useMemo (filteredSuppliers va kpis) ichida, bir-biridan
  // mustaqil ravishda takror chaqirilardi — bitta useMemo'da bir marta
  // hisoblanadigan Map ikkalasida ham qayta ishlatiladi.
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

  const filteredSuppliers = useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    const base = suppliers.filter((supplier) => {
      const matchesQuery =
        !query ||
        supplier.name.toLowerCase().includes(query) ||
        supplier.phone.includes(query) ||
        supplier.stir.includes(query);

      const matchesCategory =
        filters.category === "all" ||
        supplier.categories?.includes(filters.category);

      const matchesStatus =
        filters.status === "all" || supplier.status === filters.status;

      // Archive / Restore (Enterprise): arxivlangan supplierlar standart
      // ro'yxatda ko'rinmaydi (soft-delete) — faqat "Arxivlanganlar" belgisi
      // yoqilganda ko'rsatiladi.
      const matchesArchived = filters.showArchived || !supplier.archived;

      return matchesQuery && matchesCategory && matchesStatus && matchesArchived;
    });

    // Quick-filter: "O'rtacha reyting" kartasi bosilganda ALLAQACHON
    // filtrlangan ro'yxat reyting bo'yicha kamayish tartibida saralanadi —
    // filtrlash mantig'i qayta yozilmaydi, faqat bitta qo'shimcha qadam.
    // Statik `score` o'rniga endi avtomatik hisoblangan qiymat bilan
    // saralanadi (audit: "Supplier Score deyarli statik").
    return sortByRating
      ? [...base].sort(
          (a, b) =>
            (supplierScoreById.get(b.id) ?? 0) - (supplierScoreById.get(a.id) ?? 0),
        )
      : base;
  }, [suppliers, filters, sortByRating, supplierScoreById]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSuppliers.length / PAGE_SIZE),
  );
  const pagedSuppliers = filteredSuppliers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const kpis = useMemo(() => {
    const activeCount = suppliers.filter(
      (entry) => entry.status === SUPPLIER_STATUSES.active,
    ).length;
    const blockedCount = suppliers.filter(
      (entry) => entry.status === SUPPLIER_STATUSES.blocked,
    ).length;
    const avgScore = suppliers.length
      ? Math.round(
          suppliers.reduce(
            (sum, entry) => sum + (supplierScoreById.get(entry.id) ?? 0),
            0,
          ) / suppliers.length,
        )
      : 0;

    return { activeCount, blockedCount, avgScore };
  }, [suppliers, supplierScoreById]);

  // ---------- Bulk actions (Enterprise) ----------
  const toggleSelect = (id) =>
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  const toggleSelectAll = (checked) =>
    setSelectedIds(checked ? pagedSuppliers.map((supplier) => supplier.id) : []);

  const selectedSuppliers = suppliers.filter((supplier) => selectedIds.includes(supplier.id));

  const runBulkArchive = () => {
    // Loading state: haqiqiy tarmoq so'rovi hali yo'q (localStorage), lekin
    // tugma darhol qayta bosilishini oldini olish uchun (va backend ulanganda
    // shu bitta joy haqiqiy `await`ga almashtiriladi) — button holati
    // himoyalanadi.
    setBusy(true);

    selectedIds.forEach((id) => actions.archiveSupplier(id));

    Promise.resolve().then(() => {
      setBusy(false);
      notify.success(`${selectedIds.length} ta yetkazib beruvchi arxivlandi.`);
      setSelectedIds([]);
      setBulkArchiveRequest(false);
    });
  };

  const handleExportSelected = () => {
    const rows = selectedIds.length ? selectedSuppliers : filteredSuppliers;

    return {
      title: "Yetkazib beruvchilar ro'yxati",
      subtitle: `Jami ${rows.length} ta yozuv`,
      columns: SUPPLIER_EXPORT_COLUMNS,
      rows,
      filename: "suppliers",
    };
  };

  const handleImportFile = (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";
    if (!file) return;

    setBusy(true);

    const reader = new FileReader();

    reader.onload = () => {
      const rows = parseSuppliersCsv(String(reader.result || ""));
      const result = actions.importSuppliers(rows);

      setBusy(false);

      if (result.created) {
        notify.success(
          `${result.created} ta yetkazib beruvchi import qilindi${
            result.skipped ? `, ${result.skipped} ta o'tkazib yuborildi` : ""
          }.`,
        );
      } else {
        notify.error("Hech qanday yetkazib beruvchi import qilinmadi — faylni tekshiring.");
      }
    };

    reader.onerror = () => {
      setBusy(false);
      notify.error("Fayl o'qilmadi. Qaytadan urinib ko'ring.");
    };

    reader.readAsText(file);
  };

  // Step 2: yaratishdan keyin darhol Supplier Detail sahifasiga o'tiladi —
  // barcha ilg'or sozlash (kategoriya, mahsulot, kredit, holat) shu yerda
  // amalga oshiriladi, modal esa faqat yaratish uchun (Step 1/3).
  const handleCreate = (payload) => {
    const created = actions.createSupplier(payload);

    if (created) {
      setCreateOpen(false);
      notify.success(`"${created.name}" yetkazib beruvchi sifatida qo'shildi.`);
      navigate(`/suppliers/${created.id}`);
      return;
    }

    // Edge case (auditda ko'rsatilmagan): SupplierForm STIR takrorini
    // submitdan oldin tekshiradi, lekin nazariy poyga holatida (masalan
    // boshqa oynada bir vaqtda yaratilsa) store baribir jimgina rad etadi —
    // ilgari modal hech qanday tushuntirishsiz ochiq qolib ketardi.
    notify.error(
      "Yetkazib beruvchi yaratilmadi — STIR band bo'lishi mumkin. Qaytadan urinib ko'ring.",
    );
  };

  return (
    <div className="suppliers-page">
      <PageHeader
        title="Yetkazib beruvchilar"
        description="Barcha yetkazib beruvchilarni qidiring, filtrlang va boshqaring."
        actions={
          <>
            <NotificationBell />

            {busy && <Loading label="Bajarilmoqda..." />}

            {/* Import / Export (Enterprise) — RBAC bilan cheklangan: ruxsat
                bo'lmasa tugmalar ko'rsatilmaydi. */}
            {can(SUPPLIER_PERMISSIONS.import) && (
              <>
                <input
                  ref={importInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  hidden
                  onChange={handleImportFile}
                />
                <Button
                  variant="secondary"
                  leftIcon={<Upload size={15} />}
                  disabled={busy}
                  onClick={() => importInputRef.current?.click()}
                >
                  Import (CSV)
                </Button>
              </>
            )}

            {can(SUPPLIER_PERMISSIONS.export) && (
              <ReportExportMenu getExportPayload={handleExportSelected} disabled={busy} />
            )}

            {can(SUPPLIER_PERMISSIONS.create) && (
              <Button
                variant="primary"
                leftIcon={<Plus size={16} />}
                onClick={() => setCreateOpen(true)}
              >
                Yangi yetkazib beruvchi
              </Button>
            )}
          </>
        }
      />

      {selectedIds.length > 0 && (
        <div className="suppliers-page__bulk-bar">
          <span>{selectedIds.length} ta tanlandi</span>

          {can(SUPPLIER_PERMISSIONS.export) && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Download size={14} />}
              onClick={() => exportReportToCsv(handleExportSelected())}
              disabled={busy}
            >
              Tanlanganlarni eksport
            </Button>
          )}

          {can(SUPPLIER_PERMISSIONS.archive) && (
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Archive size={14} />}
              onClick={() => setBulkArchiveRequest(true)}
              disabled={busy}
            >
              Arxivlash
            </Button>
          )}

          <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
            Bekor qilish
          </Button>
        </div>
      )}

      {/* Quick-filter: har bir karta mavjud filtr state'ini (yoki reyting
          saralashni) o'rnatadi — StatCard (Dashboard moduliga tegishli,
          o'zgartirilmaydi) tashqi tugma bilan o'raladi, aktiv holat shu
          o'ram orqali ko'rsatiladi. */}
      <section className="suppliers-page__stats">
        <button
          type="button"
          className={[
            "suppliers-page__stat-trigger",
            filters.status === "all" && !sortByRating
              ? "suppliers-page__stat-trigger--active"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-pressed={filters.status === "all" && !sortByRating}
          onClick={() => toggleStatusCard("all")}
        >
          <StatCard
            title="Jami yetkazib beruvchi"
            value={String(suppliers.length)}
            change="—"
            previous="Bazadagi umumiy yetkazib beruvchi"
            icon={Users}
            color="blue"
            priority="primary"
          />
        </button>

        <button
          type="button"
          className={[
            "suppliers-page__stat-trigger",
            filters.status === SUPPLIER_STATUSES.active
              ? "suppliers-page__stat-trigger--active"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-pressed={filters.status === SUPPLIER_STATUSES.active}
          onClick={() => toggleStatusCard(SUPPLIER_STATUSES.active)}
        >
          <StatCard
            title="Faol yetkazib beruvchi"
            value={String(kpis.activeCount)}
            change="—"
            previous="Yaqinda xarid qilingan"
            icon={Users}
            color="green"
          />
        </button>

        <button
          type="button"
          className={[
            "suppliers-page__stat-trigger",
            filters.status === SUPPLIER_STATUSES.blocked
              ? "suppliers-page__stat-trigger--active"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-pressed={filters.status === SUPPLIER_STATUSES.blocked}
          onClick={() => toggleStatusCard(SUPPLIER_STATUSES.blocked)}
        >
          <StatCard
            title="Bloklangan"
            value={String(kpis.blockedCount)}
            change="—"
            previous="Qora ro'yxatdagi yetkazib beruvchilar"
            icon={ShieldAlert}
            color="orange"
          />
        </button>

        <button
          type="button"
          className={[
            "suppliers-page__stat-trigger",
            sortByRating ? "suppliers-page__stat-trigger--active" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-pressed={sortByRating}
          onClick={toggleRatingSort}
        >
          <StatCard
            title="O'rtacha reyting"
            value={`${kpis.avgScore}/100`}
            change="—"
            previous="Yetkazib beruvchilar sifat bahosi"
            icon={Star}
            color="purple"
          />
        </button>
      </section>

      <AIWorkspace
        title="AI tavsiya — yetkazib beruvchilar"
        compact
        hideSummary
        maxItems={3}
        scopeFilter={(insight) => insight.category === "supplier"}
        emptyText="Hozircha yetkazib beruvchilar bo'yicha AI tavsiyasi yo'q."
      />

      <SupplierFilters filters={filters} onChange={setFilter} />

      <SupplierTable
        suppliers={pagedSuppliers}
        getDebt={getDebt}
        getScore={getScore}
        formatMoney={formatMoney}
        onView={(supplier) => navigate(`/suppliers/${supplier.id}`)}
        onEdit={(supplier) => navigate(`/suppliers/${supplier.id}?edit=1`)}
        selectable={can(SUPPLIER_PERMISSIONS.bulk)}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        canArchive={can(SUPPLIER_PERMISSIONS.archive)}
        canRestore={can(SUPPLIER_PERMISSIONS.restore)}
        onArchive={(supplier) => setArchiveRequest(supplier)}
        onRestore={(supplier) => {
          actions.restoreSupplier(supplier.id);
          notify.success(`"${supplier.name}" arxivdan tiklandi.`);
        }}
      />

      {filteredSuppliers.length > 0 && (
        <div className="suppliers-page__pagination">
          <span>
            Jami {filteredSuppliers.length} ta · {page}/{totalPages}-sahifa
          </span>
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Oldingi
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Keyingi
          </button>
        </div>
      )}

      <Modal
        open={createOpen}
        title="Yangi yetkazib beruvchi"
        description="Faqat asosiy rekvizit — kategoriya, mahsulot, kredit va boshqa sozlamalar keyinroq yetkazib beruvchi profilida beriladi."
        onClose={() => setCreateOpen(false)}
      >
        <SupplierForm
          suppliers={suppliers}
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>

      <SupplierConfirmDialog
        open={!!archiveRequest}
        tone="warning"
        title="Yetkazib beruvchini arxivlash"
        description={`"${archiveRequest?.name || ""}" arxivlanadi — ro'yxatda ko'rinmay qoladi va yangi xarid buyurtmalarida tanlanmaydi. Istalgan vaqt tiklashingiz mumkin.`}
        confirmLabel="Ha, arxivlash"
        onConfirm={() => {
          actions.archiveSupplier(archiveRequest.id);
          notify.success(`"${archiveRequest.name}" arxivlandi.`);
          setArchiveRequest(null);
        }}
        onClose={() => setArchiveRequest(null)}
      />

      <SupplierConfirmDialog
        open={bulkArchiveRequest}
        tone="warning"
        title="Tanlanganlarni arxivlash"
        description={`${selectedIds.length} ta yetkazib beruvchi arxivlanadi — ro'yxatda ko'rinmay qoladi. Istalgan vaqt tiklashingiz mumkin.`}
        confirmLabel="Ha, arxivlash"
        onConfirm={runBulkArchive}
        onClose={() => setBulkArchiveRequest(false)}
      />
    </div>
  );
};

export default Suppliers;
