// Enterprise Notifications & Alerts — markaziy holat qatlami. Purchases va
// Suppliers modullaridagi boshqa store'lar (usePurchasesStore.js,
// suppliersApi.js) bilan BIR XIL naqsh: modul darajasidagi singleton +
// pub/sub listeners + localStorage persist (backend ulanguncha oflayn-first).
// Bu fayl LEAF modul — usePurchasesStore/suppliersApi'ni IMPORT QILMAYDI
// (aylanma bog'liqlik bo'lmasin uchun), ular esa buni chaqiradi.

import { useCallback, useEffect, useState } from "react";

import { createEntityId } from "../utils/purchaseIds";
import {
  DEFAULT_PRIORITY_BY_TYPE,
  NOTIFICATION_PRIORITIES,
} from "./notificationPriority";
import {
  NOTIFICATION_TYPE_REQUIRED_REFS,
  isKnownNotificationType,
} from "./notificationTypes";
import {
  ACTIVE_NOTIFICATION_STATUSES,
  NOTIFICATION_STATUSES,
  canTransitionNotificationStatus,
} from "./notificationStatus";
import {
  loadNotificationsState,
  saveNotificationsState,
} from "./notificationsStorage";
import { SEED_NOTIFICATIONS } from "./notificationsSeed";

const nowIso = () => new Date().toISOString();

const createInitialState = () => ({ notifications: SEED_NOTIFICATIONS });

const loadedState = loadNotificationsState();
let storeState = loadedState?.notifications
  ? loadedState
  : createInitialState();
const listeners = new Set();

const emit = () => {
  saveNotificationsState(storeState);
  listeners.forEach((listener) => listener(storeState));
};

const setStoreState = (updater) => {
  storeState = updater(storeState);
  emit();
};

const isActiveStatus = (status) => ACTIVE_NOTIFICATION_STATUSES.includes(status);

// VALIDATION (audit talabi): noto'g'ri/bo'sh referens, noma'lum tur yoki
// takrorlangan (dedupeKey mos, hali faol) bildirishnoma yaratilmaydi.
const isValidPayload = (payload) => {
  if (!payload || !isKnownNotificationType(payload.type)) return false;
  if (!payload.title?.trim()) return false;

  const requiredRefs = NOTIFICATION_TYPE_REQUIRED_REFS[payload.type] || [];
  const refs = payload.refs || {};

  return requiredRefs.every((key) => !!refs[key]);
};

// Chaqiruvchi (triggers/sync) tayyor "voqea" obyektini yuboradi — bu yerda
// faqat validatsiya, standart qiymatlar va DUPLIKATSIYA oldini olish bor.
// Muvaffaqiyatsiz bo'lsa `null` qaytadi (jim rad — boshqa store'lar
// mutatsiyasini to'xtatib qo'ymasligi uchun).
export const pushNotification = (payload) => {
  if (!isValidPayload(payload)) {
    if (import.meta.env?.DEV) {
      console.warn("[notifications] rad etildi — noto'g'ri payload", payload);
    }
    return null;
  }

  let created = null;

  setStoreState((current) => {
    // Prevent duplicate notifications: bir xil dedupeKey'ga ega FAOL
    // (unread/read) yozuv mavjud bo'lsa — yangisi yaratilmaydi, mavjudi
    // qaytariladi (idempotent voqea).
    if (payload.dedupeKey) {
      const existing = current.notifications.find(
        (entry) =>
          entry.dedupeKey === payload.dedupeKey && isActiveStatus(entry.status),
      );

      if (existing) {
        created = existing;
        return current;
      }
    }

    created = {
      id: createEntityId("ntf"),
      type: payload.type,
      priority:
        payload.priority || DEFAULT_PRIORITY_BY_TYPE[payload.type] || NOTIFICATION_PRIORITIES.informational,
      status: NOTIFICATION_STATUSES.unread,
      title: payload.title.trim(),
      message: (payload.message || "").trim(),
      // Broken links oldini olish: link faqat bo'sh bo'lmagan satr bo'lsa
      // saqlanadi, aks holda UI havolasiz (bosilmaydigan) qator ko'rsatadi.
      link: payload.link?.trim() || null,
      refs: payload.refs || {},
      actor: payload.actor || "Tizim",
      source: payload.source || "event",
      dedupeKey: payload.dedupeKey || null,
      createdAt: nowIso(),
      readAt: null,
      archivedAt: null,
      dismissedAt: null,
    };

    return {
      ...current,
      notifications: [created, ...current.notifications],
    };
  });

  return created;
};

