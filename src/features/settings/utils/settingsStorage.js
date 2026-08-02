const canUseStorage = () => typeof window !== "undefined" && window.localStorage;

export const settingsStorageKeys = {
  state: "zenix.settings.state.v2",
  favorites: "zenix.settings.favorites",
  recent: "zenix.settings.recent",
  history: "zenix.settings.history",
  role: "zenix.settings.role",
};

export const safeSettingsRead = (key, fallback) => {
  if (!canUseStorage()) return fallback;

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const safeSettingsWrite = (key, value) => {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Settings keeps working in memory when browser storage is unavailable.
  }
};
