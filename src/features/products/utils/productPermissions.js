export const productRoles = {
  owner: {
    label: "Egasi",
    permissions: ["viewCost", "edit", "approvePrice", "bulk", "import", "settings"],
  },
  manager: {
    label: "Menejer",
    permissions: ["viewCost", "edit", "bulk", "import"],
  },
  catalog: {
    label: "Katalog mutaxassisi",
    permissions: ["edit", "bulk"],
  },
  viewer: {
    label: "Kuzatuvchi",
    permissions: [],
  },
};

export const canProduct = (role = "manager", permission) =>
  Boolean(productRoles[role]?.permissions.includes(permission));
