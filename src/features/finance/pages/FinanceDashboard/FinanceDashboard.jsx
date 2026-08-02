import { useMemo, useState } from "react";
import {
  Banknote,
  CircleDollarSign,
  FileText,
  MoveRight,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { FinanceTrendChart } from "../../components/FinanceCharts/FinanceCharts";
import FinanceKpiCard from "../../components/FinanceKpiCard/FinanceKpiCard";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { formatAiAction, formatMoney, formatStatusLabel } from "../../utils/financeFormatters";

const periodStarts = {
  today: () => new Date().toISOString().slice(0, 10),
  week: () => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().slice(0, 10);
  },
  month: () => new Date().toISOString().slice(0, 7),
  year: () => new Date().toISOString().slice(0, 4),
};

const FinanceDashboard = ({ controller, onNavigate }) => {
  const { summary, state } = controller;
  const [period, setPeriod] = useState("month");
  const posted = state.transactions.filter((item) => item.status === "Posted");
  const filteredFlow = useMemo(() => {
    const start = periodStarts[period]?.();
    if (!start) return posted;
    return posted.filter((item) => item.date?.startsWith(start) || item.date >= start);
  }, [period, posted]);
  const trendRows = filteredFlow.slice(-18).map((item) => ({
    label: item.date.slice(5),
    value: item.cashDirection === "out" ? -item.amount : item.amount,
  }));
  const recent = state.transactions.slice(0, 10);
  const upcomingPayments = state.payables
    .filter((item) => Number(item.balance || 0) > 0)
    .slice(0, 5);
  const aiInsights = state.aiInsights.filter((item) => item.status === "open").slice(0, 4);

  const kpis = [
    { label: "Jami pul qoldig'i", value: formatMoney(summary.totalBalance), hint: "Bank + kassa + posted oqim", icon: Wallet, tone: "blue", trend: "+4.8%", view: "cash-flow", sparkline: [22, 30, 27, 38, 45, 52] },
    { label: "Daromad", value: formatMoney(summary.income), hint: "Tasdiqlangan kirimlar", icon: TrendingUp, tone: "green", trend: "+12.4%", view: "income", sparkline: [18, 24, 30, 34, 46, 54] },
    { label: "Xarajat", value: formatMoney(summary.expenses), hint: "Tasdiqlangan chiqimlar", icon: TrendingDown, tone: "red", trend: "+6.1%", view: "expenses", sparkline: [20, 28, 26, 42, 39, 48] },
    { label: "Sof foyda", value: formatMoney(summary.netProfit), hint: "Daromad minus xarajat", icon: CircleDollarSign, tone: "purple", trend: "+9.2%", view: "profit-loss", sparkline: [16, 22, 35, 31, 44, 50] },
    { label: "Debitor", value: formatMoney(summary.receivable), hint: `${formatMoney(summary.overdue)} muddati o'tgan`, icon: Receipt, tone: "blue", trend: "-2.5%", view: "receivables", sparkline: [45, 44, 38, 40, 34, 30] },
    { label: "Kreditor", value: formatMoney(summary.payable), hint: "Yaqin majburiyatlar", icon: Banknote, tone: "red", trend: "+3.3%", view: "payables", sparkline: [26, 31, 29, 36, 35, 39] },
  ];

  const quickActions = [
    { label: "Daromad qo'shish", icon: TrendingUp, action: () => { controller.actions.setActiveModal("create-income"); onNavigate("income"); } },
    { label: "Xarajat qo'shish", icon: TrendingDown, action: () => { controller.actions.setActiveModal("create-expense"); onNavigate("expenses"); } },
    { label: "Pul o'tkazish", icon: MoveRight, action: () => { controller.actions.setActiveModal("create-transaction"); onNavigate("transactions"); } },
    { label: "Invoice yaratish", icon: FileText, action: () => { controller.actions.setActiveModal("create-invoice"); onNavigate("invoices"); } },
  ];

  return (
    <section className="finance-view finance-dashboard">
      <div className="finance-kpi-grid finance-kpi-grid--sticky">
        {kpis.map((item) => (
          <FinanceKpiCard key={item.label} {...item} onClick={() => onNavigate(item.view)} />
        ))}
      </div>

      <section className="finance-panel finance-quick-actions">
        {quickActions.map((item) => {
          const Icon = item.icon;
          return (
            <button type="button" key={item.label} onClick={item.action}>
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </section>

      <div className="finance-grid finance-grid--wide">
        <section className="finance-panel">
          <div className="finance-panel__head">
            <div>
              <span>Pul oqimi</span>
              <h2>Cash Flow</h2>
            </div>
            <div className="finance-segmented">
              {[
                ["today", "Bugun"],
                ["week", "Hafta"],
                ["month", "Oy"],
                ["year", "Yil"],
              ].map(([value, label]) => (
                <button type="button" key={value} className={period === value ? "is-active" : ""} onClick={() => setPeriod(value)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <FinanceTrendChart rows={trendRows} title="Kirim va chiqim harakati" />
        </section>

        <section className="finance-panel">
          <div className="finance-panel__head">
            <div>
              <span>ZENIX AI Moliya</span>
              <h2>AI Insight</h2>
            </div>
          </div>
          <div className="finance-list finance-list--compact">
            {aiInsights.length ? aiInsights.map((item) => (
              <article key={item.id}>
                <StatusBadge status={item.severity} label={item.type} />
                <strong>{item.title}</strong>
                <span>{item.message}</span>
                <button type="button" onClick={() => controller.actions.runAiAction(item.id, item.action)}>
                  {formatAiAction(item.action)}
                </button>
              </article>
            )) : (
              <article>
                <StatusBadge status="success" label="AI" />
                <strong>Pul oqimi barqaror</strong>
                <span>Qarzdorlik, xarajatlar va kutilgan kirimlar bo'yicha jiddiy signal yo'q.</span>
              </article>
            )}
          </div>
        </section>
      </div>

      <div className="finance-grid">
        <section className="finance-panel">
          <div className="finance-panel__head">
            <div>
              <span>Oxirgi tranzaksiyalar</span>
              <h2>So'nggi 10 operatsiya</h2>
            </div>
            <button type="button" className="finance-button" onClick={() => onNavigate("transactions")}>Barchasini ko'rish</button>
          </div>
          <div className="finance-table">
            {recent.map((item) => (
              <article key={item.id}>
                <div><strong>{item.reference}</strong><span>{item.date} | {item.counterparty}</span></div>
                <b>{formatMoney(item.amount, item.currency)}</b>
                <StatusBadge status={item.status} label={formatStatusLabel(item.status)} />
              </article>
            ))}
          </div>
        </section>

        <section className="finance-panel">
          <div className="finance-panel__head">
            <div>
              <span>Yaqin to'lovlar</span>
              <h2>Majburiyatlar</h2>
            </div>
          </div>
          <div className="finance-list finance-list--compact">
            {upcomingPayments.length ? upcomingPayments.map((item) => (
              <article key={item.id}>
                <strong>{item.supplier}</strong>
                <span>{item.bill} | muddati {item.dueDate}</span>
                <b>{formatMoney(item.balance)}</b>
                <button type="button" onClick={() => onNavigate("payment-orders")}>To'lov topshirig'i</button>
              </article>
            )) : (
              <article>
                <strong>Yaqin to'lov yo'q</strong>
                <span>Supplierlar, kreditlar va majburiyatlar hozircha kutilmayapti.</span>
              </article>
            )}
          </div>
        </section>
      </div>
    </section>
  );
};

export default FinanceDashboard;
