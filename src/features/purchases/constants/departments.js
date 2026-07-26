// PDF 57 (Enterprise, Department Budget): Xaridlar ichki bo'lim/markaz
// ro'yxati — PO qaysi bo'lim uchun ekanini belgilash va shu kesimda byudjet
// yuritish uchun. Purchases moduli doirasida yagona ro'yxat (backend
// ulanganda kompaniya tuzilmasidan almashtiriladi).

export const PURCHASE_DEPARTMENTS = [
  { id: "procurement", label: "Sotib olish bo'limi" },
  { id: "warehouse", label: "Ombor" },
  { id: "retail", label: "Savdo/Do'kon" },
  { id: "production", label: "Ishlab chiqarish" },
  { id: "marketing", label: "Marketing" },
  { id: "administration", label: "Boshqaruv" },
  { id: "it", label: "IT" },
];

export const getDepartmentLabel = (departmentId) =>
  PURCHASE_DEPARTMENTS.find((entry) => entry.id === departmentId)?.label ||
  departmentId ||
  "";
