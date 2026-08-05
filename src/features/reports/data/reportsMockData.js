import {
  BadgeDollarSign,
  BarChart3,
  Boxes,
  BrainCircuit,
  BriefcaseBusiness,
  CalendarClock,
  CircleDollarSign,
  ClipboardList,
  Download,
  Factory,
  FileClock,
  FileText,
  HeartPulse,
  LineChart,
  PieChart,
  ReceiptText,
  Scale,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  UserRoundCog,
  WalletCards,
} from "lucide-react";

export const reportsRoles = [
  { id: "owner", label: "Tizim egasi" },
  { id: "CEO", label: "Rahbar" },
  { id: "branchManager", label: "Filial menejeri" },
  { id: "warehouseManager", label: "Ombor menejeri" },
  { id: "financeManager", label: "Moliya menejeri" },
  { id: "HRManager", label: "HR menejeri" },
  { id: "cashier", label: "Kassir" },
  { id: "employee", label: "Xodim" },
  { id: "viewer", label: "Kuzatuvchi" },
];

export const reportsNavigationGroups = [
  {
    id: "overview",
    title: "Umumiy",
    items: [
      { id: "hub", label: "Hub", path: "", icon: BarChart3 },
      { id: "dashboard", label: "Hisobotlar", path: "overview", icon: BarChart3 },
      { id: "health", label: "Biznes salomatligi", path: "business-health", icon: HeartPulse },
      { id: "executive", label: "Rahbar xulosasi", path: "executive", icon: BriefcaseBusiness },
    ],
  },
  {
    id: "operations",
    title: "Operatsiyalar",
    items: [
      { id: "sales", label: "Savdo", path: "sales", icon: ReceiptText },
      { id: "inventory", label: "Ombor", path: "inventory", icon: Boxes },
      { id: "purchases", label: "Xaridlar", path: "purchases", icon: ClipboardList },
    ],
  },
  {
    id: "customers",
    title: "Mijozlar va jamoa",
    items: [
      { id: "crm", label: "Mijozlar", path: "crm", icon: Users },
      { id: "hr", label: "Xodimlar", path: "hr", icon: UserRoundCog },
    ],
  },
  {
    id: "finance",
    title: "Moliya",
    items: [
      { id: "finance", label: "Moliya", path: "finance", icon: WalletCards },
      { id: "profit", label: "Foyda", path: "profit", icon: TrendingUp },
      { id: "cash-flow", label: "Pul oqimi", path: "cash-flow", icon: CircleDollarSign },
      { id: "budget", label: "Byudjet", path: "budget", icon: Scale },
      { id: "debt", label: "Qarzlar", path: "debt", icon: BadgeDollarSign },
    ],
  },
  {
    id: "intelligence",
    title: "Tahlil",
    items: [
      { id: "ai", label: "Aqlli tahlil", path: "ai", icon: BrainCircuit },
      { id: "forecast", label: "Prognoz", path: "forecast", icon: LineChart },
      { id: "comparison", label: "Taqqoslash", path: "comparison", icon: PieChart },
      { id: "kpi", label: "KPI markazi", path: "kpi", icon: Sparkles },
    ],
  },
  {
    id: "management",
    title: "Boshqaruv",
    items: [
      { id: "builder", label: "Konstruktor", path: "builder", icon: Factory },
      { id: "templates", label: "Andozalar", path: "templates", icon: FileText },
      { id: "saved", label: "Saqlangan", path: "saved", icon: FileClock },
      { id: "favorites", label: "Saralangan", path: "favorites", icon: Star },
      { id: "recent", label: "Oxirgi", path: "recent", icon: CalendarClock },
    ],
  },
  {
    id: "automation",
    title: "Avtomatlashtirish",
    items: [
      { id: "scheduled", label: "Rejalashtirilgan", path: "scheduled", icon: CalendarClock },
      { id: "export", label: "Eksport", path: "export", icon: Download },
      { id: "sharing", label: "Ulashish", path: "sharing", icon: FileText },
    ],
  },
  {
    id: "control",
    title: "Nazorat",
    items: [
      { id: "permissions", label: "Ruxsatlar", path: "permissions", icon: ShieldCheck },
      { id: "audit", label: "Audit", path: "audit", icon: FileClock },
      { id: "settings", label: "Sozlamalar", path: "settings", icon: Sparkles },
    ],
  },
];

export const defaultFilters = {
  datePreset: "last30",
  startDate: "",
  endDate: "",
  branch: "all",
  warehouse: "all",
  employee: "all",
  cashier: "all",
  supplier: "all",
  customer: "all",
  product: "all",
  category: "all",
  brand: "all",
  department: "all",
  paymentMethod: "all",
  status: "all",
  currency: "UZS",
  region: "all",
  businessType: "retail",
  risk: "all",
  priority: "all",
};

