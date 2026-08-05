import { useState } from "react";
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
import Budget from "./Budget/Budget";
import CashFlow from "./CashFlow/CashFlow";
import ChartOfAccounts from "./ChartOfAccounts/ChartOfAccounts";
import CostAccounting from "./CostAccounting/CostAccounting";
import CurrencyManagement from "./CurrencyManagement/CurrencyManagement";
import Expenses from "./Expenses/Expenses";
import AccountManagement from "./AccountManagement/AccountManagement";
import FinanceErrorBoundary from "../components/FinanceErrorBoundary/FinanceErrorBoundary";
import FinanceAnalytics from "./FinanceAnalytics/FinanceAnalytics";
import FinanceDashboard from "./FinanceDashboard/FinanceDashboard";
import FinanceHub from "./FinanceHub";
import FinanceReports from "./FinanceReports/FinanceReports";
import FinanceSettings from "./FinanceSettings/FinanceSettings";
import FinancialClosing from "./FinancialClosing/FinancialClosing";
import GeneralLedger from "./GeneralLedger/GeneralLedger";
import Income from "./Income/Income";
import Invoices from "./Invoices/Invoices";
import Journals from "./Journals/Journals";
import PaymentOrders from "./PaymentOrders/PaymentOrders";
import ProfitAndLoss from "./ProfitAndLoss/ProfitAndLoss";
import CashFlowStatement from "./CashFlowStatement/CashFlowStatement";
import TaxManagement from "./TaxManagement/TaxManagement";
import TaxReports from "./TaxReports/TaxReports";
import TransactionDetails from "./TransactionDetails/TransactionDetails";
import Transactions from "./Transactions/Transactions";

import "./Finance.scss";

const TrialBalance = ({ controller }) => {
  const rows = controller.state.accounts.map((account) => {
    const journalRows = controller.state.journals.flatMap((journal) =>
      journal.rows
        .filter((row) => row.accountId === account.id)
        .map((row) => ({ ...row, journalStatus: journal.status })),
    );
    const periodDebit = journalRows.reduce((sum, row) => sum + Number(row.debit || 0), 0);
    const periodCredit = journalRows.reduce((sum, row) => sum + Number(row.credit || 0), 0);
    const opening = Number(account.openingBalance || 0);
    const closing = opening + periodDebit - periodCredit;

    return { account, opening, periodDebit, periodCredit, closing };
  });
  const totalDebit = rows.reduce((sum, row) => sum + row.periodDebit, 0);
  const totalCredit = rows.reduce((sum, row) => sum + row.periodCredit, 0);

  return (
    <section className="finance-view">
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Sinov balansi</span>
            <h2>Hisoblar bo'yicha debit va kredit</h2>
          </div>
          <StatusBadge
            status={Math.round(totalDebit) === Math.round(totalCredit) ? "success" : "danger"}
            label={`Farq ${Math.abs(totalDebit - totalCredit).toLocaleString("uz-UZ")}`}
          />
        </div>
        <div className="finance-filters">
          <label><span>Sana boshidan</span><input type="date" /></label>
          <label><span>Sana oxiri</span><input type="date" /></label>
          <label><span>Filial</span><select><option>Barchasi</option></select></label>
          <label><span>Valyuta</span><select><option>Barchasi</option>{controller.state.currencies.map((item) => <option key={item.code}>{item.code}</option>)}</select></label>
        </div>
        <div className="ledger-table">
          {rows.map((row) => (
            <article key={row.account.id}>
              <div>
                <strong>{row.account.code} | {row.account.name}</strong>
                <span>Boshlang'ich qoldiq: {row.opening.toLocaleString("uz-UZ")}</span>
              </div>
              <b>{row.periodDebit.toLocaleString("uz-UZ")}</b>
              <b>{row.periodCredit.toLocaleString("uz-UZ")}</b>
              <StatusBadge status={row.closing >= 0 ? "success" : "warning"} label={row.closing.toLocaleString("uz-UZ")} />
              <span>{row.account.currency}</span>
            </article>
          ))}
        </div>
        <div className="finance-actions-row">
          <button
            type="button"
            className="finance-button"
            onClick={() => controller.actions.exportFinanceCsv("trial-balance", [["Hisob", "Davr debeti", "Davr krediti", "Yakuniy"], ...rows.map((row) => [row.account.code, row.periodDebit, row.periodCredit, row.closing])])}
          >
            Excel/CSV eksport
          </button>
          <button type="button" className="finance-button">PDF eksport</button>
        </div>
      </section>
    </section>
  );
};

