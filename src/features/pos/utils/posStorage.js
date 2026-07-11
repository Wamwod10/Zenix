const HELD_ORDERS_KEY = "zenix.pos.heldOrders";
const RECENT_SALES_KEY = "zenix.pos.recentSales";
const RETURNS_KEY = "zenix.pos.returns";
const SHIFT_KEY = "zenix.pos.shift";
const OFFLINE_QUEUE_KEY = "zenix.pos.offlineQueue";
const SETTINGS_KEY = "zenix.pos.settings";

const canUseStorage = () => typeof window !== "undefined" && window.localStorage;

export const safeParseJSON = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const readStorage = (key, fallback) => {
  if (!canUseStorage()) {
    return fallback;
  }

  return safeParseJSON(window.localStorage.getItem(key), fallback);
};

const writeStorage = (key, value) => {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable in private mode. POS state still works in memory.
  }
};

export const readHeldOrders = () => readStorage(HELD_ORDERS_KEY, []);

export const writeHeldOrders = (orders) => writeStorage(HELD_ORDERS_KEY, orders);

export const readRecentSales = () => readStorage(RECENT_SALES_KEY, []);

export const writeRecentSales = (sales) => writeStorage(RECENT_SALES_KEY, sales);

export const readReturns = () => readStorage(RETURNS_KEY, []);

export const writeReturns = (returns) => writeStorage(RETURNS_KEY, returns);

export const readShift = () => readStorage(SHIFT_KEY, null);

export const writeShift = (shift) => writeStorage(SHIFT_KEY, shift);

export const readOfflineQueue = () => readStorage(OFFLINE_QUEUE_KEY, []);

export const writeOfflineQueue = (queue) => writeStorage(OFFLINE_QUEUE_KEY, queue);

export const readPOSSettings = (fallback) => readStorage(SETTINGS_KEY, fallback);

export const writePOSSettings = (settings) => writeStorage(SETTINGS_KEY, settings);
