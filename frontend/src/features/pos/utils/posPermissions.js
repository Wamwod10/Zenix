import { defaultPOSRole, posRolePermissions } from "../data/posPermissions";

export const getRolePermissions = (role = defaultPOSRole) =>
  posRolePermissions[role] || posRolePermissions.cashier;

export const hasPOSPermission = (permission, role = defaultPOSRole) =>
  getRolePermissions(role).includes(permission);

export const needsManagerApproval = ({
  action,
  discountPercent = 0,
  settings,
} = {}) => {
  if (action === "void" && settings?.requireManagerForVoid) {
    return true;
  }

  if (action === "shift-close" && settings?.requireManagerForShiftClose) {
    return true;
  }

  if (action === "discount") {
    return Number(discountPercent) > Number(settings?.requireManagerForDiscountPercent || 15);
  }

  return false;
};
