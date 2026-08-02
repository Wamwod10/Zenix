// Bildirishnomalar moduli lokal holati (backend ulanguncha oflayn-first
// saqlash) — purchasesStorage.js bilan bir xil naqsh, alohida kalit.

const STORAGE_KEY = "zenix:notifications:v2";

const isBrowser = () => typeof window !== "undefined" && !!window.localStorage;

export const loadNotificationsState = () => {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveNotificationsState = (state) => {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // saqlash imkoni bo'lmasa jim o'tamiz (private mode va h.k.)
  }
};

export const clearNotificationsState = () => {
  if (!isBrowser()) return;

  window.localStorage.removeItem(STORAGE_KEY);
};
