// PDF 18-bo'lim: Purchase Statuses — 10 ta holat, qat'iy state machine.
// Har o'tish faqat ruxsat etilgan yo'nalishda bo'ladi.

export const PURCHASE_STATUSES = {
  draft: "draft",
  pendingApproval: "pending_approval",
  approved: "approved",
  sent: "sent",
  partiallyReceived: "partially_received",
  received: "received",
  invoiced: "invoiced",
  paid: "paid",
  cancelled: "cancelled",
  closed: "closed",
};

export const PURCHASE_STATUS_LABELS = {
  [PURCHASE_STATUSES.draft]: "Qoralama",
  [PURCHASE_STATUSES.pendingApproval]: "Tasdiq kutilmoqda",
  [PURCHASE_STATUSES.approved]: "Tasdiqlangan",
  [PURCHASE_STATUSES.sent]: "Yuborilgan",
  [PURCHASE_STATUSES.partiallyReceived]: "Qisman kelgan",
  [PURCHASE_STATUSES.received]: "To'liq kelgan",
  [PURCHASE_STATUSES.invoiced]: "Invoys kelgan",
  [PURCHASE_STATUSES.paid]: "To'langan",
  [PURCHASE_STATUSES.cancelled]: "Bekor qilingan",
  [PURCHASE_STATUSES.closed]: "Yopilgan",
};

export const PURCHASE_STATUS_TONES = {
  [PURCHASE_STATUSES.draft]: "neutral",
  [PURCHASE_STATUSES.pendingApproval]: "warning",
  [PURCHASE_STATUSES.approved]: "info",
  [PURCHASE_STATUSES.sent]: "info",
  [PURCHASE_STATUSES.partiallyReceived]: "warning",
  [PURCHASE_STATUSES.received]: "success",
  [PURCHASE_STATUSES.invoiced]: "info",
  [PURCHASE_STATUSES.paid]: "success",
  [PURCHASE_STATUSES.cancelled]: "danger",
  [PURCHASE_STATUSES.closed]: "neutral",
};

// PDF 18: "Holat o'tishlari qat'iy" — ruxsat etilgan o'tishlar xaritasi.
export const PURCHASE_STATUS_FLOW = {
  [PURCHASE_STATUSES.draft]: [
    PURCHASE_STATUSES.pendingApproval,
    PURCHASE_STATUSES.approved, // 1 mln gacha — avtomatik tasdiq (PDF 5-bo'lim)
    PURCHASE_STATUSES.cancelled,
  ],
  [PURCHASE_STATUSES.pendingApproval]: [
    PURCHASE_STATUSES.approved,
    PURCHASE_STATUSES.draft, // rad etilsa xaridorga qaytadi
    PURCHASE_STATUSES.cancelled,
  ],
  [PURCHASE_STATUSES.approved]: [
    PURCHASE_STATUSES.sent,
    PURCHASE_STATUSES.cancelled,
  ],
  [PURCHASE_STATUSES.sent]: [
    PURCHASE_STATUSES.partiallyReceived,
    PURCHASE_STATUSES.received,
    PURCHASE_STATUSES.cancelled, // PDF 2: bekor qilish faqat "kelmagan" PO uchun
  ],
  [PURCHASE_STATUSES.partiallyReceived]: [
    PURCHASE_STATUSES.received,
    PURCHASE_STATUSES.closed, // qolgan kelmasa — qo'lda yopish (PDF 22)
  ],
  [PURCHASE_STATUSES.received]: [
    PURCHASE_STATUSES.invoiced,
    PURCHASE_STATUSES.closed,
  ],
  [PURCHASE_STATUSES.invoiced]: [
    PURCHASE_STATUSES.paid,
    PURCHASE_STATUSES.closed,
  ],
  [PURCHASE_STATUSES.paid]: [PURCHASE_STATUSES.closed],
  [PURCHASE_STATUSES.cancelled]: [],
  [PURCHASE_STATUSES.closed]: [],
};

export const canTransitionStatus = (from, to) =>
  (PURCHASE_STATUS_FLOW[from] || []).includes(to);

// Bekor qilish faqat tovar hali kelmagan holatlarda mumkin (PDF 2, 21).
export const CANCELLABLE_STATUSES = [
  PURCHASE_STATUSES.draft,
  PURCHASE_STATUSES.pendingApproval,
  PURCHASE_STATUSES.approved,
  PURCHASE_STATUSES.sent,
];

// Qabul qilish mumkin bo'lgan holatlar (PDF 21: "PO holati sent/approved").
export const RECEIVABLE_STATUSES = [
  PURCHASE_STATUSES.sent,
  PURCHASE_STATUSES.partiallyReceived,
];

// Qaytarish faqat qabul qilingan tovar uchun (PDF 36).
export const RETURNABLE_STATUSES = [
  PURCHASE_STATUSES.partiallyReceived,
  PURCHASE_STATUSES.received,
  PURCHASE_STATUSES.invoiced,
  PURCHASE_STATUSES.paid,
];

// Invoys kiritish mumkin bo'lgan holatlar (PDF 41).
export const INVOICEABLE_STATUSES = [
  PURCHASE_STATUSES.partiallyReceived,
  PURCHASE_STATUSES.received,
  PURCHASE_STATUSES.invoiced,
];
