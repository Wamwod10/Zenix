// Voqea asosidagi (event-driven) bildirishnoma shablonlari — PO/Qabul/
// Invoys/To'lov/Qaytarish/Supplier lifecycle harakatlari sodir bo'lganda
// usePurchasesStore.js va suppliersApi.js tomonidan chaqiriladi. Har bir
// funksiya tayyor voqea ma'lumotidan sarlavha/matn/havola quradi va
// pushNotification orqali saqlaydi (dedupeKey bilan — bir xil voqea ikki
// marta bildirishnoma yaratmaydi).

import { NOTIFICATION_TYPES } from "./notificationTypes";
import { pushNotification } from "./notificationsStore";
import { formatCurrencyMoney } from "../utils/purchaseMoney";

const supplierLabel = (supplierName) => supplierName || "Noma'lum yetkazib beruvchi";

export const notifyPurchaseOrderCreated = ({ order, supplierName, actor }) =>
  pushNotification({
    type: NOTIFICATION_TYPES.poCreated,
    title: "Yangi buyurtma yaratildi",
    message: `${order.number} (${supplierLabel(supplierName)}) qoralama sifatida yaratildi.`,
    link: `/purchases/orders/${order.id}`,
    refs: { orderId: order.id, orderNumber: order.number, supplierId: order.supplierId },
    actor: actor || order.buyer?.name,
    dedupeKey: `po_created:${order.id}`,
  });

export const notifyPurchaseOrderSubmitted = ({ order, supplierName, actor }) =>
  pushNotification({
    type: NOTIFICATION_TYPES.poSubmitted,
    title: "Buyurtma tasdiqqa yuborildi",
    message: `${order.number} (${supplierLabel(supplierName)}) tasdiq bosqichini kutmoqda.`,
    link: `/purchases/orders/${order.id}`,
    refs: { orderId: order.id, orderNumber: order.number, supplierId: order.supplierId },
    actor: actor || order.buyer?.name,
    dedupeKey: `po_submitted:${order.id}`,
  });

export const notifyPurchaseOrderApproved = ({ order, supplierName, auto, actor }) =>
  pushNotification({
    type: NOTIFICATION_TYPES.poApproved,
    title: "Buyurtma tasdiqlandi",
    message: auto
      ? `${order.number} (${supplierLabel(supplierName)}) avtomatik tasdiqlandi.`
      : `${order.number} (${supplierLabel(supplierName)}) barcha bosqichlardan tasdiqlandi.`,
    link: `/purchases/orders/${order.id}`,
    refs: { orderId: order.id, orderNumber: order.number, supplierId: order.supplierId },
    actor: actor || "Tizim",
    dedupeKey: `po_approved:${order.id}`,
  });

export const notifyPurchaseOrderRejected = ({ order, supplierName, reason, actor }) =>
  pushNotification({
    type: NOTIFICATION_TYPES.poRejected,
    title: "Buyurtma rad etildi",
    message: `${order.number} (${supplierLabel(supplierName)}) rad etildi: ${reason}`,
    link: `/purchases/orders/${order.id}`,
    refs: { orderId: order.id, orderNumber: order.number, supplierId: order.supplierId },
    actor,
    // Har bir rad etish alohida voqea — qayta yuborilgach yana rad etilsa ham
    // farqli yozuv (timestamp asosida) bo'lishi uchun dedupeKey yo'q.
  });

export const notifyGoodsReceived = ({ order, receipt, supplierName, actor }) =>
  pushNotification({
    type: NOTIFICATION_TYPES.goodsReceived,
    title: "Tovar to'liq qabul qilindi",
    message: `${order.number} (${supplierLabel(supplierName)}) bo'yicha barcha tovar qabul qilindi (${receipt.number}).`,
    link: `/purchases/orders/${order.id}`,
    refs: { orderId: order.id, orderNumber: order.number, supplierId: order.supplierId },
    actor: actor || receipt.receivedBy,
    dedupeKey: `goods_received:${order.id}`,
  });

export const notifyPartialReceiving = ({ order, receipt, supplierName, actor }) =>
  pushNotification({
    type: NOTIFICATION_TYPES.partialReceiving,
    title: "Tovar qisman qabul qilindi",
    message: `${order.number} (${supplierLabel(supplierName)}) bo'yicha qisman qabul qilindi (${receipt.number}).`,
    link: `/purchases/orders/${order.id}`,
    refs: { orderId: order.id, orderNumber: order.number, supplierId: order.supplierId },
    actor: actor || receipt.receivedBy,
    dedupeKey: `partial_receiving:${receipt.id}`,
  });

