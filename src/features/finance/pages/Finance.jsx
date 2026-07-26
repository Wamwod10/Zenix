import { useLocation, useNavigate } from "react-router-dom";
import {
  BadgePercent,
  Banknote,
  BarChart3,
  BookOpenCheck,
  Bot,
  CalendarCheck2,
  CircleDollarSign,
  ClipboardCheck,
  Coins,
  FileClock,
  FileText,
  Landmark,
  ListChecks,
  Receipt,
  Scale,
  Settings,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import FinanceHeader from "../components/FinanceHeader/FinanceHeader";
import FinanceNavigation from "../components/FinanceNavigation/FinanceNavigation";
import StatusBadge from "../components/StatusBadge/StatusBadge";
import useFinanceController from "../hooks/useFinanceController";
import AccountsPayable from "./AccountsPayable/AccountsPayable";
import AccountsReceivable from "./AccountsReceivable/AccountsReceivable";
import AIFinance from "./AIFinance/AIFinance";
import Approvals from "./Approvals/Approvals";
import AuditLog from "./AuditLog/AuditLog";
import BalanceSheet from "./BalanceSheet/BalanceSheet";
import BankReconciliation from "./BankReconciliation/BankReconciliation";
import CashFlow from "./CashFlow/CashFlow";
import ChartOfAccounts from "./ChartOfAccounts/ChartOfAccounts";
import CostAccounting from "./CostAccounting/CostAccounting";
import CurrencyManagement from "./CurrencyManagement/CurrencyManagement";
import Expenses from "./Expenses/Expenses";
import FinanceDashboard from "./FinanceDashboard/FinanceDashboard";
import FinanceReports from "./FinanceReports/FinanceReports";
import FinanceSettings from "./FinanceSettings/FinanceSettings";
import FinancialClosing from "./FinancialClosing/FinancialClosing";
import GeneralLedger from "./GeneralLedger/GeneralLedger";
import Income from "./Income/Income";
import Journals from "./Journals/Journals";
import ProfitAndLoss from "./ProfitAndLoss/ProfitAndLoss";
import TaxManagement from "./TaxManagement/TaxManagement";
import TransactionDetails from "./TransactionDetails/TransactionDetails";
import Transactions from "./Transactions/Transactions";

import "./Finance.scss";

const navigationGroups = [
  { id: "management", title: "Boshqaruv", items: [{ id: "dashboard", label: "Finance Dashboard", icon: WalletCards }] },
  {
    id: "cash",
    title: "Pul harakati",
    items: [
      { id: "income", label: "Daromadlar", icon: TrendingUp },
      { id: "expenses", label: "Xarajatlar", icon: TrendingDown },
      { id: "cash-flow", label: "Cash Flow", icon: CircleDollarSign },
      { id: "transactions", label: "Tranzaksiyalar", icon: Receipt },
    ],
  },
  {
    id: "accounting",
    title: "Buxgalteriya",
    items: [
      { id: "ledger", label: "General Ledger", icon: BookOpenCheck },
      { id: "journals", label: "Journals", icon: FileText },
      { id: "accounts", label: "Chart of Accounts", icon: ListChecks },
      { id: "trial-balance", label: "Trial Balance", icon: Scale },
      { id: "double-entry", label: "Double Entry", icon: ClipboardCheck },
    ],
  },
  {
    id: "debt",
    title: "Qarzdorlik",
    items: [
      { id: "receivables", label: "Accounts Receivable", icon: Receipt },
      { id: "payables", label: "Accounts Payable", icon: Banknote },
      { id: "customer-credit", label: "Customer Credit", icon: TrendingUp },
      { id: "supplier-credit", label: "Supplier Credit", icon: TrendingDown },
    ],
  },
  {
    id: "bank",
    title: "Bank va kassa",
    items: [
      { id: "bank-accounts", label: "Bank Accounts", icon: Landmark },
      { id: "cash-accounts", label: "Cash Accounts", icon: CircleDollarSign },
      { id: "reconciliation", label: "Bank Reconciliation", icon: ShieldCheck },
      { id: "payment-orders", label: "Payment Orders", icon: FileClock },
    ],
  },
  {
    id: "reports",
    title: "Hisobotlar",
    items: [
      { id: "profit-loss", label: "Profit & Loss", icon: BarChart3 },
      { id: "balance-sheet", label: "Balance Sheet", icon: Scale },
      { id: "cash-flow-statement", label: "Cash Flow Statement", icon: FileText },
      { id: "tax-reports", label: "Tax Reports", icon: BadgePercent },
      { id: "reports", label: "Financial Reports", icon: BarChart3 },
    ],
  },
  {
    id: "control",
    title: "Boshqaruv",
    items: [
      { id: "closing", label: "Financial Closing", icon: CalendarCheck2 },
      { id: "cost", label: "Cost Accounting", icon: Coins },
      { id: "tax", label: "Tax Engine", icon: BadgePercent },
      { id: "currency", label: "Currency Engine", icon: CircleDollarSign },
      { id: "approvals", label: "Approvals", icon: ShieldCheck },
      { id: "audit", label: "Audit Log", icon: FileClock },
      { id: "settings", label: "Finance Settings", icon: Settings },
      { id: "ai", label: "AI Finance", icon: Bot },
    ],
  },
];

const segmentToView = {
  "": "dashboard",
  transactions: "transactions",
  "transaction-details": "transaction-details",
  ledger: "ledger",
  journals: "journals",
  accounts: "accounts",
  "trial-balance": "ledger",
  "double-entry": "journals",
  "cash-flow": "cash-flow",
  "cash-flow-statement": "cash-flow",
  "profit-loss": "profit-loss",
  "balance-sheet": "balance-sheet",
  expenses: "expenses",
  income: "income",
  receivables: "receivables",
  payables: "payables",
  "customer-credit": "receivables",
  "supplier-credit": "payables",
  reconciliation: "reconciliation",
  "bank-accounts": "cash-flow",
  "cash-accounts": "cash-flow",
  "payment-orders": "payables",
  closing: "closing",
  cost: "cost",
  tax: "tax",
  "tax-reports": "tax",
  currency: "currency",
  approvals: "approvals",
  audit: "audit",
  reports: "reports",
  settings: "settings",
  ai: "ai",
};

const viewToPath = {
  dashboard: "",
  transactions: "transactions",
  "transaction-details": "transaction-details",
  ledger: "ledger",
  journals: "journals",
  accounts: "accounts",
  "trial-balance": "trial-balance",
  "double-entry": "double-entry",
  "cash-flow": "cash-flow",
  "cash-flow-statement": "cash-flow-statement",
  "profit-loss": "profit-loss",
  "balance-sheet": "balance-sheet",
  expenses: "expenses",
  income: "income",
  receivables: "receivables",
  payables: "payables",
  "customer-credit": "customer-credit",
  "supplier-credit": "supplier-credit",
  reconciliation: "reconciliation",
  "bank-accounts": "bank-accounts",
  "cash-accounts": "cash-accounts",
  "payment-orders": "payment-orders",
  closing: "closing",
  cost: "cost",
  tax: "tax",
  "tax-reports": "tax-reports",
  currency: "currency",
  approvals: "approvals",
  audit: "audit",
  reports: "reports",
  settings: "settings",
  ai: "ai",
};

const Finance = () => {
  const controller = useFinanceController();
  const location = useLocation();
  const navigate = useNavigate();
  const segment = location.pathname.replace(/^\/finance\/?/, "").split("/")[0] || "";
  const activeView = segmentToView[segment] || "dashboard";

  const navigateView = (view) => {
    navigate(`/finance/${viewToPath[view] || ""}`.replace(/\/$/, ""));
  };

  const props = { controller, onNavigate: navigateView };
  const views = {
    dashboard: <FinanceDashboard {...props} />,
    transactions: <Transactions {...props} />,
    "transaction-details": <TransactionDetails {...props} />,
    ledger: <GeneralLedger {...props} />,
    journals: <Journals {...props} />,
    accounts: <ChartOfAccounts {...props} />,
    "cash-flow": <CashFlow {...props} />,
    "profit-loss": <ProfitAndLoss {...props} />,
    "balance-sheet": <BalanceSheet {...props} />,
    expenses: <Expenses {...props} />,
    income: <Income {...props} />,
    receivables: <AccountsReceivable {...props} />,
    payables: <AccountsPayable {...props} />,
    reconciliation: <BankReconciliation {...props} />,
    closing: <FinancialClosing {...props} />,
    cost: <CostAccounting {...props} />,
    tax: <TaxManagement {...props} />,
    currency: <CurrencyManagement {...props} />,
    approvals: <Approvals {...props} />,
    audit: <AuditLog {...props} />,
    reports: <FinanceReports {...props} />,
    settings: <FinanceSettings {...props} />,
    ai: <AIFinance {...props} />,
  };

  return (
    <main className="zenix-finance">
      <FinanceHeader
        search={controller.filters.search}
        onSearch={(value) => controller.actions.updateFilter("search", value)}
        role={controller.role}
        roles={controller.roles}
        onRoleChange={controller.actions.setRole}
        onCreate={() => {
          controller.actions.setActiveModal("create-transaction");
          navigateView("transactions");
        }}
        onExport={() => controller.actions.addNotification("Finance report export simulyatsiya qilindi.")}
        unreadCount={controller.state.notifications.filter((item) => !item.read).length}
      />

      <FinanceNavigation groups={navigationGroups} activeView={activeView} onNavigate={navigateView} />

      <section className="finance-permission-note">
        <StatusBadge status="warning" label="Professional preview" />
        Soliq, QQS, double-entry va period closing real ishga tushirishdan oldin malakali
        buxgalter va O'zbekiston qonunchiligi mutaxassisi tomonidan tasdiqlanishi kerak.
      </section>

      {views[activeView] || views.dashboard}

      {controller.toast && (
        <div className="zenix-finance__toast" role="status">
          {controller.toast}
        </div>
      )}
    </main>
  );
};

export default Finance;