export const filterOptions = Object.fromEntries(
  Object.keys(defaultFilters).map((key) => [key, key === "currency" ? ["UZS"] : ["all"]]),
);

const zeroMetric = (id, title, unit, icon, report) => ({
  id,
  title,
  value: 0,
  previous: 0,
  unit,
  goal: 0,
  trend: "flat",
  percent: 0,
  source: "Real data",
  status: "empty",
  forecast: 0,
  icon,
  report,
  formula: "",
  ai: "",
});

export const metricCatalog = [
  zeroMetric("revenue", "Daromad", "UZS", CircleDollarSign, "sales"),
  zeroMetric("profit", "Foyda", "UZS", TrendingUp, "profit"),
  zeroMetric("inventory", "Ombor qiymati", "UZS", Boxes, "inventory"),
  zeroMetric("customers", "Mijozlar", "count", Users, "crm"),
  zeroMetric("employees", "Xodimlar", "count", UserRoundCog, "hr"),
  zeroMetric("debt", "Qarzlar", "UZS", BadgeDollarSign, "debt"),
];

const emptyModuleReport = (title) => ({
  eyebrow: "Real data",
  title,
  description: "Hali ma'lumot kiritilmagan.",
  source: "",
  kpis: [],
  charts: [],
  tableTitle: title,
});

export const moduleReports = {
  sales: emptyModuleReport("Savdo hisoboti"),
  inventory: emptyModuleReport("Ombor hisoboti"),
  purchases: emptyModuleReport("Xaridlar hisoboti"),
  crm: emptyModuleReport("Mijozlar hisoboti"),
  hr: emptyModuleReport("HR hisoboti"),
  finance: emptyModuleReport("Moliya hisoboti"),
  profit: emptyModuleReport("Foyda hisoboti"),
  "cash-flow": emptyModuleReport("Pul oqimi"),
  budget: emptyModuleReport("Byudjet hisoboti"),
  debt: emptyModuleReport("Qarzlar hisoboti"),
};

export const chartSeries = [
  { label: "Start", revenue: 0, profit: 0, expenses: 0, customers: 0, inventory: 0 },
  { label: "Hozir", revenue: 0, profit: 0, expenses: 0, customers: 0, inventory: 0 },
];

export const tableRows = [];
export const aiInsights = [];
export const notifications = [];
export const reportTemplates = [];
export const defaultScheduledReports = [];

export const defaultBuilder = {
  name: "",
  report: "sales",
  metrics: [],
  dimensions: [],
  filters: defaultFilters,
  chart: "table",
  schedule: "",
};

export const reportTitles = {
  hub: "Hisobotlar Hub",
  dashboard: "Hisobotlar",
  health: "Biznes salomatligi",
  executive: "Rahbar xulosasi",
  sales: "Savdo hisoboti",
  inventory: "Ombor hisoboti",
  purchases: "Xaridlar hisoboti",
  crm: "Mijozlar hisoboti",
  hr: "HR hisoboti",
  finance: "Moliya hisoboti",
  profit: "Foyda hisoboti",
  "cash-flow": "Pul oqimi",
  budget: "Byudjet",
  debt: "Qarzlar",
  ai: "Aqlli tahlil",
  forecast: "Prognoz",
  comparison: "Taqqoslash",
  kpi: "KPI markazi",
  builder: "Konstruktor",
  templates: "Andozalar",
  saved: "Saqlangan",
  favorites: "Saralangan",
  recent: "Oxirgi",
  scheduled: "Rejalashtirilgan",
  export: "Eksport",
  sharing: "Ulashish",
  permissions: "Ruxsatlar",
  audit: "Audit",
  settings: "Sozlamalar",
};

export const reportsRouteConfig = reportsNavigationGroups.flatMap((group) =>
  group.items.map((item) => ({
    ...item,
    groupId: group.id,
    groupTitle: group.title,
    view: item.id,
  })),
);

export const financeReportConfigs = {
  finance: { metrics: ["revenue", "profit", "debt"], rows: [] },
  profit: { metrics: ["profit"], rows: [] },
  "cash-flow": { metrics: ["revenue"], rows: [] },
  budget: { metrics: [], rows: [] },
  debt: { metrics: ["debt"], rows: [] },
};

export const filterLabels = Object.fromEntries(
  Object.keys(defaultFilters).map((key) => [key, key]),
);

export const valueLabels = {
  all: "Barchasi",
  UZS: "UZS",
};

export const tableColumnSchemas = {
  default: [
    { key: "name", label: "Nomi" },
    { key: "value", label: "Qiymat" },
    { key: "status", label: "Status" },
  ],
};
