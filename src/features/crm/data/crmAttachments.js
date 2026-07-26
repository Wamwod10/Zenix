export const CRM_ATTACHMENT_MAX_SIZE = 10 * 1024 * 1024;

export const CRM_ATTACHMENT_ACCEPTED_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export const CRM_ATTACHMENT_ACCEPT_VALUE = [
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
].join(",");

export const crmAttachmentCategories = {
    contract: "Shartnoma",
    invoice: "Hisob-faktura",
    identity: "Shaxsiy hujjat",
    payment: "To‘lov hujjati",
    other: "Boshqa",
};

export const crmAttachments = [
    {
        id: "att-001",
        customerId: "cus-001",
        name: "Hamkorlik_shartnomasi_2026.pdf",
        size: 1_842_300,
        mimeType: "application/pdf",
        category: "contract",
        uploadedBy: "Dilshod Karimov",
        createdAt: "2026-06-14T10:25:00.000Z",
        source: "mock",
    },
    {
        id: "att-002",
        customerId: "cus-001",
        name: "Hisob_faktura_1048.pdf",
        size: 624_800,
        mimeType: "application/pdf",
        category: "invoice",
        uploadedBy: "Madina Rasulova",
        createdAt: "2026-07-12T15:45:00.000Z",
        source: "mock",
    },
    {
        id: "att-003",
        customerId: "cus-001",
        name: "Tolov_tasdiqi.png",
        size: 948_200,
        mimeType: "image/png",
        category: "payment",
        uploadedBy: "Dilshod Karimov",
        createdAt: "2026-07-12T16:02:00.000Z",
        source: "mock",
    },
    {
        id: "att-004",
        customerId: "cus-002",
        name: "Mijoz_anketasi.docx",
        size: 284_500,
        mimeType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        category: "other",
        uploadedBy: "Aziza Murodova",
        createdAt: "2026-05-22T09:40:00.000Z",
        source: "mock",
    },
    {
        id: "att-005",
        customerId: "cus-003",
        name: "VIP_shartnoma.pdf",
        size: 2_104_600,
        mimeType: "application/pdf",
        category: "contract",
        uploadedBy: "Madina Rasulova",
        createdAt: "2026-04-18T13:15:00.000Z",
        source: "mock",
    },
];

export const getCustomerAttachments = (customerId) =>
    crmAttachments
        .filter((attachment) => attachment.customerId === customerId)
        .sort(
            (first, second) =>
                new Date(second.createdAt).getTime() -
                new Date(first.createdAt).getTime(),
        )
        .map((attachment) => ({ ...attachment }));