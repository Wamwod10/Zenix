import {
  CASH_DIRECTION,
  FINANCE_SOURCE,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from "../constants/financeConstants";

export const financeIntegrationSources = {
  posCashSale: "pos.cash-sale",
  posCardSale: "pos.card-sale",
  purchasePayable: "purchases.payable",
  supplierPayment: "suppliers.payment",
  invoiceReceivable: "invoice.receivable",
  bankStatement: "bank.statement",
  cashOperation: "cash.operation",
  ledgerJournal: "ledger.journal",
};

export const buildTransactionFromPosPayment = ({
  payment,
  accountId,
  branch = "",
  currentUser = "",
} = {}) => ({
  type: TRANSACTION_TYPE.INCOME,
  cashDirection: CASH_DIRECTION.IN,
  amount: payment?.amount || 0,
  currency: payment?.currency || "UZS",
  accountId,
  partnerType: "Customer",
  counterparty: payment?.customerName || "POS mijoz",
  category: "Mahsulot savdosi",
  source: payment?.method === "cash" ? FINANCE_SOURCE.POS : FINANCE_SOURCE.PAYMENTS,
  sourceModule: financeIntegrationSources.posCashSale,
  sourceId: payment?.id || "",
  description: payment?.description || "POS savdo tushumi",
  branch,
  submit: true,
  status: TRANSACTION_STATUS.PENDING,
});

export const buildPayableFromPurchase = (purchase = {}) => ({
  id: purchase.id ? `payable-${purchase.id}` : "",
  supplier: purchase.supplierName || purchase.supplier || "",
  bill: purchase.documentNumber || purchase.invoiceNumber || "",
  total: purchase.total || 0,
  paid: purchase.paid || 0,
  balance: Math.max(Number(purchase.total || 0) - Number(purchase.paid || 0), 0),
  dueDate: purchase.dueDate || "",
  status: purchase.status || "pending",
  sourceModule: financeIntegrationSources.purchasePayable,
  sourceId: purchase.id || "",
});

export const buildReceivableFromInvoice = (invoice = {}) => ({
  id: invoice.id ? `receivable-${invoice.id}` : "",
  customer: invoice.customer || "",
  invoice: invoice.number || invoice.id || "",
  total: invoice.amount || invoice.total || 0,
  paid: invoice.paid || 0,
  balance: Math.max(Number(invoice.amount || invoice.total || 0) - Number(invoice.paid || 0), 0),
  dueDate: invoice.dueDate || "",
  status: invoice.status || "open",
  sourceModule: financeIntegrationSources.invoiceReceivable,
  sourceId: invoice.id || "",
});

export const financeIntegrationContracts = [
  {
    module: "POS",
    flow: "Naqd savdo -> Kassa hisobi",
    adapter: "buildTransactionFromPosPayment",
    required: ["payment.id", "payment.amount", "accountId"],
  },
  {
    module: "POS",
    flow: "Karta/bank to'lovi -> Bank hisobi",
    adapter: "buildTransactionFromPosPayment",
    required: ["payment.id", "payment.amount", "accountId", "payment.method"],
  },
  {
    module: "Xaridlar",
    flow: "Xarid invoice -> Kreditor qarzdorlik",
    adapter: "buildPayableFromPurchase",
    required: ["purchase.id", "purchase.supplierName", "purchase.total"],
  },
  {
    module: "Invoice",
    flow: "Hisob-faktura -> Debitor qarzdorlik",
    adapter: "buildReceivableFromInvoice",
    required: ["invoice.id", "invoice.customer", "invoice.total"],
  },
];
