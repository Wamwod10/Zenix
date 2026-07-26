const CRM_RELATIONSHIPS_STORAGE_KEY =
    "zenix.crm.relationships.v1";

export const crmRelationshipTypes = {
    company: "Kompaniya",
    employee: "Xodim",
    partner: "Hamkor",
    family: "Oila a’zosi",
    referral: "Tavsiya qiluvchi",
    contact: "Bog‘liq kontakt",
};

export const crmRelationshipStatuses = {
    active: "Faol",
    inactive: "Faol emas",
};

export const crmRelationships = [
    {
        id: "relationship-001",
        customerId: "cus-001",
        type: "company",
        name: "Techno Market Group",
        position: "Asoschi va direktor",
        phone: "+998 90 123 45 67",
        email: "director@technomarket.uz",
        note: "Asosiy xaridlar kompaniya nomidan amalga oshiriladi.",
        status: "active",
        isPrimary: true,
        createdAt: "2026-06-12T09:30:00.000Z",
        updatedAt: "2026-07-10T12:15:00.000Z",
    },
    {
        id: "relationship-002",
        customerId: "cus-001",
        type: "employee",
        name: "Sardor Yoqubov",
        position: "Xaridlar bo‘yicha menejer",
        phone: "+998 93 445 28 18",
        email: "sardor@technomarket.uz",
        note: "Buyurtmalar va yetkazib berish masalalari bo‘yicha bog‘lanish.",
        status: "active",
        isPrimary: false,
        createdAt: "2026-06-15T10:20:00.000Z",
        updatedAt: "2026-07-08T08:40:00.000Z",
    },
    {
        id: "relationship-003",
        customerId: "cus-001",
        type: "referral",
        name: "Akmal Saidov",
        position: "Biznes hamkor",
        phone: "+998 99 764 20 10",
        email: "",
        note: "Mijozni ZENIX platformasiga tavsiya qilgan.",
        status: "active",
        isPrimary: false,
        createdAt: "2026-06-10T14:00:00.000Z",
        updatedAt: "2026-06-10T14:00:00.000Z",
    },
    {
        id: "relationship-004",
        customerId: "cus-002",
        type: "company",
        name: "Baraka Savdo",
        position: "Filial rahbari",
        phone: "+998 95 208 44 12",
        email: "office@barakasavdo.uz",
        note: "Asosiy shartnoma ushbu kompaniya bilan tuzilgan.",
        status: "active",
        isPrimary: true,
        createdAt: "2026-05-21T11:10:00.000Z",
        updatedAt: "2026-06-29T16:45:00.000Z",
    },
    {
        id: "relationship-005",
        customerId: "cus-003",
        type: "partner",
        name: "Luxury Distribution",
        position: "Distribyutor",
        phone: "+998 71 200 18 80",
        email: "sales@luxurydistribution.uz",
        note: "VIP mahsulotlar va maxsus kolleksiyalar yetkazib beruvchisi.",
        status: "active",
        isPrimary: true,
        createdAt: "2026-07-01T09:00:00.000Z",
        updatedAt: "2026-07-15T13:25:00.000Z",
    },
];

const createEmptyStorage = () => ({
    records: [],
    deletedIds: [],
});

const readRelationshipsStorage = () => {
    if (typeof window === "undefined") {
        return createEmptyStorage();
    }

    try {
        const storedValue = window.localStorage.getItem(
            CRM_RELATIONSHIPS_STORAGE_KEY,
        );

        if (!storedValue) {
            return createEmptyStorage();
        }

        const parsedValue = JSON.parse(storedValue);

        return {
            records: Array.isArray(parsedValue?.records)
                ? parsedValue.records
                : [],
            deletedIds: Array.isArray(parsedValue?.deletedIds)
                ? parsedValue.deletedIds
                : [],
        };
    } catch {
        return createEmptyStorage();
    }
};

const writeRelationshipsStorage = (storage) => {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.localStorage.setItem(
            CRM_RELATIONSHIPS_STORAGE_KEY,
            JSON.stringify(storage),
        );
    } catch {
        throw new Error(
            "Bog‘lanishni brauzer xotirasiga saqlab bo‘lmadi.",
        );
    }
};

const createRelationshipId = () => {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return `relationship-${crypto.randomUUID()}`;
    }

    return `relationship-${Date.now().toString(36)}`;
};

