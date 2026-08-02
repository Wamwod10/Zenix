export const settingsGroups = [
  {
    id: "general",
    title: "Umumiy",
    items: [
      { id: "home", label: "Sozlamalar bosh sahifasi", path: "/settings", icon: "LayoutDashboard" },
      { id: "company", label: "Kompaniya", path: "/settings/company", icon: "Building2" },
      { id: "business", label: "Biznes", path: "/settings/business", icon: "BriefcaseBusiness" },
      { id: "localization", label: "Mahalliylashtirish", path: "/settings/localization", icon: "Languages" },
      { id: "appearance", label: "Ko'rinish", path: "/settings/appearance", icon: "Palette" },
    ],
  },
  {
    id: "organization",
    title: "Tashkilot",
    items: [
      { id: "branches", label: "Filiallar", path: "/settings/branches", icon: "GitBranch" },
      { id: "warehouses", label: "Omborlar", path: "/settings/warehouses", icon: "Warehouse" },
      { id: "users", label: "Foydalanuvchilar", path: "/settings/users", icon: "UsersRound" },
      { id: "roles", label: "Rollar", path: "/settings/roles", icon: "ShieldCheck" },
      { id: "permissions", label: "Ruxsatlar", path: "/settings/permissions", icon: "LockKeyhole" },
    ],
  },
  {
    id: "finance",
    title: "Moliya",
    items: [
      { id: "finance", label: "Valyuta", path: "/settings/finance", icon: "CircleDollarSign" },
      { id: "taxes", label: "Soliqlar", path: "/settings/taxes", icon: "BadgePercent" },
      { id: "payments", label: "To'lov usullari", path: "/settings/payments", icon: "CreditCard" },
    ],
  },
  {
    id: "documents",
    title: "Hujjatlar",
    items: [
      { id: "documents", label: "Shablonlar", path: "/settings/documents", icon: "Files" },
      { id: "notifications", label: "Bildirishnomalar", path: "/settings/notifications", icon: "BellRing" },
      { id: "security", label: "Xavfsizlik", path: "/settings/security", icon: "ShieldAlert" },
    ],
  },
  {
    id: "integrations",
    title: "Integratsiyalar",
    items: [
      { id: "integrations", label: "Integratsiyalar", path: "/settings/integrations", icon: "PlugZap" },
      { id: "api", label: "API va webhooklar", path: "/settings/api", icon: "KeyRound" },
    ],
  },
  {
    id: "system",
    title: "Tizim",
    items: [
      { id: "backup", label: "Backup va tiklash", path: "/settings/backup", icon: "DatabaseBackup" },
      { id: "ai", label: "AI sozlamalari", path: "/settings/ai", icon: "Bot" },
      { id: "advanced", label: "Kengaytirilgan", path: "/settings/advanced", icon: "SlidersHorizontal" },
      { id: "audit", label: "Audit jurnali", path: "/settings/audit", icon: "FileClock" },
    ],
  },
];

export const settingsRouteIds = settingsGroups.flatMap((group) => group.items.map((item) => item.id));

export const settingsPathById = settingsGroups
  .flatMap((group) => group.items)
  .reduce((map, item) => ({ ...map, [item.id]: item.path }), {});

