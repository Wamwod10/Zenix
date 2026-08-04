// PDF 4: Create Purchase Order — 5 qadam:
// 1) Supplier  2) Tovarlar  3) Miqdor/narx/chegirma/soliq
// 4) Yetkazish sanasi, ombor, to'lov shartlari  5) Jami — saqlash yoki tasdiqqa.
// PDF 3: har o'zgarish avtomatik draft ga yoziladi.

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  FileText,
  Package,
  PackageSearch,
  PencilLine,
  RefreshCw,
  Save,
  ScanLine,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Trash2,
  Truck,
} from "lucide-react";

import PurchaseDateField from "../../components/PurchaseDateField/PurchaseDateField";
import PurchaseModal from "../../components/PurchaseModal/PurchaseModal";
import PurchaseSelectField from "../../components/PurchaseSelectField/PurchaseSelectField";
import PurchaseTextarea from "../../components/PurchaseTextarea/PurchaseTextarea";
import PurchaseTextField from "../../components/PurchaseTextField/PurchaseTextField";
import BudgetImpactPanel from "../../components/BudgetImpactPanel/BudgetImpactPanel";
import ConfirmReasonModal from "../../modals/ConfirmReasonModal/ConfirmReasonModal";
// Task 1 (supplier selector redesign): kategoriya chip'lari Suppliers
// modulidan qayta ishlatiladi — mantiq/render ikki joyda yozilmaydi.
import SupplierCategoryBadges from "../../../suppliers/components/SupplierCategoryBadges/SupplierCategoryBadges";
import { useSuppliers } from "../../../suppliers/suppliersApi";
import {
  APPROVAL_ROLE_LABELS,
  resolveApprovalSteps,
} from "../../constants/approvalMatrix";
import {
  PAYMENT_TERMS,
  TAX_MODES,
  TAX_MODE_LABELS,
  TAX_RATES,
  computePaymentDueDate,
  getPaymentTermById,
} from "../../constants/paymentTerms";
import {
  BASE_PURCHASE_CURRENCY,
  PURCHASE_CURRENCIES,
  convertToBaseCurrency,
  getDefaultExchangeRate,
} from "../../constants/currencies";
import { PURCHASE_DEPARTMENTS } from "../../constants/departments";
import { getReorderSuggestions } from "../../data/purchaseProducts";
import {
  PRICE_WARNING_THRESHOLD,
  calculateLineSubtotal,
  calculateOrderTotals,
  getPriceIncreasePercent,
  getSupplierOutstandingDebt,
} from "../../utils/purchaseCalculations";
import { getApplicableBudgetImpacts } from "../../utils/budgetCalculations";
import { createEntityId } from "../../utils/purchaseIds";
import {
  clearWizardDraft,
  getSupplierPriceOverride,
  loadSupplierPriceOverrides,
  loadWizardDraft,
  saveSupplierPriceOverride,
  saveWizardDraft,
} from "../../utils/purchasesStorage";
import {
  formatCurrencyMoney,
  formatCurrencyWithBase,
  formatMoney,
  formatPurchaseDate,
  formatQuantity,
  normalizeNumber,
} from "../../utils/purchaseMoney";

import "./PurchaseOrderWizard.scss";

const STEPS = [
  { id: 1, label: "Yetkazib beruvchi", icon: Truck },
  { id: 2, label: "Tovarlar", icon: Package },
  { id: 3, label: "Miqdor va narx", icon: FileText },
  { id: 4, label: "Yetkazish va to'lov", icon: Send },
  { id: 5, label: "Xulosa", icon: ShieldCheck },
];

const todayStr = () => new Date().toISOString().slice(0, 10);

// PO valyutasi almashganda narxlarni qayta hisoblash uchun yagona konversiya
// nuqtasi — UZS "ko'prik" sifatida ishlatiladi (har bir valyutaning UZS kursi
// bor, ikkita chet el valyutasi orasida ham shu orqali o'tiladi).
// `fromRate`/`toRate` — 1 birlik shu valyutaning necha UZS turishi.
const convertPrice = (amount, fromRate, toRate, toCurrency) => {
  const amountInUzs = normalizeNumber(amount) * (fromRate || 1);
  const converted = amountInUzs / (toRate || 1);

  return toCurrency === BASE_PURCHASE_CURRENCY
    ? Math.round(converted)
    : Math.round(converted * 100) / 100;
};

const buildItemFromProduct = (
  product,
  unitCode,
  quantity,
  currencyCode = BASE_PURCHASE_CURRENCY,
  rateToUzs = 1,
  supplierTerms = null,
  legacyDefaultPrice = null,
) => {
  const unit =
    product.units.find((entry) => entry.code === unitCode) || product.units[0];
  // Point 9: Supplier uchun saqlangan standart narx bo'lsa (foydalanuvchi
  // ilgari "standartni yangilash"ni tanlagan), u katalog narxidan ustun
  // turadi — aks holda katalog (lastPrice) ishlatiladi. Ikkalasi ham
  // UZS bazasida saqlanadi — PO valyutasiga konvertatsiya qilinadi.
  const supplierPrice = supplierTerms?.purchasePrice ?? supplierTerms?.price;
  const supplierPriceInBase =
    normalizeNumber(supplierPrice) > 0
      ? convertToBaseCurrency(
          supplierPrice,
          getDefaultExchangeRate(supplierTerms?.currency || BASE_PURCHASE_CURRENCY),
        )
      : null;
  const basePriceUzs =
    (supplierPriceInBase ??
      legacyDefaultPrice ??
      product.currentCost ??
      product.standardCost ??
      product.lastPrice ??
      0) * unit.factor;
  const price = convertPrice(basePriceUzs, 1, rateToUzs, currencyCode);

  return {
    id: createEntityId("poi"),
    productId: product.id,
    name: product.name,
    sku: product.sku,
    barcode: product.barcode,
    supplierProductId: supplierTerms?.id || "",
    supplierSku: supplierTerms?.supplierSku || supplierTerms?.sku || "",

    unit: unit.code,
    unitLabel: unit.label,
    unitFactor: unit.factor,
    units: product.units,

    quantity: quantity ?? Math.max(supplierTerms?.minimumOrderQty || supplierTerms?.moq || product.moq, 1),
    receivedQty: 0,
    returnedQty: 0,
    damagedQty: 0,
    missingQty: 0,

    price,
    lastPrice: price,
    currency: currencyCode,
    supplierCurrency: supplierTerms?.currency || BASE_PURCHASE_CURRENCY,

    lastPurchase: product.lastPurchase,
    moq: supplierTerms?.minimumOrderQty || supplierTerms?.moq || product.moq,
    leadTime: supplierTerms?.leadTime ?? supplierTerms?.leadTimeDays,
    discountType: supplierTerms?.discountType || "percentage",
    discountValue: supplierTerms?.discountValue ?? supplierTerms?.discount ?? 0,
    discountPercent:
      (supplierTerms?.discountType || "percentage") === "percentage"
        ? supplierTerms?.discountValue ?? supplierTerms?.discount ?? 0
        : 0,
    // Standart soliq: QQS 0% / ozod (12% emas) — kerak bo'lsa qatorda tanlanadi
    taxId: supplierTerms?.taxId || "",
    vatRate: supplierTerms?.vatRate ?? supplierTerms?.vat ?? 0,
    taxRate: supplierTerms?.vatRate ?? supplierTerms?.vat ?? 0,
    taxInclusive: Boolean(supplierTerms?.taxInclusive),
  };
};

