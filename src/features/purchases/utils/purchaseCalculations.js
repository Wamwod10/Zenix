// PDF 4, 10, 11, 12: jami hisoblash — miqdor, narx, chegirma, soliq.
// Hisoblash tartibi: qator chegirma → umumiy chegirma → soliq (default: soliqdan oldin).

import { TAX_MODES } from "../constants/paymentTerms";
import { normalizeNumber } from "./purchaseMoney";

// Qator summasi: miqdor(bazaviy birlikka konvertatsiya) x narx - qator chegirma
export const calculateLineSubtotal = (item = {}) => {
  const quantity = normalizeNumber(item.quantity);
  const price = normalizeNumber(item.price);
  const discountPercent = Math.min(
    Math.max(normalizeNumber(item.discountPercent), 0),
    100,
  );

  const gross = quantity * price;

  return gross - (gross * discountPercent) / 100;
};

export const calculateOrderTotals = (order = {}) => {
  const items = order.items || [];
  const taxMode = order.taxMode || TAX_MODES.exclusive;
  const orderDiscountPercent = Math.min(
    Math.max(normalizeNumber(order.orderDiscountPercent), 0),
    100,
  );

  const linesSubtotal = items.reduce(
    (sum, item) => sum + calculateLineSubtotal(item),
    0,
  );

  const orderDiscount = (linesSubtotal * orderDiscountPercent) / 100;
  const taxableBase = linesSubtotal - orderDiscount;

  // Har qator o'z soliq stavkasi bilan (aralash stavka — PDF 12 edge case)
  let taxAmount = 0;

  if (linesSubtotal > 0) {
    taxAmount = items.reduce((sum, item) => {
      const lineShare = calculateLineSubtotal(item) / linesSubtotal;
      const lineBase = taxableBase * lineShare;
      const rate = normalizeNumber(item.taxRate) / 100;

      if (taxMode === TAX_MODES.inclusive) {
        return sum + lineBase - lineBase / (1 + rate);
      }

      return sum + lineBase * rate;
    }, 0);
  }

  // PDF 56 fix: landed cost (yetkazish/bojxona/sug'urta) YAKUNIY summaga
  // qo'shiladi — Mahsulot + Landed cost + Soliq - Chegirma. `order.landedCostTotal`
  // topshirilmagan chaqiruvchilarda 0 bo'lib qoladi (orqaga moslik).
  const landedCostTotal = normalizeNumber(order.landedCostTotal);

  const total =
    (taxMode === TAX_MODES.inclusive ? taxableBase : taxableBase + taxAmount) +
    landedCostTotal;

  return {
    linesSubtotal: Math.round(linesSubtotal),
    orderDiscount: Math.round(orderDiscount),
    taxableBase: Math.round(taxableBase),
    taxAmount: Math.round(taxAmount),
    landedCostTotal: Math.round(landedCostTotal),
    total: Math.round(total),
  };
};

// PDF 9: birlik konversiyasi — buyurtma birlikdagi miqdor → bazaviy (dona)
export const toBaseQuantity = (item = {}) =>
  normalizeNumber(item.quantity) * (normalizeNumber(item.unitFactor) || 1);

// PDF 22: qolgan miqdor (bazaviy birlikda)
// Bug fix: ilgari faqat receivedQty (yaxshi holatdagi qabul) ayirilardi —
// buzuq (damagedQty) va yetishmagan (missingQty) miqdor esa buyurtma
// qolig'idan chiqarilmasdi. Natijada, masalan, 4 tadan 3 tasi yaxshi + 1
// tasi buzuq/yetishmagan holda TO'LIQ hujjatlashtirilgan bo'lsa ham, tizim
// hamon "1 dona qolgan" deb hisoblardi — PO hech qachon to'liq qabul
// qilingan holatga o'tmasdi va barcha keyingi summalar (qoldiq, holat)
// noto'g'ri bo'lib qolardi. Endi uchala miqdor ham (yaxshi + buzuq +
// yetishmagan) buyurtmadan "hal qilingan" deb hisoblanadi.
export const getRemainingQty = (item = {}) =>
  Math.max(
    toBaseQuantity(item) -
      normalizeNumber(item.receivedQty) -
      normalizeNumber(item.damagedQty) -
      normalizeNumber(item.missingQty),
    0,
  );

export const isOrderFullyReceived = (order = {}) =>
  (order.items || []).every((item) => getRemainingQty(item) <= 0);

