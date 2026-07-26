// Enterprise Three-Way Matching — PO -> Goods Receipt -> Supplier Invoice,
// QATOR (line-item) darajasida. Bitta YAGONA formuladan foydalanadi: invoys
// yaratilayotganda (usePurchasesStore.js: createInvoice / receiveOrder
// avtomatik invoys) VA invoys modalidagi live preview (PurchaseInvoiceModal)
// bir xil natija berishi shart — mantiq ikki joyda yozilmaydi.
//
// Miqdorlar HAR DOIM bazaviy birlikda (dona) solishtiriladi — receivedQty/
// damagedQty/missingQty kabi (ReceiveGoodsModal bilan bir xil konvensiya).
// Narx ham "1 bazaviy birlik narxi" sifatida (item.price / unitFactor).
//
// Backend ulanganda: bu modul hech qanday store/React holatiga bog'liq emas
// (sof funksiyalar) — xuddi shu hisoblash mantig'ini backend endpoint
// (masalan POST /invoices/:id/match) qaytarishi mumkin, frontend faqat
// natijani (lines + summary) render qiladi.

import { INVOICE_MATCH_TOLERANCE, TAX_MODES } from "../constants/paymentTerms";
import { getEffectiveReceivedQty, toBaseQuantity } from "./purchaseCalculations";
import { formatMoney, formatQuantity, normalizeNumber } from "./purchaseMoney";

export const LINE_MATCH_STATUSES = {
  matched: "matched",
  partial: "partial",
  mismatch: "mismatch",
  missing: "missing",
  extra: "extra",
};

export const LINE_MATCH_STATUS_LABELS = {
  [LINE_MATCH_STATUSES.matched]: "Mos",
  [LINE_MATCH_STATUSES.partial]: "Qisman mos",
  [LINE_MATCH_STATUSES.mismatch]: "Nomuvofiqlik",
  [LINE_MATCH_STATUSES.missing]: "Yetishmayapti",
  [LINE_MATCH_STATUSES.extra]: "Ortiqcha (PO'da yo'q)",
};

export const LINE_MATCH_STATUS_TONES = {
  [LINE_MATCH_STATUSES.matched]: "success",
  [LINE_MATCH_STATUSES.partial]: "warning",
  [LINE_MATCH_STATUSES.mismatch]: "danger",
  [LINE_MATCH_STATUSES.missing]: "danger",
  [LINE_MATCH_STATUSES.extra]: "warning",
};

const OVERALL_LABELS = {
  [LINE_MATCH_STATUSES.matched]: "To'liq mos — three-way match o'tdi",
  [LINE_MATCH_STATUSES.partial]: "Qisman mos — hali yakunlanmagan",
  [LINE_MATCH_STATUSES.mismatch]: "Nomuvofiqlik bor — tekshirish talab qilinadi",
};

const QTY_EPSILON = 1e-6;
const DISCOUNT_TAX_EPSILON = 0.01;

// Narx tolerance foizga o'tkaziladi (INVOICE_MATCH_TOLERANCE = 0.01 -> 1%).
export const PRICE_MATCH_TOLERANCE_PERCENT = INVOICE_MATCH_TOLERANCE * 100;

// PO qatoridagi narx buyurtma BIRLIGIDA (masalan 1 Qop) saqlanadi, lekin
// qabul/miqdor solishtiruvi bazaviy birlikda (dona) olib boriladi — shu
// sabab narx ham bazaviy birlikka o'tkaziladi (aks holda Qop narxini dona
// miqdoriga solishtirib bo'lmaydi).
export const getOrderedUnitPrice = (item = {}) =>
  normalizeNumber(item.price) / (normalizeNumber(item.unitFactor) || 1);

const round = (value) => Math.round(value * 100) / 100;

const computeNetAmount = (qty, unitPrice, discountPercent = 0) => {
  const gross = qty * unitPrice;

  return gross - (gross * discountPercent) / 100;
};

// PO.taxMode qoidasi bilan bir xil (calculateOrderTotals): "inclusive"
// rejimida narx QQS'ni ICHIDA saqlaydi (jami = net summaning o'zi), faqat
// "exclusive" rejimida QQS net summaga USTIGA qo'shiladi.
const computeGrossAmount = (netAmount, taxRate = 0, taxMode = TAX_MODES.exclusive) =>
  taxMode === TAX_MODES.inclusive ? netAmount : netAmount + (netAmount * taxRate) / 100;

