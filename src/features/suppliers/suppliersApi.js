// Suppliers moduli — markaziy ma'lumot qatlami (backend ulanguncha
// oflayn-first, localStorage bilan). Dashboard modulidagi bilan bir xil FLAT
// arxitektura: components/, pages/, bitta ...Api.js fayl, index.js barrel —
// Purchases'dagi kabi ko'p qatlamli papkalar (hooks/, constants/, utils/,
// data/) ishlatilmaydi.
//
// Task 2/5: supplier yaratish/tahrirlash mantiqi shu yerda — yagona manba.
// Purchases moduli suppliers'ni shu yerdan iste'mol qiladi, o'z nusxasini
// saqlamaydi (usePurchasesStore.js shu faylga delegatsiya qiladi).

import { useCallback, useEffect, useState } from "react";

import { store } from "../../app/store/store";
import { businessOSActions } from "../../core/businessOS/businessOSSlice";
import {
  enforceSinglePreferredSupplier,
  normalizeSupplierProductRelations,
  upsertSupplierProductRelation,
} from "../../core/businessOS/erpProductModel";
import { RETURN_STATUSES } from "../purchases/constants/paymentTerms";
import {
  PURCHASE_ROLES,
  PURCHASE_ROLE_LABELS,
} from "../purchases/constants/purchasePermissions";
import { purchaseCurrentUser } from "../purchases/data/purchaseSuppliers";
import { getSupplierOutstandingDebt } from "../purchases/utils/purchaseCalculations";
import { createEntityId } from "../purchases/utils/purchaseIds";
import { normalizeNumber } from "../purchases/utils/purchaseMoney";
import { notifySupplierIssue } from "../purchases/notifications/notificationTriggers";

const STORAGE_KEY = "zenix:suppliers:v2";

const isBrowser = () => typeof window !== "undefined" && !!window.localStorage;

const nowIso = () => new Date().toISOString();

// ---------- RBAC — Suppliers moduli huquqlari (PDF §84 Role Management) ----------
// Rol tizimi Purchases bilan BIR XIL (PURCHASE_ROLES) — ilova bo'ylab yagona
// foydalanuvchi/rol modeli, ikkinchi marta ixtiro qilinmaydi. Hozircha
// (Purchases'dagi kabi) faqat bitta hardcoded actor bor — `purchaseCurrentUser`
// (rol: owner), shu sabab bu yerdagi ruxsat tekshiruvi ham amaliyotda faqat
// "owner" orqali sinaladi; boshqa rollar bilan real login ulanganda mantiq
// o'zgarishsiz ishlaydi (audit: Purchases'dagi bir xil cheklov — "RBAC mavjud,
// lekin kuzatib bo'lmaydi", shu sabab bu yerda ham ochiq tan olinadi).
export { PURCHASE_ROLES as SUPPLIER_ROLES, PURCHASE_ROLE_LABELS as SUPPLIER_ROLE_LABELS };

export const supplierCurrentUser = purchaseCurrentUser;

export const SUPPLIER_PERMISSIONS = {
  view: "supplier.view",
  create: "supplier.create",
  edit: "supplier.edit",
  statusChange: "supplier.status_change",
  archive: "supplier.archive",
  restore: "supplier.restore",
  export: "supplier.export",
  import: "supplier.import",
  bulk: "supplier.bulk",
  claimManage: "supplier.claim_manage",
};

const SUPPLIER_ROLE_PERMISSIONS = {
  [PURCHASE_ROLES.buyer]: [
    SUPPLIER_PERMISSIONS.view,
    SUPPLIER_PERMISSIONS.create,
    SUPPLIER_PERMISSIONS.edit,
  ],
  [PURCHASE_ROLES.manager]: [
    SUPPLIER_PERMISSIONS.view,
    SUPPLIER_PERMISSIONS.create,
    SUPPLIER_PERMISSIONS.edit,
    SUPPLIER_PERMISSIONS.statusChange,
    SUPPLIER_PERMISSIONS.archive,
    SUPPLIER_PERMISSIONS.restore,
    SUPPLIER_PERMISSIONS.export,
    SUPPLIER_PERMISSIONS.import,
    SUPPLIER_PERMISSIONS.bulk,
    SUPPLIER_PERMISSIONS.claimManage,
  ],
  [PURCHASE_ROLES.finance]: [
    SUPPLIER_PERMISSIONS.view,
    SUPPLIER_PERMISSIONS.export,
    SUPPLIER_PERMISSIONS.claimManage,
  ],
  [PURCHASE_ROLES.warehouse]: [SUPPLIER_PERMISSIONS.view],
  [PURCHASE_ROLES.owner]: Object.values(SUPPLIER_PERMISSIONS),
};

// Backend-ready: faqat (rol, ruxsat) qabul qiladi/qaytaradi — real
// autentifikatsiya ulanganda ham shu bitta funksiya, faqat `role` haqiqiy
// foydalanuvchidan keladi.
export const hasSupplierPermission = (role, permission) =>
  (SUPPLIER_ROLE_PERMISSIONS[role] || []).includes(permission);

// ---------- Supplier Claim / Issue — holat state machine (PDF §39) ----------
// "Muammo" sifatida belgilangan izohlar endi oddiy matn emas, balki
// kuzatiladigan da'vo (claim) — SUPPLIER_STATUS_FLOW bilan bir xil naqshda
// qat'iy holat o'tishlari bilan.
export const CLAIM_STATUSES = {
  open: "open",
  reviewing: "reviewing",
  resolved: "resolved",
  rejected: "rejected",
};

export const CLAIM_STATUS_LABELS = {
  [CLAIM_STATUSES.open]: "Ochiq",
  [CLAIM_STATUSES.reviewing]: "Ko'rib chiqilmoqda",
  [CLAIM_STATUSES.resolved]: "Hal qilindi",
  [CLAIM_STATUSES.rejected]: "Rad etildi",
};

export const CLAIM_STATUS_TONES = {
  [CLAIM_STATUSES.open]: "danger",
  [CLAIM_STATUSES.reviewing]: "warning",
  [CLAIM_STATUSES.resolved]: "success",
  [CLAIM_STATUSES.rejected]: "neutral",
};

const CLAIM_STATUS_FLOW = {
  [CLAIM_STATUSES.open]: [CLAIM_STATUSES.reviewing, CLAIM_STATUSES.rejected],
  [CLAIM_STATUSES.reviewing]: [CLAIM_STATUSES.resolved, CLAIM_STATUSES.rejected],
  [CLAIM_STATUSES.resolved]: [],
  [CLAIM_STATUSES.rejected]: [],
};

export const canTransitionClaimStatus = (from, to) =>
  from === to || (CLAIM_STATUS_FLOW[from] || []).includes(to);