// PDF 36 + 43: qaytarilgan tovar hech qachon to'lovga tegishli emas — 3-tomonlama
// solishtirishda receivedQty o'rniga NET (qaytarilgandan keyingi) miqdor ishlatiladi.
export const getEffectiveReceivedQty = (item = {}) =>
  Math.max(
    normalizeNumber(item.receivedQty) - normalizeNumber(item.returnedQty),
    0,
  );

export const hasAnyReceipt = (order = {}) =>
  (order.items || []).some((item) => normalizeNumber(item.receivedQty) > 0);

// PDF 10: narx ogohlantirish — oldingi narxdan 20%+ qimmat
export const getPriceIncreasePercent = (item = {}) => {
  const price = normalizeNumber(item.price);
  const lastPrice = normalizeNumber(item.lastPrice);

  if (!lastPrice || !price) return 0;

  return Math.round(((price - lastPrice) / lastPrice) * 100);
};

export const PRICE_WARNING_THRESHOLD = 20;

// PDF 45, 53: qarz aging — 0-30 / 30-60 / 60+ kun
export const getAgingBucket = (dueDate, now = new Date()) => {
  if (!dueDate) return "current";

  const due = new Date(dueDate);
  const overdueDays = Math.floor((now - due) / (1000 * 60 * 60 * 24));

  if (overdueDays <= 0) return "current";
  if (overdueDays <= 30) return "d30";
  if (overdueDays <= 60) return "d60";

  return "d60plus";
};

export const AGING_LABELS = {
  current: "Muddati kelmagan",
  d30: "0-30 kun o'tgan",
  d60: "30-60 kun o'tgan",
  d60plus: "60+ kun o'tgan",
};

export const getInvoiceRemaining = (invoice = {}) =>
  Math.max(
    normalizeNumber(invoice.amount) - normalizeNumber(invoice.paidAmount),
    0,
  );

// Invoys qoldig'i BAZAVIY valyutada (UZS). Turli invoyslar turli valyutada
// bo'lishi mumkin (PO valyutasidan meros) — ularni to'g'ridan-to'g'ri qo'shib
// bo'lmaydi. Har bir invoys o'z exchangeRate'i bilan UZS'ga o'tkaziladi, keyin
// yig'iladi. Eski (valyuta maydonisiz) invoyslar uchun exchangeRate 1 (UZS)
// deb olinadi — orqaga moslik.
export const getInvoiceRemainingInBaseCurrency = (invoice = {}) =>
  Math.round(
    getInvoiceRemaining(invoice) * (normalizeNumber(invoice.exchangeRate) || 1),
  );

// PDF 53: Supplier qarzi — ochiq (to'lanmagan) invoyslar qoldig'i yig'indisi,
// BAZAVIY valyutada. Bu YAGONA formula: qarz supplier kartochkasida
// saqlanadigan statik maydon emas, invoyslardan JONLI hisoblanadi — aks holda
// to'lov/invoys yaratilganda eskirib qoladi (invoice/payment — accounts
// payable balansini his qildi). Turli valyutadagi invoyslar aralashtirilmaydi.
export const getSupplierOutstandingDebt = (invoices = [], supplierId) =>
  invoices
    .filter((invoice) => invoice.supplierId === supplierId)
    .reduce((sum, invoice) => sum + getInvoiceRemainingInBaseCurrency(invoice), 0);

// Task 7: "Bo'lib to'lash" (installment) shartida to'lov jadvali avtomatik
// generatsiya qilinadi — 3 ta bo'lak, 30/60/90 kunlik intervallarda (qo'lda
// hisoblash shart emas). Oxirgi bo'lak yaxlitlash farqini o'ziga oladi —
// bo'laklar yig'indisi har doim `amount`ga aniq teng bo'lishi uchun.
export const INSTALLMENT_INTERVALS_DAYS = [30, 60, 90];

export const generateInstallmentSchedule = (amount, fromDateIso) => {
  const total = normalizeNumber(amount);
  const fromDate = fromDateIso ? new Date(fromDateIso) : new Date();
  const count = INSTALLMENT_INTERVALS_DAYS.length;
  const share = Math.floor(total / count);

  return INSTALLMENT_INTERVALS_DAYS.map((days, index) => {
    const dueDate = new Date(fromDate);
    dueDate.setDate(dueDate.getDate() + days);

    const isLast = index === count - 1;
    const value = isLast ? total - share * (count - 1) : share;

    return {
      index: index + 1,
      dueDate: dueDate.toISOString().slice(0, 10),
      amount: value,
    };
  });
};
