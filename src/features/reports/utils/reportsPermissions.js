const rolePermissions = {
  owner: ["view", "export", "print", "share", "create", "edit", "delete", "schedule", "ai", "executive", "builder", "audit", "permissions"],
  CEO: ["view", "export", "print", "share", "create", "edit", "schedule", "ai", "executive", "builder", "audit"],
  branchManager: ["view", "export", "print", "share", "create", "edit", "schedule", "ai"],
  warehouseManager: ["view", "export", "print", "share", "ai"],
  financeManager: ["view", "export", "print", "share", "create", "edit", "schedule", "ai", "builder", "audit"],
  HRManager: ["view", "export", "print", "share", "create", "edit", "schedule", "ai"],
  cashier: ["view", "print"],
  employee: ["view"],
  viewer: ["view"],
};

export const canReport = (role, action) => rolePermissions[role]?.includes(action);

export const permissionMode = (role, action) => {
  if (canReport(role, action)) return "allowed";
  if (["delete", "permissions", "audit"].includes(action)) return "hidden";
  return "disabled";
};

export const permissionMatrix = Object.entries(rolePermissions).map(([role, permissions]) => ({
  role,
  view: permissions.includes("view"),
  export: permissions.includes("export"),
  print: permissions.includes("print"),
  share: permissions.includes("share"),
  create: permissions.includes("create"),
  edit: permissions.includes("edit"),
  delete: permissions.includes("delete"),
  schedule: permissions.includes("schedule"),
  aiAccess: permissions.includes("ai"),
  executiveAccess: permissions.includes("executive"),
  builderAccess: permissions.includes("builder"),
}));