// Draft/initialOrder qatorlarida `units` katalogdan qayta tiklanadi
// (saqlashda strip qilinadi) — birlik select ishlashi uchun.
const hydrateItems = (items = [], products = []) =>
  items.map((item) => {
    if (item.units?.length) return item;

    const product = products.find((entry) => entry.id === item.productId);

    return product ? { ...item, units: product.units } : item;
  });

const PurchaseOrderWizard = ({
  suppliers = [],
  products = [],
  warehouses = [],
  invoices = [],
  orders = [],
  budgets = [],
  initialOrder = null,
  onSaveDraft,
  onSubmit,
  onCancel,
}) => {
  const { actions: supplierActions } = useSuppliers();
  const draft = useMemo(
    () => (initialOrder ? null : loadWizardDraft()),
    [initialOrder],
  );

  const [step, setStep] = useState(1);
  const [supplierId, setSupplierId] = useState(
    initialOrder?.supplierId || draft?.supplierId || "",
  );
  const [items, setItems] = useState(() =>
    hydrateItems(initialOrder?.items || draft?.items || [], products),
  );
  const [supplierSearch, setSupplierSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [replacingItemId, setReplacingItemId] = useState(null);
  const [expandedLineIds, setExpandedLineIds] = useState(() => new Set());
  // Point 9: supplier standart narxi tahrirlansa dialog ko'rsatiladi —
  // "Faqat shu xarid uchun" yoki "Standart narxni yangilash".
  const [priceOverrides, setPriceOverrides] = useState(() =>
    loadSupplierPriceOverrides(),
  );
  const [priceConfirm, setPriceConfirm] = useState(null);
  // PDF 58 (Enterprise Budget Control, Soft Limit): chegaradan oshganda
  // sabab so'rash oynasi.
  const [budgetOverrideModalOpen, setBudgetOverrideModalOpen] = useState(false);

  const toggleLineExpanded = (itemId) =>
    setExpandedLineIds((current) => {
      const next = new Set(current);

      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }

      return next;
    });

  const { watch, getValues, setValue } = useForm({
    defaultValues: {
      expectedDate:
        initialOrder?.expectedDate || draft?.form?.expectedDate || "",
      warehouseId:
        initialOrder?.warehouseId ||
        draft?.form?.warehouseId ||
        warehouses[0]?.id ||
        "",
      paymentTerm:
        initialOrder?.paymentTerm ||
        draft?.form?.paymentTerm ||
        PAYMENT_TERMS[1].id,
      // Task 3: to'lov muddati — naqd/avans (creditDays=0) shartida bo'sh
      // (o'chirilgan), kredit shartida yetkazish sanasidan hisoblanadi.
      paymentDueDate:
        initialOrder?.paymentDueDate ??
        draft?.form?.paymentDueDate ??
        computePaymentDueDate(
          initialOrder?.paymentTerm || draft?.form?.paymentTerm || PAYMENT_TERMS[1].id,
          initialOrder?.expectedDate || draft?.form?.expectedDate,
        ),
      taxMode: initialOrder?.taxMode || draft?.form?.taxMode || TAX_MODES.exclusive,
      orderDiscountPercent:
        initialOrder?.orderDiscountPercent ??
        draft?.form?.orderDiscountPercent ??
        0,
      currency:
        initialOrder?.currency ||
        draft?.form?.currency ||
        BASE_PURCHASE_CURRENCY,
      exchangeRate:
        initialOrder?.exchangeRate ??
        draft?.form?.exchangeRate ??
        getDefaultExchangeRate(initialOrder?.currency || draft?.form?.currency),
      supplierNote: draft?.form?.supplierNote || "",
      internalNote: draft?.form?.internalNote || "",
      // PDF 57 (Enterprise, Department/Project Budget): ixtiyoriy — shu PO
      // qaysi bo'lim/loyiha uchun ekanini belgilaydi, mos byudjet kesimida
      // nazorat qilinishi uchun.
      department: initialOrder?.department || draft?.form?.department || "",
      project: initialOrder?.project || draft?.form?.project || "",
    },
  });

  const formValues = watch();

  // PO valyutasi va joriy kursi — addProduct/updateItem shulardan foydalanadi,
  // shu sababli useForm() dan keyin, lekin ular ishlatilishidan OLDIN e'lon qilinadi
  // (ilgari pastda turardi va yopiq funksiyalar uni "oldindan" ishlatardi).
  const selectedCurrency = formValues.currency || BASE_PURCHASE_CURRENCY;
  const exchangeRate = normalizeNumber(formValues.exchangeRate) || 1;
  const selectedPaymentTerm = getPaymentTermById(formValues.paymentTerm);

  // PDF 3: avtomatik draft saqlash (yangi PO uchun)
  useEffect(() => {
    if (initialOrder) return;

    saveWizardDraft({ supplierId, items, form: formValues });
  }, [supplierId, items, formValues, initialOrder]);

  const selectedSupplier = suppliers.find((entry) => entry.id === supplierId);
  const supplierTermsByProductId = useMemo(
    () =>
      (selectedSupplier?.supplierProducts || []).reduce((map, relation) => {
        map[relation.productId] = relation;
        return map;
      }, {}),
    [selectedSupplier],
  );

  // PDF 6: qidiruv + score bo'yicha tartib; bloklangan tanlanmaydi
  const visibleSuppliers = useMemo(() => {
    const query = supplierSearch.trim().toLowerCase();

    return suppliers
      .filter(
        (supplier) =>
          !query ||
          supplier.name.toLowerCase().includes(query) ||
          supplier.category.toLowerCase().includes(query),
      )
      .sort((a, b) => b.score - a.score);
  }, [suppliers, supplierSearch]);

  // Tovarlar FAQAT tanlangan supplierniki: Suppliers profilida (Mahsulot
  // qo'shish modali orqali) ANIQ bog'langan mahsulotlar (`supplier.
  // productIds`). Boshqa supplier tovarlari KO'RSATILMAYDI.
  // Bug fix: ilgari Product katalogidagi mock `product.supplierIds`
  // maydoni orqali ham "avtomatik" bog'lanish ko'rsatilardi — bu esa
  // hech qachon foydalanuvchi tomonidan aniq bog'lanmagan mahsulotlarni
  // ham PO Wizard'da ko'rsatib yuborardi. Endi YAGONA manba
  // `supplier.productIds` — Suppliers profilidagi bilan bir xil.
  const supplierProducts = useMemo(() => {
    if (!supplierId) return [];

    const linkedIds = new Set(selectedSupplier?.productIds || []);
    const activeRelationIds = new Set(
      (selectedSupplier?.supplierProducts || [])
        .filter((relation) => (relation.status || "active") === "active")
        .map((relation) => relation.productId),
    );

    return products.filter(
      (product) =>
        linkedIds.has(product.id) &&
        (!selectedSupplier?.supplierProducts?.length || activeRelationIds.has(product.id)),
    );
  }, [products, supplierId, selectedSupplier]);

  // PDF 7: tovar qidiruv — nom, SKU, barcode (supplier tovarlari ichida)
  const visibleProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();

    return supplierProducts.filter(
      (product) =>
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.barcode.includes(query),
    );
  }, [supplierProducts, productSearch]);

  // AI reorder tavsiyasi ham faqat shu supplier tovarlaridan
  const reorderSuggestions = useMemo(
    () => getReorderSuggestions(supplierProducts),
    [supplierProducts],
  );

  const addProduct = (product, quantity) => {
    const legacyDefaultPrice = getSupplierPriceOverride(
      priceOverrides,
      supplierId,
      product.id,
    );
    const supplierTerms = supplierTermsByProductId[product.id];

    setItems((current) => {
      if (replacingItemId) {
        return current.map((item) =>
          item.id === replacingItemId
            ? buildItemFromProduct(
                product,
                undefined,
                quantity,
                selectedCurrency,
                exchangeRate,
                supplierTerms,
                legacyDefaultPrice,
              )
            : item,
        );
      }

      if (current.some((item) => item.productId === product.id)) return current;

      return [
        ...current,
        buildItemFromProduct(
          product,
          undefined,
          quantity,
          selectedCurrency,
          exchangeRate,
          supplierTerms,
          legacyDefaultPrice,
        ),
      ];
    });

    setReplacingItemId(null);
  };

  // Point 9: narx qatordan chiqib ketganda (blur) standart narxdan farq
  // qilsa — "faqat shu xarid" yoki "standartni yangilash" dialogini ochamiz.
  const handlePriceBlur = (item) => {
    if (normalizeNumber(item.price) === normalizeNumber(item.lastPrice)) return;

    setPriceConfirm({
      itemId: item.id,
      productId: item.productId,
      name: item.name,
      newPrice: item.price,
      oldPrice: item.lastPrice,
    });
  };

  const resolvePriceConfirm = (updateDefault) => {
    if (!priceConfirm) return;

    if (updateDefault) {
      const next = saveSupplierPriceOverride(
        supplierId,
        priceConfirm.productId,
        priceConfirm.newPrice,
      );
      supplierActions.updateSupplier(supplierId, {
        productId: priceConfirm.productId,
        productTerms: {
          purchasePrice: priceConfirm.newPrice,
          currency: selectedCurrency,
          source: "purchase_order_wizard",
        },
      });

      setPriceOverrides(next);
      updateItem(priceConfirm.itemId, { lastPrice: priceConfirm.newPrice });
    }

    setPriceConfirm(null);
  };

  const removeItem = (itemId) =>
    setItems((current) => current.filter((item) => item.id !== itemId));

  const updateItem = (itemId, patch) =>
    setItems((current) =>
      current.map((item) => {
        if (item.id !== itemId) return item;

        const next = { ...item, ...patch };

        // PDF 9: birlik o'zgarsa narx avto-konvertatsiya
        if (patch.unit && item.units) {
          const unit = item.units.find((entry) => entry.code === patch.unit);

          if (unit) {
            const basePrice = item.price / item.unitFactor;

            next.unitLabel = unit.label;
            next.unitFactor = unit.factor;
            next.price = Math.round(basePrice * unit.factor);
            next.lastPrice = Math.round(
              (item.lastPrice / item.unitFactor) * unit.factor,
            );
          }
        }

        return next;
      }),
    );

  const orderShape = {
    items,
    taxMode: formValues.taxMode,
    orderDiscountPercent: normalizeNumber(formValues.orderDiscountPercent),
  };

  const totals = calculateOrderTotals(orderShape);
  const baseCurrencyTotal = convertToBaseCurrency(totals.total, exchangeRate);
  const approvalPreview = resolveApprovalSteps(baseCurrencyTotal);

  // PDF 57-60 (Enterprise Budget Control): shu PO ga tegishli faol byudjetlar
  // va ularga ta'sir — real vaqtda, har bir o'zgarishda qayta hisoblanadi.
  const budgetImpactOrderShape = {
    id: initialOrder?.id || null,
    supplierId,
    items,
    taxMode: formValues.taxMode,
    orderDiscountPercent: normalizeNumber(formValues.orderDiscountPercent),
    currency: selectedCurrency,
    exchangeRate,
    department: formValues.department,
    project: formValues.project,
    createdAt: initialOrder?.createdAt || new Date().toISOString(),
    baseCurrencyTotal,
  };

  const budgetImpacts = getApplicableBudgetImpacts(
    budgetImpactOrderShape,
    budgets,
    orders,
    { products, excludeOrderId: initialOrder?.id || null },
  );

  const hardBlockingBudgets = budgetImpacts.filter((entry) => entry.impact.willBlock);
  // Soft Limit: chegaradan oshgan, lekin Hard Limit bo'lmagan byudjetlar —
  // davom etish uchun sabab kiritish talab qilinadi.
  const softExceededBudgets = budgetImpacts.filter(
    (entry) => !entry.impact.willBlock && entry.impact.afterUtilizationPercent >= 100,
  );

  const getSupplierById = (id) => suppliers.find((entry) => entry.id === id);

  // PO valyutasi almashganda barcha qator narxlarini yangi valyutaga
  // qayta hisoblaymiz — aks holda summa raqami o'zgarmay, faqat belgi
  // ($ / so'm) almashadi (bug: 120000 UZS -> "$120000" o'rniga "$9.48").
  const handleCurrencyChange = (currencyCode) => {
    if (currencyCode === selectedCurrency) return; // ikki marta konvertatsiya qilinmasin

    const fromRate = exchangeRate; // joriy valyutaning UZS kursi (foydalanuvchi tahrirlagan bo'lishi mumkin)
    const toRate = getDefaultExchangeRate(currencyCode); // yangi valyutaning standart UZS kursi

    setValue("currency", currencyCode);
    setValue("exchangeRate", toRate);

    setItems((current) =>
      current.map((item) => ({
        ...item,
        price: convertPrice(item.price, fromRate, toRate, currencyCode),
        lastPrice: convertPrice(item.lastPrice, fromRate, toRate, currencyCode),
        currency: currencyCode,
      })),
    );
  };

  // Task 3: to'lov sharti o'zgarganda muddat avtomatik hisoblanadi — naqd/avans
  // (creditDays=0) uchun bo'sh/o'chirilgan, kredit shartlarida yetkazish
  // sanasidan creditDays kun keyin (foydalanuvchi keyin tahrirlashi mumkin).
  const handlePaymentTermChange = (termId) => {
    setValue("paymentTerm", termId, { shouldDirty: true });
    setValue(
      "paymentDueDate",
      computePaymentDueDate(termId, formValues.expectedDate),
      { shouldDirty: true },
    );
  };

  // PDF 4: validatsiya — har bir qadam uchun alohida, step indikatorda
  // xatolar sonini ko'rsatish uchun (oxirgi qadamgacha kutish shart emas)
  const supplierIssues = useMemo(
    () => (!supplierId ? ["Yetkazib beruvchi tanlanmagan"] : []),
    [supplierId],
  );

  const itemsIssues = useMemo(
    () => (!items.length ? ["Kamida 1 tovar qo'shilsin"] : []),
    [items.length],
  );

  const lineIssues = useMemo(() => {
    const issues = [];

    items.forEach((item) => {
      if (normalizeNumber(item.quantity) <= 0) {
        issues.push(`${item.name}: miqdor 0 dan katta bo'lsin`);
      }

      if (normalizeNumber(item.price) < 0) {
        issues.push(`${item.name}: narx manfiy bo'lmasin`);
      }

      // PDF 8: MOQ — bazaviy birlikda tekshiriladi
      const baseQty = normalizeNumber(item.quantity) * item.unitFactor;

      if (item.moq && baseQty > 0 && baseQty < item.moq) {
        issues.push(`${item.name}: MOQ ${item.moq} dona (hozir ${baseQty})`);
      }
    });

    return issues;
  }, [items]);

  const deliveryIssues = useMemo(() => {
    const issues = [];

    if (!formValues.expectedDate) {
      issues.push("Yetkazish sanasi kiritilsin");
    } else if (formValues.expectedDate <= todayStr()) {
      issues.push("Yetkazish sanasi bugundan keyin bo'lsin");
    }

    if (formValues.expectedDate) {
      const expectedTime = new Date(formValues.expectedDate).getTime();

      items.forEach((item) => {
        const leadTime = normalizeNumber(item.leadTime);
        if (!leadTime) return;

        const minDate = new Date();
        minDate.setDate(minDate.getDate() + leadTime);
        if (expectedTime < minDate.getTime()) {
          issues.push(`${item.name}: lead time kamida ${leadTime} kun.`);
        }
      });
    }

    if (!formValues.warehouseId) issues.push("Ombor tanlanmagan");

    const discount = normalizeNumber(formValues.orderDiscountPercent);

    if (discount < 0 || discount > 100) {
      issues.push("Umumiy chegirma 0-100% oralig'ida bo'lsin");
    }

    return issues;
  }, [formValues, items]);

  const validation = useMemo(
    () => [...supplierIssues, ...itemsIssues, ...lineIssues, ...deliveryIssues],
    [supplierIssues, itemsIssues, lineIssues, deliveryIssues],
  );

  const stepIssueCounts = {
    1: supplierIssues.length,
    2: itemsIssues.length,
    3: lineIssues.length,
    4: deliveryIssues.length,
  };

  const stepAllowsNext = () => {
    if (step === 1) return !!supplierId;
    if (step === 2) return items.length > 0;

    return true;
  };

  const collectPayload = (budgetOverrideReason = "") => ({
    supplierId,
    items: items.map(({ units: _units, ...item }) => {
      const subtotal = calculateLineSubtotal(item);
      const taxRate = normalizeNumber(item.vatRate ?? item.taxRate);
      const taxAmount = item.taxInclusive
        ? Math.round(subtotal - subtotal / (1 + taxRate / 100))
        : Math.round((subtotal * taxRate) / 100);
      const total = item.taxInclusive ? Math.round(subtotal) : Math.round(subtotal + taxAmount);
      const exchangeRate = normalizeNumber(getValues("exchangeRate")) || 1;

      return {
        ...item,
        supplierId,
        purchasePrice: normalizeNumber(item.price),
        discountType: item.discountType || "percentage",
        discountValue: normalizeNumber(item.discountValue ?? item.discountPercent),
        discount: normalizeNumber(item.discountPercent),
        taxId: item.taxId || "",
        vatRate: taxRate,
        vat: taxRate,
        taxInclusive: Boolean(item.taxInclusive),
        exchangeRate,
        baseCurrencyAmount: convertToBaseCurrency(total, exchangeRate),
        subtotal: Math.round(subtotal),
        taxAmount,
        total,
        createdAt: item.createdAt || new Date().toISOString(),
      };
    }),
    expectedDate: getValues("expectedDate"),
    warehouseId: getValues("warehouseId"),
    branch:
      warehouses.find((entry) => entry.id === getValues("warehouseId"))
        ?.branch || "",
    paymentTerm: getValues("paymentTerm"),
    paymentDueDate: getValues("paymentDueDate"),
    taxMode: getValues("taxMode"),
    orderDiscountPercent: normalizeNumber(getValues("orderDiscountPercent")),
    currency: getValues("currency"),
    exchangeRate: normalizeNumber(getValues("exchangeRate")) || 1,
    baseCurrency: BASE_PURCHASE_CURRENCY,
    convertedTotal: totals.total,
    baseCurrencyTotal,
    // PDF 57 (Enterprise Department/Project Budget)
    department: getValues("department") || "",
    project: getValues("project") || "",
    // PDF 58 (Soft Limit override): sabab bilan chegaradan o'tkazilgan
    // byudjetlar — audit uchun saqlanadi (Hard Limit hech qachon shu yerga
    // yetib kelmaydi, chunki tugma o'zi bloklangan bo'ladi).
    ...(budgetOverrideReason
      ? {
          budgetOverrides: softExceededBudgets.map((entry) => ({
            budgetId: entry.budget.id,
            budgetName: entry.budget.name,
            reason: budgetOverrideReason,
            at: new Date().toISOString(),
          })),
        }
      : {}),
    notes: [
      getValues("internalNote")?.trim() && {
        id: createEntityId("note"),
        type: "internal",
        text: getValues("internalNote").trim(),
        author: "",
        createdAt: new Date().toISOString(),
      },
      getValues("supplierNote")?.trim() && {
        id: createEntityId("note"),
        type: "supplier",
        text: getValues("supplierNote").trim(),
        author: "",
        createdAt: new Date().toISOString(),
      },
    ].filter(Boolean),
  });

  const handleSaveDraft = () => {
    // PDF 3: draft da to'liq validatsiya shart emas
    onSaveDraft?.(collectPayload());
    clearWizardDraft();
  };

  const finalizeSubmit = (budgetOverrideReason = "") => {
    onSubmit?.(collectPayload(budgetOverrideReason));
    clearWizardDraft();
  };

  const handleSubmit = () => {
    setSubmitAttempted(true);

    if (validation.length) return;
    // PDF 58: Hard Limit oshgan bo'lsa tugma allaqachon bloklangan, lekin
    // himoya sifatida bu yerda ham qayta tekshiriladi.
    if (hardBlockingBudgets.length > 0) return;

    // PDF 58: Soft Limit oshgan byudjet(lar) bo'lsa — sabab so'raladi,
    // sababsiz tasdiqqa yuborilmaydi.
    if (softExceededBudgets.length > 0) {
      setBudgetOverrideModalOpen(true);
      return;
    }

    finalizeSubmit();
  };

  return (
    <div className="po-wizard">
      <ol className="po-wizard__steps">
        {STEPS.map((entry) => {
          const Icon = entry.icon;
          const issueCount = stepIssueCounts[entry.id] || 0;
          const stepVisited = step > entry.id || submitAttempted;

          return (
            <li
              className={[
                "po-wizard__step",
                step === entry.id ? "po-wizard__step--active" : "",
                step > entry.id ? "po-wizard__step--done" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              key={entry.id}
            >
              <span className="po-wizard__step-icon">
                {step > entry.id ? <Check size={14} /> : <Icon size={14} />}
              </span>
              <span className="po-wizard__step-label">{entry.label}</span>
              {stepVisited && issueCount > 0 && (
                <span className="po-wizard__step-issues">{issueCount}</span>
              )}
            </li>
          );
        })}
      </ol>

      {/* 1-qadam: Supplier tanlash (PDF 6) */}
      {step === 1 && (
        <section className="po-wizard__panel">
          <label className="po-wizard__search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Yetkazib beruvchi nomi yoki kategoriya bo'yicha qidirish..."
              value={supplierSearch}
              onChange={(event) => setSupplierSearch(event.target.value)}
            />
          </label>

          {/* Step 4: Purchases faqat MAVJUD supplierni tanlaydi — yangi
              supplier yaratish Suppliers moduliga tegishli (Step 1/2). */}
          {!visibleSuppliers.length && (
            <p className="po-wizard__suppliers-empty">
              Yetkazib beruvchi topilmadi.{" "}
              <Link to="/suppliers">Yetkazib beruvchilar bo'limida yangi yetkazib beruvchi qo'shing</Link>.
            </p>
          )}

          <div className="po-wizard__suppliers">
            {visibleSuppliers.map((supplier) => {
              const active = supplierId === supplier.id;
              const scoreTone =
                supplier.score >= 80
                  ? "high"
                  : supplier.score >= 50
                    ? "mid"
                    : "low";

              return (
                <button
                  type="button"
                  key={supplier.id}
                  disabled={supplier.blocked}
                  className={[
                    "po-wizard__supplier",
                    active ? "po-wizard__supplier--active" : "",
                    supplier.blocked ? "po-wizard__supplier--blocked" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setSupplierId(supplier.id)}
                >
                  <div className="po-wizard__supplier-main">
                    <div className="po-wizard__supplier-heading">
                      <strong>{supplier.name}</strong>
                      {active && (
                        <Check size={14} className="po-wizard__supplier-check" />
                      )}
                    </div>

                    <SupplierCategoryBadges
                      categoryIds={supplier.categories}
                      max={2}
                    />

                    <small className="po-wizard__supplier-meta">
                      <Truck size={12} />
                      Yetkazish: {supplier.leadTimeDays} kun
                    </small>
                  </div>

                  <div className="po-wizard__supplier-side">
                    <span className={`po-wizard__score po-wizard__score--${scoreTone}`}>
                      {supplier.score}
                      <small>/100</small>
                    </span>

                    {supplier.blocked ? (
                      <span className="po-wizard__supplier-blocked">
                        Qora ro'yxatda
                      </span>
                    ) : (
                      <span className="po-wizard__supplier-debt">
                        Qarz: {formatMoney(getSupplierOutstandingDebt(invoices, supplier.id))}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 2-qadam: Tovarlar (PDF 7) */}
      {step === 2 && (
        <section className="po-wizard__panel">
          <label className="po-wizard__search">
            <ScanLine size={16} />
            <input
              type="text"
              placeholder="Nom, SKU yoki barcode bo'yicha qidirish / skanerlash..."
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
            />
          </label>

          {reorderSuggestions.length > 0 && (
            <div className="po-wizard__suggestions">
              <span className="po-wizard__suggestions-title">
                <Sparkles size={14} />
                AI reorder tavsiyasi — kam qolgan tovarlar
              </span>

              {reorderSuggestions.map((product) => (
                <button
                  type="button"
                  key={product.id}
                  className="po-wizard__suggestion"
                  onClick={() => addProduct(product, product.suggestedQty)}
                >
                  <strong>{product.name}</strong>
                  <small>
                    Qoldiq: {product.stock} / min {product.reorderPoint} — tavsiya:{" "}
                    {product.suggestedQty} dona
                  </small>
                </button>
              ))}
            </div>
          )}

          {visibleProducts.length === 0 && (
            <div className="po-wizard__products-empty">
              <PackageSearch size={22} />
              <strong>
                {supplierProducts.length === 0
                  ? "Bu yetkazib beruvchiga mahsulot bog'lanmagan"
                  : "Qidiruv bo'yicha tovar topilmadi"}
              </strong>
              <small>
                {supplierProducts.length === 0
                  ? "Yetkazib beruvchi sahifasida mahsulot biriktiring yoki boshqa yetkazib beruvchi tanlang — soxta tovarlar ko'rsatilmaydi."
                  : "Boshqa nom, SKU yoki barcode bilan urinib ko'ring."}
              </small>
            </div>
          )}

          <div className="po-wizard__products">
            {visibleProducts.map((product) => {
              const added = items.some((item) => item.productId === product.id);
              const previousPrice =
                product.lastPurchase?.previousPrice || product.lastPrice;
              const diff = product.lastPrice - previousPrice;
              const trend = product.lastPurchase?.trend || "flat";
              const TrendIcon = trend === "down" ? TrendingDown : TrendingUp;

              return (
                <button
                  type="button"
                  key={product.id}
                  className={`po-wizard__product ${added ? "po-wizard__product--added" : ""
                  }`}
                  onClick={() => {
                    if (replacingItemId) {
                      addProduct(product);
                      return;
                    }

                    const existing = items.find(
                      (item) => item.productId === product.id
                    );

                    if (existing) {
                      removeItem(existing.id);
                    } else {
                      addProduct(product);
                    }
                  }}
                >
                  <div>
                    <strong>{product.name}</strong>
                    <small>
                      {product.sku} · Oxirgi narx: {formatMoney(product.lastPrice)}
                    </small>
                  </div>
                  <span
                    className={`po-wizard__product-action ${added ? "po-wizard__product-action--remove" : ""
                      }`}
                  >
                    <small className="po-wizard__product-history">
                      <TrendIcon size={12} />
                      Oldingi: {formatMoney(previousPrice)} /{" "}
                      {product.lastPurchase?.supplierName || "Yetkazib beruvchi"} /{" "}
                      {formatPurchaseDate(product.lastPurchase?.date)}
                      {diff ? ` / farq ${formatMoney(diff)}` : " / o'zgarish yo'q"}
                    </small>

                    <strong>
                      {replacingItemId
                        ? "Almashtirish"
                        : added
                          ? "Ajratish"
                          : "+ Qo'shish"}
                    </strong>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 3-qadam: Miqdor, narx, chegirma, soliq (PDF 8-12) */}
      {step === 3 && (
        <section className="po-wizard__panel">
          {items.length === 0 && (
            <p className="po-wizard__empty">Avval tovar qo'shing (2-qadam).</p>
          )}

          {items.map((item) => {
            const priceIncrease = getPriceIncreasePercent(item);
            const baseQty = normalizeNumber(item.quantity) * item.unitFactor;
            const moqIssue = item.moq && baseQty > 0 && baseQty < item.moq;
            const lineExpanded = expandedLineIds.has(item.id);

            return (
              <div className="po-wizard__line" key={item.id}>
                <div className="po-wizard__line-head">
                  <strong>{item.name}</strong>
                  <div className="po-wizard__line-actions">
                    <button
                      type="button"
                      className={
                        lineExpanded
                          ? "po-wizard__line-toggle po-wizard__line-toggle--open"
                          : "po-wizard__line-toggle"
                      }
                      aria-expanded={lineExpanded}
                      onClick={() => toggleLineExpanded(item.id)}
                    >
                      <SlidersHorizontal size={13} />
                      Tafsilotlar
                      <ChevronDown size={13} />
                    </button>

                    <button
                      type="button"
                      aria-label="Qatorni tahrirlash"
                      title="Qatorni tahrirlash"
                      onClick={() =>
                        document.getElementById(`po-qty-${item.id}`)?.focus()
                      }
                    >
                      <PencilLine size={15} />
                    </button>
                    <button
                      type="button"
                      aria-label="Tovarni almashtirish"
                      title="Tovarni almashtirish"
                      onClick={() => {
                        setReplacingItemId(item.id);
                        setStep(2);
                      }}
                    >
                      <RefreshCw size={15} />
                    </button>

                    <button
                      type="button"
                      aria-label="Qatorni o'chirish"
                      title="Qatorni o'chirish"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="po-wizard__line-grid">
                  <PurchaseTextField
                    id={`po-qty-${item.id}`}
                    label="Miqdor"
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(event) =>
                      updateItem(item.id, {
                        quantity: normalizeNumber(event.target.value),
                      })
                    }
                  />

                  <PurchaseSelectField
                    label="Birlik"
                    value={item.unit}
                    options={(item.units || []).map((unit) => ({
                      value: unit.code,
                      label: unit.label,
                    }))}
                    onChange={(value) => updateItem(item.id, { unit: value })}
                  />

                  <PurchaseTextField
                    label={`Narx (${item.unitLabel})`}
                    type="number"
                    min="0"
                    step="100"
                    value={item.price}
                    onChange={(event) =>
                      updateItem(item.id, {
                        price: normalizeNumber(event.target.value),
                      })
                    }
                    onBlur={() => handlePriceBlur(item)}
                  />

                  <div className="po-wizard__line-total">
                    <span>Qator jami</span>
                    <strong>
                      {formatCurrencyMoney(
                        calculateLineSubtotal(item),
                        selectedCurrency,
                      )}
                    </strong>
                  </div>
                </div>

                {lineExpanded && (
                  <div className="po-wizard__line-grid po-wizard__line-grid--secondary">
                    <PurchaseTextField
                      label="Chegirma %"
                      type="number"
                      min="0"
                      max="100"
                      value={item.discountPercent}
                      onChange={(event) =>
                        updateItem(item.id, {
                          discountPercent: Math.min(
                            Math.max(normalizeNumber(event.target.value), 0),
                            100,
                          ),
                        })
                      }
                    />

                    <PurchaseSelectField
                      label="Soliq"
                      value={String(item.taxRate)}
                      options={TAX_RATES.map((rate) => ({
                        value: String(rate.value),
                        label: rate.label,
                      }))}
                      onChange={(value) =>
                        updateItem(item.id, {
                          taxRate: normalizeNumber(value),
                        })
                      }
                    />
                  </div>
                )}

                <div className="po-wizard__line-meta">
                  <small>
                    = {formatQuantity(baseQty)} dona (bazaviy) · Oxirgi narx:{" "}
                    {formatCurrencyMoney(item.lastPrice, selectedCurrency)}
                  </small>

                  {priceIncrease >= PRICE_WARNING_THRESHOLD && (
                    <small className="po-wizard__flag">
                      <AlertTriangle size={12} />
                      Narx oldingidan {priceIncrease}% qimmat!
                    </small>
                  )}

                  {moqIssue && (
                    <small className="po-wizard__flag">
                      <AlertTriangle size={12} />
                      MOQ: kamida {item.moq} dona
                    </small>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* 4-qadam: Yetkazish, ombor, to'lov shartlari (PDF 13-14, 16) */}
      {step === 4 && (
        <section className="po-wizard__panel po-wizard__panel--groups">
          <div className="po-wizard__group">
            <h4>Yetkazish</h4>
            <div className="po-wizard__group-grid">
              <PurchaseDateField
                label="Kutilayotgan yetkazish sanasi"
                min={todayStr()}
                value={formValues.expectedDate}
                hint={
                  selectedSupplier
                    ? `Supplier o'rtacha lead time: ${selectedSupplier.leadTimeDays} kun`
                    : undefined
                }
                onChange={(event) =>
                  setValue("expectedDate", event.target.value, {
                    shouldDirty: true,
                  })
                }
              />

              <PurchaseSelectField
                label="Qabul qilinadigan ombor"
                value={formValues.warehouseId}
                options={warehouses.map((warehouse) => ({
                  value: warehouse.id,
                  label: `${warehouse.name} · ${warehouse.branch}`,
                }))}
                onChange={(value) =>
                  setValue("warehouseId", value, { shouldDirty: true })
                }
              />
            </div>
          </div>

          <div className="po-wizard__group">
            <h4>Moliyaviy shartlar</h4>
            <div className="po-wizard__group-grid">
              <PurchaseSelectField
                label="To'lov sharti"
                value={formValues.paymentTerm}
                options={PAYMENT_TERMS.map((term) => ({
                  value: term.id,
                  label: `${term.label} — ${term.description}`,
                }))}
                onChange={handlePaymentTermChange}
              />

              {/* Task 3: naqd/avans (creditDays=0) — muddat o'chirilgan;
                  kredit shartlarida (Net 30/60/90, Bo'lib to'lash) — yoqilgan. */}
              <PurchaseDateField
                label="To'lov muddati"
                min={todayStr()}
                value={formValues.paymentDueDate}
                disabled={!selectedPaymentTerm.creditDays}
                hint={
                  selectedPaymentTerm.creditDays
                    ? `Kredit muddati: ${selectedPaymentTerm.creditDays} kun`
                    : "Bu to'lov shartida kelajakdagi muddat yo'q — darhol to'lanadi"
                }
                onChange={(event) =>
                  setValue("paymentDueDate", event.target.value, {
                    shouldDirty: true,
                  })
                }
              />

              <PurchaseSelectField
                label="Soliq rejimi"
                value={formValues.taxMode}
                options={Object.entries(TAX_MODE_LABELS).map(
                  ([value, label]) => ({ value, label }),
                )}
                onChange={(value) =>
                  setValue("taxMode", value, { shouldDirty: true })
                }
              />

              <PurchaseTextField
                label="Umumiy chegirma %"
                type="number"
                min="0"
                max="100"
                value={formValues.orderDiscountPercent}
                onChange={(event) =>
                  setValue("orderDiscountPercent", event.target.value, {
                    shouldDirty: true,
                  })
                }
              />

              <PurchaseSelectField
                label="PO valutasi"
                value={selectedCurrency}
                options={PURCHASE_CURRENCIES.map((currency) => ({
                  value: currency.code,
                  label: currency.label,
                }))}
                onChange={handleCurrencyChange}
              />

              <PurchaseTextField
                label={`Kurs (${selectedCurrency} / UZS)`}
                type="number"
                min="1"
                step="0.01"
                value={formValues.exchangeRate}
                onChange={(event) =>
                  setValue("exchangeRate", event.target.value, {
                    shouldDirty: true,
                  })
                }
              />
            </div>
          </div>

          {/* PDF 57 (Enterprise Department/Project Budget): ixtiyoriy —
              kiritilsa mos bo'lim/loyiha byudjeti bilan bog'lanadi. */}
          <div className="po-wizard__group">
            <h4>Byudjet kesimi (ixtiyoriy)</h4>
            <div className="po-wizard__group-grid">
              <PurchaseSelectField
                label="Bo'lim"
                value={formValues.department}
                placeholder="Bo'lim tanlanmagan"
                options={PURCHASE_DEPARTMENTS.map((entry) => ({
                  value: entry.id,
                  label: entry.label,
                }))}
                onChange={(value) =>
                  setValue("department", value, { shouldDirty: true })
                }
              />

              <PurchaseTextField
                label="Loyiha"
                placeholder="Masalan: Yozgi aksiya"
                value={formValues.project}
                onChange={(event) =>
                  setValue("project", event.target.value, { shouldDirty: true })
                }
              />
            </div>
          </div>

          <div className="po-wizard__group">
            <h4>Izohlar</h4>
            <div className="po-wizard__group-grid">
              <PurchaseTextarea
                className="po-wizard__note"
                label="Yetkazib beruvchi izohi (buyurtma hujjatida chiqadi)"
                rows={2}
                value={formValues.supplierNote}
                onChange={(event) =>
                  setValue("supplierNote", event.target.value, {
                    shouldDirty: true,
                  })
                }
              />

              <PurchaseTextarea
                className="po-wizard__note"
                label="Ichki izoh (faqat jamoa ko'radi)"
                rows={2}
                value={formValues.internalNote}
                onChange={(event) =>
                  setValue("internalNote", event.target.value, {
                    shouldDirty: true,
                  })
                }
              />
            </div>
          </div>
        </section>
      )}

      {/* 5-qadam: Xulosa (PDF 4-5) */}
      {step === 5 && (
        <section className="po-wizard__panel">
          <div className="po-wizard__summary">
            <div className="po-wizard__summary-block">
              <span>Yetkazib beruvchi</span>
              <strong>{selectedSupplier?.name || "—"}</strong>
            </div>
            <div className="po-wizard__summary-block">
              <span>Tovarlar</span>
              <strong>{items.length} xil</strong>
            </div>
            <div className="po-wizard__summary-block">
              <span>Yetkazish sanasi</span>
              <strong>{formValues.expectedDate || "—"}</strong>
            </div>
            <div className="po-wizard__summary-block">
              <span>To'lov sharti</span>
              <strong>
                {PAYMENT_TERMS.find((term) => term.id === formValues.paymentTerm)
                  ?.label || "—"}
              </strong>
            </div>
            <div className="po-wizard__summary-block">
              <span>Valuta</span>
              <strong>{selectedCurrency}</strong>
            </div>
          </div>

          {/* Point 10: "N mahsulot" o'rniga tovarlarning to'liq jadvali */}
          <div className="po-wizard__summary-table" role="table">
            <div
              className="po-wizard__summary-row po-wizard__summary-row--head"
              role="row"
            >
              <span>Tovar</span>
              <span>Miqdor</span>
              <span>Birlik</span>
              <span>Narx</span>
              <span>Chegirma</span>
              <span>Soliq</span>
              <span>Valyuta</span>
              <span>Jami</span>
            </div>

            {items.map((item) => (
              <div className="po-wizard__summary-row" role="row" key={item.id}>
                <span className="po-wizard__summary-row-name">{item.name}</span>
                <span>{formatQuantity(item.quantity)}</span>
                <span>{item.unitLabel}</span>
                <span>{formatCurrencyMoney(item.price, selectedCurrency)}</span>
                <span>{item.discountPercent ? `${item.discountPercent}%` : "—"}</span>
                <span>{item.taxRate}%</span>
                <span>{selectedCurrency}</span>
                <span className="po-wizard__summary-row-total">
                  {formatCurrencyMoney(
                    calculateLineSubtotal(item),
                    selectedCurrency,
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="po-wizard__totals">
            <div>
              <span>Oraliq jami</span>
              <strong>
                {formatCurrencyMoney(totals.linesSubtotal, selectedCurrency)}
              </strong>
            </div>
            <div>
              <span>Umumiy chegirma</span>
              <strong>
                -{formatCurrencyMoney(totals.orderDiscount, selectedCurrency)}
              </strong>
            </div>
            <div>
              <span>
                QQS (
                {formValues.taxMode === TAX_MODES.inclusive ? "ichida" : "ustiga"})
              </span>
              <strong>
                {formatCurrencyMoney(totals.taxAmount, selectedCurrency)}
              </strong>
            </div>
            <div className="po-wizard__totals-grand">
              <span>JAMI</span>
              {/* Point 12: valyuta formati BUTUN modulda bir xil — "44 USD ≈ 556 600 so'm" */}
              <strong>
                {formatCurrencyWithBase(totals.total, selectedCurrency, exchangeRate)}
              </strong>
            </div>
          </div>

          <div className="po-wizard__approval-preview">
            <ShieldCheck size={16} />
            {approvalPreview.length === 0 ? (
              <span>Summa 1 mln gacha — avtomatik tasdiqlanadi.</span>
            ) : (
              <span>
                Tasdiq bosqichlari:{" "}
                {approvalPreview
                  .map((entry) => APPROVAL_ROLE_LABELS[entry.role])
                  .join(" → ")}
              </span>
            )}
          </div>

          {/* PDF 57-60 (Enterprise Budget Control): shu PO ga tegishli barcha
              faol byudjet — Joriy/Qolgan/Xariddan keyingi holat, Hard/Soft
              Limit nazorati bilan. */}
          {budgetImpacts.length > 0 && (
            <div className="po-wizard__budget">
              <h4>Byudjet nazorati</h4>
              <BudgetImpactPanel impacts={budgetImpacts} getSupplier={getSupplierById} />
            </div>
          )}

          {submitAttempted && validation.length > 0 && (
            <ul className="po-wizard__errors">
              {validation.map((issue) => (
                <li key={issue}>
                  <AlertTriangle size={13} />
                  {issue}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <footer className="po-wizard__footer">
        <div className="po-wizard__footer-left">
          <button
            className="purchase-btn purchase-btn--ghost"
            type="button"
            onClick={onCancel}
          >
            Chiqish
          </button>

          <button
            className="purchase-btn purchase-btn--ghost"
            type="button"
            onClick={handleSaveDraft}
          >
            <Save size={15} />
            Qoralama sifatida saqlash
          </button>
        </div>

        <div className="po-wizard__footer-right">
          {step > 1 && (
            <button
              className="purchase-btn purchase-btn--ghost"
              type="button"
              onClick={() => setStep((current) => current - 1)}
            >
              <ArrowLeft size={15} />
              Ortga
            </button>
          )}

          {step < STEPS.length ? (
            <button
              className="purchase-btn purchase-btn--primary"
              type="button"
              disabled={!stepAllowsNext()}
              onClick={() => setStep((current) => current + 1)}
            >
              Keyingi qadam
              <ArrowRight size={15} />
            </button>
          ) : (
            <button
              className="purchase-btn purchase-btn--success"
              type="button"
              disabled={hardBlockingBudgets.length > 0}
              title={
                hardBlockingBudgets.length > 0
                  ? "Qattiq byudjet chegarasi oshib ketgani uchun bloklangan"
                  : undefined
              }
              onClick={handleSubmit}
            >
              <Send size={15} />
              Tasdiqqa yuborish
            </button>
          )}
        </div>
      </footer>

      {/* Point 9: narx tahrirlanganda "faqat shu xarid" yoki "standartni
          yangilash" dialogi — supplier standart narxi Purchases doirasida
          saqlanadi (katalogga tegilmaydi). */}
      <PurchaseModal
        open={!!priceConfirm}
        size="sm"
        title="Narx o'zgartirildi"
        description={
          priceConfirm
            ? `${priceConfirm.name}: ${formatMoney(priceConfirm.oldPrice)} → ${formatMoney(
                priceConfirm.newPrice,
              )}. Bu o'zgarishni qanday qo'llaymiz?`
            : ""
        }
        onClose={() => resolvePriceConfirm(false)}
        footer={
          <>
            <button
              className="purchase-btn purchase-btn--ghost"
              type="button"
              onClick={() => resolvePriceConfirm(false)}
            >
              Faqat shu xarid uchun
            </button>
            <button
              className="purchase-btn purchase-btn--primary"
              type="button"
              onClick={() => resolvePriceConfirm(true)}
            >
              Standart narxni yangilash
            </button>
          </>
        }
      />

      {/* PDF 58 (Enterprise Budget Control, Soft Limit): chegaradan oshgan
          byudjet(lar) bo'lsa, davom etish uchun sabab majburiy — audit
          uchun order.budgetOverrides ga yoziladi. */}
      <ConfirmReasonModal
        open={budgetOverrideModalOpen}
        title="Byudjet chegarasidan oshish"
        description={
          softExceededBudgets.length > 0
            ? `Quyidagi byudjet(lar) chegaradan oshadi: ${softExceededBudgets
                .map((entry) => entry.budget.name)
                .join(", ")}. Bu yumshoq chegara (Soft Limit) — davom etish uchun sabab kiriting.`
            : ""
        }
        confirmLabel="Sababni tasdiqlab, yuborish"
        tone="primary"
        onClose={() => setBudgetOverrideModalOpen(false)}
        onConfirm={(reason) => {
          setBudgetOverrideModalOpen(false);
          finalizeSubmit(reason);
        }}
      />
    </div>
  );
};

export default PurchaseOrderWizard;