// PO qatorini solishtiruv uchun kanonik shaklga o'tkazadi — createInvoice,
// receiveOrder va PurchaseInvoiceModal (live preview) shu YAGONA
// mapper'dan foydalanadi.
export const mapOrderItemForMatching = (item = {}) => {
  const orderedQty = toBaseQuantity(item);

  return {
    itemId: item.id,
    name: item.name,
    sku: item.sku,
    orderedQty,
    // "receivedQty" (NET, qaytarilgandan keyingi) — invoys qatori qancha
    // invoyslanishi KERAKligini solishtirish uchun (qaytarilgan tovar hech
    // qachon to'lovga tegishli emas, PDF 36+43).
    receivedQty: Math.min(getEffectiveReceivedQty(item), orderedQty),
    // "grossReceivedQty" (qaytarish HISOBGA OLINMAGAN) — "yetkazish hali
    // tugamadimi" (partialReceipt) savoliga javob berish uchun ALOHIDA
    // saqlanadi. Bug fix: agar shu ikkalasi bitta maydon bo'lsa, TO'LIQ
    // yetkazib berilgan, keyin qisman qaytarilgan buyurtma ham "hali
    // yetkazish tugamagan" deb noto'g'ri belgilanardi (qaytarish qabulni
    // "kelmagan" qilmaydi — u kelgan va qaytarilgan, ikkalasi TAMOM bo'lgan
    // fakt, "kutilayotgan" emas).
    grossReceivedQty: Math.min(normalizeNumber(item.receivedQty), orderedQty),
    unitPrice: getOrderedUnitPrice(item),
    discountPercent: normalizeNumber(item.discountPercent),
    taxRate: normalizeNumber(item.taxRate),
  };
};

const buildLineRow = (
  orderItem,
  invoiceLine,
  { orderCurrency, invoiceCurrency, taxMode },
) => {
  const hasInvoiceLine = !!invoiceLine;

  const orderedQty = orderItem.orderedQty;
  const receivedQty = orderItem.receivedQty;
  const grossReceivedQty = orderItem.grossReceivedQty ?? receivedQty;
  const invoicedQty = hasInvoiceLine ? normalizeNumber(invoiceLine.invoicedQty) : 0;

  const orderedUnitPrice = orderItem.unitPrice;
  const invoicedUnitPrice = hasInvoiceLine
    ? normalizeNumber(invoiceLine.unitPrice)
    : orderedUnitPrice;

  const orderedDiscount = orderItem.discountPercent || 0;
  const invoicedDiscount = hasInvoiceLine
    ? normalizeNumber(invoiceLine.discountPercent ?? orderedDiscount)
    : orderedDiscount;

  const orderedTax = orderItem.taxRate || 0;
  const invoicedTax = hasInvoiceLine
    ? normalizeNumber(invoiceLine.taxRate ?? orderedTax)
    : orderedTax;

  const priceDiffPercent = orderedUnitPrice
    ? ((invoicedUnitPrice - orderedUnitPrice) / orderedUnitPrice) * 100
    : invoicedUnitPrice
      ? 100
      : 0;

  const orderedNet = computeNetAmount(orderedQty, orderedUnitPrice, orderedDiscount);
  const receivedNet = computeNetAmount(receivedQty, orderedUnitPrice, orderedDiscount);
  const invoicedNet = computeNetAmount(invoicedQty, invoicedUnitPrice, invoicedDiscount);

  const lineTotal = {
    ordered: Math.round(computeGrossAmount(orderedNet, orderedTax, taxMode)),
    received: Math.round(computeGrossAmount(receivedNet, orderedTax, taxMode)),
    invoiced: Math.round(computeGrossAmount(invoicedNet, invoicedTax, taxMode)),
  };

  const flags = {
    missing: !hasInvoiceLine,
    extra: false,
    partialReceipt:
      grossReceivedQty > QTY_EPSILON && orderedQty - grossReceivedQty > QTY_EPSILON,
    partialInvoice:
      hasInvoiceLine &&
      invoicedQty > QTY_EPSILON &&
      receivedQty - invoicedQty > QTY_EPSILON,
    qtyDiff: hasInvoiceLine && Math.abs(invoicedQty - receivedQty) > QTY_EPSILON,
    priceDiff:
      hasInvoiceLine && Math.abs(priceDiffPercent) > PRICE_MATCH_TOLERANCE_PERCENT,
    discountDiff:
      hasInvoiceLine &&
      Math.abs(invoicedDiscount - orderedDiscount) > DISCOUNT_TAX_EPSILON,
    taxDiff:
      hasInvoiceLine && Math.abs(invoicedTax - orderedTax) > DISCOUNT_TAX_EPSILON,
    currencyDiff:
      hasInvoiceLine &&
      !!invoiceCurrency &&
      !!orderCurrency &&
      invoiceCurrency !== orderCurrency,
  };

  let status = LINE_MATCH_STATUSES.matched;

  if (flags.missing) {
    status = LINE_MATCH_STATUSES.missing;
  } else if (
    flags.qtyDiff ||
    flags.priceDiff ||
    flags.discountDiff ||
    flags.taxDiff ||
    flags.currencyDiff
  ) {
    status = LINE_MATCH_STATUSES.mismatch;
  } else if (flags.partialReceipt || flags.partialInvoice) {
    status = LINE_MATCH_STATUSES.partial;
  }

  const reasons = [];

  if (flags.missing) {
    reasons.push("Bu tovar uchun invoys qatori kiritilmagan.");
  }

  if (flags.qtyDiff) {
    reasons.push(
      `Miqdor farqi: qabul qilingan ${formatQuantity(receivedQty)}, invoysda ${formatQuantity(invoicedQty)}.`,
    );
  }

  if (flags.priceDiff) {
    const sign = priceDiffPercent > 0 ? "+" : "";

    reasons.push(
      `Narx farqi: PO ${formatMoney(orderedUnitPrice)}, invoys ${formatMoney(invoicedUnitPrice)} (${sign}${round(priceDiffPercent)}%).`,
    );
  }

  if (flags.discountDiff) {
    reasons.push(
      `Chegirma farqi: PO ${orderedDiscount}%, invoys ${invoicedDiscount}%.`,
    );
  }

  if (flags.taxDiff) {
    reasons.push(`QQS farqi: PO ${orderedTax}%, invoys ${invoicedTax}%.`);
  }

  if (flags.currencyDiff) {
    reasons.push(`Valyuta farqi: PO ${orderCurrency}, invoys ${invoiceCurrency}.`);
  }

  if (!flags.missing && flags.partialReceipt) {
    reasons.push(
      `Qisman qabul: ${formatQuantity(receivedQty)} / ${formatQuantity(orderedQty)}.`,
    );
  }

  if (!flags.missing && flags.partialInvoice) {
    reasons.push(
      `Qisman invoys: qabul qilingan ${formatQuantity(receivedQty)}dan ${formatQuantity(invoicedQty)} invoyslandi.`,
    );
  }

  if (status === LINE_MATCH_STATUSES.matched) {
    reasons.push("PO, qabul va invoys to'liq mos keladi.");
  }

  return {
    itemId: orderItem.itemId,
    name: orderItem.name,
    sku: orderItem.sku,
    orderedQty,
    receivedQty,
    invoicedQty,
    unitPrice: {
      ordered: round(orderedUnitPrice),
      invoiced: round(invoicedUnitPrice),
      diffPercent: round(priceDiffPercent),
    },
    discountPercent: { ordered: orderedDiscount, invoiced: invoicedDiscount },
    taxRate: { ordered: orderedTax, invoiced: invoicedTax },
    lineTotal,
    flags,
    status,
    reasons,
  };
};

