export const FINANCE_ROLE = {
  OWNER: "owner",
  CHIEF_ACCOUNTANT: "chiefAccountant",
  ACCOUNTANT: "accountant",
  CASHIER: "cashier",
  MANAGER: "manager",
  AUDITOR: "auditor",
  VIEWER: "viewer",
};

export const FINANCE_ACTION = {
  VIEW: "view",
  CREATE: "create",
  SUBMIT: "submit",
  APPROVE: "approve",
  REJECT: "reject",
  POST: "post",
  REVERSE: "reverse",
  CLOSE: "close",
  REOPEN: "reopen",
  SETTINGS: "settings",
  CURRENCY: "currency",
  TAX: "tax",
  COST: "cost",
  ARCHIVE: "archive",
  AUDIT: "audit",
};

export const TRANSACTION_STATUS = {
  DRAFT: "Draft",
  PENDING: "Pending",
  APPROVED: "Approved",
  POSTED: "Posted",
  REVERSED: "Reversed",
  CANCELLED: "Cancelled",
  ARCHIVED: "Archived",
};

export const TRANSACTION_TYPE = {
  INCOME: "income",
  EXPENSE: "expense",
  TRANSFER: "transfer",
  REFUND: "refund",
  ADJUSTMENT: "adjustment",
  OPENING: "opening",
  EXCHANGE: "exchange",
};

export const CASH_DIRECTION = {
  IN: "in",
  OUT: "out",
  NONE: "none",
};

export const ACCOUNT_KIND = {
  CASH: "cash",
  BANK: "bank",
  RECEIVABLE: "receivable",
  PAYABLE: "payable",
  INVENTORY: "inventory",
  TAX: "tax",
  EQUITY: "equity",
  INCOME: "income",
  EXPENSE: "expense",
  FX: "fx",
};

export const ACCOUNT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ARCHIVED: "archived",
};

export const PAYMENT_ORDER_STATUS = {
  DRAFT: "Draft",
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  READY: "Ready",
  SENT: "SentToBank",
  PAID: "Paid",
  CANCELLED: "Cancelled",
  OVERDUE: "Overdue",
};

export const RECONCILIATION_STATUS = {
  OPEN: "open",
  CLOSED: "closed",
  FULL_MATCH: "matched",
  PARTIAL_MATCH: "partial",
  UNMATCHED: "unmatched",
  DUPLICATE: "duplicate",
  MANUAL_MATCH: "manual",
  NEEDS_REVIEW: "review",
};

export const FINANCE_SOURCE = {
  MANUAL: "Manual",
  POS: "POS",
  WAREHOUSE: "Warehouse",
  CRM: "CRM",
  PURCHASES: "Purchases",
  SUPPLIERS: "Suppliers",
  PAYMENTS: "Payments",
  AUTOMATIC: "Automatic",
};

export const DEFAULT_CURRENCY = "UZS";

export const transactionStatusOrder = [
  TRANSACTION_STATUS.DRAFT,
  TRANSACTION_STATUS.PENDING,
  TRANSACTION_STATUS.APPROVED,
  TRANSACTION_STATUS.POSTED,
  TRANSACTION_STATUS.REVERSED,
  TRANSACTION_STATUS.CANCELLED,
  TRANSACTION_STATUS.ARCHIVED,
];
