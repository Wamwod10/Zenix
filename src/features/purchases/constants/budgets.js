// PDF 57-60 (Enterprise): Purchase Budget — turlar, davrlar, holatlar, nazorat.
// Byudjet ikkita mustaqil o'lchamga ega: SCOPE (nimaga tegishli — umumiy /
// yetkazib beruvchi / kategoriya / bo'lim / loyiha) va PERIOD (qaysi vaqt
// oralig'i — oylik / choraklik / yillik). Ular bir-biridan mustaqil
// tanlanadi (masalan "Iyul oyi — Ichimlik kategoriyasi byudjeti").

export const BUDGET_SCOPE_TYPES = {
  overall: "overall",
  supplier: "supplier",
  category: "category",
  department: "department",
  project: "project",
};

export const BUDGET_SCOPE_LABELS = {
  [BUDGET_SCOPE_TYPES.overall]: "Umumiy byudjet",
  [BUDGET_SCOPE_TYPES.supplier]: "Yetkazib beruvchi byudjeti",
  [BUDGET_SCOPE_TYPES.category]: "Kategoriya byudjeti",
  [BUDGET_SCOPE_TYPES.department]: "Bo'lim byudjeti",
  [BUDGET_SCOPE_TYPES.project]: "Loyiha byudjeti",
};

// Har bir scope turi qo'shimcha "scopeValue" talab qiladimi (overall'dan
// boshqasi — kimga/nimaga tegishli ekanini aniqlash uchun).
export const SCOPE_REQUIRES_VALUE = {
  [BUDGET_SCOPE_TYPES.overall]: false,
  [BUDGET_SCOPE_TYPES.supplier]: true,
  [BUDGET_SCOPE_TYPES.category]: true,
  [BUDGET_SCOPE_TYPES.department]: true,
  [BUDGET_SCOPE_TYPES.project]: true,
};

export const BUDGET_PERIOD_TYPES = {
  monthly: "monthly",
  quarterly: "quarterly",
  annual: "annual",
};

export const BUDGET_PERIOD_LABELS = {
  [BUDGET_PERIOD_TYPES.monthly]: "Oylik",
  [BUDGET_PERIOD_TYPES.quarterly]: "Choraklik",
  [BUDGET_PERIOD_TYPES.annual]: "Yillik",
};

export const QUARTER_LABELS = {
  1: "I chorak (Yan-Mar)",
  2: "II chorak (Apr-Iyun)",
  3: "III chorak (Iyul-Sen)",
  4: "IV chorak (Okt-Dek)",
};

export const MONTH_LABELS = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
];

// PDF 59: nazorat bosqichlari — foydalanuvchi tomonidan sozlanadigan foiz
// chegaralari (default qiymatlar). Bular ogohlantirish/rangni belgilaydi;
// aniq holat (status) 3 ta qat'iy bosqichga (near/warning/exceeded) yig'iladi.
export const DEFAULT_BUDGET_THRESHOLDS = [50, 75, 90, 95, 100];

// PDF 58: nazorat rejimi — Hard Limit (bloklaydi) / Soft Limit (sabab bilan o'tkazadi)
export const BUDGET_ENFORCEMENT = {
  soft: "soft",
  hard: "hard",
};

export const BUDGET_ENFORCEMENT_LABELS = {
  [BUDGET_ENFORCEMENT.soft]: "Yumshoq chegara — sabab bilan o'tkazish mumkin",
  [BUDGET_ENFORCEMENT.hard]: "Qattiq chegara — oshsa bloklaydi",
};

// PDF 58 (Budget Status): Within Budget / Near Limit / Warning / Exceeded / Blocked
export const BUDGET_STATUSES = {
  withinBudget: "within_budget",
  nearLimit: "near_limit",
  warning: "warning",
  exceeded: "exceeded",
  blocked: "blocked",
};

export const BUDGET_STATUS_LABELS = {
  [BUDGET_STATUSES.withinBudget]: "Byudjet doirasida",
  [BUDGET_STATUSES.nearLimit]: "Chegaraga yaqinlashdi",
  [BUDGET_STATUSES.warning]: "Ogohlantirish",
  [BUDGET_STATUSES.exceeded]: "Byudjetdan oshdi",
  [BUDGET_STATUSES.blocked]: "Bloklangan",
};

// Mavjud tone tizimi qayta ishlatiladi (PurchaseStatusBadge/Alert/Progress bilan bir xil) —
// yangi rang YO'Q.
export const BUDGET_STATUS_TONES = {
  [BUDGET_STATUSES.withinBudget]: "success",
  [BUDGET_STATUSES.nearLimit]: "info",
  [BUDGET_STATUSES.warning]: "warning",
  [BUDGET_STATUSES.exceeded]: "danger",
  [BUDGET_STATUSES.blocked]: "danger",
};
