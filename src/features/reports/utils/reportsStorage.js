const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable in private mode; the UI still works in memory.
  }
};

export const reportsStorage = {
  read: readJson,
  write: writeJson,
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
    role: "zenix.reports.role",
  },
};
