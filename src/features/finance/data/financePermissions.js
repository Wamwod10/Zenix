import { FINANCE_ACTION, FINANCE_ROLE } from "../constants/financeConstants";

export const financeRoles = [
  { id: FINANCE_ROLE.OWNER, label: "Egasi" },
  { id: FINANCE_ROLE.CHIEF_ACCOUNTANT, label: "Bosh buxgalter" },
  { id: FINANCE_ROLE.ACCOUNTANT, label: "Buxgalter" },
  { id: FINANCE_ROLE.CASHIER, label: "Kassir" },
  { id: FINANCE_ROLE.MANAGER, label: "Menejer" },
  { id: FINANCE_ROLE.AUDITOR, label: "Auditor" },
  { id: FINANCE_ROLE.VIEWER, label: "Kuzatuvchi" },
];

export const approvalMatrix = [
  {
    id: "accountant",
    min: 0,
    max: 1000000,
    role: FINANCE_ROLE.ACCOUNTANT,
    label: "1 mln gacha",
  },
  {
    id: "chief",
    min: 1000000,
    max: 10000000,
    role: FINANCE_ROLE.CHIEF_ACCOUNTANT,
    label: "1-10 mln",
  },
  {
    id: "owner",
    min: 10000000,
    max: Number.POSITIVE_INFINITY,
    role: FINANCE_ROLE.OWNER,
    label: "10 mln dan yuqori",
  },
];

export const financePermissionRules = {
  [FINANCE_ROLE.OWNER]: Object.values(FINANCE_ACTION),
  [FINANCE_ROLE.CHIEF_ACCOUNTANT]: [
    FINANCE_ACTION.VIEW,
    FINANCE_ACTION.CREATE,
    FINANCE_ACTION.SUBMIT,
    FINANCE_ACTION.APPROVE,
    FINANCE_ACTION.REJECT,
    FINANCE_ACTION.POST,
    FINANCE_ACTION.REVERSE,
    FINANCE_ACTION.CLOSE,
    FINANCE_ACTION.REOPEN,
    FINANCE_ACTION.SETTINGS,
    FINANCE_ACTION.CURRENCY,
    FINANCE_ACTION.TAX,
    FINANCE_ACTION.COST,
    FINANCE_ACTION.AUDIT,
  ],
  [FINANCE_ROLE.ACCOUNTANT]: [
    FINANCE_ACTION.VIEW,
    FINANCE_ACTION.CREATE,
    FINANCE_ACTION.SUBMIT,
    FINANCE_ACTION.POST,
    FINANCE_ACTION.CURRENCY,
    FINANCE_ACTION.TAX,
  ],
  [FINANCE_ROLE.CASHIER]: [
    FINANCE_ACTION.VIEW,
    FINANCE_ACTION.CREATE,
    FINANCE_ACTION.SUBMIT,
  ],
  [FINANCE_ROLE.MANAGER]: [
    FINANCE_ACTION.VIEW,
    FINANCE_ACTION.CREATE,
    FINANCE_ACTION.SUBMIT,
    FINANCE_ACTION.APPROVE,
  ],
  [FINANCE_ROLE.AUDITOR]: [
    FINANCE_ACTION.VIEW,
    FINANCE_ACTION.AUDIT,
  ],
  [FINANCE_ROLE.VIEWER]: [FINANCE_ACTION.VIEW],
};
