import { financeAccounts } from "./financeAccounts";
import { financeCurrencies } from "./financeCurrencies";
import { financeSettings } from "./financeSettings";
import { financeTransactions } from "./financeTransactions";

export const initialFinanceState = {
  transactions: financeTransactions,
  accounts: financeAccounts,
  currencies: financeCurrencies,
  settings: financeSettings,
  journals: [],
  receivables: [],
  payables: [],
  invoices: [],
  paymentOrders: [],
  cashSessions: [],
  reconciliation: {
    system: [],
    bank: [],
    status: "open",
    closedAt: "",
    closedBy: "",
    history: [],
  },
  periods: [],
  closingChecklist: [],
  costAccounting: {
    method: financeSettings.selectedCostMethod,
    inventoryValuation: 0,
    cogs: 0,
    purchaseCost: 0,
    transport: 0,
    customs: 0,
    additionalExpenses: 0,
    quantity: 0,
  },
  taxReports: [],
  aiInsights: [],
  edgeCases: [],
  budgets: [],
  transfers: [],
  reminders: [],
  notifications: [],
  auditLog: [],
};
