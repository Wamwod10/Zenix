const canUseStorage = () => typeof window !== "undefined" && window.localStorage;

export const warehouseStorageKeys = {
  state: "zenix.warehouse.state",
  settings: "zenix.warehouse.settings",
  filters: "zenix.warehouse.filters",
  role: "zenix.warehouse.role",
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
    // The WMS keeps working in memory when browser storage is unavailable.
  }
};
