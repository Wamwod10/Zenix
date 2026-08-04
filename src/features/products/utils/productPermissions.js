export const productRoles = {
  owner: {
    label: "Egasi",
    permissions: [
      "create",
      "edit",
      "editSku",
      "editBarcode",
      "createSupplierRelation",
      "editSupplierTerms",
      "viewPurchasePrice",
      "editPurchasePrice",
      "setPreferredSupplier",
      "viewSellingPrice",
      "editSellingPrice",
      "viewCost",
      "overrideCost",
      "editStandardCost",
      "overridePurchasePrice",
      "overrideDuplicateWarning",
      "approvePrice",
      "bulk",
      "import",
      "settings",
    ],
  },
  manager: {
    label: "Menejer",
    permissions: [
      "create",
      "edit",
      "createSupplierRelation",
      "editSupplierTerms",
      "viewPurchasePrice",
      "editPurchasePrice",
      "setPreferredSupplier",
      "viewSellingPrice",
      "viewCost",
      "overridePurchasePrice",
      "approvePrice",
      "bulk",
      "import",
    ],
  },
  catalog: {
    label: "Katalog mutaxassisi",
    permissions: ["create", "edit", "editSku", "editBarcode", "viewSellingPrice", "editSellingPrice", "bulk"],
  },
  viewer: {
    label: "Kuzatuvchi",
    permissions: [],
  },
};

export const canProduct = (role = "manager", permission) =>
  Boolean(productRoles[role]?.permissions.includes(permission));