export const notifyInvoiceCreated = ({ invoice, supplierName, actor }) =>
  pushNotification({
    type: NOTIFICATION_TYPES.invoiceCreated,
    title: "Yangi invoys",
    message: `${invoice.number} (${supplierLabel(supplierName)}) — ${formatCurrencyMoney(invoice.amount, invoice.currency)}.`,
    link: "/purchases/invoices",
    refs: { invoiceId: invoice.id, invoiceNumber: invoice.number, orderId: invoice.orderId, supplierId: invoice.supplierId },
    actor: actor || invoice.createdBy,
    dedupeKey: `invoice_created:${invoice.id}`,
  });

export const notifyInvoiceMatched = ({ invoice, supplierName, actor }) =>
  pushNotification({
    type: NOTIFICATION_TYPES.invoiceMatched,
    title: "Invoys mos keldi",
    message: `${invoice.number} (${supplierLabel(supplierName)}) uch tomonlama solishtiruvda to'liq mos keldi.`,
    link: "/purchases/invoices",
    refs: { invoiceId: invoice.id, invoiceNumber: invoice.number, orderId: invoice.orderId, supplierId: invoice.supplierId },
    actor: actor || "Tizim",
    dedupeKey: `invoice_matched:${invoice.id}`,
  });

export const notifyInvoiceMismatch = ({ invoice, supplierName, actor }) =>
  pushNotification({
    type: NOTIFICATION_TYPES.invoiceMismatch,
    title: "Invoys nomuvofiqligi",
    message: `${invoice.number} (${supplierLabel(supplierName)}) uch tomonlama solishtiruvda nomuvofiqlik aniqlandi.`,
    link: "/purchases/invoices",
    refs: { invoiceId: invoice.id, invoiceNumber: invoice.number, orderId: invoice.orderId, supplierId: invoice.supplierId },
    actor: actor || "Tizim",
    dedupeKey: `invoice_mismatch:${invoice.id}`,
  });

export const notifyPaymentCreated = ({ invoice, amount, currency, supplierName, actor }) =>
  pushNotification({
    type: NOTIFICATION_TYPES.paymentCreated,
    title: "To'lov amalga oshirildi",
    message: `${invoice.number} (${supplierLabel(supplierName)}) uchun ${formatCurrencyMoney(amount, currency)} to'landi.`,
    link: "/purchases/invoices",
    refs: { invoiceId: invoice.id, invoiceNumber: invoice.number, orderId: invoice.orderId, supplierId: invoice.supplierId },
    actor,
    // Har bir to'lov alohida voqea (bir invoysga bir necha marta to'lanishi
    // mumkin — PDF 44-46 qisman to'lov), shu sabab dedupeKey yo'q.
  });

export const notifyPurchaseReturn = ({ returnEntry, supplierName, actor }) =>
  pushNotification({
    type: NOTIFICATION_TYPES.purchaseReturn,
    title: "Qaytarish yaratildi",
    message: `${returnEntry.number} (${supplierLabel(supplierName)}) — ${formatCurrencyMoney(returnEntry.total, "UZS")} tasdiq kutmoqda.`,
    link: "/purchases/returns",
    refs: { returnId: returnEntry.id, returnNumber: returnEntry.number, orderId: returnEntry.orderId, supplierId: returnEntry.supplierId },
    actor: actor || returnEntry.createdBy,
    dedupeKey: `purchase_return:${returnEntry.id}`,
  });

export const notifyQualityInspection = ({ inspection, order, statusLabel, supplierName, actor }) =>
  pushNotification({
    type: NOTIFICATION_TYPES.qualityInspection,
    title: "Sifat tekshiruvi yakunlandi",
    message: `${inspection.number} (${order?.number || inspection.orderNumber}, ${supplierLabel(supplierName)}) — ${statusLabel}.`,
    link: "/purchases/quality-inspection",
    refs: {
      orderId: inspection.orderId,
      orderNumber: inspection.orderNumber,
      supplierId: inspection.supplierId,
      inspectionId: inspection.id,
    },
    actor: actor || inspection.inspectedBy,
    dedupeKey: `quality_inspection:${inspection.id}`,
  });

export const notifySupplierIssue = ({ supplier, noteText, noteId, actor }) =>
  pushNotification({
    type: NOTIFICATION_TYPES.supplierIssue,
    title: "Yetkazib beruvchida muammo",
    message: `${supplier.name}: ${noteText}`,
    link: `/suppliers/${supplier.id}`,
    refs: { supplierId: supplier.id },
    actor,
    dedupeKey: `supplier_issue:${supplier.id}:${noteId}`,
  });
