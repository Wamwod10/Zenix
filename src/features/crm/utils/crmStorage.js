// CRM Storage
const STORAGE_PREFIX = 'crm_';

export const getFromStorage = (key) => {
  const data = localStorage.getItem(STORAGE_PREFIX + key);
  return data ? JSON.parse(data) : null;
};

export const saveToStorage = (key, data) => {
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
};

export const removeFromStorage = (key) => {
  localStorage.removeItem(STORAGE_PREFIX + key);
};