// ---------- Activity Timeline / Audit Log (PDF §86-87) ----------
// Purchases modulidagi bilan BIR XIL naqsh (`order.timeline` / PurchaseTimeline):
// global audit jadvali emas, balki har bir supplier yozuviga tegishli,
// append-only hodisalar ro'yxati — kim, nima, qachon. Bir vaqtning o'zida
// ham "Supplier Activity Timeline", ham "Audit Log" talabini qondiradi
// (Purchases auditida ham xuddi shu yechim qabul qilingan).
const buildTimelineEntry = (type, label, actor) => ({
  id: createEntityId("stl"),
  type,
  label,
  actor: actor?.name || actor || "Tizim",
  at: nowIso(),
});

// updateSupplier bitta umumiy action bo'lgani uchun (kontakt, kategoriya,
// kredit, mahsulot bog'lash — barchasi shu orqali o'tadi), timeline yozuvi
// UCHUN eng releventi payload kalitlaridan aniqlanadi (Consistency: to'liq
// diff emas, lekin foydalanuvchiga tushunarli, aniq yozuv).
const describeSupplierUpdate = (payload = {}) => {
  if (payload.productIds !== undefined) return "Bog'langan mahsulotlar yangilandi";
  if (payload.creditLimit !== undefined) return "Kredit limiti yangilandi";
  if (payload.leadTimeDays !== undefined) return "Yetkazish muddati yangilandi";
  if (payload.categories !== undefined) return "Kategoriyalar yangilandi";
  if (payload.status !== undefined) return "Holat o'zgartirildi";

  return "Profil ma'lumotlari yangilandi";
};

const SUPPLIER_DIFF_LABELS = {
  name: "nom",
  phone: "telefon",
  email: "email",
  address: "manzil",
  contactPerson: "aloqa shaxsi",
  stir: "STIR",
  productIds: "bog'langan mahsulotlar",
  productOverrides: "mahsulot shartlari",
  creditLimit: "kredit limiti",
  leadTimeDays: "yetkazish muddati",
  categories: "kategoriyalar",
  status: "holat",
  score: "manual reyting",
};

const normalizeForDiff = (value) =>
  Array.isArray(value) || (value && typeof value === "object")
    ? JSON.stringify(value)
    : String(value ?? "");

const buildSupplierDiff = (before = {}, after = {}, payload = {}) =>
  Object.keys(payload)
    .filter((key) => normalizeForDiff(before[key]) !== normalizeForDiff(after[key]))
    .map((key) => ({
      field: key,
      label: SUPPLIER_DIFF_LABELS[key] || key,
      oldValue: before[key],
      newValue: after[key],
    }));

const describeSupplierDiff = (diffs = []) =>
  diffs.length ? `Yangilandi: ${diffs.map((diff) => diff.label).join(", ")}` : "";

// ---------- Kategoriyalar ----------

export const SUPPLIER_CATEGORIES = [
  { id: "raw_materials", label: "Xomashyo" },
  { id: "food", label: "Oziq-ovqat" },
  { id: "beverages", label: "Ichimliklar" },
  { id: "packaging", label: "Qadoqlash" },
  { id: "equipment", label: "Uskunalar" },
  { id: "office_supplies", label: "Ofis buyumlari" },
  { id: "cleaning", label: "Tozalash vositalari" },
  { id: "services", label: "Xizmatlar" },
  { id: "transport", label: "Transport" },
  { id: "other", label: "Boshqa" },
];

export const getCategoryLabel = (categoryId) =>
  SUPPLIER_CATEGORIES.find((entry) => entry.id === categoryId)?.label ||
  categoryId ||
  "";

// ---------- Holat ----------

export const SUPPLIER_STATUSES = {
  active: "active",
  inactive: "inactive",
  new: "new",
  blocked: "blocked",
};

export const SUPPLIER_STATUS_LABELS = {
  [SUPPLIER_STATUSES.active]: "Faol",
  [SUPPLIER_STATUSES.inactive]: "Nofaol",
  [SUPPLIER_STATUSES.new]: "Yangi",
  [SUPPLIER_STATUSES.blocked]: "Bloklangan",
};

export const SUPPLIER_STATUS_TONES = {
  [SUPPLIER_STATUSES.active]: "success",
  [SUPPLIER_STATUSES.inactive]: "neutral",
  [SUPPLIER_STATUSES.new]: "primary",
  [SUPPLIER_STATUSES.blocked]: "danger",
};

// ---------- Holat o'tishlari — qat'iy state machine ----------
// Purchases modulidagi PURCHASE_STATUS_FLOW (purchaseStatuses.js) bilan bir
// xil naqsh: har o'tish faqat ruxsat etilgan yo'nalishda bo'ladi, "Invalid
// transition" tuzatuvchi/dropdown orqali ham, to'g'ridan-to'g'ri action
// chaqirilganda ham mumkin emas.
export const SUPPLIER_STATUS_FLOW = {
  [SUPPLIER_STATUSES.new]: [SUPPLIER_STATUSES.active, SUPPLIER_STATUSES.blocked],
  [SUPPLIER_STATUSES.active]: [
    SUPPLIER_STATUSES.inactive,
    SUPPLIER_STATUSES.blocked,
  ],
  [SUPPLIER_STATUSES.inactive]: [
    SUPPLIER_STATUSES.active,
    SUPPLIER_STATUSES.blocked,
  ],
  // Bloklangan supplier faqat qayta faollashtirilishi (unblock) mumkin —
  // to'g'ridan-to'g'ri "nofaol"/"yangi"ga o'tish yo'q, chunki blokdan
  // chiqarish har doim ongli qayta ko'rib chiqishni anglatadi.
  [SUPPLIER_STATUSES.blocked]: [SUPPLIER_STATUSES.active],
};

export const canTransitionSupplierStatus = (from, to) =>
  from === to || (SUPPLIER_STATUS_FLOW[from] || []).includes(to);

// ---------- Supplier Score — Enterprise (avtomatik hisoblanadigan) ----------
// Ilgari `score` faqat yaratishda kiritilgan STATIK raqam edi va hech qachon
// yangilanmasdi. Quyidagi funksiyalar Purchases moduli tarixidan (xarid/
// qabul/qaytarish/invoys — FAQAT O'QISH uchun, bu yerda nusxa saqlanmaydi)
// tarkibiy (composite) ballni HAR CHAQIRUVDA qayta hisoblaydi — supplier
// kartochkasidagi `score` maydoni endi faqat (a) tarixi yo'q yangi supplier
// uchun boshlang'ich qiymat va (b) bloklangan holatda chegara sifatida
// ishlatiladi, ko'rsatiladigan ball esa doim shu yerdan chiqadi.

// Tarixi yo'q (yangi) supplier uchun neytral boshlang'ich ball.
export const SUPPLIER_SCORE_BASELINE = 70;

// Har bir omilning ball ichidagi ulushi (yig'indisi 1.0). O'z vaqtida
// yetkazish — yetkazib beruvchi ishonchliligining birinchi ko'rsatkichi,
// shu sabab eng og'ir vaznga ega; so'ng sifat (buzuq/yetishmagan tovar),
// keyin qaytarish darajasi, oxirida moliyaviy xavf (kredit limiti
// ishlatilishi).
export const SUPPLIER_SCORE_WEIGHTS = {
  onTime: 0.35,
  quality: 0.25,
  reliability: 0.2,
  financial: 0.2,
};

