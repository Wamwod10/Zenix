// Notification Status — Unread / Read / Archived / Dismissed.
// Qat'iy state machine — purchaseStatuses.js (PURCHASE_STATUS_FLOW) bilan
// bir xil naqsh: har o'tish faqat ruxsat etilgan yo'nalishda.

export const NOTIFICATION_STATUSES = {
  unread: "unread",
  read: "read",
  archived: "archived",
  dismissed: "dismissed",
};

export const NOTIFICATION_STATUS_LABELS = {
  [NOTIFICATION_STATUSES.unread]: "O'qilmagan",
  [NOTIFICATION_STATUSES.read]: "O'qilgan",
  [NOTIFICATION_STATUSES.archived]: "Arxivlangan",
  [NOTIFICATION_STATUSES.dismissed]: "Yopilgan",
};

// unread <-> read erkin; ikkisidan ham arxivlash/yopish mumkin; arxivdan
// faqat "read" holatiga tiklanadi (Restore); dismissed — terminal holat.
export const NOTIFICATION_STATUS_FLOW = {
  [NOTIFICATION_STATUSES.unread]: [
    NOTIFICATION_STATUSES.read,
    NOTIFICATION_STATUSES.archived,
    NOTIFICATION_STATUSES.dismissed,
  ],
  [NOTIFICATION_STATUSES.read]: [
    NOTIFICATION_STATUSES.unread,
    NOTIFICATION_STATUSES.archived,
    NOTIFICATION_STATUSES.dismissed,
  ],
  [NOTIFICATION_STATUSES.archived]: [
    NOTIFICATION_STATUSES.read,
    NOTIFICATION_STATUSES.dismissed,
  ],
  [NOTIFICATION_STATUSES.dismissed]: [],
};

export const canTransitionNotificationStatus = (from, to) =>
  from === to || (NOTIFICATION_STATUS_FLOW[from] || []).includes(to);

// Faol (foydalanuvchi diqqatini talab qiladigan) holatlar — dedup tekshiruvi
// va badge hisoblagichi shu ro'yxatga qarab ishlaydi.
export const ACTIVE_NOTIFICATION_STATUSES = [
  NOTIFICATION_STATUSES.unread,
  NOTIFICATION_STATUSES.read,
];
