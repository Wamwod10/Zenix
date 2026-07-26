const CRM_NOTES_STORAGE_KEY = "zenix.crm.notes.v1";

export const crmNoteCategories = {
    general: "Umumiy",
    sales: "Savdo",
    support: "Yordam",
    finance: "Moliya",
    relationship: "Munosabat",
};

export const crmNotePriorities = {
    normal: "Oddiy",
    important: "Muhim",
    critical: "Juda muhim",
};

export const crmNotes = [
    {
        id: "note-001",
        customerId: "cus-001",
        category: "sales",
        priority: "important",
        content:
            "Mijoz yangi filial uchun katta buyurtma rejalashtirmoqda. Avgust boshida qayta bog‘lanish kerak.",
        isPinned: true,
        author: "Dilshod Karimov",
        createdAt: "2026-07-12T13:10:00.000Z",
        updatedAt: "2026-07-12T13:10:00.000Z",
    },
    {
        id: "note-002",
        customerId: "cus-001",
        category: "relationship",
        priority: "normal",
        content:
            "Mijoz telefon orqali bog‘lanishni afzal ko‘radi. Ish vaqtida 10:00–16:00 oralig‘ida qo‘ng‘iroq qilish qulay.",
        isPinned: false,
        author: "Madina Rasulova",
        createdAt: "2026-06-28T10:45:00.000Z",
        updatedAt: "2026-06-28T10:45:00.000Z",
    },
    {
        id: "note-003",
        customerId: "cus-001",
        category: "finance",
        priority: "critical",
        content:
            "Keyingi qarzli savdodan oldin ochiq qarzdorlik va kredit limitini tekshirish kerak.",
        isPinned: true,
        author: "Aziza Murodova",
        createdAt: "2026-06-17T09:20:00.000Z",
        updatedAt: "2026-06-17T09:20:00.000Z",
    },
    {
        id: "note-004",
        customerId: "cus-002",
        category: "support",
        priority: "normal",
        content:
            "Mijoz mahsulot kafolati bo‘yicha ma’lumot so‘radi. Kafolat shartlari email orqali yuborildi.",
        isPinned: false,
        author: "Aziza Murodova",
        createdAt: "2026-07-07T15:30:00.000Z",
        updatedAt: "2026-07-07T15:30:00.000Z",
    },
    {
        id: "note-005",
        customerId: "cus-003",
        category: "sales",
        priority: "important",
        content:
            "VIP kampaniyalar va yangi kolleksiyalar haqida birinchi bo‘lib xabar berish kerak.",
        isPinned: true,
        author: "Madina Rasulova",
        createdAt: "2026-07-14T10:40:00.000Z",
        updatedAt: "2026-07-14T10:40:00.000Z",
    },
];

const getEmptyStorage = () => ({
    records: [],
    deletedIds: [],
});

const readNotesStorage = () => {
    if (typeof window === "undefined") {
        return getEmptyStorage();
    }

    try {
        const storedValue = window.localStorage.getItem(
            CRM_NOTES_STORAGE_KEY,
        );

        if (!storedValue) {
            return getEmptyStorage();
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
        return getEmptyStorage();
    }
};

const writeNotesStorage = (storage) => {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.localStorage.setItem(
            CRM_NOTES_STORAGE_KEY,
            JSON.stringify(storage),
        );
    } catch {
        throw new Error(
            "Eslatmani brauzer xotirasiga saqlab bo‘lmadi.",
        );
    }
};

const createNoteId = () => {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return `note-${crypto.randomUUID()}`;
    }

    return `note-${Date.now().toString(36)}`;
};

const sortNotes = (first, second) => {
    if (first.isPinned !== second.isPinned) {
        return first.isPinned ? -1 : 1;
    }

    return (
        new Date(second.updatedAt).getTime() -
        new Date(first.updatedAt).getTime()
    );
};

export const getCustomerNotes = (customerId) => {
    const storage = readNotesStorage();
    const deletedIds = new Set(storage.deletedIds);
    const recordsById = new Map();

    crmNotes.forEach((note) => {
        if (!deletedIds.has(note.id)) {
            recordsById.set(note.id, note);
        }
    });

    storage.records.forEach((note) => {
        if (!deletedIds.has(note.id)) {
            recordsById.set(note.id, note);
        }
    });

    return Array.from(recordsById.values())
        .filter((note) => note.customerId === customerId)
        .sort(sortNotes)
        .map((note) => ({ ...note }));
};

export const saveCustomerNote = (note) => {
    if (!note?.customerId) {
        throw new Error("Mijoz identifikatori topilmadi.");
    }

    if (!note?.content?.trim()) {
        throw new Error("Eslatma matni kiritilmagan.");
    }

    const storage = readNotesStorage();
    const timestamp = new Date().toISOString();
    const existingNote = getCustomerNotes(note.customerId).find(
        (record) => record.id === note.id,
    );

    const savedNote = {
        id: note.id ?? createNoteId(),
        customerId: note.customerId,
        category: note.category ?? "general",
        priority: note.priority ?? "normal",
        content: note.content.trim(),
        isPinned: note.isPinned ?? existingNote?.isPinned ?? false,
        author: note.author ?? existingNote?.author ?? "Joriy foydalanuvchi",
        createdAt: existingNote?.createdAt ?? note.createdAt ?? timestamp,
        updatedAt: timestamp,
    };

    const recordIndex = storage.records.findIndex(
        (record) => record.id === savedNote.id,
    );

    if (recordIndex >= 0) {
        storage.records[recordIndex] = savedNote;
    } else {
        storage.records.push(savedNote);
    }

    storage.deletedIds = storage.deletedIds.filter(
        (deletedId) => deletedId !== savedNote.id,
    );

    writeNotesStorage(storage);

    return { ...savedNote };
};

export const deleteCustomerNote = (noteId) => {
    if (!noteId) {
        throw new Error("O‘chiriladigan eslatma topilmadi.");
    }

    const storage = readNotesStorage();

    storage.records = storage.records.filter(
        (record) => record.id !== noteId,
    );

    if (!storage.deletedIds.includes(noteId)) {
        storage.deletedIds.push(noteId);
    }

    writeNotesStorage(storage);

    return noteId;
};

export const toggleCustomerNotePin = (note) =>
    saveCustomerNote({
        ...note,
        isPinned: !note.isPinned,
    });