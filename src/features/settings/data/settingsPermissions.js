export const settingsRoles = [
  { id: "owner", name: "Owner", type: "standard", users: 1, description: "Platforma egasi, billing va advanced system settings." },
  { id: "ceo", name: "CEO", type: "standard", users: 2, description: "Kompaniya bo'yicha barcha operatsion sozlamalar." },
  { id: "admin", name: "Admin", type: "standard", users: 4, description: "Users, branches, documents va integrations boshqaruvi." },
  { id: "branchManager", name: "Branch Manager", type: "standard", users: 7, description: "O'z filialidagi users, warehouse va notifications." },
  { id: "warehouseManager", name: "Warehouse Manager", type: "standard", users: 5, description: "Warehouse policy, transfers va stock restrictions." },
  { id: "financeManager", name: "Finance Manager", type: "standard", users: 3, description: "Currency, taxes, payments va fiscal settings." },
  { id: "hrManager", name: "HR Manager", type: "standard", users: 2, description: "Users profile fields va role request flows." },
  { id: "cashier", name: "Cashier", type: "standard", users: 16, description: "POS, receipt printer va limited payment settings." },
  { id: "viewer", name: "Viewer", type: "standard", users: 9, description: "Faqat ko'rish, export disabled." },
];

export const permissionModules = [
  "dashboard",
  "pos",
  "products",
  "sales",
  "purchases",
  "warehouse",
  "crm",
  "finance",
  "hr",
  "reports",
  "settings",
  "documents",
  "integrations",
  "api",
  "ai",
  "billing",
];

export const permissionActions = [
  "view",
  "create",
  "edit",
  "delete",
  "restore",
  "archive",
  "print",
  "share",
  "duplicate",
  "import",
  "export",
  "approve",
  "reject",
  "viewCost",
  "viewProfit",
  "priceEdit",
  "discount",
  "api",
  "ai",
  "audit",
  "settings",
  "bulkEdit",
  "permanentDelete",
  "field",
  "branch",
  "warehouse",
  "device",
  "ip",
];

export const defaultPermissionMatrix = permissionModules.reduce((matrix, moduleId) => {
  matrix[moduleId] = permissionActions.reduce((actions, action) => {
    actions[action] = moduleId === "settings" && ["delete", "approve"].includes(action) ? "approval" : "allowed";
    return actions;
  }, {});
  return matrix;
}, {});
