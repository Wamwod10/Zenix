const CRM_RELATIONSHIPS_STORAGE_KEY = "zenix.crm.relationships.v2";

export const crmRelationshipTypes = {
  family: "Oila",
  coworker: "Hamkasb",
  business: "Biznes aloqa",
  referral: "Tavsiya",
  other: "Boshqa",
};

export const crmRelationshipStatuses = {
  active: "Faol",
  inactive: "Nofaol",
};

export const crmRelationships = [];

const createEmptyStorage = () => ({
  records: [],
  deletedIds: [],
});

const readRelationshipsStorage = () => {
  if (typeof window === "undefined" || !window.localStorage) return createEmptyStorage();

  try {
    const storedValue = window.localStorage.getItem(CRM_RELATIONSHIPS_STORAGE_KEY);
    return storedValue
      ? { ...createEmptyStorage(), ...JSON.parse(storedValue) }
      : createEmptyStorage();
  } catch {
    return createEmptyStorage();
  }
};

const writeRelationshipsStorage = (storage) => {
  if (typeof window === "undefined" || !window.localStorage) return;
  window.localStorage.setItem(CRM_RELATIONSHIPS_STORAGE_KEY, JSON.stringify(storage));
};

export const getCustomerRelationships = (customerId) =>
  readRelationshipsStorage().records.filter(
    (relationship) => String(relationship.customerId) === String(customerId),
  );

export const saveCustomerRelationship = (relationship) => {
  const storage = readRelationshipsStorage();
  const savedRelationship = {
    status: "active",
    ...relationship,
    id: relationship.id || `relationship-${Date.now()}`,
    createdAt: relationship.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const recordIndex = storage.records.findIndex((entry) => entry.id === savedRelationship.id);

  if (recordIndex >= 0) storage.records[recordIndex] = savedRelationship;
  else storage.records.push(savedRelationship);

  storage.deletedIds = storage.deletedIds.filter((id) => id !== savedRelationship.id);
  writeRelationshipsStorage(storage);

  return savedRelationship;
};

export const deleteCustomerRelationship = (relationshipId) => {
  const storage = readRelationshipsStorage();
  storage.records = storage.records.filter((relationship) => relationship.id !== relationshipId);
  if (!storage.deletedIds.includes(relationshipId)) storage.deletedIds.push(relationshipId);
  writeRelationshipsStorage(storage);
};

export const setPrimaryCustomerRelationship = (relationship) =>
  saveCustomerRelationship({ ...relationship, primary: true });

export const toggleCustomerRelationshipStatus = (relationship) =>
  saveCustomerRelationship({
    ...relationship,
    status: relationship.status === "active" ? "inactive" : "active",
  });
