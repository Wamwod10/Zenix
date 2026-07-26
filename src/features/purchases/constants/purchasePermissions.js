// PDF 84-bo'lim: Role Management (RBAC) — xaridlar moduli huquqlari.

export const PURCHASE_ROLES = {
  buyer: "buyer", // Xaridor — PO yaratish, o'z PO larini ko'rish
  manager: "manager", // Menejer — tasdiqlash, filial ko'rish, hisobot
  warehouse: "warehouse", // Omborchi — qabul qilish
  finance: "finance", // Moliyachi — invoys, to'lov, byudjet
  owner: "owner", // Ega/Admin — hammasiga to'liq huquq
};

export const PURCHASE_ROLE_LABELS = {
  [PURCHASE_ROLES.buyer]: "Xaridor",
  [PURCHASE_ROLES.manager]: "Menejer",
  [PURCHASE_ROLES.warehouse]: "Omborchi",
  [PURCHASE_ROLES.finance]: "Moliyachi",
  [PURCHASE_ROLES.owner]: "Ega",
};

const ROLE_PERMISSIONS = {
  [PURCHASE_ROLES.buyer]: [
    "po.view",
    "po.create",
    "po.edit",
    "po.submit",
    "po.cancel",
    "return.create",
  ],
  [PURCHASE_ROLES.manager]: [
    "po.view",
    "po.create",
    "po.edit",
    "po.submit",
    "po.cancel",
    "po.approve",
    "po.send",
    "po.close",
    "return.create",
    "return.approve",
    "reports.view",
  ],
  [PURCHASE_ROLES.warehouse]: ["po.view", "receiving.create"],
  [PURCHASE_ROLES.finance]: [
    "po.view",
    "po.approve",
    "invoice.create",
    "payment.create",
    "return.approve",
    "reports.view",
  ],
  [PURCHASE_ROLES.owner]: [
    "po.view",
    "po.create",
    "po.edit",
    "po.submit",
    "po.cancel",
    "po.approve",
    "po.send",
    "po.close",
    "receiving.create",
    "return.create",
    "return.approve",
    "invoice.create",
    "payment.create",
    "reports.view",
  ],
};

export const hasPurchasePermission = (role, permission) =>
  (ROLE_PERMISSIONS[role] || []).includes(permission);

// PDF 5: "o'z PO ni o'zi tasdiqlay olmaydi"
export const canApproveStep = ({ user, order, step }) => {
  if (!user || !step || step.status !== "pending") return false;
  if (order?.buyer?.id === user.id && user.role !== PURCHASE_ROLES.owner) {
    return false;
  }

  return (
    user.role === PURCHASE_ROLES.owner ||
    user.role === step.role ||
    hasPurchasePermission(user.role, "po.approve")
  );
};
