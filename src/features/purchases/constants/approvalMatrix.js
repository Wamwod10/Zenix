// PDF 5-bo'lim: Approval Workflow — summaga qarab ko'p bosqichli tasdiq.
// Har bosqich ketma-ket; bir bosqich rad etsa — to'xtaydi va xaridorga qaytadi.

export const APPROVAL_ROLES = {
  manager: "manager",
  finance: "finance",
  owner: "owner",
};

export const APPROVAL_ROLE_LABELS = {
  [APPROVAL_ROLES.manager]: "Menejer",
  [APPROVAL_ROLES.finance]: "Moliya",
  [APPROVAL_ROLES.owner]: "Ega",
};

// Summa oralig'i (UZS) → tasdiqlovchi bosqichlar
export const APPROVAL_MATRIX = [
  { maxTotal: 1_000_000, steps: [] }, // avtomatik, tasdiq shart emas
  { maxTotal: 10_000_000, steps: [APPROVAL_ROLES.manager] },
  {
    maxTotal: 50_000_000,
    steps: [APPROVAL_ROLES.manager, APPROVAL_ROLES.finance],
  },
  {
    maxTotal: Infinity,
    steps: [APPROVAL_ROLES.manager, APPROVAL_ROLES.finance, APPROVAL_ROLES.owner],
  },
];

export const resolveApprovalSteps = (total = 0) => {
  const tier = APPROVAL_MATRIX.find((entry) => total <= entry.maxTotal);

  return (tier?.steps || []).map((role) => ({
    role,
    label: APPROVAL_ROLE_LABELS[role],
    status: "pending",
    actor: null,
    actedAt: null,
    reason: "",
  }));
};

export const APPROVAL_STEP_STATUSES = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
};
