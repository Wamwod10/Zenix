import { hrPermissionMatrix } from "../data/hrPermissions";

export const canHR = (role, permission) => {
  const grants = hrPermissionMatrix[role] || [];
  return grants.includes("*") || grants.includes(permission);
};

export const getHRActionState = ({ role, permission, approvalRequired = false }) => {
  const allowed = canHR(role, permission);

  if (!allowed && approvalRequired) {
    return { visible: true, enabled: false, approvalRequired: true, reason: "Approval required" };
  }

  if (!allowed) {
    return { visible: false, enabled: false, approvalRequired: false, reason: "Ruxsat yo'q" };
  }

  return { visible: true, enabled: true, approvalRequired, reason: "" };
};