// Derivatsiya qilingan (hisoblab chiqarilgan) ogohlantirishlarni holat bilan
// muvofiqlashtiradi — masalan invoys to'langach uning "muddati o'tdi"
// bildirishnomasi avtomatik arxivlanadi. `prefix` — dedupeKey old qismi
// (masalan "payment_overdue"), `desiredByKey` — HOZIR bo'lishi kerak bo'lgan
// bildirishnomalar xaritasi (dedupeKey -> pushNotification payload).
export const reconcileDerivedNotifications = (prefix, desiredByKey) => {
  setStoreState((current) => {
    const desiredKeys = new Set(desiredByKey.keys());

    const resolved = current.notifications.map((entry) => {
      const matchesPrefix = entry.dedupeKey?.startsWith(`${prefix}:`);

      if (
        matchesPrefix &&
        isActiveStatus(entry.status) &&
        !desiredKeys.has(entry.dedupeKey)
      ) {
        return {
          ...entry,
          status: NOTIFICATION_STATUSES.archived,
          archivedAt: nowIso(),
        };
      }

      return entry;
    });

    return { ...current, notifications: resolved };
  });

  desiredByKey.forEach((payload) => pushNotification(payload));
};

const updateNotification = (current, id, updater) => ({
  ...current,
  notifications: current.notifications.map((entry) =>
    entry.id === id ? updater(entry) : entry,
  ),
});

const transitionTo = (entry, nextStatus, extra = {}) => {
  if (!canTransitionNotificationStatus(entry.status, nextStatus)) return entry;

  return { ...entry, status: nextStatus, ...extra };
};

export const useNotificationsStore = () => {
  const [state, setState] = useState(storeState);

  useEffect(() => {
    const listener = (next) => setState(next);

    listeners.add(listener);

    return () => listeners.delete(listener);
  }, []);

  const markRead = useCallback((id) => {
    setStoreState((current) =>
      updateNotification(current, id, (entry) =>
        transitionTo(entry, NOTIFICATION_STATUSES.read, { readAt: nowIso() }),
      ),
    );
  }, []);

  const markUnread = useCallback((id) => {
    setStoreState((current) =>
      updateNotification(current, id, (entry) =>
        transitionTo(entry, NOTIFICATION_STATUSES.unread, { readAt: null }),
      ),
    );
  }, []);

  const markAllRead = useCallback(() => {
    setStoreState((current) => ({
      ...current,
      notifications: current.notifications.map((entry) =>
        transitionTo(entry, NOTIFICATION_STATUSES.read, { readAt: nowIso() }),
      ),
    }));
  }, []);

  const archive = useCallback((id) => {
    setStoreState((current) =>
      updateNotification(current, id, (entry) =>
        transitionTo(entry, NOTIFICATION_STATUSES.archived, {
          archivedAt: nowIso(),
        }),
      ),
    );
  }, []);

  const restore = useCallback((id) => {
    setStoreState((current) =>
      updateNotification(current, id, (entry) =>
        transitionTo(entry, NOTIFICATION_STATUSES.read, { archivedAt: null }),
      ),
    );
  }, []);

  const dismiss = useCallback((id) => {
    setStoreState((current) =>
      updateNotification(current, id, (entry) =>
        transitionTo(entry, NOTIFICATION_STATUSES.dismissed, {
          dismissedAt: nowIso(),
        }),
      ),
    );
  }, []);

  // "Clear Read Notifications" — o'qilgan yozuvlarni ro'yxatdan (faol
  // ko'rinishdan) olib tashlaydi. Audit iz sifatida saqlanishi uchun qattiq
  // o'chirish emas, balki "dismissed"ga o'tkaziladi (Restore imkoni yo'q —
  // dismissed terminal, xuddi PurchaseReturns'dagi kabi qat'iy holat).
  const clearRead = useCallback(() => {
    setStoreState((current) => ({
      ...current,
      notifications: current.notifications.map((entry) =>
        entry.status === NOTIFICATION_STATUSES.read
          ? transitionTo(entry, NOTIFICATION_STATUSES.dismissed, {
              dismissedAt: nowIso(),
            })
          : entry,
      ),
    }));
  }, []);

  return {
    notifications: state.notifications,
    actions: {
      markRead,
      markUnread,
      markAllRead,
      archive,
      restore,
      dismiss,
      clearRead,
    },
  };
};

export default useNotificationsStore;
