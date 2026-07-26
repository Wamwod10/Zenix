// Enterprise Notifications & Alerts — bildirishnoma turlari (18 ta, audit
// talabiga ko'ra). Har bir tur guruh (category) va route havolasi shabloniga
// ega — Notification Center filtr/guruhlash shu yerdan foydalanadi.

export const NOTIFICATION_TYPES = {
  poCreated: "po_created",
  poSubmitted: "po_submitted",
  poApproved: "po_approved",
  poRejected: "po_rejected",
  goodsReceived: "goods_received",
  partialReceiving: "partial_receiving",
  invoiceCreated: "invoice_created",
  invoiceMatched: "invoice_matched",
  invoiceMismatch: "invoice_mismatch",
  paymentCreated: "payment_created",
  paymentDue: "payment_due",
  paymentOverdue: "payment_overdue",
  budgetWarning: "budget_warning",
  budgetExceeded: "budget_exceeded",
  supplierDocumentExpiring: "supplier_document_expiring",
  supplierIssue: "supplier_issue",
  purchaseReturn: "purchase_return",
  qualityInspection: "quality_inspection",
  systemNotification: "system_notification",
};

export const NOTIFICATION_TYPE_LABELS = {
  [NOTIFICATION_TYPES.poCreated]: "Buyurtma yaratildi",
  [NOTIFICATION_TYPES.poSubmitted]: "Buyurtma tasdiqqa yuborildi",
  [NOTIFICATION_TYPES.poApproved]: "Buyurtma tasdiqlandi",
  [NOTIFICATION_TYPES.poRejected]: "Buyurtma rad etildi",
  [NOTIFICATION_TYPES.goodsReceived]: "Tovar to'liq qabul qilindi",
  [NOTIFICATION_TYPES.partialReceiving]: "Tovar qisman qabul qilindi",
  [NOTIFICATION_TYPES.invoiceCreated]: "Invoys yaratildi",
  [NOTIFICATION_TYPES.invoiceMatched]: "Invoys mos keldi",
  [NOTIFICATION_TYPES.invoiceMismatch]: "Invoys nomuvofiqligi",
  [NOTIFICATION_TYPES.paymentCreated]: "To'lov amalga oshirildi",
  [NOTIFICATION_TYPES.paymentDue]: "To'lov muddati yaqinlashmoqda",
  [NOTIFICATION_TYPES.paymentOverdue]: "To'lov muddati o'tib ketdi",
  [NOTIFICATION_TYPES.budgetWarning]: "Byudjet ogohlantirishi",
  [NOTIFICATION_TYPES.budgetExceeded]: "Byudjet chegarasi oshib ketdi",
  [NOTIFICATION_TYPES.supplierDocumentExpiring]: "Hujjat muddati tugamoqda",
  [NOTIFICATION_TYPES.supplierIssue]: "Yetkazib beruvchida muammo",
  [NOTIFICATION_TYPES.purchaseReturn]: "Qaytarish yaratildi",
  [NOTIFICATION_TYPES.qualityInspection]: "Sifat tekshiruvi yakunlandi",
  [NOTIFICATION_TYPES.systemNotification]: "Tizim xabari",
};

// Guruhlash (Grouped Notifications) uchun — filter va bo'lim sarlavhalari.
export const NOTIFICATION_CATEGORIES = {
  orders: "orders",
  receiving: "receiving",
  invoices: "invoices",
  payments: "payments",
  budget: "budget",
  suppliers: "suppliers",
  returns: "returns",
  system: "system",
};

export const NOTIFICATION_CATEGORY_LABELS = {
  [NOTIFICATION_CATEGORIES.orders]: "Buyurtmalar",
  [NOTIFICATION_CATEGORIES.receiving]: "Qabul",
  [NOTIFICATION_CATEGORIES.invoices]: "Invoyslar",
  [NOTIFICATION_CATEGORIES.payments]: "To'lovlar",
  [NOTIFICATION_CATEGORIES.budget]: "Byudjet",
  [NOTIFICATION_CATEGORIES.suppliers]: "Yetkazib beruvchilar",
  [NOTIFICATION_CATEGORIES.returns]: "Qaytarishlar",
  [NOTIFICATION_CATEGORIES.system]: "Tizim",
};

