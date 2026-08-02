// AI Workspace — foydalanuvchi holati (pin/complete/dismiss/tarix) uchun
// lokal saqlash qatlami. Xuddi suppliersApi.js/usePurchasesStore.js kabi
// singleton state + pub/sub + localStorage naqshi (backend ulanguncha).
// Insightning o'zi HAR DOIM qayta hisoblanadi (aiEngine.js) — bu yerda faqat
// foydalanuvchi amali (pin/complete/dismiss) va shu amallar tarixi saqlanadi,
// insightId barqaror (deterministik) bo'lgani uchun qayta hisoblangandan
// keyin ham to'g'ri moslanadi.

import { useEffect, useState } from "react";

import { createEntityId } from "../utils/purchaseIds";

const STORAGE_KEY = "zenix:ai:purchases:v1";

const isBrowser = () => typeof window !== "undefined" && !!window.localStorage;

const nowIso = () => new Date().toISOString();

const loadState = () => {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveState = (state) => {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // saqlash imkoni bo'lmasa jim o'tamiz (private mode va h.k.)
  }
};

const createInitialState = () => ({ entries: {}, history: [] });

let storeState = loadState() || createInitialState();
const listeners = new Set();

const emit = () => {
  saveState(storeState);
  listeners.forEach((listener) => listener(storeState));
};

const setStoreState = (updater) => {
  storeState = updater(storeState);
  emit();
};

const getEntry = (state, id) =>
  state.entries[id] || { pinned: false, completed: false, dismissed: false };

const pushHistory = (state, insightId, title, action) => ({
  ...state,
  history: [
    { id: createEntityId("ai-history"), insightId, title, action, at: nowIso() },
    ...state.history,
  ].slice(0, 200),
});

export const aiStorageActions = {
  pin: (insightId, title) => {
    setStoreState((current) => {
      const entry = getEntry(current, insightId);
      const next = { ...current, entries: { ...current.entries, [insightId]: { ...entry, pinned: !entry.pinned } } };

      return pushHistory(next, insightId, title, entry.pinned ? "unpinned" : "pinned");
    });
  },
  complete: (insightId, title) => {
    setStoreState((current) => {
      const entry = getEntry(current, insightId);
      const next = {
        ...current,
        entries: { ...current.entries, [insightId]: { ...entry, completed: !entry.completed } },
      };

      return pushHistory(next, insightId, title, entry.completed ? "reopened" : "completed");
    });
  },
  dismiss: (insightId, title) => {
    setStoreState((current) => {
      const entry = getEntry(current, insightId);
      const next = {
        ...current,
        entries: { ...current.entries, [insightId]: { ...entry, dismissed: true } },
      };

      return pushHistory(next, insightId, title, "dismissed");
    });
  },
  restore: (insightId, title) => {
    setStoreState((current) => {
      const entry = getEntry(current, insightId);
      const next = {
        ...current,
        entries: { ...current.entries, [insightId]: { ...entry, dismissed: false } },
      };

      return pushHistory(next, insightId, title, "restored");
    });
  },
};

export const useAIUserState = () => {
  const [state, setState] = useState(storeState);

  useEffect(() => {
    const listener = (next) => setState(next);

    listeners.add(listener);

    return () => listeners.delete(listener);
  }, []);

  return { entries: state.entries, history: state.history, actions: aiStorageActions };
};

export const getAIStoreSnapshot = () => storeState;
