import { useMemo, useState } from "react";

import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { sumBy } from "../../utils/financeCalculations";
import { formatMoney } from "../../utils/financeFormatters";

const rowsConfig = [
  { id: "sales", title: "Savdo daromadi", type: "income", category: "Mahsulot savdosi" },
  { id: "service", title: "Xizmat daromadi", type: "income", category: "Xizmat" },
  { id: "returns", title: "Qaytarishlar", type: "expense", category: "Qaytarim" },
  { id: "discounts", title: "Chegirmalar", type: "expense", category: "Chegirma" },
  { id: "cogs", title: "Sotilgan tovar tannarxi", source: "cogs" },
  { id: "salary", title: "Ish haqi xarajatlari", type: "expense", category: "Ish haqi" },
  { id: "rent", title: "Ijara", type: "expense", category: "Ijara" },
  { id: "marketing", title: "Marketing", type: "expense", category: "Marketing" },
  { id: "delivery", title: "Yetkazib berish", type: "expense", category: "Transport" },
  { id: "otherExpense", title: "Boshqa xarajatlar", type: "expense", category: "Boshqa" },
  { id: "otherIncome", title: "Boshqa daromadlar", type: "income", category: "Boshqa daromad" },
  { id: "tax", title: "Soliq", type: "expense", category: "Soliq" },
];

const ProfitAndLoss = ({ controller }) => {
  const [filters, setFilters] = useState({ dateFrom: "", dateTo: "", branch: "all", currency: "all", method: "accrual" });
  const [drilldown, setDrilldown] = useState(null);

  const transactions = useMemo(() => controller.state.transactions.filter((item) => {
    const matchesStatus = item.status === "Posted" || item.status === "Approved";
    const matchesFrom = !filters.dateFrom || item.date >= filters.dateFrom;
    const matchesTo = !filters.dateTo || item.date <= filters.dateTo;
    const matchesBranch = filters.branch === "all" || item.branch === filters.branch;
    const matchesCurrency = filters.currency === "all" || item.currency === filters.currency;
    return matchesStatus && matchesFrom && matchesTo && matchesBranch && matchesCurrency;
  }), [controller.state.transactions, filters]);

  const amountFor = (config) => {
    if (config.source === "cogs") return Number(controller.state.costAccounting.cogs || 0);
    return sumBy(transactions.filter((item) => item.type === config.type && (!config.category || item.category === config.category)), (item) => item.amount);
  };

  const rows = rowsConfig.map((row) => ({ ...row, amount: amountFor(row) }));
  const grossIncome = sumBy(rows.filter((row) => ["sales", "service", "otherIncome"].includes(row.id)), (row) => row.amount);
  const deductions = sumBy(rows.filter((row) => ["returns", "discounts"].includes(row.id)), (row) => row.amount);
  const netIncome = grossIncome - deductions;
  const cogs = rows.find((row) => row.id === "cogs")?.amount || 0;
  const grossProfit = netIncome - cogs;
  const operatingExpenses = sumBy(rows.filter((row) => ["salary", "rent", "marketing", "delivery", "otherExpense"].includes(row.id)), (row) => row.amount);
  const operatingProfit = grossProfit - operatingExpenses;
  const tax = rows.find((row) => row.id === "tax")?.amount || 0;
  const netProfit = operatingProfit - tax;
  const exportRows = [
    ["Qator", "Summa"],
    ["Sof daromad", netIncome],
    ["Yalpi foyda", grossProfit],
    ["Operatsion foyda", operatingProfit],
    ["Sof foyda", netProfit],
    ...rows.map((row) => [row.title, row.amount]),
  ];

  return (
    <section className="finance-view">
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Foyda va zarar</span>
            <h2>Davr bo'yicha moliyaviy natija</h2>
          </div>
          <button type="button" className="finance-button" onClick={() => controller.actions.exportFinanceCsv("foyda-va-zarar", exportRows)}>CSV eksport</button>
        </div>
        <div className="finance-filters">
          <label><span>Sana boshidan</span><input type="date" value={filters.dateFrom} onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))} /></label>
          <label><span>Sana oxiri</span><input type="date" value={filters.dateTo} onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))} /></label>
          <label><span>Filial</span><input value={filters.branch === "all" ? "" : filters.branch} placeholder="Barcha filiallar" onChange={(event) => setFilters((current) => ({ ...current, branch: event.target.value.trim() || "all" }))} /></label>
          <label><span>Usul</span><input value={filters.method} onChange={(event) => setFilters((current) => ({ ...current, method: event.target.value }))} /></label>
        </div>
        <div className="finance-card-grid">
          <article className="finance-mini-card"><strong>{formatMoney(netIncome)}</strong><span>Sof daromad</span></article>
          <article className="finance-mini-card"><strong>{formatMoney(grossProfit)}</strong><span>Yalpi foyda</span></article>
          <article className="finance-mini-card"><strong>{formatMoney(operatingProfit)}</strong><span>Operatsion foyda</span></article>
          <article className="finance-mini-card"><strong>{formatMoney(netProfit)}</strong><span>Sof foyda</span></article>
        </div>
        <div className="finance-statement">
          <h3>Daromadlar</h3>
          {rows.filter((row) => row.type === "income").map((row) => (
            <article key={row.id} onClick={() => setDrilldown(row)}>
              <span>{row.title}</span><strong>{formatMoney(row.amount)}</strong>
            </article>
          ))}
          <article className="is-total"><span>Sof daromad</span><strong>{formatMoney(netIncome)}</strong></article>
          <h3>Xarajatlar</h3>
          {rows.filter((row) => row.type === "expense" || row.source === "cogs").map((row) => (
            <article key={row.id} onClick={() => setDrilldown(row)}>
              <span>{row.title}</span><strong>{formatMoney(row.amount)}</strong>
            </article>
          ))}
          <article className="is-total"><span>Sof foyda</span><strong>{formatMoney(netProfit)}</strong></article>
        </div>
        {!transactions.length && <div className="finance-empty">Tanlangan davr uchun foyda va zarar hisobotini shakllantiradigan operatsiyalar mavjud emas.</div>}
      </section>
      {drilldown && (
        <section className="finance-panel">
          <div className="finance-panel__head">
            <div><span>Drill-down</span><h2>{drilldown.title}</h2></div>
            <StatusBadge status="success" label={formatMoney(drilldown.amount)} />
          </div>
          <div className="finance-table">
            {transactions.filter((item) => item.category === drilldown.category || item.type === drilldown.type).slice(0, 10).map((item) => (
              <article key={item.id}><div><strong>{item.reference}</strong><span>{item.date} | {item.counterparty}</span></div><b>{formatMoney(item.amount, item.currency)}</b><StatusBadge status={item.status} /></article>
            ))}
          </div>
        </section>
      )}
    </section>
  );
};

export default ProfitAndLoss;