const buildExtraRow = (invoiceLine, { invoiceCurrency, taxMode }) => {
  const invoicedQty = normalizeNumber(invoiceLine.invoicedQty);
  const invoicedUnitPrice = normalizeNumber(invoiceLine.unitPrice);
  const invoicedDiscount = normalizeNumber(invoiceLine.discountPercent);
  const invoicedTax = normalizeNumber(invoiceLine.taxRate);
  const invoicedNet = computeNetAmount(invoicedQty, invoicedUnitPrice, invoicedDiscount);
  const invoicedTotal = Math.round(computeGrossAmount(invoicedNet, invoicedTax, taxMode));

  return {
    itemId: invoiceLine.itemId || null,
    name: invoiceLine.name || "Noma'lum tovar",
    sku: invoiceLine.sku || "",
    orderedQty: 0,
    receivedQty: 0,
    invoicedQty,
    unitPrice: { ordered: 0, invoiced: round(invoicedUnitPrice), diffPercent: null },
    discountPercent: { ordered: 0, invoiced: invoicedDiscount },
    taxRate: { ordered: 0, invoiced: invoicedTax },
    lineTotal: { ordered: 0, received: 0, invoiced: invoicedTotal },
    flags: {
      missing: false,
      extra: true,
      partialReceipt: false,
      partialInvoice: false,
      qtyDiff: false,
      priceDiff: false,
      discountDiff: false,
      taxDiff: false,
      currencyDiff: false,
    },
    status: LINE_MATCH_STATUSES.extra,
    reasons: [
      `PO'da mavjud emas — qo'shimcha qator (${formatMoney(invoicedTotal)}), tasdiqlash talab qilinadi.`,
    ],
    currency: invoiceCurrency,
  };
};

