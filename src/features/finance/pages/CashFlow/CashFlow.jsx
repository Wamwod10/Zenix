import { GlassSelect } from "@/components/ui";
import { Activity, Banknote, Landmark, TrendingDown, TrendingUp, WalletCards } from "lucide-react";
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

  const summaryCards = [
    {
      icon: Activity,
      label: "Jami pul oqimi",
      value: formatMoney(controller.summary.cashFlow),
      hint: "Kirim va chiqim farqi",
      tone: "is-flow",
    },
    {
      icon: TrendingUp,
      label: "Jami kirim",
      value: formatMoney(controller.summary.income),
      hint: "Tasdiqlangan kirimlar",
      tone: "is-income",
    },
    {
      icon: TrendingDown,
      label: "Jami chiqim",
      value: formatMoney(controller.summary.expenses),
      hint: "Tasdiqlangan chiqimlar",
      tone: "is-expense",
    },
    {
      icon: Landmark,
      label: "Bank qoldiqlari",
      value: formatMoney(controller.summary.bank),
      hint: "Bank hisoblari balansi",
      tone: "is-bank",
    },
    {
      icon: Banknote,
      label: "Kassa qoldiqlari",
      value: formatMoney(controller.summary.cash),
      hint: "Naqd pul qoldig'i",
      tone: "is-cash",
    },
    {
      icon: WalletCards,
      label: "Sof pul oqimi",
      value: formatMoney(controller.summary.totalBalance),
      hint: "Umumiy balans signali",
      tone: "is-net",
    },
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
            <GlassSelect value={filters.period} onChange={(event) => setFilters((current) => ({ ...current, period: event.target.value }))}>
              <option value="all">Barchasi</option>
              <option value={new Date().toISOString().slice(0, 10)}>Bugun</option>
              <option value={new Date().toISOString().slice(0, 7)}>Oy</option>
              <option value={new Date().toISOString().slice(0, 4)}>Yil</option>
              {controller.state.periods.map((period) => <option key={period.id} value={period.id}>{period.label}</option>)}
            </GlassSelect>
          </label>
          <label>
            <span>Hisob</span>
            <GlassSelect value={filters.account} onChange={(event) => setFilters((current) => ({ ...current, account: event.target.value }))}>
              <option value="all">Barcha hisoblar</option>
              {controller.state.accounts.filter((account) => account.kind === "bank" || account.kind === "cash").map((account) => (
                <option key={account.id} value={account.id}>{account.code} | {account.name}</option>
              ))}
            </GlassSelect>
          </label>
          <label><span>Maxsus sana boshidan</span><input type="date" value={filters.dateFrom} onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))} /></label>
          <label><span>Maxsus sana oxiri</span><input type="date" value={filters.dateTo} onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))} /></label>
        </div>
        <div className="finance-card-grid">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <article className={`finance-mini-card finance-mini-card--metric ${card.tone}`} key={card.label}>
                <span className="finance-mini-card__icon" aria-hidden="true">
                  <Icon size={18} />
                </span>
                <span className="finance-mini-card__label">{card.label}</span>
                <strong>{card.value}</strong>
                <small>{card.hint}</small>
              </article>
            );
          })}
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