const DoubleEntry = ({ controller }) => (
  <section className="finance-view">
    <Journals controller={controller} />
  </section>
);

const DebtView = ({ controller, kind = "customer" }) => {
  const isCustomer = kind === "customer";
  const rows = isCustomer ? controller.state.receivables : controller.state.payables;

  return (
    <section className="finance-view">
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Qarzdorlik</span>
            <h2>{isCustomer ? "Mijoz kreditlari" : "Yetkazib beruvchi kreditlari"}</h2>
          </div>
        </div>
        <div className="finance-filters finance-filters--compact">
          <label><span>Qidirish</span><input placeholder={isCustomer ? "Mijoz nomi yoki telefon" : "Supplier nomi yoki hujjat"} /></label>
          <label><span>Holat</span><select><option>Barchasi</option><option>Ochiq</option><option>Muddati o'tgan</option><option>Qisman</option></select></label>
          <button type="button" className="finance-button">Filtrlarni tozalash</button>
        </div>
        {rows.length ? (
          <div className="finance-table">
            {rows.map((item) => (
              <article key={item.id}>
                <div>
                  <strong>{isCustomer ? item.customer : item.supplier}</strong>
                  <span>{isCustomer ? item.invoice : item.bill} | muddati {item.dueDate}</span>
                </div>
                <b>{Number(item.total || 0).toLocaleString("uz-UZ")}</b>
                <b>{Number(item.paid || 0).toLocaleString("uz-UZ")}</b>
                <b>{Number(item.balance || 0).toLocaleString("uz-UZ")}</b>
                <StatusBadge status={item.status === "overdue" ? "danger" : "success"} label={item.status} />
              </article>
            ))}
          </div>
        ) : (
          <div className="finance-empty">
            {isCustomer ? "Hozircha mijoz kreditlari mavjud emas" : "Hozircha yetkazib beruvchi kreditlari mavjud emas"}
            <button type="button" className="finance-button is-primary">Birinchi yozuvni yarating</button>
          </div>
        )}
      </section>
    </section>
  );
};

