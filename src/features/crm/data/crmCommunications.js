const CRM_COMMUNICATIONS_STORAGE_KEY = "zenix.crm.communications.v2";

export const crmCommunicationChannels = {
  call: "Qo'ng'iroq",
  sms: "SMS",
  telegram: "Telegram",
  email: "Email",
  whatsapp: "WhatsApp",
};

export const crmCommunicationStatuses = {
  planned: "Rejalashtirilgan",
  completed: "Bajarilgan",
  missed: "O'tkazib yuborilgan",
  cancelled: "Bekor qilingan",
};

export const crmCommunications = [];

const readStoredCommunications = () => {
  if (typeof window === "undefined" || !window.localStorage) return [];

  try {
    const storedValue = window.localStorage.getItem(CRM_COMMUNICATIONS_STORAGE_KEY);
    const parsed = storedValue ? JSON.parse(storedValue) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeStoredCommunications = (communications) => {
  if (typeof window === "undefined" || !window.localStorage) return;
  window.localStorage.setItem(CRM_COMMUNICATIONS_STORAGE_KEY, JSON.stringify(communications));
};

export const getCustomerCommunications = (customerId) =>
  readStoredCommunications()
    .filter((communication) => String(communication.customerId) === String(customerId))
    .sort(
      (first, second) =>
        new Date(second.createdAt || second.date || 0).getTime() -
        new Date(first.createdAt || first.date || 0).getTime(),
    );

export const saveCustomerCommunication = (communication) => {
  const communications = readStoredCommunications();
  const savedCommunication = {
    ...communication,
    id: communication.id || `communication-${Date.now()}`,
    createdAt: communication.createdAt || new Date().toISOString(),
  };
  const index = communications.findIndex((entry) => entry.id === savedCommunication.id);

  if (index >= 0) communications[index] = savedCommunication;
  else communications.push(savedCommunication);

  writeStoredCommunications(communications);

  return savedCommunication;
};

export const formatCommunicationDuration = (seconds = 0) => {
  const value = Number(seconds) || 0;
  const minutes = Math.floor(value / 60);
  const remainingSeconds = value % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};
