const uzsFormatter = new Intl.NumberFormat("uz-UZ", {
  style: "currency",
  currency: "UZS",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("uz-UZ", {
  maximumFractionDigits: 2,
});

export const formatMoney = (value = 0, currency = "UZS") => {
  const amount = Number(value || 0);

  if (currency === "UZS") {
    return uzsFormatter.format(amount);
  }

  return `${numberFormatter.format(amount)} ${currency}`;
};

export const formatCurrency = formatMoney;

export const formatPercent = (value = 0) =>
  `${numberFormatter.format(Number(value || 0))}%`;

const dateFormatter = new Intl.DateTimeFormat("uz-UZ", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("uz-UZ", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export const normalizeDateValue = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDate = (date, fallback = "—") => {
  const normalized = normalizeDateValue(date);

  if (!normalized) {
    return fallback;
  }

  return dateFormatter.format(normalized);
};

export const formatDateTime = (date, fallback = "—") => {
  const normalized = normalizeDateValue(date);

  if (!normalized) {
    return fallback;
  }

  return dateTimeFormatter.format(normalized);
};

export const financeStatusLabels = {
  Draft: "Qoralama",
  Pending: "Tasdiq kutmoqda",
  Approved: "Tasdiqlangan",
  Posted: "O'tkazilgan",
  Reversed: "Storno qilingan",
  Cancelled: "Bekor qilingan",
  Archived: "Arxivlangan",
  draft: "Qoralama",
  open: "Ochiq",
  overdue: "Muddati o'tgan",
  pending: "Kutilmoqda",
  partial: "Qisman",
  paid: "To'langan",
  Rejected: "Rad etilgan",
  Ready: "To'lovga tayyor",
  SentToBank: "Bankka yuborilgan",
  Paid: "To'langan",
  Overdue: "Muddati o'tgan",
  sent: "Yuborilgan",
  matched: "Moslangan",
  closed: "Yopilgan",
  validation: "Tekshiruvda",
  valid: "Faol",
  review: "Ko'rib chiqilmoqda",
  connected: "Ulangan",
  disconnected: "Ulanmagan",
  checking: "Tekshirilmoqda",
  "setup required": "Sozlash kerak",
  error: "Xatolik",
  success: "Bajarildi",
  warning: "E'tibor",
  danger: "Xavf",
  taxable: "Soliq solinadigan",
  taxExempt: "Soliqdan ozod",
};

export const transactionTypeLabels = {
  income: "Daromad",
  expense: "Xarajat",
  transfer: "O'tkazma",
  refund: "Qaytarim",
  adjustment: "Balans tuzatish",
  opening: "Boshlang'ich qoldiq",
  exchange: "Valyuta ayirboshlash",
};

export const accountKindLabels = {
  cash: "Kassa",
  bank: "Bank",
  receivable: "Debitor",
  payable: "Kreditor",
  inventory: "Ombor",
  tax: "Soliq",
  equity: "Kapital",
  income: "Daromad",
  expense: "Xarajat",
  fx: "Valyuta farqi",
};

export const accountTypeLabels = {
  asset: "Aktiv",
  liability: "Majburiyat",
  equity: "Kapital",
  income: "Daromad",
  expense: "Xarajat",
};

export const sourceLabels = {
  Manual: "Qo'lda",
  POS: "Savdo kassasi",
  Warehouse: "Ombor",
  CRM: "Mijozlar",
  Purchases: "Xaridlar",
  Suppliers: "Yetkazib beruvchilar",
  Payments: "To'lov tizimlari",
  Automatic: "Avtomatik",
  cash: "Naqd",
  bank: "Bank",
  click: "Click",
  payme: "Payme",
  terminal: "Terminal",
  other: "Boshqa",
};

export const aiActionLabels = {
  "review transaction": "Tranzaksiyani ko'rish",
  "create reminder": "Eslatma yaratish",
  "mark resolved": "Hal qilindi",
  "open approval": "Tasdiqlarni ochish",
  dismiss: "Yashirish",
};

export const formatFinanceLabel = (dictionary, value, fallback = value) =>
  dictionary[value] || fallback || "";

export const formatStatusLabel = (status) =>
  formatFinanceLabel(financeStatusLabels, status);

export const formatTransactionType = (type) =>
  formatFinanceLabel(transactionTypeLabels, type);

export const formatAccountKind = (kind) =>
  formatFinanceLabel(accountKindLabels, kind);

export const formatAccountType = (type) =>
  formatFinanceLabel(accountTypeLabels, type);

export const formatSource = (source) =>
  formatFinanceLabel(sourceLabels, source);

export const formatAiAction = (action) =>
  formatFinanceLabel(aiActionLabels, action);
