const CRM_NOTES_STORAGE_KEY = "zenix.crm.notes.v2";

export const crmNoteCategories = {
  general: "Umumiy",
  sales: "Savdo",
  support: "Qo'llab-quvvatlash",
  finance: "Moliya",
};

export const crmNotePriorities = {
  low: "Past",
  normal: "Oddiy",
  high: "Yuqori",
};

export const crmNotes = [];

const getEmptyStorage = () => ({
  records: [],
  deletedIds: [],
});

const readNotesStorage = () => {
  if (typeof window === "undefined" || !window.localStorage) {
    return getEmptyStorage();
  }

  try {
    const storedValue = window.localStorage.getItem(CRM_NOTES_STORAGE_KEY);
    return storedValue ? { ...getEmptyStorage(), ...JSON.parse(storedValue) } : getEmptyStorage();
  } catch {
    return getEmptyStorage();
  }
};

const writeNotesStorage = (storage) => {
  if (typeof window === "undefined" || !window.localStorage) return;
  window.localStorage.setItem(CRM_NOTES_STORAGE_KEY, JSON.stringify(storage));
};

export const getCustomerNotes = (customerId) =>
  readNotesStorage().records
    .filter((note) => String(note.customerId) === String(customerId))
    .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)));

export const saveCustomerNote = (note) => {
  const storage = readNotesStorage();
  const savedNote = {
    ...note,
    id: note.id || `note-${Date.now()}`,
    createdAt: note.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const recordIndex = storage.records.findIndex((entry) => entry.id === savedNote.id);

  if (recordIndex >= 0) storage.records[recordIndex] = savedNote;
  else storage.records.push(savedNote);

  storage.deletedIds = storage.deletedIds.filter((id) => id !== savedNote.id);
  writeNotesStorage(storage);

  return savedNote;
};

export const deleteCustomerNote = (noteId) => {
  const storage = readNotesStorage();
  storage.records = storage.records.filter((note) => note.id !== noteId);
  if (!storage.deletedIds.includes(noteId)) storage.deletedIds.push(noteId);
  writeNotesStorage(storage);
};

export const toggleCustomerNotePin = (note) =>
  saveCustomerNote({ ...note, pinned: !note.pinned });
