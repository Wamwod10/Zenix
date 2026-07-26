const uzNumberFormatter = new Intl.NumberFormat("uz-UZ");

const compactNumberFormatter = new Intl.NumberFormat("uz-UZ", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat("uz-UZ", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("uz-UZ", {
  day: "2-digit",
  month: "short",
});

const dateTimeFormatter = new Intl.DateTimeFormat("uz-UZ", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const isValidNumber = (value) =>
  typeof value === "number" && Number.isFinite(value);

const toValidDate = (value) => {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatNumber = (value, fallback = "—") => {
  if (!isValidNumber(value)) {
    return fallback;
  }

  return uzNumberFormatter.format(value);
};

export const formatCompactNumber = (value, fallback = "—") => {
  if (!isValidNumber(value)) {
    return fallback;
  }

  return compactNumberFormatter.format(value);
};

export const formatCurrency = (
  value,
  { compact = false, currencyLabel = "so‘m", fallback = "—" } = {},
) => {
  if (!isValidNumber(value)) {
    return fallback;
  }

  const formattedValue = compact
    ? compactNumberFormatter.format(value)
    : uzNumberFormatter.format(value);

  return currencyLabel ? `${formattedValue} ${currencyLabel}` : formattedValue;
};

export const formatPercentage = (
  value,
  { maximumFractionDigits = 1, showSign = false, fallback = "—" } = {},
) => {
  if (!isValidNumber(value)) {
    return fallback;
  }

  const sign = showSign && value > 0 ? "+" : "";

  return `${sign}${value.toLocaleString("uz-UZ", {
    maximumFractionDigits,
  })}%`;
};

export const formatDate = (value, { short = false, fallback = "—" } = {}) => {
  const date = toValidDate(value);

  if (!date) {
    return fallback;
  }

  return short ? shortDateFormatter.format(date) : dateFormatter.format(date);
};

export const formatDateTime = (value, fallback = "—") => {
  const date = toValidDate(value);

  if (!date) {
    return fallback;
  }

  return dateTimeFormatter.format(date);
};

export const formatRelativeDate = (
  value,
  referenceValue = new Date(),
  fallback = "—",
) => {
  const date = toValidDate(value);
  const referenceDate = toValidDate(referenceValue);

  if (!date || !referenceDate) {
    return fallback;
  }

  const difference = referenceDate.getTime() - date.getTime();
  const absoluteDifference = Math.abs(difference);

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (absoluteDifference < minute) {
    return "Hozirgina";
  }

  if (absoluteDifference < hour) {
    const minutes = Math.floor(absoluteDifference / minute);

    return difference >= 0
      ? `${minutes} daqiqa oldin`
      : `${minutes} daqiqadan keyin`;
  }

  if (absoluteDifference < day) {
    const hours = Math.floor(absoluteDifference / hour);

    return difference >= 0 ? `${hours} soat oldin` : `${hours} soatdan keyin`;
  }

  const days = Math.floor(absoluteDifference / day);

  if (days === 1) {
    return difference >= 0 ? "Kecha" : "Ertaga";
  }

  if (days < 7) {
    return difference >= 0 ? `${days} kun oldin` : `${days} kundan keyin`;
  }

  return formatDate(date, {
    short: true,
    fallback,
  });
};

export const formatPhoneNumber = (value, fallback = "—") => {
  if (!value) {
    return fallback;
  }

  const digits = String(value).replace(/\D/g, "");
  const normalizedDigits = digits.length === 9 ? `998${digits}` : digits;

  if (normalizedDigits.length === 12 && normalizedDigits.startsWith("998")) {
    return `+998 ${normalizedDigits.slice(3, 5)} ${normalizedDigits.slice(
      5,
      8,
    )} ${normalizedDigits.slice(8, 10)} ${normalizedDigits.slice(10, 12)}`;
  }

  return String(value);
};

export const formatInitials = (fullName, fallback = "M") => {
  if (!fullName || typeof fullName !== "string") {
    return fallback;
  }

  const names = fullName.trim().split(/\s+/).filter(Boolean);

  if (!names.length) {
    return fallback;
  }

  if (names.length === 1) {
    return names[0].slice(0, 2).toLocaleUpperCase("uz-UZ");
  }

  return `${names[0][0]}${names[names.length - 1][0]}`.toLocaleUpperCase(
    "uz-UZ",
  );
};

export const formatCustomerName = (
  customerOrFirstName,
  lastName,
  fallback = "Nomsiz mijoz",
) => {
  if (customerOrFirstName && typeof customerOrFirstName === "object") {
    const customer = customerOrFirstName;

    if (customer.fullName?.trim()) {
      return customer.fullName.trim();
    }

    const combinedName = [customer.firstName, customer.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    return combinedName || fallback;
  }

  const combinedName = [customerOrFirstName, lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return combinedName || fallback;
};

export const formatLoyaltyLevel = (level) => {
  const labels = {
    bronze: "Bronza",
    silver: "Kumush",
    gold: "Oltin",
    platinum: "Platina",
    vip: "VIP",
  };

  if (!level) {
    return "Standart";
  }

  return labels[String(level).toLowerCase()] || level;
};

export const formatCustomerStatus = (status) => {
  const labels = {
    active: "Faol",
    inactive: "Nofaol",
    prospect: "Potensial",
    lead: "Lead",
    customer: "Mijoz",
    blocked: "Bloklangan",
    archived: "Arxivlangan",
  };

  if (!status) {
    return "Noma’lum";
  }

  return labels[String(status).toLowerCase()] || status;
};

export const formatRiskLevel = (riskLevel) => {
  const labels = {
    low: "Past xavf",
    medium: "O‘rta xavf",
    high: "Yuqori xavf",
    critical: "Kritik xavf",
  };

  if (!riskLevel) {
    return "Aniqlanmagan";
  }

  return labels[String(riskLevel).toLowerCase()] || riskLevel;
};