const navigationGroups = [
  {
    id: "management",
    title: "Boshqaruv",
    items: [
      { id: "hub", label: "Moliya Hub", icon: WalletCards },
      { id: "dashboard", label: "Moliya dashboard", icon: WalletCards },
    ],
  },
  {
    id: "cash",
    title: "Pul harakati",
    items: [
      { id: "income", label: "Daromadlar", icon: TrendingUp },
      { id: "expenses", label: "Xarajatlar", icon: TrendingDown },
      { id: "cash-flow", label: "Pul oqimi", icon: CircleDollarSign },
      { id: "transactions", label: "Tranzaksiyalar", icon: Receipt },
      { id: "invoices", label: "Hisob-faktura", icon: FileText },
    ],
  },
  {
    id: "accounting",
    title: "Buxgalteriya",
    items: [
      { id: "ledger", label: "Bosh kitob", icon: BookOpenCheck },
      { id: "journals", label: "Jurnallar", icon: FileText },
      { id: "accounts", label: "Hisoblar rejasi", icon: ListChecks },
      { id: "trial-balance", label: "Sinov balansi", icon: Scale },
      { id: "double-entry", label: "Ikkiyoqlama yozuv", icon: ClipboardCheck },
    ],
  },
  {
    id: "debt",
    title: "Qarzdorlik",
    items: [
      { id: "receivables", label: "Debitor", icon: Receipt },
      { id: "payables", label: "Kreditor", icon: Banknote },
      { id: "customer-credit", label: "Mijoz krediti", icon: TrendingUp },
      { id: "supplier-credit", label: "Yetkazuvchi krediti", icon: TrendingDown },
    ],
  },
  {
    id: "bank",
    title: "Bank va kassa",
    items: [
      { id: "bank-accounts", label: "Bank hisoblari", icon: Landmark },
      { id: "cash-accounts", label: "Kassa hisoblari", icon: CircleDollarSign },
      { id: "reconciliation", label: "Bank sverkasi", icon: ShieldCheck },
      { id: "payment-orders", label: "To'lov topshiriqlari", icon: FileClock },
    ],
  },
  {
    id: "reports",
    title: "Hisobotlar",
    items: [
      { id: "profit-loss", label: "Foyda va zarar", icon: BarChart3 },
      { id: "balance-sheet", label: "Balans", icon: Scale },
      { id: "cash-flow-statement", label: "Pul oqimi hisoboti", icon: FileText },
      { id: "tax-reports", label: "Soliq hisobotlari", icon: BadgePercent },
      { id: "reports", label: "Moliyaviy hisobotlar", icon: BarChart3 },
      { id: "analytics", label: "Tahlil", icon: BarChart3 },
    ],
  },
  {
    id: "control",
    title: "Boshqaruv",
    items: [
      { id: "closing", label: "Period yopish", icon: CalendarCheck2 },
      { id: "cost", label: "Tannarx", icon: Coins },
      { id: "tax", label: "Soliq engine", icon: BadgePercent },
      { id: "currency", label: "Valyuta engine", icon: CircleDollarSign },
      { id: "budget", label: "Budget reja", icon: ListChecks },
      { id: "approvals", label: "Tasdiqlar", icon: ShieldCheck },
      { id: "audit", label: "Audit jurnali", icon: FileClock },
      { id: "settings", label: "Moliya sozlamalari", icon: Settings },
      { id: "ai", label: "AI Moliya", icon: Bot },
    ],
  },
];

const segmentToView = {
  "": "hub",
  overview: "dashboard",
  transactions: "transactions",
  invoices: "invoices",
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
  analytics: "analytics",
  budget: "budget",
  settings: "settings",
  ai: "ai",
};

const viewToPath = {
  hub: "",
  dashboard: "overview",
  transactions: "transactions",
  invoices: "invoices",
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
  analytics: "analytics",
  budget: "budget",
  settings: "settings",
  ai: "ai",
};

