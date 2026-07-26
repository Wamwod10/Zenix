import {
  approvalMatrix,
  financePermissionRules,
} from "../data/financePermissions";

export const getApprovalRequirement = (amount = 0) =>
  approvalMatrix.find(
    (rule) => Number(amount || 0) > rule.min && Number(amount || 0) <= rule.max,
  ) || approvalMatrix[0];

export const canFinance = (role = "viewer", action = "view") =>
  Boolean(financePermissionRules[role]?.includes(action));

export const getFinanceActionState = ({
  role = "viewer",
  action = "view",
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

  if (action === "approve" && transaction?.createdBy === currentUser) {
    return {
      state: "disabled",
      allowed: false,
      reason: "Maker-checker: yaratgan foydalanuvchi o'zi tasdiqlay olmaydi.",
    };
  }

  if (action === "approve" && transaction) {
    const required = getApprovalRequirement(transaction.amount);

    if (required.role !== role && role !== "owner") {
      return {
        state: "approval required",
        allowed: false,
        reason: `${required.label} uchun ${required.role} tasdig'i kerak.`,
      };
    }
  }

  if (action === "post" && transaction?.status !== "Approved") {
    return {
      state: "disabled",
      allowed: false,
      reason: "Faqat Approved holatidagi yozuv post qilinadi.",
    };
  }

  if (action === "reverse" && transaction?.status !== "Posted") {
    return {
      state: "disabled",
      allowed: false,
      reason: "Faqat Posted yozuv storno qilinadi.",
    };
  }

  return {
    state: "allowed",
    allowed: true,
    reason: "",
  };
};
