import {
  AlertTriangle,
  Banknote,
  CircleDollarSign,
  Landmark,
  Receipt,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

import FinanceKpiCard from "../../components/FinanceKpiCard/FinanceKpiCard";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { formatMoney } from "../../utils/financeFormatters";

const FinanceDashboard = ({ controller, onNavigate }) => {
  const { summary, state } = controller;
  const currentPeriod = state.periods.find((item) => item.id === state.settings.currentPeriodId);

  const kpis = [
    { label: "Jami pul qoldig'i", value: formatMoney(summary.totalBalance), hint: "Bank + kassa + posted flow", icon: Wallet, tone: "blue", view: "cash-flow" },
    { label: "Daromad", value: formatMoney(summary.income), hint: "Accrual revenue", icon: TrendingUp, tone: "green", view: "income" },
    { label: "Xarajat", value: formatMoney(summary.expenses), hint: "Expense + cash paid", icon: TrendingDown, tone: "orange", view: "expenses" },
    { label: "Sof foyda", value: formatMoney(summary.netProfit), hint: "P&L preview", icon: CircleDollarSign, tone: "purple", view: "profit-loss" },
    { label: "AR", value: formatMoney(summary.receivable), hint: `${formatMoney(summary.overdue)} overdue`, icon: Receipt, tone: "red", view: "receivables" },
    { label: "AP", value: formatMoney(summary.payable), hint: "Upcoming payments", icon: Banknote, tone: "orange", view: "payables" },
    { label: "Bank qoldiq", value: formatMoney(summary.bank), hint: `${summary.unreconciled} unreconciled`, icon: Landmark, tone: "blue", view: "reconciliation" },
    { label: "Tax payable", value: formatMoney(summary.taxPayable), hint: "Validation preview", icon: ShieldAlert, tone: "red", view: "tax" },
  ];

  return (
    <section className="finance-view">
      <div className="finance-kpi-grid">
        {kpis.map((item) => (
          <FinanceKpiCard
            key={item.label}
            {...item}
            onClick={() => onNavigate(item.view)}
          />
        ))}
      </div>

      <div className="finance-grid finance-grid--wide">
        <section className="finance-panel">
          <div className="finance-panel__head">
            <div>
              <span>AI forecast</span>
              <h2>Cash flow va foyda bashorati</h2>
            </div>
            <StatusBadge status={summary.healthScore > 70 ? "success" : "warning"} label={`${summary.healthScore}/100 health`} />
          </div>
          <div className="finance-forecast">
            <article>
              <strong>{formatMoney(summary.cashFlow + 8200000)}</strong>
              <span>7 kunlik cash flow forecast</span>
              <meter min="0" max="100" value="74" />
            </article>
            <article>
              <strong>{formatMoney(summary.netProfit + 5100000)}</strong>
              <span>Profit forecast</span>
              <meter min="0" max="100" value="68" />
            </article>
            <article>
              <strong>{currentPeriod?.label}</strong>
              <span>Current financial period</span>
              <StatusBadge status={currentPeriod?.status === "open" ? "success" : "warning"} label={currentPeriod?.status} />
            </article>
          </div>
        </section>

        <section className="finance-panel">
          <div className="finance-panel__head">
            <div>
              <span>Risk notifications</span>
              <h2>AI va audit signallari</h2>
            </div>
            <AlertTriangle size={18} />
          </div>
          <div className="finance-list">
            {state.aiInsights.filter((item) => item.status === "open").slice(0, 4).map((item) => (
              <article key={item.id}>
                <StatusBadge status={item.severity} label={item.type} />
                <strong>{item.title}</strong>
                <span>{item.message}</span>
                <button type="button" onClick={() => controller.actions.runAiAction(item.id, item.action)}>
                  {item.action}
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="finance-grid">
        <section className="finance-panel">
          <div className="finance-panel__head">
            <div>
              <span>Recent transactions</span>
              <h2>So'nggi harakatlar</h2>
            </div>
          </div>
          <div className="finance-list">
            {controller.filteredTransactions.slice(0, 5).map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => {
                  controller.actions.setSelectedTransactionId(item.id);
                  onNavigate("transaction-details");
                }}
              >
                <strong>{item.reference}</strong>
                <span>{item.counterparty} · {formatMoney(item.amount, item.currency)}</span>
                <StatusBadge status={item.status} />
              </button>
            ))}
          </div>
        </section>

        <section className="finance-panel">
          <div className="finance-panel__head">
            <div>
              <span>Upcoming payments</span>
              <h2>Yaqin to'lovlar</h2>
            </div>
          </div>
          <div className="finance-list">
            {state.payables.map((item) => (
              <article key={item.id}>
                <strong>{item.supplier}</strong>
                <span>{item.bill} · {item.dueDate}</span>
                <b>{formatMoney(item.balance)}</b>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
};

export default FinanceDashboard;
