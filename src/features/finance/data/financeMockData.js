import { financeAccounts } from "./financeAccounts";
import { financeCurrencies } from "./financeCurrencies";
import { financeSettings } from "./financeSettings";
import { financeTransactions } from "./financeTransactions";

export const initialFinanceState = {
  transactions: financeTransactions,
  accounts: financeAccounts,
  currencies: financeCurrencies,
  settings: financeSettings,
  journals: [
    {
      id: "JRN-202607220908-001",
      date: "2026-07-22",
      reference: "TRX-202607220901-AA01",
      source: "Automatic",
      description: "POS tushumi uchun avtomatik journal",
      status: "Posted",
      createdBy: "system",
      approvedBy: "accountant.zenix",
      rows: [
        { accountId: "1010", debit: 24800000, credit: 0 },
        { accountId: "4000", debit: 0, credit: 24800000 },
      ],
      audit: [{ at: "2026-07-22T09:08:00.000Z", by: "system", event: "Automatic journal posted" }],
    },
    {
      id: "JRN-202607211730-002",
      date: "2026-07-21",
      reference: "INV-2397",
      source: "Manual",
      description: "Accrual receivable journal",
      status: "Approved",
      createdBy: "accountant.zenix",
      approvedBy: "chief.accountant",
      rows: [
        { accountId: "1200", debit: 16800000, credit: 0 },
        { accountId: "4000", debit: 0, credit: 16800000 },
      ],
      audit: [{ at: "2026-07-21T17:30:00.000Z", by: "chief.accountant", event: "Approved" }],
    },
  ],
  receivables: [
    { id: "AR-001", customer: "Nur Retail", invoice: "INV-2397", total: 16800000, paid: 4200000, balance: 12600000, dueDate: "2026-07-25", status: "open" },
    { id: "AR-002", customer: "Ziyo Market", invoice: "INV-2388", total: 18500000, paid: 0, balance: 18500000, dueDate: "2026-07-18", status: "overdue" },
  ],
  payables: [
    { id: "AP-001", supplier: "Logistika Servis", bill: "BILL-781", total: 7200000, paid: 0, balance: 7200000, dueDate: "2026-07-28", status: "pending" },
    { id: "AP-002", supplier: "Import Partner LLC", bill: "PO-884", total: 15800000, paid: 8000000, balance: 7800000, dueDate: "2026-07-30", status: "partial" },
  ],
  reconciliation: {
    system: [
      { id: "SYS-001", date: "2026-07-22", description: "POS tushumi", amount: 24800000, matched: "BNK-001" },
      { id: "SYS-002", date: "2026-07-22", description: "Transport payment", amount: -7200000, matched: "" },
      { id: "SYS-003", date: "2026-07-21", description: "Bank fee", amount: -180000, matched: "" },
    ],
    bank: [
      { id: "BNK-001", date: "2026-07-22", description: "Terminal settlement", amount: 24800000, matched: "SYS-001" },
      { id: "BNK-002", date: "2026-07-22", description: "Logistika Servis", amount: -7200000, matched: "" },
      { id: "BNK-003", date: "2026-07-21", description: "Bank commission", amount: -180000, matched: "" },
    ],
    history: [{ at: "2026-07-22T12:00:00.000Z", by: "accountant.zenix", event: "1 ta automatic match topildi" }],
  },
  periods: [
    { id: "2026-06", label: "Iyun 2026", type: "Monthly", status: "closed", lockedBy: "owner.zenix", closedAt: "2026-07-02T18:00:00.000Z", reopenReason: "" },
    { id: "2026-07", label: "Iyul 2026", type: "Monthly", status: "open", lockedBy: "", closedAt: "", reopenReason: "" },
  ],
  closingChecklist: [
    { id: "posted", label: "Barcha yozuvlar posted", complete: false },
    { id: "bank", label: "Bank reconciliation yakunlangan", complete: false },
    { id: "difference", label: "Open difference yo'q", complete: true },
    { id: "tax", label: "Tax validation tugagan", complete: true },
    { id: "approval", label: "Pending approval yo'q", complete: false },
  ],
  costAccounting: {
    method: financeSettings.selectedCostMethod,
    inventoryValuation: 88000000,
    cogs: 46200000,
    purchaseCost: 42000000,
    transport: 2100000,
    customs: 3700000,
    additionalExpenses: 950000,
    quantity: 240,
  },
  taxReports: [
    { id: "TAX-2026-07", name: "Iyul QQS preview", taxableBase: 41600000, payable: 4992000, status: "validation" },
  ],
  aiInsights: [
    { id: "AI-001", type: "fraud", severity: "danger", title: "Duplicate payment xavfi", message: "EXP-312 va BANK-773 summasi bir xil, counterparty yaqin.", status: "open", action: "review transaction", targetId: "TRX-202607191120-EE05" },
    { id: "AI-002", type: "cash-flow", severity: "warning", title: "Cash flow shortage", message: "7 kun ichida 18.4 mln so'm payable chiqimi bor, AR muddati kechikmoqda.", status: "open", action: "create reminder", targetId: "AR-002" },
    { id: "AI-003", type: "profit", severity: "success", title: "Profit forecast", message: "Iyul yakunida net profit 31-36 mln so'm oralig'ida bo'lishi kutilmoqda.", status: "open", action: "mark resolved", targetId: "" },
    { id: "AI-004", type: "currency", severity: "warning", title: "Currency risk", message: "USD kursi o'sishi import payable bo'yicha 126 ming so'm loss yaratadi.", status: "open", action: "open approval", targetId: "USD" },
  ],
  edgeCases: [
    { id: "EC-NEG-CASH", type: "negative cash", severity: "danger", message: "Kassa chiqimi qoldiqdan oshsa bloklanadi.", status: "open", resolution: "Bank hisobdan to'lovga o'tkazish" },
    { id: "EC-PARTIAL", type: "partial payment", severity: "warning", message: "PO-884 qisman to'langan, qoldiq AP sifatida saqlangan.", status: "open", resolution: "Payment schedule yaratish" },
    { id: "EC-OVERPAY", type: "overpayment", severity: "warning", message: "Ortiqcha to'lov customer credit sifatida ushlanadi.", status: "open", resolution: "Credit memo ochish" },
    { id: "EC-TAX-DIFF", type: "tax difference", severity: "warning", message: "Preferential tax group buxgalter tekshiruvini talab qiladi.", status: "open", resolution: "Tax adjustment journal" },
  ],
  notifications: [
    { id: "NTF-001", tone: "warning", text: "3 ta tranzaksiya reconciliation kutmoqda.", read: false },
    { id: "NTF-002", tone: "danger", text: "Fiskal receipt integratsiyasi xato holatda.", read: false },
  ],
  auditLog: [
    { id: "AUD-001", at: "2026-07-22T09:08:00.000Z", by: "accountant.zenix", event: "Posted TRX-202607220901-AA01", area: "transaction" },
    { id: "AUD-002", at: "2026-07-22T12:00:00.000Z", by: "accountant.zenix", event: "Bank reconciliation auto match", area: "reconciliation" },
  ],
};