// Bloklangan supplier — operatsion tarixi qanchalik yaxshi bo'lmasin, ball
// hech qachon shu chegaradan yuqori ko'rsatilmaydi (blocklash operatsion
// ko'rsatkichdan ustun turadigan qat'iy business qoida).
export const SUPPLIER_SCORE_BLOCKED_CEILING = 15;

// Nofaol supplier — hozircha faol nazoratdan o'tmagani uchun ball 100%gacha
// ko'tarilmaydi (operatsion ko'rsatkichlar baribir hisobga olinadi, faqat
// yuqori chegara pasaytiriladi).
export const SUPPLIER_SCORE_INACTIVE_CEILING = 85;

const clampPercent = (value) => Math.min(100, Math.max(0, value));

// Har qanday kiritilgan/hisoblangan ball 0-100 oralig'iga va butun songa
// majburiy moslashtiriladi — manfiy, 100dan katta, NaN yoki undefined qiymat
// hech qachon saqlanadigan/ko'rsatiladigan holatga o'tmaydi (Business
// Validation: "Invalid score", "Negative values"). Bug fix: ilgari
// `Number(payload.score) || 70` ishlatilardi — bu manfiy sonlarni
// (masalan -10, haqiqiy son bo'lgani uchun "truthy") o'tkazib yuborardi VA
// haqiqiy `0` qiymatini noto'g'ri 70ga almashtirardi.
export const clampScore = (value, fallback = SUPPLIER_SCORE_BASELINE) => {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) return fallback;

  return Math.round(clampPercent(numeric));
};

// Kredit limiti manfiy bo'lishi mumkin emas (xuddi shu `Number(x) || 0` bugi
// bu yerda ham bor edi — manfiy limit o'tib ketardi).
export const clampCreditLimit = (value, fallback = 0) => {
  const numeric = Number(value);

  if (!Number.isFinite(numeric) || numeric < 0) return fallback;

  return Math.round(numeric);
};

// Yetkazish muddati kamida 1 kun bo'lishi kerak (0/manfiy — real xarid
// rejalashtirishda ma'nosiz).
export const clampLeadTimeDays = (value, fallback = 3) => {
  const numeric = Number(value);

  if (!Number.isFinite(numeric) || numeric < 1) return fallback;

  return Math.round(numeric);
};

export const SUPPLIER_SCORE_TONE_THRESHOLDS = { high: 80, mid: 50 };

// Ball rangini aniqlash — ilgari SupplierProfile VA SupplierTable ikkalasida
// ham bir xil son (80/50) alohida-alohida yozilgan edi (Consistency:
// "Duplicate logic bo'lmasin"). Endi YAGONA joyda.
export const getSupplierScoreTone = (score) => {
  if (score >= SUPPLIER_SCORE_TONE_THRESHOLDS.high) return "high";
  if (score >= SUPPLIER_SCORE_TONE_THRESHOLDS.mid) return "mid";

  return "low";
};

// ---------- Kredit limiti — professional validatsiya ----------

export const CREDIT_STATUSES = {
  none: "none",
  ok: "ok",
  warning: "warning",
  exceeded: "exceeded",
};

// Mavjud UI'da qarz-bar allaqachon 80%dan "xavfli" rangda ko'rsatilardi
// (qattiq kodlangan raqam, hech qanday nomlangan konstantasiz) — endi shu
// bir xil chegara markazlashtirilgan va qarz HOLATI (ok/warning/exceeded)
// sifatida qayta ishlatiladi.
export const CREDIT_WARNING_THRESHOLD_PERCENT = 80;

// Backend-ready: bu funksiya faqat son qabul qiladi/qaytaradi (React/DOM'ga
// bog'liq emas) — backend validatsiya qatlami xuddi shu formulani
// o'zgarishsiz qayta ishlatishi mumkin. Kredit limiti 0 bo'lsa (kredit
// berilmagan) — xavf yo'q ("none"), aks holda limit qarzdan oshib ketgan
// ("exceeded"), ogohlantirish chegarasidan yuqori ("warning") yoki normal
// ("ok") holatlarga ajratiladi.
export const getSupplierCreditStatus = (creditLimit, debt) => {
  const limit = clampCreditLimit(creditLimit);
  const used = Math.max(Number(debt) || 0, 0);

  if (!limit) {
    return { status: CREDIT_STATUSES.none, usedPercent: 0, available: 0 };
  }

  const usedPercent = Math.round((used / limit) * 100);

  if (used > limit) {
    return { status: CREDIT_STATUSES.exceeded, usedPercent, available: 0 };
  }

  if (usedPercent >= CREDIT_WARNING_THRESHOLD_PERCENT) {
    return {
      status: CREDIT_STATUSES.warning,
      usedPercent,
      available: limit - used,
    };
  }

  return { status: CREDIT_STATUSES.ok, usedPercent, available: limit - used };
};

// ---------- Operatsion ko'rsatkichlar (Purchases tarixidan, faqat o'qish) ----------
// Bitta YAGONA joyda hisoblanadi. Eslatma: aynan shu "o'z vaqtida yetkazish"
// formulasining nusxalari aiEngine.js va reportCalculations.js'da ham bor,
// lekin ular Purchases moduliga tegishli — shu ishning ko'lami (faqat
// Suppliers) tashqarisida, o'zgartirilmaydi.
export const computeSupplierOperationalMetrics = (
  { orders = [], receipts = [], returns = [], invoices = [] } = {},
  supplierId,
) => {
  const supplierOrders = orders.filter((order) => order.supplierId === supplierId);
  const supplierReceipts = receipts.filter(
    (receipt) => receipt.supplierId === supplierId,
  );

  const deliveredOrders = supplierOrders.filter((order) =>
    supplierReceipts.some((receipt) => receipt.orderId === order.id),
  );

  const onTimeCount = deliveredOrders.filter((order) => {
    const firstReceivedAt = supplierReceipts
      .filter((receipt) => receipt.orderId === order.id)
      .map((receipt) => receipt.receivedAt)
      .sort()[0];

    return !order.expectedDate || !firstReceivedAt
      ? true
      : firstReceivedAt.slice(0, 10) <= order.expectedDate;
  }).length;

  const onTimePercent = deliveredOrders.length
    ? Math.round((onTimeCount / deliveredOrders.length) * 100)
    : null;

  // Sifat ko'rsatkichi — bu supplierdan qabul qilingan qatorlardagi "yaxshi"
  // (received) va "muammoli" (damaged + missing) miqdor nisbati. Alohida
  // "mahsulot sifati" maydoni mavjud bo'lmagani sabab, real qabul
  // hujjatlaridagi buzuq/yetishmagan miqdor supplier sifat ishonchliligi
  // uchun eng yaqin, haqiqatan mavjud ko'rsatkich hisoblanadi.
  let goodQty = 0;
  let problemQty = 0;

  supplierReceipts.forEach((receipt) => {
    (receipt.items || []).forEach((item) => {
      goodQty += normalizeNumber(item.received);
      problemQty += normalizeNumber(item.damaged) + normalizeNumber(item.missing);
    });
  });

  const totalHandledQty = goodQty + problemQty;
  const damageRatePercent = totalHandledQty
    ? Math.round((problemQty / totalHandledQty) * 1000) / 10
    : 0;

  // Faqat TASDIQLANGAN (yoki yakunlangan) qaytarishlar hisoblanadi — hali
  // ko'rib chiqilmagan (pending) yoki asossiz deb topilgan (rejected) da'vo
  // supplierga qarshi hisoblanmaydi.
  const confirmedReturns = returns.filter(
    (entry) =>
      entry.supplierId === supplierId &&
      (entry.status === RETURN_STATUSES.approved ||
        entry.status === RETURN_STATUSES.completed),
  );

  const returnRatePercent = deliveredOrders.length
    ? Math.round((confirmedReturns.length / deliveredOrders.length) * 1000) / 10
    : 0;

  const debt = getSupplierOutstandingDebt(invoices, supplierId);

  return {
    totalOrders: supplierOrders.length,
    deliveredCount: deliveredOrders.length,
    onTimePercent,
    damageRatePercent,
    returnRatePercent,
    debt,
  };
};

