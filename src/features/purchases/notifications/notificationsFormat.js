// Notification Center uchun nisbiy vaqt formatlash — formatPurchaseDate
// (purchaseMoney.js) bilan bir xil "backend ulanguncha real vaqt" mantig'i,
// lekin ro'yxatda o'qish uchun qulayroq nisbiy shaklda ("5 daqiqa oldin").

export const formatRelativeTime = (value, now = new Date()) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "hozir";
  if (diffMinutes < 60) return `${diffMinutes} daqiqa oldin`;

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) return `${diffHours} soat oldin`;

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) return `${diffDays} kun oldin`;

  const pad = (num) => String(num).padStart(2, "0");

  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
};

// Timeline guruhlash uchun sana bo'limi — "Bugun / Kecha / Bu hafta / Oldinroq".
export const getDateBucket = (value, now = new Date()) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "earlier";

  const startOfDay = (input) =>
    new Date(input.getFullYear(), input.getMonth(), input.getDate()).getTime();

  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays <= 7) return "week";

  return "earlier";
};

export const DATE_BUCKET_LABELS = {
  today: "Bugun",
  yesterday: "Kecha",
  week: "Bu hafta",
  earlier: "Oldinroq",
};

export const DATE_BUCKET_ORDER = ["today", "yesterday", "week", "earlier"];
