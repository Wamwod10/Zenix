export const crmActivityTypes = [
  { id: "call", label: "Qo'ng'iroq" },
  { id: "message", label: "Xabar" },
  { id: "meeting", label: "Uchrashuv" },
  { id: "purchase", label: "Xarid" },
  { id: "task", label: "Vazifa" },
];

export const crmActivities = [];

export const getCustomerActivities = (customerId) =>
  crmActivities.filter(
    (activity) => String(activity.customerId) === String(customerId),
  );
