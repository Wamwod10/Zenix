import { normalizeProductCatalogRecord } from "../../../core/businessOS/erpProductModel";

const canUseStorage = () => typeof window !== "undefined" && window.localStorage;

export const productStorageKeys = {
  schemaVersion: "zenix.products.schemaVersion.v2",
  state: "zenix.products.state.v2",
  filters: "zenix.products.filters.v2",
  savedFilters: "zenix.products.savedFilters.v2",
  role: "zenix.products.role.v2",
  viewMode: "zenix.products.viewMode.v2",
  pageSize: "zenix.products.pageSize.v2",
  drafts: "zenix.products.drafts.v2",
};

export const productStorageSchemaVersion = 4;

export const withProductSchema = (state) => ({
  ...state,
  schemaVersion: productStorageSchemaVersion,
  settings: {
    ...(state.settings || {}),
  },
  products: (state.products || []).map(normalizeProductCatalogRecord),
  categories: state.categories || [],
  brands: state.brands || [],
  units: state.units || [],
  notifications: state.notifications || [],
  auditLog: state.auditLog || [],
});

export const safeStorageRead = (key, fallback) => {
  if (!canUseStorage()) return fallback;

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const safeStorageWrite = (key, value) => {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Brauzer xotirasi ishlamasa ham modul vaqtincha xotirada ishlaydi.
  }
};
