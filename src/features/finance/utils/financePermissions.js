import {
  approvalMatrix,
  financeRoles,
  financePermissionRules,
} from "../data/financePermissions";
import { FINANCE_ACTION, FINANCE_ROLE, TRANSACTION_STATUS } from "../constants/financeConstants";

const roleLabels = Object.fromEntries(financeRoles.map((role) => [role.id, role.label]));

export const getApprovalRequirement = (amount = 0) =>
  approvalMatrix.find(
    (rule) => Number(amount || 0) > rule.min && Number(amount || 0) <= rule.max,
  ) || approvalMatrix[0];

export const canFinance = (role = FINANCE_ROLE.VIEWER, action = FINANCE_ACTION.VIEW) =>
  Boolean(financePermissionRules[role]?.includes(action));

export const getFinanceActionState = ({
  role = FINANCE_ROLE.VIEWER,
  action = FINANCE_ACTION.VIEW,
  transaction,
  currentUser = "admin",
} = {}) => {
  if (!canFinance(role, action)) {
    return {
      state: "hidden",
      allowed: false,
      reason: "Bu rol uchun ruxsat berilmagan.",
    };
  }

  if (action === FINANCE_ACTION.APPROVE && transaction?.createdBy === currentUser) {
    return {
      state: "disabled",
      allowed: false,
      reason: "Maker-checker: yaratgan foydalanuvchi o'zi tasdiqlay olmaydi.",
    };
  }

  if (action === FINANCE_ACTION.APPROVE && transaction) {
    const required = getApprovalRequirement(transaction.amount);

    if (required.role !== role && role !== FINANCE_ROLE.OWNER) {
      return {
        state: "approval required",
        allowed: false,
        reason: `${required.label} uchun ${roleLabels[required.role] || "ruxsatli rol"} tasdig'i kerak.`,
      };
    }
  }

  if (action === FINANCE_ACTION.POST && transaction?.status !== TRANSACTION_STATUS.APPROVED) {
    return {
      state: "disabled",
      allowed: false,
      reason: "Faqat tasdiqlangan yozuv o'tkaziladi.",
    };
  }

  if (action === FINANCE_ACTION.REVERSE && transaction?.status !== TRANSACTION_STATUS.POSTED) {
    return {
      state: "disabled",
      allowed: false,
      reason: "Faqat o'tkazilgan yozuv storno qilinadi.",
    };
  }

  return {
    state: "allowed",
    allowed: true,
    reason: "",
  };
};