export const settingsPageMeta = {
  home: {
    eyebrow: "Boshqaruv markazi",
    title: "ZENIX sozlamalari",
    description: "Kompaniya, ruxsatlar, moliya, xavfsizlik, integratsiyalar va AI sozlamalari uchun markaziy operatsion modul.",
  },
  company: { eyebrow: "Umumiy", title: "Kompaniya sozlamalari", description: "Yuridik ma'lumotlar, bank rekvizitlari, brending, ish vaqti va hujjatlar." },
  business: { eyebrow: "Umumiy", title: "Biznes sozlamalari", description: "Biznes turi, operatsion qoidalar, filial modeli va xizmat chegaralari." },
  localization: { eyebrow: "Umumiy", title: "Mahalliylashtirish", description: "Til, vaqt zonasi, sana, raqam, valyuta formatlari va qulaylik sozlamalari." },
  appearance: { eyebrow: "Preview rejimi", title: "Ko'rinish", description: "Theme, zichlik, shaffoflik, blur va animatsiya sozlamalarini sinovdan o'tkazish." },
  branches: { eyebrow: "Tashkilot", title: "Filial sozlamalari", description: "Filiallar, menejerlar, ish vaqti, tahlil previewi va arxivlash oqimi." },
  warehouses: { eyebrow: "Tashkilot", title: "Ombor sozlamalari", description: "Ombor profili, zaxira siyosati, rezerv qoidalari, transfer va bildirishnomalar." },
  users: { eyebrow: "Kirish", title: "Foydalanuvchilar", description: "Foydalanuvchilar, status, rollar, filial/ombor cheklovlari, qurilmalar va oxirgi kirish." },
  roles: { eyebrow: "Kirish", title: "Rollar", description: "Standart va custom rollar, duplicate oqimi, shablonlar va faol foydalanuvchilar." },
  permissions: { eyebrow: "Kirish", title: "Ruxsatlar matritsasi", description: "Modul, sahifa, action, maydon, filial, ombor, qurilma, IP va tasdiqlash qoidalari." },
  finance: { eyebrow: "Moliya", title: "Valyuta sozlamalari", description: "Asosiy valyuta, kurslar, avtomatik yangilash va moliyaviy qoidalar." },
  taxes: { eyebrow: "Moliya", title: "Soliq sozlamalari", description: "QQS, fiskal qoidalar, soliq guruhlari, hisoblash previewi va validatsiya." },
  payments: { eyebrow: "Moliya", title: "To'lov sozlamalari", description: "To'lov usullari, kassa, bank hisoblari va settlement qoidalari." },
  documents: { eyebrow: "Hujjatlar", title: "Hujjatlar va chop etish", description: "Chek/invoice shablonlari, printerlar, raqamlash, barcode, QR va live preview." },
  notifications: { eyebrow: "Aloqa", title: "Bildirishnomalar", description: "In-app, email, SMS, Telegram va push kanallari hamda xabar shablonlari." },
  security: { eyebrow: "Xavfsizlik", title: "Xavfsizlik sozlamalari", description: "Parol siyosati, 2FA, sessiyalar, qurilmalar, IP cheklovlari va favqulodda amallar." },
  integrations: { eyebrow: "Integratsiyalar", title: "Integratsiya monitoringi", description: "Click, Payme, Telegram, 1C, qurilmalar va marketplace statuslari." },
  api: { eyebrow: "Dasturchilar", title: "API va webhooklar", description: "API keylar, webhook endpointlar, secret masking, test delivery va sync loglar." },
  backup: { eyebrow: "Tizim", title: "Backup va tiklash", description: "Backup jadvali, tarix, shifrlash, saqlash muddati, tiklash tasdig'i va progress." },
  ai: { eyebrow: "ZENIX AI", title: "AI sozlamalari", description: "AI modullar, ruxsatlar, limitlar, promptlar, knowledge source, xarajat va emergency stop." },
  advanced: { eyebrow: "Faqat owner", title: "Kengaytirilgan sozlamalar", description: "Tizim holati, cache, background joblar, feature flaglar, diagnostika va maintenance mode." },
  audit: { eyebrow: "Audit", title: "Audit jurnali", description: "Har bir o'zgarish, tasdiqlash, qurilma, IP, eski qiymat, yangi qiymat va sabab." },
};

export const naturalSearchMap = [
  { routeId: "finance", keywords: ["valyuta", "currency", "kurs", "exchange"] },
  { routeId: "integrations", keywords: ["telegram", "bot", "click", "payme", "ulash", "integration"] },
  { routeId: "documents", keywords: ["chek", "logo", "printer", "pdf", "barcode", "qr", "invoice"] },
  { routeId: "backup", keywords: ["backup", "restore", "zaxira", "tiklash"] },
  { routeId: "roles", keywords: ["rol", "role", "yangi rol", "template"] },
  { routeId: "permissions", keywords: ["ruxsat", "permission", "field", "branch restriction"] },
  { routeId: "security", keywords: ["parol", "2fa", "session", "device", "ip"] },
  { routeId: "notifications", keywords: ["sms", "email", "push", "xabar", "bildirish"] },
  { routeId: "ai", keywords: ["ai", "prompt", "automation", "limit"] },
];
