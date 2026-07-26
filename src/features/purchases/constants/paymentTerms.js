// PDF 14-bo'lim: Payment Terms — supplierga qachon va qanday to'lash shartlari.

export const PAYMENT_TERM_TYPES = {
  advance: "advance",
  onDelivery: "on_delivery",
  net30: "net_30",
  net60: "net_60",
  net90: "net_90",
  installment: "installment",
};

export const PAYMENT_TERMS = [
  {
    id: PAYMENT_TERM_TYPES.advance,
    label: "Oldindan to'lov",
    description: "Buyurtmadan oldin to'lanadi (avans)",
    creditDays: 0,
  },
  {
    id: PAYMENT_TERM_TYPES.onDelivery,
    label: "Yetkazishda",
    description: "Tovar kelganda to'lanadi",
    creditDays: 0,
  },
  {
    id: PAYMENT_TERM_TYPES.net30,
    label: "Kredit — Net 30",
    description: "Yetkazishdan 30 kun keyin",
    creditDays: 30,
  },
  {
    id: PAYMENT_TERM_TYPES.net60,
    label: "Kredit — Net 60",
    description: "Yetkazishdan 60 kun keyin",
    creditDays: 60,
  },
  {
    id: PAYMENT_TERM_TYPES.net90,
    label: "Kredit — Net 90",
    description: "Yetkazishdan 90 kun keyin",
    creditDays: 90,
  },
  {
    id: PAYMENT_TERM_TYPES.installment,
    label: "Bo'lib to'lash",
    description: "Bir necha qismda to'lanadi",
    creditDays: 30,
  },
];

export const getPaymentTermById = (id) =>
  PAYMENT_TERMS.find((term) => term.id === id) || PAYMENT_TERMS[1];

// To'lov muddati — kredit kuni bo'lmagan shartlarda (naqd/avans, creditDays=0)
// muddat yo'q (darhol to'lanadi), aks holda berilgan sanadan creditDays kun
// keyin. createInvoice VA avtomatik invoyslashtirish shu YAGONA formuladan
// foydalanadi (usePurchasesStore.js, PurchaseOrderWizard.jsx).
export const computePaymentDueDate = (paymentTermId, fromDateIso) => {
  const term = getPaymentTermById(paymentTermId);
  const fromDate = fromDateIso ? new Date(fromDateIso) : new Date();

  if (!term.creditDays) return "";

  const due = new Date(fromDate);
  due.setDate(due.getDate() + term.creditDays);

  return due.toISOString().slice(0, 10);
};

// PDF 49: To'lov usullari
export const PAYMENT_METHODS = [
  { id: "bank", label: "Bank o'tkazmasi" },
  { id: "cash", label: "Naqd" },
  { id: "card", label: "Korporativ karta" },
  { id: "letter_of_credit", label: "Akkreditiv (L/C)" },
];

// PDF 12: Soliq — QQS 12% (yoki 0% / ozod), ichida yoki ustiga
// Standart: QQS 0% / ozod birinchi (default), 12% tanlov sifatida
export const TAX_RATES = [
  { value: 0, label: "QQS 0% / ozod" },
  { value: 12, label: "QQS 12%" },
];

export const TAX_MODES = {
  exclusive: "exclusive", // soliq ustiga qo'shiladi
  inclusive: "inclusive", // soliq narx ichida
};

export const TAX_MODE_LABELS = {
  [TAX_MODES.exclusive]: "Ustiga (exclusive)",
  [TAX_MODES.inclusive]: "Ichida (inclusive)",
};

// PDF 36: Qaytarish sabablari
export const RETURN_REASONS = [
  { id: "damaged", label: "Buzuq / nuqsonli" },
  { id: "wrong", label: "Noto'g'ri tovar" },
  { id: "excess", label: "Ortiqcha kelgan" },
  { id: "quality", label: "Sifatsiz" },
];

export const RETURN_STATUSES = {
  pendingApproval: "pending_approval",
  approved: "approved",
  rejected: "rejected",
  completed: "completed",
};

export const RETURN_STATUS_LABELS = {
  [RETURN_STATUSES.pendingApproval]: "Tasdiq kutilmoqda",
  [RETURN_STATUSES.approved]: "Tasdiqlangan",
  [RETURN_STATUSES.rejected]: "Rad etilgan",
  [RETURN_STATUSES.completed]: "Yakunlangan",
};

// PDF 42: Invoice matching — ruxsat etilgan farq chegarasi (tolerance)
export const INVOICE_MATCH_TOLERANCE = 0.01; // 1%

export const INVOICE_STATUSES = {
  pending: "pending",
  matched: "matched",
  mismatch: "mismatch",
  partiallyPaid: "partially_paid",
  paid: "paid",
};

export const INVOICE_STATUS_LABELS = {
  [INVOICE_STATUSES.pending]: "Kutilmoqda",
  [INVOICE_STATUSES.matched]: "Mos (matched)",
  [INVOICE_STATUSES.mismatch]: "Farq bor",
  [INVOICE_STATUSES.partiallyPaid]: "Qisman to'langan",
  [INVOICE_STATUSES.paid]: "To'langan",
};

// Buzuq tovar bilan qilinadigan amal (qabulda tanlanadi)
export const DAMAGED_ACTIONS = [
  { id: "inspection", label: "Tekshiruv kutilmoqda" },
  { id: "quarantine", label: "Karantinga olish" },
  { id: "return_supplier", label: "Yetkazib beruvchiga qaytarish" },
  { id: "destroy", label: "Yo'q qilish" },
];

export const getDamagedActionLabel = (id) =>
  DAMAGED_ACTIONS.find((action) => action.id === id)?.label ||
  "Tekshiruv kutilmoqda";

// Landed cost xarajat turlari va taqsimlash usullari →
// src/features/purchases/constants/landedCosts.js (Enterprise kengaytma, PDF 56).

// Qaytarish kompensatsiyasi (yetkazib beruvchi bilan hisob-kitob)
export const RETURN_COMPENSATIONS = [
  { id: "reduce_debt", label: "Qarzdan ayirish" },
  { id: "refund", label: "Pul qaytarish" },
  { id: "credit_next", label: "Keyingi xaridga kredit" },
  { id: "replace", label: "Tovar almashtirish" },
];

export const getReturnCompensationLabel = (id) =>
  RETURN_COMPENSATIONS.find((entry) => entry.id === id)?.label ||
  "Qarzdan ayirish";