const Finance = () => {
  const controller = useFinanceController();
  const location = useLocation();
  const navigate = useNavigate();
  const [professionalOpen, setProfessionalOpen] = useState(false);
  const segment = location.pathname.replace(/^\/finance\/?/, "").split("/")[0] || "";
  const activeView = Object.prototype.hasOwnProperty.call(segmentToView, segment)
    ? segmentToView[segment]
    : "not-found";
  const isHubRoute = activeView === "hub";

  const navigateView = (view) => {
    if (controller.activeModal) {
      controller.actions.closeModal();
    }
    navigate(`/finance/${viewToPath[view] || ""}`.replace(/\/$/, ""));
  };

  const openQuickAction = (action) => {
    if (action === "income") {
      controller.actions.setActiveModal("create-income");
      navigateView("income");
      return;
    }

    if (action === "expense") {
      controller.actions.setActiveModal("create-expense");
      navigateView("expenses");
      return;
    }

    if (action === "invoice") {
      controller.actions.setActiveModal("create-invoice");
      navigateView("invoices");
      return;
    }

    controller.actions.setActiveModal("create-transaction");
    navigateView("transactions");
  };

  const props = { controller, onNavigate: navigateView };
  const views = {
    hub: (
      <FinanceHub
        controller={controller}
        onCreateTransaction={() => {
          controller.actions.setActiveModal("create-transaction");
          navigateView("transactions");
        }}
      />
    ),
    dashboard: <FinanceDashboard {...props} />,
    transactions: <Transactions {...props} />,
    invoices: <Invoices {...props} />,
    "transaction-details": <TransactionDetails {...props} />,
    ledger: <GeneralLedger {...props} />,
    journals: <Journals {...props} />,
    accounts: <ChartOfAccounts {...props} />,
    "trial-balance": <TrialBalance {...props} />,
    "double-entry": <DoubleEntry {...props} />,
    "cash-flow": <CashFlow {...props} />,
    "cash-flow-statement": <CashFlowStatement {...props} />,
    "profit-loss": <ProfitAndLoss {...props} />,
    "balance-sheet": <BalanceSheet {...props} />,
    expenses: <Expenses {...props} />,
    income: <Income {...props} />,
    receivables: <AccountsReceivable {...props} />,
    payables: <AccountsPayable {...props} />,
    "customer-credit": <DebtView {...props} kind="customer" />,
    "supplier-credit": <DebtView {...props} kind="supplier" />,
    "bank-accounts": <AccountManagement {...props} kind="bank" />,
    "cash-accounts": <AccountManagement {...props} kind="cash" />,
    "payment-orders": <PaymentOrders {...props} />,
    reconciliation: <BankReconciliation {...props} />,
    closing: <FinancialClosing {...props} />,
    cost: <CostAccounting {...props} />,
    tax: <TaxManagement {...props} />,
    "tax-reports": <TaxReports {...props} />,
    currency: <CurrencyManagement {...props} />,
    approvals: <Approvals {...props} />,
    audit: <AuditLog {...props} />,
    reports: <FinanceReports {...props} />,
    analytics: <FinanceAnalytics {...props} />,
    budget: <Budget {...props} />,
    settings: <FinanceSettings {...props} />,
    ai: <AIFinance {...props} />,
    "not-found": (
      <section className="finance-empty">
        <strong>Sahifa topilmadi</strong>
        <span>Bu moliya yo'nalishi mavjud emas yoki noto'g'ri manzil kiritilgan.</span>
        <button type="button" className="finance-button is-primary" onClick={() => navigate("/finance")}>
          Moliya Hub
        </button>
      </section>
    ),
  };

  return (
    <main className="zenix-finance">
      {!isHubRoute ? (
        <>
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
            onExport={() => controller.actions.exportFinanceCsv("moliya-tranzaksiyalari", [
              ["Sana", "Hujjat", "Hamkor", "Summa", "Valyuta", "Holat"],
              ...controller.filteredTransactions.map((item) => [item.date, item.reference, item.counterparty, item.amount, item.currency, item.status]),
            ])}
            onQuickAction={openQuickAction}
            summary={controller.summary}
            aiInsights={controller.state.aiInsights.filter((item) => item.status === "open")}
            unreadCount={controller.state.notifications.filter((item) => !item.read).length}
          />

          <FinanceNavigation groups={navigationGroups} activeView={activeView} onNavigate={navigateView} />

          <button type="button" className="finance-permission-note finance-permission-note--button" onClick={() => setProfessionalOpen(true)}>
            <StatusBadge status="warning" label="Professional nazorat" />
            Soliq, QQS, double-entry va period yopish uchun professional tekshiruv kerak.
          </button>
        </>
      ) : null}

      {professionalOpen && (
        <div className="finance-drawer" role="dialog" aria-modal="true" aria-label="Professional nazorat">
          <section>
            <h2>Professional nazorat</h2>
            <p>
              Soliq, QQS, ikkiyoqlama yozuv, audit va period yopish real ishga tushirishdan oldin malakali buxgalter va mahalliy qonunchilik mutaxassisi tomonidan tekshirilishi kerak.
            </p>
            <button type="button" className="finance-button is-primary" onClick={() => setProfessionalOpen(false)}>
              Tushunarli
            </button>
          </section>
        </div>
      )}

      <FinanceErrorBoundary boundaryKey={activeView} onHome={() => navigateView("dashboard")}>
        {views[activeView] || views.dashboard}
      </FinanceErrorBoundary>

      {controller.toast && (
        <div className="zenix-finance__toast" role="status">
          {controller.toast}
        </div>
      )}
    </main>
  );
};

export default Finance;
