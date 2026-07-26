export const warehouseRoles = [
  { id: "owner", label: "Owner" },
  { id: "admin", label: "Admin" },
  { id: "manager", label: "Manager" },
  { id: "employee", label: "Warehouse employee" },
  { id: "cashier", label: "Cashier / seller" },
];

export const warehousePermissionMatrix = {
  owner: {
    view: "enabled",
    receipt: "enabled",
    issue: "enabled",
    transfer: "enabled",
    counting: "enabled",
    adjustment: "enabled",
    writeOff: "enabled",
    value: "enabled",
    settings: "enabled",
    importExport: "enabled",
    audit: "enabled",
  },
  admin: {
    view: "enabled",
    receipt: "enabled",
    issue: "enabled",
    transfer: "enabled",
    counting: "enabled",
    adjustment: "enabled",
    writeOff: "enabled",
    value: "enabled",
    settings: "enabled",
    importExport: "enabled",
    audit: "enabled",
  },
  manager: {
    view: "enabled",
    receipt: "enabled",
    issue: "enabled",
    transfer: "enabled",
    counting: "enabled",
    adjustment: "enabled",
    writeOff: "enabled",
    value: "enabled",
    settings: "disabled",
    importExport: "enabled",
    audit: "disabled",
  },
  employee: {
    view: "enabled",
    receipt: "enabled",
    issue: "enabled",
    transfer: "approval",
    counting: "enabled",
    adjustment: "approval",
    writeOff: "approval",
    value: "hidden",
    settings: "hidden",
    importExport: "disabled",
    audit: "hidden",
  },
  cashier: {
    view: "enabled",
    receipt: "hidden",
    issue: "hidden",
    transfer: "hidden",
    counting: "hidden",
    adjustment: "hidden",
    writeOff: "hidden",
    value: "hidden",
    settings: "hidden",
    importExport: "hidden",
    audit: "hidden",
  },
};

export const getPermissionState = (role, permission) =>
  warehousePermissionMatrix[role]?.[permission] || "hidden";

export const canWarehouse = (role, permission) =>
  getPermissionState(role, permission) === "enabled";

export const needsWarehouseApproval = (role, permission) =>
  getPermissionState(role, permission) === "approval";
