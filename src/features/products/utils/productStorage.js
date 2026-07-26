const canUseStorage = () => typeof window !== "undefined" && window.localStorage;

export const productStorageKeys = {
  state: "zenix.products.state",
  filters: "zenix.products.filters",
  savedFilters: "zenix.products.savedFilters",
  role: "zenix.products.role",
  drafts: "zenix.products.drafts",
};

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
