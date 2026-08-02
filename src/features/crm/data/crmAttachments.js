export const CRM_ATTACHMENT_MAX_SIZE = 10 * 1024 * 1024;

export const CRM_ATTACHMENT_ACCEPTED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export const CRM_ATTACHMENT_ACCEPT_VALUE = CRM_ATTACHMENT_ACCEPTED_TYPES.join(",");

export const crmAttachmentCategories = {
  contract: "Shartnoma",
  invoice: "Hisob-faktura",
  identity: "Shaxsiy hujjat",
  other: "Boshqa",
};

export const crmAttachments = [];

export const getCustomerAttachments = (customerId) =>
  crmAttachments.filter(
    (attachment) => String(attachment.customerId) === String(customerId),
  );