// order.items (PDF PurchaseOrderItem) + invoiceLines (invoys qatorlari,
// itemId orqali PO qatoriga bog'lanadi — itemId bo'lmasa "ortiqcha" qator
// deb hisoblanadi) asosida to'liq qator-darajasidagi solishtirish quradi.
export const buildThreeWayMatchLines = ({
  orderItems = [],
  invoiceLines = [],
  orderCurrency,
  invoiceCurrency,
  taxMode = TAX_MODES.exclusive,
}) => {
  const normalizedOrderItems = orderItems.map((item) =>
    item.orderedQty !== undefined ? item : mapOrderItemForMatching(item),
  );

  const invoiceLineByItemId = new Map(
    invoiceLines.filter((line) => line.itemId).map((line) => [line.itemId, line]),
  );

  const context = { orderCurrency, invoiceCurrency, taxMode };

  const rows = normalizedOrderItems.map((orderItem) =>
    buildLineRow(orderItem, invoiceLineByItemId.get(orderItem.itemId) || null, context),
  );

  const orderItemIds = new Set(normalizedOrderItems.map((item) => item.itemId));
  const extraLines = invoiceLines.filter(
    (line) => !line.itemId || !orderItemIds.has(line.itemId),
  );

  rows.push(...extraLines.map((line) => buildExtraRow(line, context)));

  return rows;
};

export const summarizeMatchLines = (lines = []) => {
  const counts = {
    matched: 0,
    partial: 0,
    mismatch: 0,
    missing: 0,
    extra: 0,
  };

  const totals = lines.reduce(
    (acc, line) => {
      counts[line.status] = (counts[line.status] || 0) + 1;

      return {
        ordered: acc.ordered + (line.lineTotal?.ordered || 0),
        received: acc.received + (line.lineTotal?.received || 0),
        invoiced: acc.invoiced + (line.lineTotal?.invoiced || 0),
      };
    },
    { ordered: 0, received: 0, invoiced: 0 },
  );

  let overallStatus = LINE_MATCH_STATUSES.matched;

  if (counts.mismatch > 0 || counts.missing > 0 || counts.extra > 0) {
    overallStatus = LINE_MATCH_STATUSES.mismatch;
  } else if (counts.partial > 0) {
    overallStatus = LINE_MATCH_STATUSES.partial;
  }

  return {
    counts,
    totals,
    lineCount: lines.length,
    matched: overallStatus === LINE_MATCH_STATUSES.matched,
    overallStatus,
    overallLabel: OVERALL_LABELS[overallStatus],
    delta: totals.invoiced - totals.received,
  };
};

// Qaysi PO qatorlari shu invoysga "tegishli" — PO ko'p invoysli bo'lishi
// mumkin (har qabulda avtomatik + qo'lda), shu sabab hali umuman qabul
// qilinmagan qatorni HAR bir invoysda "yetishmayapti" deb ko'rsatish noto'g'ri
// bo'lardi (bu shunchaki hali navbati kelmagan qator, muammo emas). Qoida:
// PO bo'yicha hech narsa qabul qilinmagan bo'lsa (masalan avans-invoys) —
// BARCHA qatorlar ko'rsatiladi; aks holda faqat qabul qilingan qatorlar.
export const getInvoiceableOrderItems = (order) => {
  const orderItems = (order?.items || []).map(mapOrderItemForMatching);
  const hasAnyReceipt = orderItems.some((item) => item.receivedQty > QTY_EPSILON);

  return hasAnyReceipt
    ? orderItems.filter((item) => item.receivedQty > QTY_EPSILON)
    : orderItems;
};

// Qulaylik uchun — order + invoiceLines'dan to'g'ridan-to'g'ri lines+summary
// ikkalasini birga quradi (store va modal shu funksiyani chaqiradi).
export const buildThreeWayMatch = (order, invoiceLines = [], invoiceCurrency) => {
  const baseItems = getInvoiceableOrderItems(order);
  const baseIds = new Set(baseItems.map((item) => item.itemId));
  // Invoys, hali "invoiceable" ro'yxatida yo'q PO qatorini ham
  // ko'rsatishi mumkin (masalan hali qabul qilinmagan tovar uchun oldindan
  // invoys — kamdan-kam, lekin tekshirilishi kerak bo'lgan holat).
  const extraReferenced = (order?.items || [])
    .map(mapOrderItemForMatching)
    .filter(
      (item) =>
        !baseIds.has(item.itemId) &&
        invoiceLines.some((line) => line.itemId === item.itemId),
    );

  const lines = buildThreeWayMatchLines({
    orderItems: [...baseItems, ...extraReferenced],
    invoiceLines,
    orderCurrency: order?.currency,
    invoiceCurrency: invoiceCurrency || order?.currency,
    taxMode: order?.taxMode,
  });

  return { lines, summary: summarizeMatchLines(lines) };
};