export const NOTIFICATION_TYPE_CATEGORY = {
  [NOTIFICATION_TYPES.poCreated]: NOTIFICATION_CATEGORIES.orders,
  [NOTIFICATION_TYPES.poSubmitted]: NOTIFICATION_CATEGORIES.orders,
  [NOTIFICATION_TYPES.poApproved]: NOTIFICATION_CATEGORIES.orders,
  [NOTIFICATION_TYPES.poRejected]: NOTIFICATION_CATEGORIES.orders,
  [NOTIFICATION_TYPES.goodsReceived]: NOTIFICATION_CATEGORIES.receiving,
  [NOTIFICATION_TYPES.partialReceiving]: NOTIFICATION_CATEGORIES.receiving,
  [NOTIFICATION_TYPES.invoiceCreated]: NOTIFICATION_CATEGORIES.invoices,
  [NOTIFICATION_TYPES.invoiceMatched]: NOTIFICATION_CATEGORIES.invoices,
  [NOTIFICATION_TYPES.invoiceMismatch]: NOTIFICATION_CATEGORIES.invoices,
  [NOTIFICATION_TYPES.paymentCreated]: NOTIFICATION_CATEGORIES.payments,
  [NOTIFICATION_TYPES.paymentDue]: NOTIFICATION_CATEGORIES.payments,
  [NOTIFICATION_TYPES.paymentOverdue]: NOTIFICATION_CATEGORIES.payments,
  [NOTIFICATION_TYPES.budgetWarning]: NOTIFICATION_CATEGORIES.budget,
  [NOTIFICATION_TYPES.budgetExceeded]: NOTIFICATION_CATEGORIES.budget,
  [NOTIFICATION_TYPES.supplierDocumentExpiring]: NOTIFICATION_CATEGORIES.suppliers,
  [NOTIFICATION_TYPES.supplierIssue]: NOTIFICATION_CATEGORIES.suppliers,
  [NOTIFICATION_TYPES.purchaseReturn]: NOTIFICATION_CATEGORIES.returns,
  [NOTIFICATION_TYPES.qualityInspection]: NOTIFICATION_CATEGORIES.receiving,
  [NOTIFICATION_TYPES.systemNotification]: NOTIFICATION_CATEGORIES.system,
};

// Har bir turga tegishli MAJBURIY referens maydonlar — "Invalid references"
// validatsiyasi shu ro'yxatga qarab ishlaydi (pushNotification.js).
export const NOTIFICATION_TYPE_REQUIRED_REFS = {
  [NOTIFICATION_TYPES.poCreated]: ["orderId"],
  [NOTIFICATION_TYPES.poSubmitted]: ["orderId"],
  [NOTIFICATION_TYPES.poApproved]: ["orderId"],
  [NOTIFICATION_TYPES.poRejected]: ["orderId"],
  [NOTIFICATION_TYPES.goodsReceived]: ["orderId"],
  [NOTIFICATION_TYPES.partialReceiving]: ["orderId"],
  [NOTIFICATION_TYPES.invoiceCreated]: ["invoiceId"],
  [NOTIFICATION_TYPES.invoiceMatched]: ["invoiceId"],
  [NOTIFICATION_TYPES.invoiceMismatch]: ["invoiceId"],
  [NOTIFICATION_TYPES.paymentCreated]: ["invoiceId"],
  [NOTIFICATION_TYPES.paymentDue]: ["invoiceId"],
  [NOTIFICATION_TYPES.paymentOverdue]: ["invoiceId"],
  [NOTIFICATION_TYPES.budgetWarning]: ["budgetId"],
  [NOTIFICATION_TYPES.budgetExceeded]: ["budgetId"],
  [NOTIFICATION_TYPES.supplierDocumentExpiring]: ["supplierId"],
  [NOTIFICATION_TYPES.supplierIssue]: ["supplierId"],
  [NOTIFICATION_TYPES.purchaseReturn]: ["returnId"],
  [NOTIFICATION_TYPES.qualityInspection]: ["orderId"],
  [NOTIFICATION_TYPES.systemNotification]: [],
};

export const isKnownNotificationType = (type) =>
  Object.values(NOTIFICATION_TYPES).includes(type);
