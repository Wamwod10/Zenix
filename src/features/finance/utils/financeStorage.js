export const financeStorageKeys = {
  state: "zenix.finance.state.v3",
};

export const safeStorageRead = (key, fallback) => {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const safeStorageWrite = (key, value) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Browser storage can be unavailable in private mode.
  }
};
