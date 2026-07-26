// Enterprise Damaged Goods & Quality Inspection — qabulda buzuq deb
// belgilangan tovarni tekshirish: natija (status), shikast turi, jiddiylik
// va tekshiruv yakunida qilinadigan amal.

export const INSPECTION_STATUSES = {
  pending: "pending_inspection",
  passed: "passed",
  failed: "failed",
  partial: "partially_passed",
  rejected: "rejected",
};

export const INSPECTION_STATUS_LABELS = {
  [INSPECTION_STATUSES.pending]: "Tekshiruv kutilmoqda",
  [INSPECTION_STATUSES.passed]: "O'tdi",
  [INSPECTION_STATUSES.failed]: "O'tmadi",
  [INSPECTION_STATUSES.partial]: "Qisman o'tdi",
  [INSPECTION_STATUSES.rejected]: "Rad etildi",
};

export const INSPECTION_STATUS_TONES = {
  [INSPECTION_STATUSES.pending]: "warning",
  [INSPECTION_STATUSES.passed]: "success",
  [INSPECTION_STATUSES.failed]: "danger",
  [INSPECTION_STATUSES.partial]: "info",
  [INSPECTION_STATUSES.rejected]: "danger",
};

// Qat'iy holat o'tishi — bir marta yakunlangan tekshiruv qayta "kutilmoqda"
// holatiga qaytmaydi va ikki marta yakunlanmaydi (duplicate inspection).
export const INSPECTION_STATUS_FLOW = {
  [INSPECTION_STATUSES.pending]: [
    INSPECTION_STATUSES.passed,
    INSPECTION_STATUSES.failed,
    INSPECTION_STATUSES.partial,
    INSPECTION_STATUSES.rejected,
  ],
  [INSPECTION_STATUSES.passed]: [],
  [INSPECTION_STATUSES.failed]: [],
  [INSPECTION_STATUSES.partial]: [],
  [INSPECTION_STATUSES.rejected]: [],
};

export const canTransitionInspectionStatus = (from, to) =>
  (INSPECTION_STATUS_FLOW[from] || []).includes(to);

export const DAMAGE_TYPES = [
  { id: "broken", label: "Sinilgan" },
  { id: "scratched", label: "Tirnalgan" },
  { id: "expired", label: "Muddati o'tgan" },
  { id: "wrong_product", label: "Noto'g'ri tovar" },
  { id: "missing_quantity", label: "Miqdor yetishmaydi" },
  { id: "wet", label: "Nam / ho'l bo'lgan" },
  { id: "packaging_damage", label: "Qadoq shikastlangan" },
  { id: "manufacturing_defect", label: "Ishlab chiqarish nuqsoni" },
  { id: "transport_damage", label: "Tashishda shikastlangan" },
  { id: "other", label: "Boshqa" },
];

export const getDamageTypeLabel = (id) =>
  DAMAGE_TYPES.find((entry) => entry.id === id)?.label || "Boshqa";

export const SEVERITY_LEVELS = [
  { id: "low", label: "Past" },
  { id: "medium", label: "O'rta" },
  { id: "high", label: "Yuqori" },
  { id: "critical", label: "Kritik" },
];

export const SEVERITY_TONES = {
  low: "neutral",
  medium: "warning",
  high: "danger",
  critical: "danger",
};

export const getSeverityLabel = (id) =>
  SEVERITY_LEVELS.find((entry) => entry.id === id)?.label || "O'rta";

// Buzuq tovar bilan tekshiruv yakunida qilinadigan amal.
export const INSPECTION_ACTIONS = {
  accept: "accept",
  reject: "reject",
  partialAccept: "partial_accept",
  returnSupplier: "return_supplier",
  replacement: "replacement",
  dispose: "dispose",
  repair: "repair",
  quarantine: "quarantine",
};

export const INSPECTION_ACTION_OPTIONS = [
  { id: INSPECTION_ACTIONS.accept, label: "Qabul qilish" },
  { id: INSPECTION_ACTIONS.reject, label: "Rad etish" },
  { id: INSPECTION_ACTIONS.partialAccept, label: "Qisman qabul" },
  { id: INSPECTION_ACTIONS.returnSupplier, label: "Yetkazib beruvchiga qaytarish" },
  { id: INSPECTION_ACTIONS.replacement, label: "Almashtirish so'rovi" },
  { id: INSPECTION_ACTIONS.dispose, label: "Yo'q qilish (utilizatsiya)" },
  { id: INSPECTION_ACTIONS.repair, label: "Ta'mirlash" },
  { id: INSPECTION_ACTIONS.quarantine, label: "Karantinga olish" },
];

export const getInspectionActionLabel = (id) =>
  INSPECTION_ACTION_OPTIONS.find((entry) => entry.id === id)?.label || "—";
