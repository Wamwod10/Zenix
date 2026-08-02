import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import {
  calculateAvailableStock,
  calculateMargin,
  calculateMarkup,
  calculateProfit,
  createProductEntityId,
  detectDuplicateProduct,
  generateBarcode,
  generateSKU,
  getStockStatus,
  summarizeStock,
  toNumber,
  validateProduct,
} from "../utils/productCalculations";
import {
  productStorageKeys,
  safeStorageRead,
  safeStorageWrite,
} from "../utils/productStorage";
import { canProduct } from "../utils/productPermissions";
import useProductsStorage from "./useProductsStorage";

const defaultFilters = {
  categoryId: "all",
  brandId: "all",
  status: "all",
  stockStatus: "all",
  warehouse: "all",
  approvalStatus: "all",
  priceMin: "",
  priceMax: "",
  marginMin: "",
  tag: "all",
  missingData: "all",
};

const now = () => new Date().toISOString();

const generateProductId = createProductEntityId;

const normalizeViewMode = (value) => (["table", "grid", "compact"].includes(value) ? value : "table");

const normalizePageSize = (value) => {
  const size = toNumber(value, 10);
  return [6, 10, 20, 50].includes(size) ? size : 10;
};

const clampFilterValue = (key, value, currentFilters) => {
  if (key === "marginMin") {
    if (value === "") return "";
    return String(Math.min(100, Math.max(0, toNumber(value))));
  }

  if (key === "priceMin" || key === "priceMax") {
    if (value === "") return "";
    const number = Math.max(0, toNumber(value));
    const other = key === "priceMin" ? currentFilters.priceMax : currentFilters.priceMin;

    if (other !== "") {
      const otherNumber = toNumber(other);
      return String(key === "priceMin" ? Math.min(number, otherNumber) : Math.max(number, otherNumber));
    }

    return String(number);
  }

  return value;
};

const createUniqueSku = ({ name, category, brand, prefix, sequence, products }) => {
  const usedSkus = new Set(products.map((item) => String(item.sku || "").toLowerCase()));
  let attempt = 0;
  let sku = "";

  do {
    sku = generateSKU({
      name,
      category,
      brand,
      prefix,
      sequence: sequence + attempt,
    });
    attempt += 1;
  } while (usedSkus.has(sku.toLowerCase()));

  return sku;
};

const normalizeProduct = (product, state) => {
  const category = state.categories.find((item) => item.id === product.categoryId);
  const brand = state.brands.find((item) => item.id === product.brandId);
  const unit = state.units.find((item) => item.id === product.unitId);
  const stock = summarizeStock(product.stockSummary);
  const margin = calculateMargin(product.price, product.cost);
  const markup = calculateMarkup(product.price, product.cost);

  return {
    ...product,
    category,
    brand,
    unit,
    stock,
    stockStatus: getStockStatus(product),
    profit: calculateProfit(product.price, product.cost),
    margin,
    markup,
  };
};

