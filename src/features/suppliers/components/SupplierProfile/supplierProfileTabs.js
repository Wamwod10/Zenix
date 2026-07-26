// Deep Linking (Task 5): SupplierDetails ?tab= query paramni shu YAGONA
// ro'yxatga qarshi tekshiradi — tab id'lari ikki joyda takrorlanmaydi.
//
// Alohida faylga chiqarildi (ilgari SupplierProfile.jsx ichida edi): bitta
// fayl komponent VA konstantani birga eksport qilsa, Fast Refresh butun
// komponentni qayta yuklay olmaydi (react-refresh/only-export-components
// ogohlantirishi) — konstanta shu yerda, komponent SupplierProfile.jsx'da.
import {
  Activity,
  Building2,
  FileSpreadsheet,
  History,
  MessageSquarePlus,
  Package,
  Paperclip,
  ReceiptText,
  Sparkles,
} from "lucide-react";

export const SUPPLIER_PROFILE_TABS = [
  { id: "overview", label: "Umumiy", icon: Building2 },
  { id: "products", label: "Mahsulotlar", icon: Package },
  { id: "history", label: "Xarid tarixi", icon: History },
  { id: "invoices", label: "Invoyslar", icon: ReceiptText },
  { id: "statement", label: "Hisob-varaq", icon: FileSpreadsheet },
  { id: "documents", label: "Hujjatlar", icon: Paperclip },
  { id: "notes", label: "Izohlar", icon: MessageSquarePlus },
  { id: "activity", label: "Faoliyat", icon: Activity },
  { id: "ai", label: "AI tahlil", icon: Sparkles },
];
