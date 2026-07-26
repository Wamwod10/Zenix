// Enterprise AI (Purchases & Suppliers) — umumiy lug'at: kategoriya, tur,
// ustuvorlik va xavf darajalarining yorliq/rang xaritasi. Barcha AI hisoblash
// (aiEngine.js) va UI (AIInsightCard/AIWorkspace) shu YAGONA manbadan
// foydalanadi — rang/yorliq mantiqi ikki joyda yozilmaydi. Tone qiymatlari
// mavjud Badge komponenti tone tizimi bilan bir xil (neutral/success/warning/
// danger/primary/info) — yangi rang tizimi yaratilmaydi.

export const AI_INSIGHT_TYPES = {
  recommendation: "recommendation",
  warning: "warning",
  prediction: "prediction",
  opportunity: "opportunity",
  insight: "insight",
  risk: "risk",
};

export const AI_INSIGHT_TYPE_LABELS = {
  [AI_INSIGHT_TYPES.recommendation]: "Tavsiya",
  [AI_INSIGHT_TYPES.warning]: "Ogohlantirish",
  [AI_INSIGHT_TYPES.prediction]: "Bashorat",
  [AI_INSIGHT_TYPES.opportunity]: "Imkoniyat",
  [AI_INSIGHT_TYPES.insight]: "Kuzatuv",
  [AI_INSIGHT_TYPES.risk]: "Xavf",
};

export const AI_INSIGHT_TYPE_TONES = {
  [AI_INSIGHT_TYPES.recommendation]: "primary",
  [AI_INSIGHT_TYPES.warning]: "warning",
  [AI_INSIGHT_TYPES.prediction]: "info",
  [AI_INSIGHT_TYPES.opportunity]: "success",
  [AI_INSIGHT_TYPES.insight]: "info",
  [AI_INSIGHT_TYPES.risk]: "danger",
};

export const AI_CATEGORIES = {
  insights: "insights",
  spending: "spending",
  supplier: "supplier",
  price: "price",
  budget: "budget",
  risk: "risk",
  delivery: "delivery",
  invoice: "invoice",
  cost: "cost",
  timing: "timing",
  quantity: "quantity",
};

export const AI_CATEGORY_LABELS = {
  [AI_CATEGORIES.insights]: "Xarid tahlili",
  [AI_CATEGORIES.spending]: "Xarajat tahlili",
  [AI_CATEGORIES.supplier]: "Yetkazib beruvchi",
  [AI_CATEGORIES.price]: "Narx tavsiyasi",
  [AI_CATEGORIES.budget]: "Byudjet",
  [AI_CATEGORIES.risk]: "Xarid xavfi",
  [AI_CATEGORIES.delivery]: "Yetkazish xavfi",
  [AI_CATEGORIES.invoice]: "Invoys",
  [AI_CATEGORIES.cost]: "Xarajatni optimallashtirish",
  [AI_CATEGORIES.timing]: "Buyurtma vaqti",
  [AI_CATEGORIES.quantity]: "Buyurtma miqdori",
};

export const AI_PRIORITY = {
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "low",
};

export const AI_PRIORITY_LABELS = {
  [AI_PRIORITY.critical]: "Kritik",
  [AI_PRIORITY.high]: "Yuqori",
  [AI_PRIORITY.medium]: "O'rta",
  [AI_PRIORITY.low]: "Past",
};

export const AI_PRIORITY_TONES = {
  [AI_PRIORITY.critical]: "danger",
  [AI_PRIORITY.high]: "danger",
  [AI_PRIORITY.medium]: "warning",
  [AI_PRIORITY.low]: "neutral",
};

export const AI_PRIORITY_ORDER = [
  AI_PRIORITY.critical,
  AI_PRIORITY.high,
  AI_PRIORITY.medium,
  AI_PRIORITY.low,
];

export const AI_RISK_LEVELS = {
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "low",
};

export const AI_RISK_LABELS = {
  [AI_RISK_LEVELS.critical]: "Kritik xavf",
  [AI_RISK_LEVELS.high]: "Yuqori xavf",
  [AI_RISK_LEVELS.medium]: "O'rta xavf",
  [AI_RISK_LEVELS.low]: "Past xavf",
};

export const AI_RISK_TONES = {
  [AI_RISK_LEVELS.critical]: "danger",
  [AI_RISK_LEVELS.high]: "danger",
  [AI_RISK_LEVELS.medium]: "warning",
  [AI_RISK_LEVELS.low]: "success",
};

// Ish maydonidagi holat yorliqlari (filtr tablari) — pin/complete/dismiss
// mustaqil bayroqlar, "faol" esa uchalasi ham yo'qligini bildiradi.
export const AI_VIEW_TABS = {
  active: "active",
  pinned: "pinned",
  completed: "completed",
  dismissed: "dismissed",
  history: "history",
};

export const AI_VIEW_TAB_LABELS = {
  [AI_VIEW_TABS.active]: "Faol",
  [AI_VIEW_TABS.pinned]: "Belgilangan",
  [AI_VIEW_TABS.completed]: "Bajarilgan",
  [AI_VIEW_TABS.dismissed]: "Yopilgan",
  [AI_VIEW_TABS.history]: "Tarix",
};

// Tarix jurnalidagi amal turlari (aiStorage.js action qiymatlari) — o'zbek
// tilidagi yorliq.
export const AI_HISTORY_ACTION_LABELS = {
  pinned: "Belgilandi",
  unpinned: "Belgi olindi",
  completed: "Bajarildi deb belgilandi",
  reopened: "Qayta ochildi",
  dismissed: "Yopildi",
  restored: "Tiklandi",
};
