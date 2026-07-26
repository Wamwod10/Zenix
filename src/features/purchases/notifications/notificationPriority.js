// Alert Priority — Critical / High / Medium / Low / Informational.
// Tone'lar mavjud dizayn tizimidan (purchase-status-badge / purchase-alert
// bilan bir xil rgba palitra) — yangi rang o'ylab topilmaydi.

import { NOTIFICATION_TYPES } from "./notificationTypes";

export const NOTIFICATION_PRIORITIES = {
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "low",
  informational: "informational",
};

export const NOTIFICATION_PRIORITY_LABELS = {
  [NOTIFICATION_PRIORITIES.critical]: "Kritik",
  [NOTIFICATION_PRIORITIES.high]: "Yuqori",
  [NOTIFICATION_PRIORITIES.medium]: "O'rta",
  [NOTIFICATION_PRIORITIES.low]: "Past",
  [NOTIFICATION_PRIORITIES.informational]: "Ma'lumot",
};

// Mavjud tone tizimi: info/success/warning/danger/neutral.
export const NOTIFICATION_PRIORITY_TONES = {
  [NOTIFICATION_PRIORITIES.critical]: "danger",
  [NOTIFICATION_PRIORITIES.high]: "warning",
  [NOTIFICATION_PRIORITIES.medium]: "info",
  [NOTIFICATION_PRIORITIES.low]: "neutral",
  [NOTIFICATION_PRIORITIES.informational]: "neutral",
};

// Saralash uchun og'irlik — "Priority bo'yicha" sort shu tartibda.
export const NOTIFICATION_PRIORITY_WEIGHT = {
  [NOTIFICATION_PRIORITIES.critical]: 5,
  [NOTIFICATION_PRIORITIES.high]: 4,
  [NOTIFICATION_PRIORITIES.medium]: 3,
  [NOTIFICATION_PRIORITIES.low]: 2,
  [NOTIFICATION_PRIORITIES.informational]: 1,
};

// Tur bo'yicha standart ustuvorlik — trigger funksiyalari shu yerdan oladi
// (chaqiruvchi boshqacha bermasa).
export const DEFAULT_PRIORITY_BY_TYPE = {
  [NOTIFICATION_TYPES.poCreated]: NOTIFICATION_PRIORITIES.low,
  [NOTIFICATION_TYPES.poSubmitted]: NOTIFICATION_PRIORITIES.medium,
  [NOTIFICATION_TYPES.poApproved]: NOTIFICATION_PRIORITIES.low,
  [NOTIFICATION_TYPES.poRejected]: NOTIFICATION_PRIORITIES.high,
  [NOTIFICATION_TYPES.goodsReceived]: NOTIFICATION_PRIORITIES.low,
  [NOTIFICATION_TYPES.partialReceiving]: NOTIFICATION_PRIORITIES.medium,
  [NOTIFICATION_TYPES.invoiceCreated]: NOTIFICATION_PRIORITIES.low,
  [NOTIFICATION_TYPES.invoiceMatched]: NOTIFICATION_PRIORITIES.low,
  [NOTIFICATION_TYPES.invoiceMismatch]: NOTIFICATION_PRIORITIES.high,
  [NOTIFICATION_TYPES.paymentCreated]: NOTIFICATION_PRIORITIES.low,
  [NOTIFICATION_TYPES.paymentDue]: NOTIFICATION_PRIORITIES.medium,
  [NOTIFICATION_TYPES.paymentOverdue]: NOTIFICATION_PRIORITIES.critical,
  [NOTIFICATION_TYPES.budgetWarning]: NOTIFICATION_PRIORITIES.medium,
  [NOTIFICATION_TYPES.budgetExceeded]: NOTIFICATION_PRIORITIES.critical,
  [NOTIFICATION_TYPES.supplierDocumentExpiring]: NOTIFICATION_PRIORITIES.medium,
  [NOTIFICATION_TYPES.supplierIssue]: NOTIFICATION_PRIORITIES.high,
  [NOTIFICATION_TYPES.purchaseReturn]: NOTIFICATION_PRIORITIES.medium,
  [NOTIFICATION_TYPES.systemNotification]: NOTIFICATION_PRIORITIES.informational,
};
