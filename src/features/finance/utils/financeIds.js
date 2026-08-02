export const generateFinanceId = (prefix = "FIN") => {
  const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `${prefix}-${stamp}-${random}`;
};

export const generateTransactionId = () => generateFinanceId("TRX");
export const generateJournalId = () => generateFinanceId("JRN");
export const generateAuditId = () => generateFinanceId("AUD");
export const generateNotificationId = () => generateFinanceId("NTF");
export const generateInvoiceId = () => generateFinanceId("INV");
export const generatePaymentOrderId = () => generateFinanceId("PO");
export const generateBudgetId = () => generateFinanceId("BDG");
export const generateAccountId = () => generateFinanceId("ACC");