const buildAiInsights = (products) => {
  const lowMargin = products.find((item) => item.margin < 18 && item.status === "active");
  const missingMedia = products.find((item) => !item.media?.length);
  const duplicate = products.find((item, index) =>
    detectDuplicateProduct(item, products.slice(index + 1)).length,
  );
  const lowStock = products.find((item) => item.stockStatus === "low");
  const dead = products.find((item) => item.sales30d <= 5 && item.stock.available > 20);
  const crossSell = products.find((item) => item.relations?.length);

  return [
    lowMargin && {
      id: "ai-low-margin",
      type: "margin",
      title: `${lowMargin.name} marjasi past`,
      message: `${Math.round(lowMargin.margin)}% marja. Eng past narx va chegirma qoidasi tekshirilsin.`,
      actionLabel: "Tasdiqqa yuborish",
      productId: lowMargin.id,
    },
    missingMedia && {
      id: "ai-missing-media",
      type: "missing",
      title: `${missingMedia.name} rasmi yetishmayapti`,
      message: "Savdo nuqtasi va mijozlar oynasida rasm kerak bo'ladi.",
      actionLabel: "Namuna rasm qo'shish",
      productId: missingMedia.id,
    },
    duplicate && {
      id: "ai-duplicate",
      type: "duplicate",
      title: "Takrorlanishi mumkin bo'lgan mahsulot aniqlandi",
      message: `${duplicate.name} artikul, shtrix-kod yoki nom bo'yicha tekshiruv talab qiladi.`,
      actionLabel: "Auditga belgilash",
      productId: duplicate.id,
    },
    lowStock && {
      id: "ai-reorder",
      type: "reorder",
      title: `${lowStock.name} qayta buyurtma signali`,
      message: "Ombor operatsiyasi yaratilmaydi, faqat xarid va ombor bo'limiga signal qo'yiladi.",
      actionLabel: "Qayta buyurtma xabari",
      productId: lowStock.id,
    },
    dead && {
      id: "ai-dead",
      type: "dead",
      title: `${dead.name} sekin aylanmoqda`,
      message: "To'plam, chegirma yoki qo'shimcha savdo aksiyasi tavsiya qilinadi.",
      actionLabel: "Aksiya qoralamasi",
      productId: dead.id,
    },
    crossSell && {
      id: "ai-cross-sell",
      type: "cross-sell",
      title: `${crossSell.name} qo'shimcha savdoga tayyor`,
      message: "Bog'langan mahsulotlar asosida savdo nuqtasi va mijozlar yordamchisiga tavsiya chiqariladi.",
      actionLabel: "Belgi qo'shish",
      productId: crossSell.id,
    },
  ].filter(Boolean);
};

const aiInsightTypeLabels = {
  margin: "marja",
  missing: "yetishmayotgan ma'lumot",
  duplicate: "takror mahsulot",
  reorder: "qayta buyurtma",
  dead: "sekin aylanma",
  cross: "qo'shimcha savdo",
  forecast: "talab bashorati",
};

