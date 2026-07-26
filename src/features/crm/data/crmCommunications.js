const CRM_COMMUNICATION_STORAGE_KEY =
    "zenix.crm.communications.v1";

export const crmCommunicationChannels = {
    call: {
        id: "call",
        label: "Qo‘ng‘iroq",
    },
    email: {
        id: "email",
        label: "Email",
    },
    sms: {
        id: "sms",
        label: "SMS",
    },
    telegram: {
        id: "telegram",
        label: "Telegram",
    },
    whatsapp: {
        id: "whatsapp",
        label: "WhatsApp",
    },
};

export const crmCommunicationStatuses = {
    completed: "Yakunlangan",
    delivered: "Yetkazilgan",
    opened: "O‘qilgan",
    missed: "Javobsiz",
    failed: "Yuborilmadi",
    scheduled: "Rejalashtirilgan",
};

export const crmCommunications = [
    {
        id: "com-001",
        customerId: "cus-001",
        channel: "call",
        direction: "outbound",
        status: "completed",
        subject: "Buyurtma tafsilotlarini tasdiqlash",
        summary:
            "Mijoz bilan ORD-2026-1048 buyurtmasining yetkazib berish vaqti kelishildi.",
        durationSeconds: 284,
        participant: "+998 90 123 45 67",
        manager: "Dilshod Karimov",
        createdAt: "2026-07-12T14:25:00.000Z",
    },
    {
        id: "com-002",
        customerId: "cus-001",
        channel: "email",
        direction: "outbound",
        status: "opened",
        subject: "Hisob-faktura va buyurtma ma’lumotlari",
        summary:
            "Mijozga ORD-2026-1048 buyurtmasi bo‘yicha hisob-faktura yuborildi.",
        participant: "azizbek@example.uz",
        manager: "Madina Rasulova",
        createdAt: "2026-07-12T15:48:00.000Z",
    },
    {
        id: "com-003",
        customerId: "cus-001",
        channel: "telegram",
        direction: "inbound",
        status: "delivered",
        subject: "Yetkazib berish manzili yangilandi",
        summary:
            "Mijoz buyurtmani Chilonzor filialidan olib ketishini ma’lum qildi.",
        participant: "@azizbek_business",
        manager: "Dilshod Karimov",
        createdAt: "2026-07-11T09:35:00.000Z",
    },
    {
        id: "com-004",
        customerId: "cus-001",
        channel: "sms",
        direction: "outbound",
        status: "delivered",
        subject: "Buyurtma tayyorligi haqida SMS",
        summary:
            "Buyurtma olib ketishga tayyor ekanligi haqida avtomatik SMS yuborildi.",
        participant: "+998 90 123 45 67",
        manager: "ZENIX Automation",
        createdAt: "2026-07-10T16:20:00.000Z",
    },
    {
        id: "com-005",
        customerId: "cus-001",
        channel: "call",
        direction: "inbound",
        status: "missed",
        subject: "Javobsiz kiruvchi qo‘ng‘iroq",
        summary:
            "Mijoz qo‘ng‘iroq qildi, lekin menejer javob bera olmadi.",
        durationSeconds: 0,
        participant: "+998 90 123 45 67",
        manager: "Dilshod Karimov",
        createdAt: "2026-07-08T11:05:00.000Z",
    },
    {
        id: "com-006",
        customerId: "cus-002",
        channel: "call",
        direction: "outbound",
        status: "completed",
        subject: "Qayta xarid bo‘yicha follow-up",
        summary:
            "Mijozga yangi mahsulotlar va shaxsiy chegirma haqida ma’lumot berildi.",
        durationSeconds: 196,
        participant: "+998 93 555 18 20",
        manager: "Aziza Murodova",
        createdAt: "2026-07-08T10:10:00.000Z",
    },
    {
        id: "com-007",
        customerId: "cus-002",
        channel: "whatsapp",
        direction: "outbound",
        status: "delivered",
        subject: "Mahsulot katalogi yuborildi",
        summary: "Mijozga yangilangan mahsulot katalogi yuborildi.",
        participant: "+998 93 555 18 20",
        manager: "Aziza Murodova",
        createdAt: "2026-07-06T13:30:00.000Z",
    },
    {
        id: "com-008",
        customerId: "cus-003",
        channel: "email",
        direction: "outbound",
        status: "opened",
        subject: "VIP mijozlar uchun maxsus taklif",
        summary:
            "Platina darajadagi mijozga yopiq kampaniya taklifi yuborildi.",
        participant: "nodira@example.uz",
        manager: "Madina Rasulova",
        createdAt: "2026-07-14T10:32:00.000Z",
    },
];

