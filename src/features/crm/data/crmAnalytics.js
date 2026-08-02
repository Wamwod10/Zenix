export const CRM_DASHBOARD_PERIODS = [
  { id: "today", label: "Bugun" },
  { id: "week", label: "7 kun" },
  { id: "month", label: "30 kun" },
  { id: "quarter", label: "3 oy" },
  { id: "year", label: "Yil" },
];

const metric = (id, label, tone, valueType) => ({
  id,
  label,
  value: 0,
  previousValue: 0,
  change: 0,
  trend: "flat",
  tone,
  description: "Boshlang'ich holat",
  ...(valueType ? { valueType } : {}),
});

export const crmDashboardData = {
  generatedAt: new Date().toISOString(),
  defaultPeriod: "month",
  summary: {
    totalCustomers: metric("total-customers", "Jami mijozlar", "indigo"),
    newCustomers: metric("new-customers", "Yangi mijozlar", "blue"),
    activeCustomers: {
      ...metric("active-customers", "Faol mijozlar", "emerald"),
      secondaryValue: 0,
      secondaryLabel: "Faollik darajasi",
    },
    totalDebt: metric("total-debt", "Jami qarzdorlik", "rose", "currency"),
    vipCustomers: metric("vip-customers", "VIP mijozlar", "amber"),
    birthdaysToday: metric("birthdays-today", "Bugungi tug'ilgan kunlar", "violet"),
  },
  growth: [
    { month: "Start", customers: 0, newCustomers: 0, activeCustomers: 0 },
    { month: "Hozir", customers: 0, newCustomers: 0, activeCustomers: 0 },
  ],
  customerHealth: {
    label: "CRM salomatligi",
    score: 0,
    description: "Real mijozlar qo'shilgandan keyin hisoblanadi.",
    metrics: [
      { id: "data", label: "Ma'lumot sifati", value: 0 },
      { id: "activity", label: "Faollik", value: 0 },
      { id: "loyalty", label: "Sodiqlik", value: 0 },
    ],
  },
  topCustomers: [],
  debtors: [],
  churnRisks: [],
  birthdays: [],
  recentActivities: [],
  aiInsights: [],
  pendingActions: [],
};

export const getCrmDashboardSummary = () => crmDashboardData.summary;

export const getCrmDashboardMetricList = () =>
  Object.values(crmDashboardData.summary);

export default crmDashboardData;
