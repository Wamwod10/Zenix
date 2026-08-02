import { useMemo, useState } from "react";

import { FinanceTrendChart } from "../../components/FinanceCharts/FinanceCharts";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { formatMoney, formatStatusLabel } from "../../utils/financeFormatters";

const CashFlow = ({ controller }) => {
  const [filters, setFilters] = useState({ period: "all", account: "all", dateFrom: "", dateTo: "" });

  const rows = useMemo(() => controller.state.transactions.filter((item) => {
    const matchesFlow = item.cashDirection !== "none";
    const matchesPeriod = filters.period === "all" || item.date.startsWith(filters.period);
    const matchesAccount = filters.account === "all" || item.accountId === filters.account;
    const matchesFrom = !filters.dateFrom || item.date >= filters.dateFrom;
    const matchesTo = !filters.dateTo || item.date <= filters.dateTo;
    return matchesFlow && matchesPeriod && matchesAccount && matchesFrom && matchesTo;
  }), [controller.state.transactions, filters]);

  const trendRows = rows.slice().reverse().map((item) => ({
    label: item.date.slice(5),
    value: item.cashDirection === "out" ? -item.amount : item.amount,
  }));

  const exportRows = [
    ["Sana", "Hamkor", "Yo'nalish", "Summa", "Valyuta", "Holat"],
    ...rows.map((item) => [item.date, item.counterparty, item.cashDirection === "in" ? "Kirim" : "Chiqim", item.amount, item.currency, formatStatusLabel(item.status)]),
  ];

  return (
    <section className="finance-view">
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Pul oqimi</span>
            <h2>Pul oqimi</h2>
          </div>
          <button type="button" className="finance-button" onClick={() => controller.actions.exportFinanceCsv("cash-flow", exportRows)}>CSV eksport</button>
        </div>
        <div className="finance-filters">
          <label>
            <span>Period</span>
            <select value={filters.period} onChange={(event) => setFilters((current) => ({ ...current, period: event.target.value }))}>
              <option value="all">Barchasi</option>
              <option value={new Date().toISOString().slice(0, 10)}>Bugun</option>
              <option value={new Date().toISOString().slice(0, 7)}>Oy</option>
              <option value={new Date().toISOString().slice(0, 4)}>Yil</option>
              {controller.state.periods.map((period) => <option key={period.id} value={period.id}>{period.label}</option>)}
            </select>
          </label>
          <label>
            <span>Hisob</span>
            <select value={filters.account} onChange={(event) => setFilters((current) => ({ ...current, account: event.target.value }))}>
              <option value="all">Barcha hisoblar</option>
              {controller.state.accounts.filter((account) => account.kind === "bank" || account.kind === "cash").map((account) => (
                <option key={account.id} value={account.id}>{account.code} | {account.name}</option>
              ))}
            </select>
          </label>
          <label><span>Maxsus sana boshidan</span><input type="date" value={filters.dateFrom} onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))} /></label>
          <label><span>Maxsus sana oxiri</span><input type="date" value={filters.dateTo} onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))} /></label>
        </div>
        <div className="finance-card-grid">
          <article className="finance-mini-card"><strong>{formatMoney(controller.summary.cashFlow)}</strong><span>Jami pul oqimi</span></article>
          <article className="finance-mini-card"><strong>{formatMoney(controller.summary.income)}</strong><span>Jami kirim</span></article>
          <article className="finance-mini-card"><strong>{formatMoney(controller.summary.expenses)}</strong><span>Jami chiqim</span></article>
          <article className="finance-mini-card"><strong>{formatMoney(controller.summary.bank)}</strong><span>Bank qoldiqlari</span></article>
          <article className="finance-mini-card"><strong>{formatMoney(controller.summary.cash)}</strong><span>Kassa qoldiqlari</span></article>
          <article className="finance-mini-card"><strong>{formatMoney(controller.summary.totalBalance)}</strong><span>Sof pul oqimi</span></article>
        </div>
        <FinanceTrendChart rows={trendRows} title="Pul oqimi bo'yicha trend" />
        <div className="finance-table">
          {rows.length ? rows.map((item) => (
            <article key={item.id}>
              <div>
                <strong>{item.cashDirection === "in" ? "+" : "-"} {formatMoney(item.amount, item.currency)}</strong>
                <span>{item.date} | {item.counterparty}</span>
              </div>
              <b>{item.reference}</b>
              <StatusBadge status={item.status} />
            </article>
          )) : (
            <div className="finance-empty">
              Pul harakati topilmadi.
              <button type="button" className="finance-button is-primary" onClick={() => controller.actions.setActiveModal("create-transaction")}>Birinchi tranzaksiyani yarating</button>
            </div>
          )}
        </div>
      </section>
    </section>
  );
};

export default CashFlow;
