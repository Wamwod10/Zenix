const STORAGE_VERSION = 4;

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.__reportsVersion) {
      return parsed.__reportsVersion === STORAGE_VERSION ? parsed.value : fallback;
    }
    return parsed;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify({ __reportsVersion: STORAGE_VERSION, value }));
    return { ok: true };
  } catch {
    // Storage can be unavailable in private mode; the UI still works in memory.
    return { ok: false, error: "storage_unavailable" };
  }
};

export const reportsStorage = {
  read: readJson,
  write: writeJson,
  version: STORAGE_VERSION,
  keys: {
    filters: "zenix.reports.filters",
    customFilters: "zenix.reports.customFilters",
    savedReports: "zenix.reports.saved",
    favorites: "zenix.reports.favorites",
    recent: "zenix.reports.recent",
    schedules: "zenix.reports.scheduled",
    audit: "zenix.reports.audit",
    layout: "zenix.reports.layout",
    builder: "zenix.reports.builder",
    notifications: "zenix.reports.notifications",
    shareHistory: "zenix.reports.shareHistory",
    exportHistory: "zenix.reports.exportHistory",
    role: "zenix.reports.role",
  },
};