const readStoredCommunications = () => {
    if (typeof window === "undefined") {
        return [];
    }

    try {
        const storedValue = window.localStorage.getItem(
            CRM_COMMUNICATION_STORAGE_KEY,
        );

        if (!storedValue) {
            return [];
        }

        const parsedValue = JSON.parse(storedValue);

        return Array.isArray(parsedValue) ? parsedValue : [];
    } catch {
        return [];
    }
};

const writeStoredCommunications = (communications) => {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.localStorage.setItem(
            CRM_COMMUNICATION_STORAGE_KEY,
            JSON.stringify(communications),
        );
    } catch {
        throw new Error(
            "Communication tarixini brauzer xotirasiga saqlab bo‘lmadi.",
        );
    }
};

const createCommunicationId = () => {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return `communication-${crypto.randomUUID()}`;
    }

    return `communication-${Date.now().toString(36)}`;
};

export const getCustomerCommunications = (customerId) => {
    const storedCommunications = readStoredCommunications();
    const recordsById = new Map();

    [...crmCommunications, ...storedCommunications].forEach(
        (communication) => {
            recordsById.set(communication.id, communication);
        },
    );

    return Array.from(recordsById.values())
        .filter(
            (communication) => communication.customerId === customerId,
        )
        .sort(
            (first, second) =>
                new Date(second.createdAt).getTime() -
                new Date(first.createdAt).getTime(),
        )
        .map((communication) => ({ ...communication }));
};

export const saveCustomerCommunication = (communication) => {
    if (!communication?.customerId) {
        throw new Error("Mijoz identifikatori topilmadi.");
    }

    if (!communication?.channel) {
        throw new Error("Aloqa kanali tanlanmagan.");
    }

    if (!communication?.summary?.trim()) {
        throw new Error("Xabar matni kiritilmagan.");
    }

    const newCommunication = {
        id: communication.id ?? createCommunicationId(),
        customerId: communication.customerId,
        channel: communication.channel,
        direction: communication.direction ?? "outbound",
        status: communication.status ?? "delivered",
        subject: communication.subject?.trim() || "Yangi xabar",
        summary: communication.summary.trim(),
        participant: communication.participant ?? "",
        manager: communication.manager ?? "Joriy foydalanuvchi",
        createdAt:
            communication.createdAt ?? new Date().toISOString(),
    };

    const storedCommunications = readStoredCommunications();
    const existingIndex = storedCommunications.findIndex(
        (record) => record.id === newCommunication.id,
    );

    if (existingIndex >= 0) {
        storedCommunications[existingIndex] = newCommunication;
    } else {
        storedCommunications.unshift(newCommunication);
    }

    writeStoredCommunications(storedCommunications);

    return { ...newCommunication };
};

export const formatCommunicationDuration = (
    durationSeconds = 0,
) => {
    const safeDuration = Math.max(Number(durationSeconds) || 0, 0);
    const minutes = Math.floor(safeDuration / 60);
    const seconds = safeDuration % 60;

    if (minutes === 0) {
        return `${seconds} soniya`;
    }

    return `${minutes} daqiqa ${seconds} soniya`;
};