const sortRelationships = (first, second) => {
    if (first.isPrimary !== second.isPrimary) {
        return first.isPrimary ? -1 : 1;
    }

    if (first.status !== second.status) {
        return first.status === "active" ? -1 : 1;
    }

    return first.name.localeCompare(second.name, "uz");
};

export const getCustomerRelationships = (customerId) => {
    const storage = readRelationshipsStorage();
    const deletedIds = new Set(storage.deletedIds);
    const recordsById = new Map();

    crmRelationships.forEach((relationship) => {
        if (!deletedIds.has(relationship.id)) {
            recordsById.set(relationship.id, relationship);
        }
    });

    storage.records.forEach((relationship) => {
        if (!deletedIds.has(relationship.id)) {
            recordsById.set(relationship.id, relationship);
        }
    });

    return Array.from(recordsById.values())
        .filter(
            (relationship) =>
                relationship.customerId === customerId,
        )
        .sort(sortRelationships)
        .map((relationship) => ({ ...relationship }));
};

export const saveCustomerRelationship = (relationship) => {
    if (!relationship?.customerId) {
        throw new Error("Mijoz identifikatori topilmadi.");
    }

    if (!relationship?.name?.trim()) {
        throw new Error("Kontakt yoki tashkilot nomini kiriting.");
    }

    const storage = readRelationshipsStorage();
    const timestamp = new Date().toISOString();

    const existingRelationship = getCustomerRelationships(
        relationship.customerId,
    ).find((record) => record.id === relationship.id);

    const savedRelationship = {
        id: relationship.id ?? createRelationshipId(),
        customerId: relationship.customerId,
        type: relationship.type ?? "contact",
        name: relationship.name.trim(),
        position: relationship.position?.trim() ?? "",
        phone: relationship.phone?.trim() ?? "",
        email: relationship.email?.trim() ?? "",
        note: relationship.note?.trim() ?? "",
        status: relationship.status ?? "active",
        isPrimary:
            relationship.isPrimary ??
            existingRelationship?.isPrimary ??
            false,
        createdAt:
            existingRelationship?.createdAt ??
            relationship.createdAt ??
            timestamp,
        updatedAt: timestamp,
    };

    if (savedRelationship.isPrimary) {
        const customerRelationships = getCustomerRelationships(
            relationship.customerId,
        );

        customerRelationships.forEach((record) => {
            if (
                record.id !== savedRelationship.id &&
                record.isPrimary
            ) {
                const updatedRecord = {
                    ...record,
                    isPrimary: false,
                    updatedAt: timestamp,
                };

                const storedRecordIndex = storage.records.findIndex(
                    (item) => item.id === record.id,
                );

                if (storedRecordIndex >= 0) {
                    storage.records[storedRecordIndex] = updatedRecord;
                } else {
                    storage.records.push(updatedRecord);
                }
            }
        });
    }

    const recordIndex = storage.records.findIndex(
        (record) => record.id === savedRelationship.id,
    );

    if (recordIndex >= 0) {
        storage.records[recordIndex] = savedRelationship;
    } else {
        storage.records.push(savedRelationship);
    }

    storage.deletedIds = storage.deletedIds.filter(
        (deletedId) => deletedId !== savedRelationship.id,
    );

    writeRelationshipsStorage(storage);

    return { ...savedRelationship };
};

export const deleteCustomerRelationship = (
    relationshipId,
) => {
    if (!relationshipId) {
        throw new Error("O‘chiriladigan bog‘lanish topilmadi.");
    }

    const storage = readRelationshipsStorage();

    storage.records = storage.records.filter(
        (record) => record.id !== relationshipId,
    );

    if (!storage.deletedIds.includes(relationshipId)) {
        storage.deletedIds.push(relationshipId);
    }

    writeRelationshipsStorage(storage);

    return relationshipId;
};

export const setPrimaryCustomerRelationship = (
    relationship,
) =>
    saveCustomerRelationship({
        ...relationship,
        isPrimary: true,
    });

export const toggleCustomerRelationshipStatus = (
    relationship,
) =>
    saveCustomerRelationship({
        ...relationship,
        status:
            relationship.status === "active"
                ? "inactive"
                : "active",
    });