const useProductsController = () => {
  const { state, setState, resetState } = useProductsStorage();
  const searchRef = useRef(null);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [filters, setFilters] = useState(() =>
    safeStorageRead(productStorageKeys.filters, defaultFilters),
  );
  const [savedFilters, setSavedFilters] = useState(() =>
    safeStorageRead(productStorageKeys.savedFilters, [
      { id: "sf-active", name: "Faol katalog", filters: defaultFilters },
      { id: "sf-approval", name: "Tasdiq kutmoqda", filters: { ...defaultFilters, approvalStatus: "pending" } },
    ]),
  );
  const [role, setRole] = useState(() => safeStorageRead(productStorageKeys.role, "manager"));
  const [viewMode, setViewModeState] = useState(() =>
    normalizeViewMode(safeStorageRead(productStorageKeys.viewMode, "table")),
  );
  const [sort, setSort] = useState({ key: "updatedAt", direction: "desc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(() =>
    normalizePageSize(safeStorageRead(productStorageKeys.pageSize, 10)),
  );
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [quickViewId, setQuickViewId] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [asyncStatus, setAsyncStatus] = useState(null);

  const products = useMemo(
    () => state.products.map((product) => normalizeProduct(product, state)),
    [state],
  );

  const productsById = useMemo(
    () =>
      products.reduce((map, product) => {
        map[product.id] = product;
        return map;
      }, {}),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return products
      .filter((product) => {
        const searchable = [
          product.name,
          product.sku,
          product.internalCode,
          product.qrCode,
          ...(product.barcodes || []),
        ]
          .join(" ")
          .toLowerCase();
        const price = toNumber(product.price);
        const missing =
          !product.media?.length ||
          !product.description ||
          !product.categoryId ||
          !product.brandId ||
          !product.barcodes?.length;

        const warehouseMatch =
          filters.warehouse === "all" ||
          product.stockSummary?.some((row) => row.warehouseId === filters.warehouse);

        return (
          (!query || searchable.includes(query)) &&
          (filters.categoryId === "all" || product.categoryId === filters.categoryId) &&
          (filters.brandId === "all" || product.brandId === filters.brandId) &&
          (filters.status === "all" || product.status === filters.status) &&
          (filters.stockStatus === "all" || product.stockStatus === filters.stockStatus) &&
          (filters.approvalStatus === "all" || product.approvalStatus === filters.approvalStatus) &&
          warehouseMatch &&
          (!filters.priceMin || price >= toNumber(filters.priceMin)) &&
          (!filters.priceMax || price <= toNumber(filters.priceMax)) &&
          (!filters.marginMin || product.margin >= toNumber(filters.marginMin)) &&
          (filters.tag === "all" || product.tags?.includes(filters.tag)) &&
          (filters.missingData === "all" || (filters.missingData === "yes" ? missing : !missing))
        );
      })
      .sort((a, b) => {
        const readSortValue = (product) => {
          if (sort.key === "stock") return product.stock.available;
          if (sort.key === "taxonomy") return `${product.category?.name || ""} ${product.brand?.name || ""}`;
          return product[sort.key];
        };
        const left = readSortValue(a);
        const right = readSortValue(b);
        const direction = sort.direction === "asc" ? 1 : -1;

        if (typeof left === "number" && typeof right === "number") {
          return (left - right) * direction;
        }

        return String(left || "").localeCompare(String(right || "")) * direction;
      });
  }, [deferredSearch, filters, products, sort]);

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const visibleProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);
  const selectedProducts = products.filter((product) => selectedIds.includes(product.id));
  const quickViewProduct = quickViewId ? productsById[quickViewId] : null;

  const metrics = useMemo(() => {
    const totals = products.reduce(
      (acc, product) => ({
        active: acc.active + (product.status === "active" ? 1 : 0),
        archived: acc.archived + (product.status === "archived" ? 1 : 0),
        pending: acc.pending + (product.approvalStatus === "pending" ? 1 : 0),
        value: acc.value + product.stock.onHand * toNumber(product.cost),
        low: acc.low + (product.stockStatus === "low" || product.stockStatus === "out" ? 1 : 0),
        margin: acc.margin + product.margin,
        sales: acc.sales + toNumber(product.sales30d),
      }),
      { active: 0, archived: 0, pending: 0, value: 0, low: 0, margin: 0, sales: 0 },
    );

    return {
      ...totals,
      total: products.length,
      averageMargin: products.length ? totals.margin / products.length : 0,
    };
  }, [products]);

  const aiInsights = useMemo(() => buildAiInsights(products), [products]);

  useEffect(() => {
    setPage((currentPage) => Math.min(Math.max(1, currentPage), pageCount));
  }, [pageCount]);

  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
  }, [deferredSearch, filters, pageSize, sort, viewMode]);

  const addAudit = useCallback(
    (audit) => {
      setState((current) => ({
        ...current,
        auditLog: [
          {
            id: generateProductId("audit"),
            user: "Ma'mur",
            time: now(),
            oldValue: "-",
            newValue: "-",
            reason: "Mahsulotlar moduli",
            ...audit,
          },
          ...current.auditLog,
        ],
      }));
    },
    [setState],
  );

  const notify = useCallback(
    (notification) => {
      setState((current) => ({
        ...current,
        notifications: [
          {
            id: generateProductId("notice"),
            read: false,
            createdAt: now(),
            level: "normal",
            ...notification,
          },
          ...current.notifications,
        ],
      }));
    },
    [setState],
  );

  const writeFilters = useCallback((nextFilters) => {
    setFilters(nextFilters);
    setPage(1);
    safeStorageWrite(productStorageKeys.filters, nextFilters);
  }, []);

  const resetFilters = useCallback(() => {
    setSearch("");
    writeFilters(defaultFilters);
    setSelectedIds([]);
  }, [writeFilters]);

  const updateFilter = useCallback(
    (key, value) => writeFilters({ ...filters, [key]: clampFilterValue(key, value, filters) }),
    [filters, writeFilters],
  );

  const updateRole = useCallback((nextRole) => {
    setRole(nextRole);
    safeStorageWrite(productStorageKeys.role, nextRole);
  }, []);

  const setViewMode = useCallback((nextMode) => {
    const normalizedMode = normalizeViewMode(nextMode);
    setViewModeState(normalizedMode);
    safeStorageWrite(productStorageKeys.viewMode, normalizedMode);
  }, []);

  const setPageSize = useCallback((nextPageSize) => {
    const normalizedPageSize = normalizePageSize(nextPageSize);
    setPageSizeState(normalizedPageSize);
    safeStorageWrite(productStorageKeys.pageSize, normalizedPageSize);
  }, []);

  const saveCurrentFilter = useCallback(
    (name) => {
      const cleanName = String(name || "").trim();
      if (!cleanName) {
        notify({ level: "important", title: "Filtr saqlanmadi", message: "Filtr nomini kiriting." });
        return false;
      }
      if (savedFilters.some((filter) => filter.name.toLowerCase() === cleanName.toLowerCase())) {
        notify({ level: "important", title: "Filtr saqlanmadi", message: "Bu nomdagi filtr allaqachon bor." });
        return false;
      }
      const next = [{ id: generateProductId("filter"), name: cleanName, filters }, ...savedFilters];
      setSavedFilters(next);
      safeStorageWrite(productStorageKeys.savedFilters, next);
      notify({ title: "Saqlangan filtr yaratildi", message: cleanName });
      return true;
    },
    [filters, notify, savedFilters],
  );

  const removeSavedFilter = useCallback(
    (filterId) => {
      const next = savedFilters.filter((filter) => filter.id !== filterId);
      setSavedFilters(next);
      safeStorageWrite(productStorageKeys.savedFilters, next);
    },
    [savedFilters],
  );

  const createOrUpdateProduct = useCallback(
    (payload) => {
      if (!canProduct(role, "edit")) {
        notify({ level: "critical", title: "Ruxsat yo'q", message: "Bu rolda mahsulot tahrirlash mumkin emas." });
        return { ok: false, errors: { permission: "Ruxsat berilmagan" } };
      }

      const isEdit = Boolean(payload.id);
      const product = {
        id: payload.id || generateProductId("prd"),
        createdAt: payload.createdAt || now(),
        updatedAt: now(),
        lifecycle: payload.lifecycle || "draft",
        status: payload.status || "active",
        approvalStatus: payload.approvalStatus || "draft",
        barcodes: payload.barcodes?.filter(Boolean) || [],
        variants: payload.variants || [],
        media: payload.media || [],
        documents: payload.documents || [],
        relations: payload.relations || [],
        bundleItems: payload.bundleItems || [],
        tags: payload.tags || [],
        stockSummary: payload.stockSummary || [],
        priceHistory: payload.priceHistory || [],
        sales30d: toNumber(payload.sales30d),
        views30d: toNumber(payload.views30d),
        ...payload,
        price: toNumber(payload.price),
        cost: toNumber(payload.cost),
        minPrice: toNumber(payload.minPrice),
        taxRate: toNumber(payload.taxRate),
      };
      const errors = validateProduct(product, state.products);

      if (Object.keys(errors).length) {
        return { ok: false, errors };
      }

      setState((current) => ({
        ...current,
        products: isEdit
          ? current.products.map((item) => (item.id === product.id ? product : item))
          : [product, ...current.products],
      }));
      addAudit({
        action: isEdit ? "Mahsulot yangilandi" : "Mahsulot yaratildi",
        target: product.name,
        newValue: product.sku,
      });
      notify({
        title: isEdit ? "Mahsulot yangilandi" : "Mahsulot yaratildi",
        message: product.name,
      });

      return { ok: true, product };
    },
    [addAudit, notify, role, setState, state.products],
  );

  const duplicateProduct = useCallback(
    (productId) => {
      const product = productsById[productId];
      if (!product) return null;
      const category = state.categories.find((item) => item.id === product.categoryId);
      const brand = state.brands.find((item) => item.id === product.brandId);
      const duplicate = {
        ...product,
        id: generateProductId("prd"),
        name: `${product.name} nusxa`,
        sku: createUniqueSku({
          name: product.name,
          category,
          brand,
          prefix: state.settings.skuPrefix,
          sequence: state.products.length + 1,
          products: state.products,
        }),
        barcodes: [generateBarcode(Date.now())],
        qrCode: `QR-${Date.now().toString(36).toUpperCase()}`,
        status: "draft",
        approvalStatus: "draft",
        createdAt: now(),
        updatedAt: now(),
      };

      setState((current) => ({ ...current, products: [duplicate, ...current.products] }));
      addAudit({ action: "Mahsulot nusxalandi", target: product.name, newValue: duplicate.sku });
      notify({ title: "Nusxa yaratildi", message: duplicate.name });
      return duplicate;
    },
    [addAudit, notify, productsById, setState, state],
  );

  const patchProducts = useCallback(
    (ids, patch, auditAction) => {
      if (!ids.length) {
        setAsyncStatus({ type: "error", message: "Amal uchun mahsulot tanlanmagan." });
        return false;
      }
      setAsyncStatus({ type: "pending", message: `${auditAction} bajarilmoqda...` });
      setState((current) => ({
        ...current,
        products: current.products.map((item) =>
          ids.includes(item.id) ? { ...item, ...patch, updatedAt: now() } : item,
        ),
      }));
      addAudit({ action: auditAction, target: `${ids.length} products`, newValue: Object.keys(patch).join(", ") });
      notify({ title: auditAction, message: `${ids.length} ta mahsulot yangilandi.` });
      setSelectedIds([]);
      setAsyncStatus({ type: "success", message: `${auditAction}: ${ids.length} ta mahsulot yangilandi.` });
      return true;
    },
    [addAudit, notify, setState],
  );

  const archiveProduct = useCallback(
    (productId) => {
      const product = productsById[productId];
      const canArchive =
        typeof window === "undefined" ||
        window.confirm(`${product?.name || "Mahsulot"} arxivlansinmi?`);

      if (!canArchive) return false;
      return patchProducts([productId], { status: "archived" }, "Mahsulot arxivlandi");
    },
    [patchProducts, productsById],
  );

  const submitPriceApproval = useCallback(
    (productId, price, cost) => {
      const product = productsById[productId];
      if (!product) return;

      setState((current) => ({
        ...current,
        products: current.products.map((item) =>
          item.id === productId
            ? {
                ...item,
                approvalStatus: "pending",
                priceHistory: [
                  {
                    id: generateProductId("price"),
                    status: "pending",
                    price: toNumber(price),
                    cost: toNumber(cost),
                    requestedBy: "Ma'mur",
                    approvedBy: "",
                    date: now().slice(0, 10),
                  },
                  ...(item.priceHistory || []),
                ],
                updatedAt: now(),
              }
            : item,
        ),
      }));
      notify({ level: "important", title: "Narx tasdiqqa yuborildi", message: product.name });
      setAsyncStatus({ type: "success", message: "Narx tasdiq navbatiga yuborildi." });
    },
    [notify, productsById, setState],
  );

  const resolvePriceApproval = useCallback(
    (productId, status) => {
      if (!canProduct(role, "approvePrice")) {
        notify({ level: "critical", title: "Tasdiqlash ruxsati yo'q", message: "Egasi roli kerak." });
        return;
      }

      const product = productsById[productId];
      setState((current) => ({
        ...current,
        products: current.products.map((item) =>
          item.id === productId
            ? {
                ...item,
                price:
                  status === "approved"
                    ? toNumber(item.priceHistory?.[0]?.price ?? item.price)
                    : item.price,
                cost:
                  status === "approved"
                    ? toNumber(item.priceHistory?.[0]?.cost ?? item.cost)
                    : item.cost,
                approvalStatus: status === "approved" ? "approved" : "rejected",
                priceHistory: (item.priceHistory || []).map((history, index) =>
                  index === 0
                    ? { ...history, status, approvedBy: "Egasi", date: now().slice(0, 10) }
                    : history,
                ),
                updatedAt: now(),
              }
            : item,
        ),
      }));
      addAudit({ action: `Narx ${status === "approved" ? "tasdiqlandi" : "rad etildi"}`, target: product?.name || productId, newValue: status });
    },
    [addAudit, notify, productsById, role, setState],
  );

  const createCategory = useCallback(
    (payload) => {
      const category = { id: generateProductId("cat"), productCount: 0, status: "active", ...payload };
      setState((current) => ({
        ...current,
        categories: [
          category,
          ...current.categories,
        ],
      }));
      notify({ title: "Kategoriya yaratildi", message: payload.name });
      return category;
    },
    [notify, setState],
  );

  const updateCategory = useCallback(
    (categoryId, patch) => {
      setState((current) => ({
        ...current,
        categories: current.categories.map((item) =>
          item.id === categoryId ? { ...item, ...patch } : item,
        ),
      }));
      notify({ title: "Kategoriya yangilandi", message: patch.name || categoryId });
    },
    [notify, setState],
  );

  const deleteCategory = useCallback(
    (categoryId) => {
      const linkedProducts = state.products.filter((product) => product.categoryId === categoryId);

      if (linkedProducts.length) {
        notify({
          level: "important",
          title: "Kategoriya o'chirilmadi",
          message: `${linkedProducts.length} ta mahsulot shu kategoriyaga bog'langan.`,
        });
        return false;
      }

      setState((current) => ({
        ...current,
        categories: current.categories.filter((item) => item.id !== categoryId),
      }));
      notify({ title: "Kategoriya o'chirildi", message: categoryId });
      return true;
    },
    [notify, setState, state.products],
  );

  const createBrand = useCallback(
    (payload) => {
      const brand = { id: generateProductId("brand"), status: "active", ...payload };
      setState((current) => ({
        ...current,
        brands: [
          brand,
          ...current.brands,
        ],
      }));
      notify({ title: "Brend yaratildi", message: payload.name });
      return brand;
    },
    [notify, setState],
  );

  const updateBrand = useCallback(
    (brandId, patch) => {
      setState((current) => ({
        ...current,
        brands: current.brands.map((item) =>
          item.id === brandId ? { ...item, ...patch } : item,
        ),
      }));
      notify({ title: "Brend yangilandi", message: patch.name || brandId });
    },
    [notify, setState],
  );

  const deleteBrand = useCallback(
    (brandId) => {
      const linkedProducts = state.products.filter((product) => product.brandId === brandId);

      if (linkedProducts.length) {
        notify({
          level: "important",
          title: "Brend o'chirilmadi",
          message: `${linkedProducts.length} ta mahsulot shu brendga bog'langan.`,
        });
        return false;
      }

      setState((current) => ({
        ...current,
        brands: current.brands.filter((item) => item.id !== brandId),
      }));
      notify({ title: "Brend o'chirildi", message: brandId });
      return true;
    },
    [notify, setState, state.products],
  );

  const runAiAction = useCallback(
    (insight) => {
      if (insight.type === "missing") {
        setState((current) => ({
          ...current,
          products: current.products.map((item) =>
            item.id === insight.productId
              ? {
                  ...item,
                  media: [
                    ...(item.media || []),
                    { id: generateProductId("media"), name: "namuna-rasm.webp", type: "image/webp", size: 180000 },
                  ],
                  updatedAt: now(),
                }
              : item,
          ),
        }));
      } else if (insight.type === "margin") {
        patchProducts([insight.productId], { approvalStatus: "pending" }, "Sun'iy idrok narx tasdiq signali");
      } else if (insight.type === "reorder") {
        notify({ level: "important", title: "Omborga qayta buyurtma signali", message: insight.title });
      } else if (insight.type === "dead") {
        patchProducts([insight.productId], { tags: [...(productsById[insight.productId]?.tags || []), "aksiya-qoralamasi"] }, "Sun'iy idrok aksiya qoralamasi");
      } else if (insight.type === "cross-sell") {
        patchProducts([insight.productId], { tags: [...(productsById[insight.productId]?.tags || []), "qo'shimcha-savdo"] }, "Sun'iy idrok qo'shimcha savdo belgisi");
      }

      addAudit({ action: `Sun'iy idrok amali: ${aiInsightTypeLabels[insight.type] || insight.type}`, target: insight.title, newValue: "Qabul qilindi" });
      notify({ title: "Sun'iy idrok tavsiyasi bajarildi", message: insight.title });
    },
    [addAudit, notify, patchProducts, productsById, setState],
  );

  const validateImport = useCallback((file) => {
    const fileName = file?.name || "mahsulotlar-kiritish-namuna.csv";
    const extension = fileName.split(".").pop()?.toLowerCase();
    const isSupported = ["csv", "xlsx", "xls"].includes(extension);
    const preview = {
      fileName,
      totalRows: 5,
      validRows: isSupported ? 4 : 0,
      errors: isSupported ? [{ row: 5, message: "Shtrix-kod takrorlangan" }] : [{ row: 1, message: "Faqat CSV yoki Excel fayl qabul qilinadi" }],
      columns: ["nom", "artikul", "shtrix-kod", "kategoriya", "brend", "narx", "tannarx"],
    };
    setImportPreview(preview);
    setAsyncStatus({ type: isSupported ? "success" : "error", message: isSupported ? "Kiritish fayli tekshirildi." : "Fayl formati noto'g'ri." });
  }, []);

  const confirmImport = useCallback(() => {
    if (!importPreview) return;
    const category = state.categories[0];
    const brand = state.brands[0];
    const imported = {
      id: generateProductId("prd"),
      name: "Kiritilgan USB-C kabel",
      description: "Kiritish ustasi orqali qo'shilgan namuna mahsulot.",
      sku: createUniqueSku({ name: "Kiritilgan kabel", category, brand, prefix: state.settings.skuPrefix, sequence: state.products.length + 1, products: state.products }),
      internalCode: "IMP-CABLE-USBC",
      barcodes: [generateBarcode(Date.now())],
      qrCode: `QR-${Date.now().toString(36).toUpperCase()}`,
      categoryId: category.id,
      brandId: brand.id,
      unitId: state.units[0].id,
      type: "simple",
      lifecycle: "draft",
      status: "draft",
      approvalStatus: "draft",
      price: 99000,
      minPrice: 89000,
      cost: 62000,
      taxRate: state.settings.defaultTaxRate,
      tags: ["kiritilgan"],
      attributes: {},
      variants: [],
      media: [],
      documents: [],
      bundleItems: [],
      relations: [],
      integrations: state.settings.integrations,
      stockSummary: [],
      priceHistory: [],
      sales30d: 0,
      views30d: 0,
      createdAt: now(),
      updatedAt: now(),
    };

      setAsyncStatus({ type: "pending", message: "Kiritish qatorlari saqlanmoqda..." });
      setState((current) => ({ ...current, products: [imported, ...current.products] }));
      addAudit({ action: "Kiritish tasdiqlandi", target: importPreview.fileName, newValue: `${importPreview.validRows} yaroqli qator` });
      notify({ title: "Kiritish yakunlandi", message: `${importPreview.validRows} qator qabul qilindi.` });
      setImportPreview(null);
      setAsyncStatus({ type: "success", message: `${importPreview.validRows} qator qabul qilindi.` });
  }, [addAudit, importPreview, notify, setState, state]);

  const exportProducts = useCallback(() => {
    const fileName = `zenix-mahsulotlar-${now().slice(0, 10)}.json`;
    setAsyncStatus({ type: "success", message: `${fileName} tayyor. ${filteredProducts.length} qator.` });
    addAudit({ action: "Mahsulotlar chiqarildi", target: fileName, newValue: `${filteredProducts.length} qator` });
  }, [addAudit, filteredProducts.length]);

  const markNotificationRead = useCallback(
    (notificationId) => {
      setState((current) => ({
        ...current,
        notifications: current.notifications.map((item) =>
          item.id === notificationId ? { ...item, read: true } : item,
        ),
      }));
    },
    [setState],
  );

  return {
    refs: { searchRef },
    state,
    role,
    filters,
    savedFilters,
    search,
    viewMode,
    sort,
    page,
    pageCount,
    pageSize,
    selectedIds,
    selectedProducts,
    activeModal,
    quickViewProduct,
    importPreview,
    asyncStatus,
    products,
    productsById,
    filteredProducts,
    visibleProducts,
    metrics,
    aiInsights,
    permissions: {
      canViewCost: canProduct(role, "viewCost"),
      canEdit: canProduct(role, "edit"),
      canApprovePrice: canProduct(role, "approvePrice"),
      canBulk: canProduct(role, "bulk"),
      canImport: canProduct(role, "import"),
      canSettings: canProduct(role, "settings"),
    },
    actions: {
      setSearch,
      updateFilter,
      writeFilters,
      resetFilters,
      setRole: updateRole,
      setViewMode,
      setSort,
      setPage,
      setPageSize,
      setSelectedIds,
      selectAllFiltered: () => setSelectedIds(filteredProducts.map((product) => product.id)),
      toggleSelected: (productId) =>
        setSelectedIds((current) =>
          current.includes(productId)
            ? current.filter((id) => id !== productId)
            : [...current, productId],
        ),
      clearSelection: () => setSelectedIds([]),
      setActiveModal,
      closeModal: () => {
        setActiveModal(null);
        setQuickViewId(null);
      },
      openQuickView: (productId) => {
        setQuickViewId(productId);
        setActiveModal("quickView");
      },
      saveCurrentFilter,
      removeSavedFilter,
      createOrUpdateProduct,
      duplicateProduct,
      archiveProduct,
      restoreProduct: (productId) => patchProducts([productId], { status: "active" }, "Mahsulot tiklandi"),
      bulkArchive: () => patchProducts(selectedIds, { status: "archived" }, "Ommaviy arxivlash"),
      bulkRestore: () => patchProducts(selectedIds, { status: "active" }, "Ommaviy tiklash"),
      bulkPending: () => patchProducts(selectedIds, { approvalStatus: "pending" }, "Ommaviy tasdiq so'rovi"),
      submitPriceApproval,
      resolvePriceApproval,
      createCategory,
      updateCategory,
      deleteCategory,
      createBrand,
      updateBrand,
      deleteBrand,
      runAiAction,
      validateImport,
      confirmImport,
      exportProducts,
      markNotificationRead,
      resetState,
      addAudit,
      notify,
      generateCodes: ({ name, categoryId, brandId }) => {
        const category = state.categories.find((item) => item.id === categoryId);
        const brand = state.brands.find((item) => item.id === brandId);
        return {
          sku: createUniqueSku({ name, category, brand, prefix: state.settings.skuPrefix, sequence: state.products.length + 1, products: state.products }),
          barcode: generateBarcode(Date.now()),
          qrCode: `QR-${Date.now().toString(36).toUpperCase()}`,
        };
      },
      calculateAvailableStock,
    },
  };
};

export default useProductsController;
