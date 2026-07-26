// Tur bo'yicha ikonka xaritasi — mavjud modulda ishlatilayotgan lucide-react
// to'plamidan (PurchasesLayout tab'lari, PurchaseAlert bilan bir xil kutubxona).

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileClock,
  FileWarning,
  Gauge,
  Info,
  PackageCheck,
  PackageOpen,
  Receipt,
  Send,
  ShieldAlert,
  Undo2,
  Wallet,
  XCircle,
} from "lucide-react";

import { NOTIFICATION_TYPES } from "./notificationTypes";

export const NOTIFICATION_TYPE_ICONS = {
  [NOTIFICATION_TYPES.poCreated]: Send,
  [NOTIFICATION_TYPES.poSubmitted]: Send,
  [NOTIFICATION_TYPES.poApproved]: CheckCircle2,
  [NOTIFICATION_TYPES.poRejected]: XCircle,
  [NOTIFICATION_TYPES.goodsReceived]: PackageCheck,
  [NOTIFICATION_TYPES.partialReceiving]: PackageOpen,
  [NOTIFICATION_TYPES.invoiceCreated]: Receipt,
  [NOTIFICATION_TYPES.invoiceMatched]: FileCheck2,
  [NOTIFICATION_TYPES.invoiceMismatch]: FileWarning,
  [NOTIFICATION_TYPES.paymentCreated]: Wallet,
  [NOTIFICATION_TYPES.paymentDue]: Clock,
  [NOTIFICATION_TYPES.paymentOverdue]: AlertTriangle,
  [NOTIFICATION_TYPES.budgetWarning]: Gauge,
  [NOTIFICATION_TYPES.budgetExceeded]: ShieldAlert,
  [NOTIFICATION_TYPES.supplierDocumentExpiring]: FileClock,
  [NOTIFICATION_TYPES.supplierIssue]: AlertCircle,
  [NOTIFICATION_TYPES.purchaseReturn]: Undo2,
  [NOTIFICATION_TYPES.systemNotification]: Info,
};

export const getNotificationIcon = (type) => NOTIFICATION_TYPE_ICONS[type] || Info;
