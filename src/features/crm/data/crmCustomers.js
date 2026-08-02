export const crmCustomerGroups = [
  { id: "vip", label: "VIP mijozlar", tone: "gold" },
  { id: "loyal", label: "Sodiq mijozlar", tone: "plum" },
  { id: "wholesale", label: "Ulgurji mijozlar", tone: "forest" },
  { id: "new", label: "Yangi mijozlar", tone: "cobalt" },
  { id: "risk", label: "Xavf ostida", tone: "rust" },
  { id: "corporate", label: "Korporativ mijozlar", tone: "slate" },
];

export const crmCustomerStatuses = [
  { id: "active", label: "Faol" },
  { id: "inactive", label: "Nofaol" },
  { id: "prospect", label: "Potensial" },
  { id: "blocked", label: "Bloklangan" },
  { id: "archived", label: "Arxivlangan" },
];

export const crmCustomerTags = [];
export const crmManagers = [];
export const crmCustomers = [];

export const crmCustomerDataSummary = {
  total: 0,
  active: 0,
  inactive: 0,
  prospects: 0,
  debtors: 0,
  totalDebt: 0,
};

export const customers = crmCustomers;
export const customerGroups = crmCustomerGroups;
export const customerStatuses = crmCustomerStatuses;
export const customerTags = crmCustomerTags;
export const customerManagers = crmManagers;

export default crmCustomers;