// Composite ball — supplier kartochkasida SAQLANMAYDI, har safar shu
// funksiya orqali qayta hisoblanadi (xuddi qarz — getSupplierOutstandingDebt
// kabi "har doim jonli" bo'lishi kerak, aks holda eskirib qoladi).
export const computeSupplierScore = (supplier = {}, metrics = {}) => {
  const {
    totalOrders = 0,
    onTimePercent = null,
    damageRatePercent = 0,
    returnRatePercent = 0,
    debt = 0,
  } = metrics;

  // Business rule: bloklangan supplier hech qachon "yaxshi" ko'rinmaydi —
  // operatsion tarixi qanday bo'lishidan qat'i nazar.
  if (supplier.blocked || supplier.status === SUPPLIER_STATUSES.blocked) {
    return Math.min(SUPPLIER_SCORE_BLOCKED_CEILING, clampScore(supplier.score));
  }

  // Business rule: hali birorta ham buyurtma bo'lmagan (yangi) supplier
  // operatsion ma'lumot yo'qligi uchun jazolanmaydi — neytral boshlang'ich
  // ball qaytariladi.
  if (!totalOrders) {
    return SUPPLIER_SCORE_BASELINE;
  }

  const creditStatus = getSupplierCreditStatus(supplier.creditLimit, debt);

  const onTimeComponent = onTimePercent ?? SUPPLIER_SCORE_BASELINE;
  const qualityComponent = clampPercent(100 - damageRatePercent);
  const reliabilityComponent = clampPercent(100 - returnRatePercent);
  const financialComponent = clampPercent(100 - creditStatus.usedPercent);

  const composite =
    onTimeComponent * SUPPLIER_SCORE_WEIGHTS.onTime +
    qualityComponent * SUPPLIER_SCORE_WEIGHTS.quality +
    reliabilityComponent * SUPPLIER_SCORE_WEIGHTS.reliability +
    financialComponent * SUPPLIER_SCORE_WEIGHTS.financial;

  const ceiling =
    supplier.status === SUPPLIER_STATUSES.inactive
      ? SUPPLIER_SCORE_INACTIVE_CEILING
      : 100;

  return Math.min(Math.round(composite), ceiling);
};

// ---------- Boshlang'ich ma'lumot ----------

const SEED_SUPPLIERS = [];

// ---------- Lokal saqlash ----------

const loadState = () => {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveState = (state) => {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // saqlash imkoni bo'lmasa jim o'tamiz (private mode va h.k.)
  }
};

const normalizeSupplierState = (state = {}) => ({
  ...state,
  suppliers: (state.suppliers || SEED_SUPPLIERS).map((supplier) => ({
    ...supplier,
    ...normalizeSupplierProductRelations(supplier),
  })),
});

let storeState = normalizeSupplierState(loadState() || { suppliers: SEED_SUPPLIERS });
const listeners = new Set();

const emit = () => {
  saveState(storeState);
  listeners.forEach((listener) => listener(storeState));
};

const setStoreState = (updater) => {
  storeState = updater(storeState);
  emit();
};

// `categories` (ko'p-tanlovli) va eski `category` (bitta satr, Purchases hali
// shu maydonni o'qiydi) bir-biriga muvofiqlashtiriladi — ikkalasi ham har
// doim mos saqlanadi (Task 3 + orqaga moslik).
const normalizeCategoryFields = (payload = {}) => {
  const categories = payload.categories?.length
    ? payload.categories
    : payload.category
      ? [payload.category]
      : [];

  const category = categories.length
    ? getCategoryLabel(categories[0])
    : payload.category || "";

  return { categories, category };
};

// Non-hook snapshot — Purchases store'ining setStoreState ichidan (React
// hookisiz) joriy supplier holatini sinxron o'qishi uchun (Task 5: blocked
// supplier tekshiruvi Purchases business qoidasi o'zgarishsiz qoladi).
export const getSupplierSnapshot = (id) =>
  storeState.suppliers.find((entry) => entry.id === id) || null;

// ---------- Import (CSV) — sof (React'ga bog'liq bo'lmagan) qatorlar parser ----------
// Backend hali yo'q (bu modulda umuman yo'q) — Purchases'dagi reportExport.js
// bilan bir xil ";" ajratuvchi va qo'shtirnoq konvensiyasi ishlatiladi
// (Consistency: bitta ilovada ikkita xil CSV formati bo'lmasin). Kutilgan
// ustunlar: name;phone;email;address;contactPerson;stir;category;creditLimit;
// leadTimeDays — tartib muhim emas, sarlavha qatoridagi nomlar bo'yicha
// moslanadi.
const SUPPLIER_CSV_COLUMNS = [
  "name",
  "phone",
  "email",
  "address",
  "contactPerson",
  "stir",
  "category",
  "creditLimit",
  "leadTimeDays",
];

const splitCsvLine = (line) => {
  const cells = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === ";" && !quoted) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());

  return cells;
};

