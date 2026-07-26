export const formatSettingNumber = (value) =>
  new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 2 }).format(Number(value || 0));

export const formatSettingDateTime = (value) =>
  new Intl.DateTimeFormat("uz-UZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
