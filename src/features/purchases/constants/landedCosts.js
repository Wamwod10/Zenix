// Landed Cost — Enterprise kengaytma (PDF 56). Xarajat turlari va taqsimlash
// usullari shu yerda markazlashtirilgan — ReceiveGoodsModal, PurchaseOrderDetail
// va landedCostAllocation.js (taqsimlash dvigateli) shu YAGONA manbadan foydalanadi.

export const LANDED_COST_TYPES = [
  { id: "freight", label: "Frax (Freight)" },
  { id: "shipping", label: "Yetkazish (Shipping)" },
  { id: "customs", label: "Bojxona (Customs)" },
  { id: "importDuty", label: "Import bojligi (Import Duty)" },
  { id: "insurance", label: "Sug'urta (Insurance)" },
  { id: "handling", label: "Qayta ishlash (Handling)" },
  { id: "packaging", label: "Qadoqlash (Packaging)" },
  { id: "portCharges", label: "Port yig'imlari (Port Charges)" },
  { id: "transport", label: "Transport" },
  { id: "other", label: "Boshqa xarajat" },
];

export const getLandedCostTypeLabel = (id) =>
  LANDED_COST_TYPES.find((type) => type.id === id)?.label || "Boshqa xarajat";

// Taqsimlash usullari — Enterprise talab: quantity/value/weight/volume/equal/manual.
export const LANDED_COST_ALLOCATION_METHODS = [
  {
    id: "quantity",
    label: "Miqdor bo'yicha",
    description: "Qabul qilingan miqdorga mutanosib taqsimlanadi.",
  },
  {
    id: "value",
    label: "Qiymat bo'yicha",
    description: "Qator qiymatiga (miqdor x narx) mutanosib taqsimlanadi.",
  },
  {
    id: "weight",
    label: "Og'irlik bo'yicha",
    description: "Qatorning umumiy og'irligiga mutanosib taqsimlanadi.",
  },
  {
    id: "volume",
    label: "Hajm bo'yicha",
    description: "Qatorning umumiy hajmiga mutanosib taqsimlanadi.",
  },
  {
    id: "equal",
    label: "Teng taqsimlash",
    description: "Xarajat barcha qatorlar orasida teng bo'linadi.",
  },
  {
    id: "manual",
    label: "Qo'lda taqsimlash",
    description: "Har bir qator uchun summa qo'lda kiritiladi.",
  },
];

export const getLandedCostAllocationMethodLabel = (id) =>
  LANDED_COST_ALLOCATION_METHODS.find((method) => method.id === id)?.label ||
  "Miqdor bo'yicha";

export const getLandedCostAllocationMethod = (id) =>
  LANDED_COST_ALLOCATION_METHODS.find((method) => method.id === id) ||
  LANDED_COST_ALLOCATION_METHODS[0];

// Yaxlitlash farqi uchun ruxsat etilgan chegara (qo'lda taqsimlashda) —
// shundan katta farq "mos kelmadi" xatosi sifatida bloklaydi.
export const LANDED_COST_ALLOCATION_TOLERANCE = 1;
