export const productCategories = [];
export const productBrands = [];
export const productUnits = [
  { id: "unit-piece", name: "Dona", code: "dona", base: "dona", ratio: 1 },
  { id: "unit-kg", name: "Kilogram", code: "kg", base: "kg", ratio: 1 },
  { id: "unit-liter", name: "Litr", code: "l", base: "l", ratio: 1 },
];

export const initialProductsState = {
  categories: productCategories,
  brands: productBrands,
  units: productUnits,
  products: [],
  priceLists: [],
  notifications: [],
  auditLog: [],
  settings: {
    skuPrefix: "ZNX",
    approvalRequiredAboveMarginDrop: 0,
    autoBarcode: true,
    defaultTaxRate: 0,
    showCostByDefault: false,
    integrations: { pos: false, warehouse: false, crm: false, finance: false },
  },
};