export const parseSuppliersCsv = (text) => {
  const lines = (text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return [];

  const header = splitCsvLine(lines[0]).map((cell) => cell.toLowerCase());
  const knownColumns = SUPPLIER_CSV_COLUMNS.filter((column) =>
    header.includes(column.toLowerCase()),
  );

  // Sarlavha tanilmasa (masalan foydalanuvchi ustun nomisiz fayl yuklasa),
  // standart tartib (SUPPLIER_CSV_COLUMNS) bo'yicha o'qiladi — birinchi
  // qator baribir sarlavha deb hisoblanadi va o'tkazib yuboriladi.
  const columns = knownColumns.length ? header : SUPPLIER_CSV_COLUMNS;
  const dataLines = knownColumns.length ? lines.slice(1) : lines;

  return dataLines.map((line) => {
    const cells = splitCsvLine(line);

    return columns.reduce((row, column, index) => {
      const key = SUPPLIER_CSV_COLUMNS.find(
        (candidate) => candidate.toLowerCase() === column.toLowerCase(),
      );

      if (key) row[key] = cells[index] || "";

      return row;
    }, {});
  });
};

export const useSuppliers = () => {
  const [state, setState] = useState(storeState);

  useEffect(() => {
    const listener = (next) => setState(next);

    listeners.add(listener);

    return () => listeners.delete(listener);
  }, []);

  const getSupplier = useCallback(
    (id) => state.suppliers.find((entry) => entry.id === id) || null,
    [state.suppliers],
  );

  // Task 2: PurchaseOrderWizard'dagi "Yangi supplier" tezkor formasi ham,
  // Suppliers modulidagi to'liq forma ham shu YAGONA actionni chaqiradi —
  // mantiq ikki joyda yozilmaydi.
  const createSupplier = useCallback((payload, actor = purchaseCurrentUser) => {
    let created = null;
    let error = "";

    setStoreState((current) => {
      const stir = payload.stir?.trim() || "";
      const phone = payload.phone?.trim() || "";
      const email = payload.email?.trim().toLowerCase() || "";

      // Business rule: bitta STIR - bitta supplier (takror oldini olish).
      // Foydalanuvchiga ko'rinadigan xato SupplierForm'da (submit'dan oldin)
      // ko'rsatiladi — bu yerda faqat data-integrity so'nggi chegara sifatida
      // yozishni to'xtatadi (`created` null qoladi, mavjud ma'lumot buzilmaydi).
      if (stir && current.suppliers.some((entry) => entry.stir === stir)) {
        error = "Bu STIR bilan yetkazib beruvchi allaqachon mavjud.";
        return current;
      }

      if (phone && current.suppliers.some((entry) => entry.phone?.trim() === phone)) {
        error = "Bu telefon bilan yetkazib beruvchi allaqachon mavjud.";
        return current;
      }

      if (
        email &&
        current.suppliers.some((entry) => entry.email?.trim().toLowerCase() === email)
      ) {
        error = "Bu email bilan yetkazib beruvchi allaqachon mavjud.";
        return current;
      }

      // Invalid/noma'lum status qiymati "yangi"ga tushadi — string bo'lmagan
      // yoki ro'yxatda yo'q qiymat yaratishda jimgina rad etiladi (Business
      // Validation: "Invalid" holat qiymati).
      const status = Object.values(SUPPLIER_STATUSES).includes(payload.status)
        ? payload.status
        : SUPPLIER_STATUSES.new;
      const { categories, category } = normalizeCategoryFields(payload);

      const supplierId = createEntityId("sup");
      const relationState = normalizeSupplierProductRelations({
        ...payload,
        id: supplierId,
      });

      created = {
        id: supplierId,
        name: (payload.name || "").trim(),
        phone: payload.phone?.trim() || "",
        email: payload.email?.trim() || "",
        address: payload.address?.trim() || "",
        contactPerson: payload.contactPerson?.trim() || "",
        stir,
        categories,
        category,
        // Bug fix: "Boshqa" orqali qo'shilgan custom kategoriyalar tanlov
        // holatidan (categories) MUSTAQIL shu yerda doimiy saqlanadi — aks
        // holda deselect qilinganda kategoriyaning o'zi yo'qolib qolardi
        // (SupplierProfile.jsx qarang).
        customCategories: Array.isArray(payload.customCategories)
          ? payload.customCategories
          : [],
        // Task 5: mahsulot bog'lanishi — YAGONA manba. SupplierProductLinkModal
        // (Supplier profili) va PurchaseOrderWizard ikkalasi ham xuddi shu
        // massivni o'qiydi/yozadi — avtomatik/mock bog'lanish yo'q.
        productIds: relationState.productIds,
        // Har bir bog'langan mahsulotga xos xarid shartlari (SKU, birlik,
        // narx, valyuta, muddat, MOQ, izoh) — productId -> shart xaritasi.
        productOverrides: relationState.productOverrides,
        supplierProducts: relationState.supplierProducts,
        score: clampScore(payload.score),
        leadTimeDays: clampLeadTimeDays(payload.leadTimeDays),
        creditLimit: clampCreditLimit(payload.creditLimit),
        status,
        blocked: status === SUPPLIER_STATUSES.blocked,
        notes: payload.note?.trim()
          ? [
              {
                id: createEntityId("snote"),
                text: payload.note.trim(),
                author: actor.name,
                createdAt: nowIso(),
              },
            ]
          : [],
        documents: [],
        archived: false,
        archivedAt: null,
        archivedBy: null,
        archivedReason: "",
        timeline: [buildTimelineEntry("created", "Yetkazib beruvchi yaratildi", actor)],
        createdBy: actor.name,
        createdAt: nowIso(),
      };

      return { ...current, suppliers: [created, ...current.suppliers] };
    });

    if (created) {
      store.dispatch(businessOSActions.upsertSupplier(created));
      return { ok: true, supplier: created };
    }

    return { ok: false, error: error || "Yetkazib beruvchi yaratilmadi." };
  }, []);

  const updateSupplier = useCallback((id, payload, actor = purchaseCurrentUser) => {
    let result = { ok: false, error: "Yetkazib beruvchi topilmadi." };
    let affectedSuppliers = [];
    const preferredOverride = Object.entries(payload.productOverrides || {})
      .find(([, terms]) => terms?.isPreferredSupplier);
    const preferredSupplierProduct = (payload.supplierProducts || [])
      .find((terms) => terms?.isPreferredSupplier);
    const preferredRequest =
      payload.productId && payload.productTerms?.isPreferredSupplier
        ? { productId: payload.productId }
        : preferredOverride
          ? { productId: preferredOverride[0] }
          : preferredSupplierProduct?.productId
            ? { productId: preferredSupplierProduct.productId }
            : null;

    setStoreState((current) => {
      let nextSuppliers = current.suppliers.map((entry) => {
        if (entry.id !== id) return entry;

        if (entry.archived) {
          result = {
            ok: false,
            error: "Arxivlangan yetkazib beruvchini tahrirlash uchun avval tiklang.",
          };
          return entry;
        }

        // Data integrity backstop: SupplierForm allaqachon duplicate STIR'ni
        // taqdim etishdan oldin tekshiradi, lekin store — yagona manba —
        // shu qoidani o'zi ham kafolatlaydi (masalan boshqa chaqiruvchi
        // to'g'ridan-to'g'ri `updateSupplier` chaqirsa ham ikkita supplier
        // bir xil STIR bilan qolib ketmasligi uchun).
        const incomingStir =
          payload.stir !== undefined ? payload.stir.trim() : undefined;
        const stirTaken =
          incomingStir &&
          current.suppliers.some(
            (other) => other.id !== id && other.stir === incomingStir,
          );

        if (stirTaken) {
          result = {
            ok: false,
            error: "Bu STIR boshqa yetkazib beruvchiga biriktirilgan.",
          };
          return entry;
        }

        const incomingPhone =
          payload.phone !== undefined ? payload.phone.trim() : undefined;
        const phoneTaken =
          incomingPhone &&
          current.suppliers.some(
            (other) => other.id !== id && other.phone?.trim() === incomingPhone,
          );

        if (phoneTaken) {
          result = {
            ok: false,
            error: "Bu telefon boshqa yetkazib beruvchiga biriktirilgan.",
          };
          return entry;
        }

        const incomingEmail =
          payload.email !== undefined ? payload.email.trim().toLowerCase() : undefined;
        const emailTaken =
          incomingEmail &&
          current.suppliers.some(
            (other) =>
              other.id !== id && other.email?.trim().toLowerCase() === incomingEmail,
          );

        if (emailTaken) {
          result = {
            ok: false,
            error: "Bu email boshqa yetkazib beruvchiga biriktirilgan.",
          };
          return entry;
        }

        // Consistency bug fix: createSupplier har doim matn maydonlarini
        // (name/phone/email/address/contactPerson) trim qiladi, lekin
        // updateSupplier ilgari payload'ni xom holda yozardi — tahrirlashda
        // boshida/oxirida bo'sh joy qolib ketishi mumkin edi (masalan
        // qidiruv/STIR solishtirishga ta'sir qiladi). Faqat SupplierForm
        // yuboradigan (payload'da mavjud) matn maydonlari trim qilinadi —
        // boshqa qisman yangilanishlarga (categories, productIds va h.k.)
        // tegilmaydi.
        const trimmedTextFields = ["name", "phone", "email", "address", "contactPerson"]
          .filter((field) => typeof payload[field] === "string")
          .reduce((acc, field) => ({ ...acc, [field]: payload[field].trim() }), {});

        // Business rule: holat o'zgarishi faqat ruxsat etilgan yo'nalishda
        // bo'ladi (SUPPLIER_STATUS_FLOW) — invalid o'tish (masalan
        // bloklangandan to'g'ridan-to'g'ri "yangi"ga) jimgina rad etiladi va
        // eski holat saqlanib qoladi (STIR tekshiruvi bilan bir xil
        // data-integrity backstop; foydalanuvchiga ko'rinadigan cheklov
        // SupplierProfile'dagi Dropdown variantlarida — faqat ruxsat etilgan
        // keyingi holatlar ko'rsatiladi).
        if (
          payload.status &&
          !canTransitionSupplierStatus(entry.status, payload.status)
        ) {
          result = {
            ok: false,
            error: "Bu holatga o'tish lifecycle bo'yicha ruxsat etilmagan.",
          };
          return entry;
        }

        const status = payload.status || entry.status;

        const merged = {
          ...entry,
          ...payload,
          ...trimmedTextFields,
          stir: stirTaken ? entry.stir : incomingStir ?? entry.stir,
          // Business Validation: score/kredit limiti/yetkazish muddati —
          // manfiy yoki noto'g'ri qiymat store darajasida ham to'xtatiladi
          // (createSupplier bilan bir xil himoya darajasi; ilgari
          // updateSupplier bu uchta maydonni umuman tekshirmasdi).
          ...(payload.score !== undefined
            ? { score: clampScore(payload.score, entry.score) }
            : {}),
          ...(payload.creditLimit !== undefined
            ? { creditLimit: clampCreditLimit(payload.creditLimit, entry.creditLimit) }
            : {}),
          ...(payload.leadTimeDays !== undefined
            ? { leadTimeDays: clampLeadTimeDays(payload.leadTimeDays, entry.leadTimeDays) }
            : {}),
        };
        const { categories, category } = normalizeCategoryFields(merged);
        const supplierFields = { ...merged };
        delete supplierFields.productId;
        delete supplierFields.productTerms;
        const relationState =
          payload.productId && payload.productTerms
            ? upsertSupplierProductRelation(entry, payload.productId, payload.productTerms)
            : normalizeSupplierProductRelations({
                ...entry,
                productIds: Array.isArray(payload.productIds)
                  ? payload.productIds
                  : entry.productIds || [],
                productOverrides:
                  payload.productOverrides && typeof payload.productOverrides === "object"
                    ? payload.productOverrides
                    : entry.productOverrides || {},
                supplierProducts: Array.isArray(payload.supplierProducts)
                  ? payload.supplierProducts
                  : entry.supplierProducts || [],
              });
        const nextEntry = {
          ...supplierFields,
          categories,
          category,
          ...relationState,
          status,
          blocked: status === SUPPLIER_STATUSES.blocked,
        };
        const diffs = buildSupplierDiff(entry, nextEntry, payload);

        if (!diffs.length) {
          result = { ok: true, supplier: entry, changed: false };
          return entry;
        }

        result = { ok: true, supplier: nextEntry, changed: true, diffs };

        return {
          ...nextEntry,
          timeline: [
            ...(entry.timeline || []),
            {
              ...buildTimelineEntry("updated", describeSupplierDiff(diffs), actor),
              diffs,
            },
          ],
        };
      });

      if (result.ok && preferredRequest?.productId) {
        nextSuppliers = enforceSinglePreferredSupplier(nextSuppliers, preferredRequest.productId, id);
        result = {
          ...result,
          supplier: nextSuppliers.find((supplier) => supplier.id === id) || result.supplier,
          changed: true,
        };
      }

      affectedSuppliers = nextSuppliers;

      return {
        ...current,
        suppliers: nextSuppliers,
      };
    });

    if (result.ok && result.supplier) {
      if (preferredRequest?.productId) {
        affectedSuppliers.forEach((supplier) =>
          store.dispatch(businessOSActions.upsertSupplier(supplier)),
        );
      } else {
        store.dispatch(businessOSActions.upsertSupplier(result.supplier));
      }
    }

    return result;
  }, []);

  const setSupplierStatus = useCallback((id, status, actor = purchaseCurrentUser) => {
    let result = { ok: false, error: "Yetkazib beruvchi topilmadi." };

    setStoreState((current) => ({
      ...current,
      suppliers: current.suppliers.map((entry) => {
        if (entry.id !== id) return entry;

        if (entry.archived) {
          result = {
            ok: false,
            error: "Arxivlangan yetkazib beruvchi holatini o'zgartirib bo'lmaydi.",
          };
          return entry;
        }

        // Invalid transition bo'lmasin — updateSupplier bilan bir xil qoida
        // (SUPPLIER_STATUS_FLOW), bu action to'g'ridan-to'g'ri chaqirilganda
        // ham chetlab o'tilmaydi.
        if (!canTransitionSupplierStatus(entry.status, status)) {
          result = {
            ok: false,
            error: "Bu holatga o'tish lifecycle bo'yicha ruxsat etilmagan.",
          };
          return entry;
        }

        result = { ok: true };

        return {
          ...entry,
          status,
          blocked: status === SUPPLIER_STATUSES.blocked,
          timeline: [
            ...(entry.timeline || []),
            buildTimelineEntry(
              "status_change",
              `Holat "${SUPPLIER_STATUS_LABELS[status] || status}"ga o'zgartirildi`,
              actor,
            ),
          ],
        };
      }),
    }));

    if (result.ok) {
      const supplier = getSupplierSnapshot(id);
      if (supplier) store.dispatch(businessOSActions.upsertSupplier(supplier));
    }

    return result;
  }, []);

  // ---------- Archive / Restore (soft-delete workflow) ----------
  // Enterprise ERP'da supplier hech qachon "hard delete" qilinmaydi — tarix
  // (xarid, invoys, to'lov) unga bog'liq bo'lib qoladi. Buning o'rniga
  // arxivlash: ro'yxatda standart ko'rinmaydi, lekin ma'lumot butunligicha
  // saqlanadi va istalgan vaqt tiklanadi (restore). Arxivlash paytida
  // `blocked: true` ham o'rnatiladi — bu Purchases modulida ALLAQACHON
  // mavjud, sinovdan o'tgan qat'iy tekshiruv (`supplier?.blocked` —
  // usePurchasesStore.js) orqali arxivlangan supplierga yangi PO ochilishini
  // avtomatik to'xtatadi, Purchases fayllariga TEGILMASDAN (Scope: faqat
  // Suppliers moduli).
  const archiveSupplier = useCallback(
    (id, reason = "", actor = purchaseCurrentUser) => {
      let result = { ok: false, error: "Yetkazib beruvchi topilmadi." };

      setStoreState((current) => ({
        ...current,
        suppliers: current.suppliers.map((entry) => {
          if (entry.id !== id) return entry;

          if (entry.archived) {
            result = { ok: false, error: "Yetkazib beruvchi allaqachon arxivlangan." };
            return entry;
          }

          result = { ok: true };

          return {
            ...entry,
            archived: true,
            archivedAt: nowIso(),
            archivedBy: actor.name,
            archivedReason: reason?.trim() || "",
            blocked: true,
            statusBeforeArchive: entry.status,
            blockedBeforeArchive: entry.blocked,
            timeline: [
              ...(entry.timeline || []),
              buildTimelineEntry(
                "archived",
                reason?.trim()
                  ? `Arxivlandi — sabab: ${reason.trim()}`
                  : "Arxivlandi",
                actor,
              ),
            ],
          };
        }),
      }));

      return result;
    },
    [],
  );

  const restoreSupplier = useCallback((id, actor = purchaseCurrentUser) => {
    let result = { ok: false, error: "Yetkazib beruvchi topilmadi." };

    setStoreState((current) => ({
      ...current,
      suppliers: current.suppliers.map((entry) => {
        if (entry.id !== id) return entry;

        if (!entry.archived) {
          result = { ok: false, error: "Yetkazib beruvchi arxivda emas." };
          return entry;
        }

        result = { ok: true };

        return {
          ...entry,
          archived: false,
          archivedAt: null,
          archivedBy: null,
          archivedReason: "",
          // Blok holati asl `status` maydoniga qarab tiklanadi — agar
          // arxivlashdan OLDIN supplier haqiqatan bloklangan bo'lsa (status
          // === "blocked"), tiklashdan keyin ham bloklangan qoladi.
          blocked:
            entry.blockedBeforeArchive !== undefined
              ? entry.blockedBeforeArchive
              : entry.status === SUPPLIER_STATUSES.blocked,
          status: entry.statusBeforeArchive || entry.status,
          statusBeforeArchive: null,
          blockedBeforeArchive: null,
          timeline: [
            ...(entry.timeline || []),
            buildTimelineEntry("restored", "Arxivdan tiklandi", actor),
          ],
        };
      }),
    }));

    return result;
  }, []);

  // `type` ixtiyoriy — "issue" bo'lsa (masalan Supplier profilida "Muammo
  // sifatida belgilash"), izoh oddiy eslatma emas, balki Notification
  // Center'ga "Yetkazib beruvchida muammo" bildirishnomasi sifatida ham
  // chiqadi. Standart ("general") xatti-harakat o'zgarishsiz qoladi.
  const addSupplierNote = useCallback(
    (id, { text, type = "general" }, actor = purchaseCurrentUser) => {
      if (!text?.trim()) return;

      let createdNote = null;
      let updatedSupplier = null;

      setStoreState((current) => ({
        ...current,
        suppliers: current.suppliers.map((entry) => {
          if (entry.id !== id) return entry;

          createdNote = {
            id: createEntityId("snote"),
            type,
            text: text.trim(),
            author: actor.name,
            createdAt: nowIso(),
            // Claim tracking (PDF §39): "Muammo" izohi yaratilgan zahoti
            // ochiq da'vo sifatida boshlanadi — CLAIM_STATUS_FLOW orqali
            // reviewing -> resolved/rejected'ga o'tadi. Oddiy ("general")
            // izohlarda bu maydon mavjud emas (ular da'vo emas).
            ...(type === "issue" ? { status: CLAIM_STATUSES.open } : {}),
          };

          updatedSupplier = {
            ...entry,
            notes: [...(entry.notes || []), createdNote],
            timeline: [
              ...(entry.timeline || []),
              buildTimelineEntry(
                type === "issue" ? "claim_opened" : "note",
                type === "issue" ? "Yangi da'vo (muammo) ochildi" : "Izoh qo'shildi",
                actor,
              ),
            ],
          };

          return updatedSupplier;
        }),
      }));

      if (createdNote && updatedSupplier && type === "issue") {
        notifySupplierIssue({
          supplier: updatedSupplier,
          noteText: createdNote.text,
          noteId: createdNote.id,
          actor: actor.name,
        });
      }
    },
    [],
  );

  // Claim / Issue holat o'tishi (PDF §39: open -> reviewing -> resolved/
  // rejected). Faqat CLAIM_STATUS_FLOW ruxsat bergan yo'nalishda o'tadi —
  // SUPPLIER_STATUS_FLOW bilan bir xil data-integrity backstop.
  const updateSupplierClaimStatus = useCallback(
    (id, noteId, nextStatus, resolution = "", actor = purchaseCurrentUser) => {
      setStoreState((current) => ({
        ...current,
        suppliers: current.suppliers.map((entry) => {
          if (entry.id !== id) return entry;

          const note = (entry.notes || []).find((item) => item.id === noteId);

          if (!note || note.type !== "issue") return entry;

          // Backward compatibility: shu funksiya qo'shilishidan OLDIN
          // yaratilgan "muammo" izohlarida `status` maydoni umuman yo'q —
          // bunday eski yozuvlar "ochiq" deb hisoblanadi (SupplierNotesTab
          // ham xuddi shu fallback bilan ko'rsatadi), aks holda
          // `canTransitionClaimStatus(undefined, ...)` har doim `false`
          // qaytarib, eski da'volar abadiy "qotib" qolar edi.
          const currentStatus = note.status || CLAIM_STATUSES.open;

          if (!canTransitionClaimStatus(currentStatus, nextStatus)) return entry;

          const isTerminal =
            nextStatus === CLAIM_STATUSES.resolved ||
            nextStatus === CLAIM_STATUSES.rejected;

          return {
            ...entry,
            notes: entry.notes.map((item) =>
              item.id === noteId
                ? {
                    ...item,
                    status: nextStatus,
                    ...(isTerminal
                      ? {
                          resolution: resolution?.trim() || "",
                          resolvedBy: actor.name,
                          resolvedAt: nowIso(),
                        }
                      : {}),
                  }
                : item,
            ),
            timeline: [
              ...(entry.timeline || []),
              buildTimelineEntry(
                "claim_status_change",
                `Da'vo holati "${CLAIM_STATUS_LABELS[nextStatus] || nextStatus}"ga o'zgartirildi`,
                actor,
              ),
            ],
          };
        }),
      }));
    },
    [],
  );

  const addSupplierDocument = useCallback(
    (id, file, actor = purchaseCurrentUser) => {
      const name = file?.name || "";
      const size = Number(file?.size) || 0;
      const extension = name.split(".").pop()?.toLowerCase() || "";
      const allowedExtensions = ["pdf", "doc", "docx", "xls", "xlsx", "png", "jpg", "jpeg"];

      if (!name?.trim()) {
        return { ok: false, error: "Hujjat nomi topilmadi." };
      }

      if (size > 10 * 1024 * 1024) {
        return { ok: false, error: "Hujjat hajmi 10 MBdan oshmasligi kerak." };
      }

      if (extension && !allowedExtensions.includes(extension)) {
        return { ok: false, error: "Bu fayl turi qo'llab-quvvatlanmaydi." };
      }

      let result = { ok: false, error: "Yetkazib beruvchi topilmadi." };

      setStoreState((current) => ({
        ...current,
        suppliers: current.suppliers.map((entry) =>
          entry.id === id
            ? (() => {
                result = { ok: true };

                return {
                ...entry,
                documents: [
                  ...(entry.documents || []),
                  {
                    id: createEntityId("sdoc"),
                    name: name.trim(),
                    size,
                    type: file.type || name.split(".").pop() || "file",
                    extension:
                      file.extension || name.split(".").pop()?.toLowerCase() || "",
                    mimeType: file.mimeType || "",
                    previewUrl: file.previewUrl || "",
                    downloadUrl: file.downloadUrl || "",
                    localOnly: !!file.localOnly,
                    author: actor.name,
                    uploadedAt: nowIso(),
                    // Enterprise Notifications: ixtiyoriy amal muddati —
                    // shartnoma/litsenziya/sertifikat kabi hujjatlar uchun.
                    // Bo'sh bo'lsa "muddati tugash" ogohlantirishi ishga
                    // tushmaydi (useNotificationsSync).
                    expiryDate: file.expiryDate || "",
                  },
                ],
                timeline: [
                  ...(entry.timeline || []),
                  buildTimelineEntry("document_add", `Hujjat qo'shildi: ${name.trim()}`, actor),
                ],
              };
              })()
            : entry,
        ),
      }));

      return result;
    },
    [],
  );

  const removeSupplierDocument = useCallback((id, documentId, actor = purchaseCurrentUser) => {
    setStoreState((current) => ({
      ...current,
      suppliers: current.suppliers.map((entry) => {
        if (entry.id !== id) return entry;

        const removedName =
          (entry.documents || []).find((file) => file.id === documentId)?.name ||
          "Hujjat";

        return {
          ...entry,
          documents: (entry.documents || []).filter((file) => file.id !== documentId),
          timeline: [
            ...(entry.timeline || []),
            buildTimelineEntry("document_remove", `Hujjat o'chirildi: ${removedName}`, actor),
          ],
        };
      }),
    }));
  }, []);

  const updateSupplierDocumentExpiry = useCallback((id, documentId, expiryDate, actor = purchaseCurrentUser) => {
    let result = { ok: false, error: "Hujjat topilmadi." };

    setStoreState((current) => ({
      ...current,
      suppliers: current.suppliers.map((entry) => {
        if (entry.id !== id) return entry;

        const currentFile = (entry.documents || []).find((file) => file.id === documentId);

        if (!currentFile) return entry;
        if ((currentFile.expiryDate || "") === (expiryDate || "")) {
          result = { ok: true, changed: false };
          return entry;
        }

        result = { ok: true, changed: true };

        return {
          ...entry,
          documents: (entry.documents || []).map((file) =>
            file.id === documentId ? { ...file, expiryDate: expiryDate || "" } : file,
          ),
          timeline: [
            ...(entry.timeline || []),
            {
              ...buildTimelineEntry("document_expiry", `Hujjat muddati yangilandi: ${currentFile.name}`, actor),
              oldValue: currentFile.expiryDate || "",
              newValue: expiryDate || "",
            },
          ],
        };
      }),
    }));

    return result;
  }, []);

  // ---------- Import (CSV) ----------
  // Backend-ready: bitta qatorni bitta supplier payload'iga aylantiradi va
  // MAVJUD `createSupplier` action'ini chaqiradi — import mantiqi (STIR
  // duplikat tekshiruvi, validatsiya, clamping) IKKINCHI MARTA yozilmaydi.
  // Backend ulanganda shu funksiya faqat qatorlarni `POST /suppliers/import`
  // so'roviga jo'natishga almashtiriladi — kontrakt (nomlangan ustunlar)
  // o'zgarmaydi.
  const importSuppliers = useCallback(
    (rows, actor = purchaseCurrentUser) => {
      const result = { created: 0, skipped: 0, errors: [] };

      rows.forEach((row, index) => {
        if (!row.name?.trim()) {
          result.skipped += 1;
          result.errors.push(`${index + 2}-qator: nom bo'sh — o'tkazib yuborildi`);
          return;
        }

        const created = createSupplier(row, actor);

        if (created?.ok) result.created += 1;
        else {
          result.skipped += 1;
          result.errors.push(
            `${index + 2}-qator: "${row.name}" — STIR band yoki noto'g'ri, o'tkazib yuborildi`,
          );
        }
      });

      return result;
    },
    [createSupplier],
  );

  return {
    suppliers: state.suppliers,
    categories: SUPPLIER_CATEGORIES,
    getSupplier,
    actions: {
      createSupplier,
      updateSupplier,
      setSupplierStatus,
      addSupplierNote,
      updateSupplierClaimStatus,
      addSupplierDocument,
      removeSupplierDocument,
      updateSupplierDocumentExpiry,
      archiveSupplier,
      restoreSupplier,
      importSuppliers,
    },
  };
};

export default useSuppliers;
