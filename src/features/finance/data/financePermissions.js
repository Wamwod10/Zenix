export const financeRoles = [
  { id: "owner", label: "Owner" },
  { id: "chiefAccountant", label: "Bosh buxgalter" },
  { id: "accountant", label: "Buxgalter" },
  { id: "manager", label: "Menejer" },
  { id: "viewer", label: "Kuzatuvchi" },
];

export const approvalMatrix = [
  {
    id: "accountant",
    min: 0,
    max: 1000000,
    role: "accountant",
    label: "1 mln gacha",
  },
  {
    id: "chief",
    min: 1000000,
    max: 10000000,
    role: "chiefAccountant",
    label: "1-10 mln",
  },
  {
    id: "owner",
    min: 10000000,
    max: Number.POSITIVE_INFINITY,
    role: "owner",
    label: "10 mln dan yuqori",
  },
];

export const financePermissionRules = {
  owner: ["view", "create", "submit", "approve", "reject", "post", "reverse", "close", "reopen", "settings", "currency", "tax", "cost"],
  chiefAccountant: ["view", "create", "submit", "approve", "reject", "post", "reverse", "close", "reopen", "settings", "currency", "tax", "cost"],
  accountant: ["view", "create", "submit", "approve", "reject", "post", "close", "currency", "tax"],
  manager: ["view", "create", "submit", "approve", "reject"],
  viewer: ["view"],
};
