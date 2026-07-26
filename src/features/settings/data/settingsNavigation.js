export const settingsGroups = [
  {
    id: "general",
    title: "General",
    items: [
      { id: "home", label: "Settings Home", path: "/settings", icon: "LayoutDashboard" },
      { id: "company", label: "Company", path: "/settings/company", icon: "Building2" },
      { id: "business", label: "Business", path: "/settings/business", icon: "BriefcaseBusiness" },
      { id: "localization", label: "Localization", path: "/settings/localization", icon: "Languages" },
      { id: "appearance", label: "Appearance", path: "/settings/appearance", icon: "Palette" },
    ],
  },
  {
    id: "organization",
    title: "Organization",
    items: [
      { id: "branches", label: "Branches", path: "/settings/branches", icon: "GitBranch" },
      { id: "warehouses", label: "Warehouses", path: "/settings/warehouses", icon: "Warehouse" },
      { id: "users", label: "Users", path: "/settings/users", icon: "UsersRound" },
      { id: "roles", label: "Roles", path: "/settings/roles", icon: "ShieldCheck" },
      { id: "permissions", label: "Permissions", path: "/settings/permissions", icon: "LockKeyhole" },
    ],
  },
  {
    id: "finance",
    title: "Finance",
    items: [
      { id: "finance", label: "Currency", path: "/settings/finance", icon: "CircleDollarSign" },
      { id: "taxes", label: "Taxes", path: "/settings/taxes", icon: "BadgePercent" },
      { id: "payments", label: "Payment Methods", path: "/settings/payments", icon: "CreditCard" },
    ],
  },
  {
    id: "documents",
    title: "Documents",
    items: [
      { id: "documents", label: "Templates", path: "/settings/documents", icon: "Files" },
      { id: "notifications", label: "Notifications", path: "/settings/notifications", icon: "BellRing" },
      { id: "security", label: "Security", path: "/settings/security", icon: "ShieldAlert" },
    ],
  },
  {
    id: "integrations",
    title: "Integrations",
    items: [
      { id: "integrations", label: "Integrations", path: "/settings/integrations", icon: "PlugZap" },
      { id: "api", label: "API & Webhooks", path: "/settings/api", icon: "KeyRound" },
    ],
  },
  {
    id: "system",
    title: "System",
    items: [
      { id: "backup", label: "Backup & Restore", path: "/settings/backup", icon: "DatabaseBackup" },
      { id: "ai", label: "AI Settings", path: "/settings/ai", icon: "Bot" },
      { id: "advanced", label: "Advanced", path: "/settings/advanced", icon: "SlidersHorizontal" },
      { id: "audit", label: "Audit Log", path: "/settings/audit", icon: "FileClock" },
    ],
  },
];

export const settingsRouteIds = settingsGroups.flatMap((group) => group.items.map((item) => item.id));

export const settingsPathById = settingsGroups
  .flatMap((group) => group.items)
  .reduce((map, item) => ({ ...map, [item.id]: item.path }), {});

export const settingsPageMeta = {
  home: {
    eyebrow: "Control Center",
    title: "ZENIX Settings",
    description: "Kompaniya, ruxsatlar, moliya, xavfsizlik, integratsiyalar va AI sozlamalari uchun markaziy operatsion modul.",
  },
  company: { eyebrow: "General", title: "Company Settings", description: "Yuridik ma'lumotlar, bank rekvizitlari, branding, ish vaqti va hujjatlar." },
  business: { eyebrow: "General", title: "Business Settings", description: "Biznes turi, operatsion qoidalar, filial modeli va service boundaries." },
  localization: { eyebrow: "General", title: "Localization", description: "Til, vaqt zonasi, sanalar, raqamlar, valyuta formatlari va accessibility." },
  appearance: { eyebrow: "Preview Mode", title: "Appearance", description: "Theme preview, density, transparency, blur va motion sozlamalari global theme'ni buzmasdan sinov qilinadi." },
  branches: { eyebrow: "Organization", title: "Branch Settings", description: "Filiallar, managerlar, ish vaqti, analytics preview va archive flow." },
  warehouses: { eyebrow: "Organization", title: "Warehouse Settings", description: "Ombor profili, stock policy, reserve rules, transfer va notification qoidalari." },
  users: { eyebrow: "Access", title: "Users", description: "Foydalanuvchilar, status, rollar, filial/ombor cheklovlari, devices va last login." },
  roles: { eyebrow: "Access", title: "Roles", description: "Standard va custom rollar, duplicate flow, templates va active users count." },
  permissions: { eyebrow: "Access", title: "Permission Matrix", description: "Module, page, feature, action, field, branch, warehouse, device, IP va approval rules." },
  finance: { eyebrow: "Finance", title: "Currency Settings", description: "Base currency, exchange rates, auto update va financial rules." },
  taxes: { eyebrow: "Finance", title: "Tax Settings", description: "QQS, fiscal rules, tax groups, calculation preview va validation." },
  payments: { eyebrow: "Finance", title: "Payment Settings", description: "Payment methods, cash registers, bank accounts va settlement qoidalari." },
  documents: { eyebrow: "Documents", title: "Documents & Printing", description: "Receipt/invoice templates, printers, numbering, barcode, QR va live preview." },
  notifications: { eyebrow: "Communication", title: "Notifications", description: "In-app, Email, SMS, Telegram, Push kanallari va template test simulation." },
  security: { eyebrow: "Security", title: "Security Settings", description: "Password policy, 2FA, sessions, devices, IP restrictions va emergency actions." },
  integrations: { eyebrow: "Integrations", title: "Integration Monitoring", description: "Click, Payme, Telegram, 1C, hardware va marketplace statuslari." },
  api: { eyebrow: "Developers", title: "API & Webhooks", description: "API keys, webhook endpoints, secret masking, test delivery va sync logs." },
  backup: { eyebrow: "System", title: "Backup & Restore", description: "Backup schedules, history, encryption, retention, restore confirmation va progress." },
  ai: { eyebrow: "ZENIX AI", title: "AI Settings", description: "AI modules, permissions, usage limits, prompts, knowledge sources, cost va emergency stop." },
  advanced: { eyebrow: "Owner Only", title: "Advanced Settings", description: "System health, cache, background jobs, feature flags, diagnostics va maintenance mode." },
  audit: { eyebrow: "Audit", title: "Settings Audit", description: "Har bir o'zgarish, approval, device, IP, old value, new value va reason." },
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
