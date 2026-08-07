import { useState } from "react";
import { Landmark, Scale, ShieldCheck, WalletCards } from "lucide-react";

import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { sumBy } from "../../utils/financeCalculations";
import { formatMoney } from "../../utils/financeFormatters";

const sectionMap = {
  assets: [
    { id: "cash", label: "Naqd pul", kind: "cash" },
    { id: "bank", label: "Bank hisoblari", kind: "bank" },
    { id: "receivable", label: "Debitor qarzdorlik", kind: "receivable" },
    { id: "inventory", label: "Tovar zaxiralari", kind: "inventory" },
    { id: "otherAssets", label: "Boshqa aktivlar", type: "asset" },
  ],
  liabilities: [
    { id: "payable", label: "Kreditor qarzdorlik", kind: "payable" },
    { id: "tax", label: "To'lanadigan soliqlar", kind: "tax" },
    { id: "otherLiabilities", label: "Boshqa majburiyatlar", type: "liability" },
  ],
  equity: [
    { id: "capital", label: "Kapital", kind: "equity" },
    { id: "currentProfit", label: "Joriy davr foydasi", source: "profit" },
  ],
};

const BalanceSheet = ({ controller }) => {
  const [filters, setFilters] = useState({ reportDate: new Date().toISOString().slice(0, 10), branch: "all", currency: "UZS" });
  const accounts = controller.state.accounts.filter((item) => filters.currency === "all" || item.currency === filters.currency);
  const valueFor = (row) => {
    if (row.source === "profit") return controller.summary.netProfit;
    const matched = accounts.filter((account) => {
      if (row.kind) return account.kind === row.kind;
      if (row.type) return account.type === row.type && !Object.values(sectionMap).flat().some((config) => config.kind && config.kind === account.kind);
      return false;
    });
    return sumBy(matched, (account) => account.openingBalance);
  };

  const assets = sectionMap.assets.map((row) => ({ ...row, value: valueFor(row) }));
  const liabilities = sectionMap.liabilities.map((row) => ({ ...row, value: valueFor(row) }));
  const equity = sectionMap.equity.map((row) => ({ ...row, value: valueFor(row) }));
  const totalAssets = sumBy(assets, (row) => row.value);
  const totalLiabilities = sumBy(liabilities, (row) => row.value);
  const totalEquity = sumBy(equity, (row) => row.value);
  const difference = totalAssets - (totalLiabilities + totalEquity);
  const balanced = Math.round(difference) === 0;
  const exportRows = [
    ["Bo'lim", "Qator", "Summa"],
    ...assets.map((row) => ["Aktivlar", row.label, row.value]),
    ...liabilities.map((row) => ["Majburiyatlar", row.label, row.value]),
    ...equity.map((row) => ["Kapital", row.label, row.value]),
    ["Formula", "Aktivlar - Majburiyatlar - Kapital", difference],
  ];
  const reportCurrency = filters.currency === "all" ? "UZS" : filters.currency;
  const summaryCards = [
    {
      icon: WalletCards,
      label: "Jami aktivlar",
      value: formatMoney(totalAssets, reportCurrency),
      hint: "Naqd, bank, debitor va zaxiralar",
      tone: "is-income",
    },
    {
      icon: Landmark,
      label: "Jami majburiyatlar",
      value: formatMoney(totalLiabilities, reportCurrency),
      hint: "Kreditor va soliq majburiyatlari",
      tone: "is-expense",
    },
    {
      icon: ShieldCheck,
      label: "Jami kapital",
      value: formatMoney(totalEquity, reportCurrency),
      hint: "Kapital va joriy davr foydasi",
      tone: "is-bank",
    },
    {
      icon: Scale,
      label: "Balans farqi",
      value: formatMoney(difference, reportCurrency),
      hint: balanced ? "Formula teng" : "Tekshiruv kerak",
      tone: balanced ? "is-flow" : "is-cash",
    },
  ];

  return (
    <section className="finance-view">
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Balans</span>
            <h2>Moliyaviy holat hisoboti</h2>
          </div>
          <div className="finance-row-actions">
            <StatusBadge status={balanced ? "success" : "danger"} label={balanced ? "Balans teng" : "Farq bor"} />
            <button type="button" className="finance-button" onClick={() => controller.actions.exportFinanceCsv("balans-hisoboti", exportRows)}>CSV eksport</button>
          </div>
        </div>
        <div className="finance-filters">
          <label><span>Hisobot sanasi</span><input type="date" value={filters.reportDate} onChange={(event) => setFilters((current) => ({ ...current, reportDate: event.target.value }))} /></label>
          <label><span>Filial</span><input value={filters.branch === "all" ? "" : filters.branch} placeholder="Barcha filiallar" onChange={(event) => setFilters((current) => ({ ...current, branch: event.target.value.trim() || "all" }))} /></label>
          <label><span>Valyuta</span><input value={filters.currency} onChange={(event) => setFilters((current) => ({ ...current, currency: event.target.value.trim() || "all" }))} /></label>
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
        {[["Aktivlar", assets], ["Majburiyatlar", liabilities], ["Kapital", equity]].map(([title, rows]) => (
          <div className="finance-statement" key={title}>
            <h3>{title}</h3>
            {rows.map((row) => (
              <article key={row.id}>
                <span>{row.label}</span>
                <strong>{formatMoney(row.value, filters.currency === "all" ? "UZS" : filters.currency)}</strong>
              </article>
            ))}
            <article className="is-total">
              <span>Jami {title.toLowerCase()}</span>
              <strong>{formatMoney(sumBy(rows, (row) => row.value), filters.currency === "all" ? "UZS" : filters.currency)}</strong>
            </article>
          </div>
        ))}
        <div className={balanced ? "finance-warning is-gain" : "finance-warning"}>
          Aktivlar = Majburiyatlar + Kapital. {balanced ? "Formula teng." : `Farq: ${formatMoney(difference, filters.currency === "all" ? "UZS" : filters.currency)}.`}
        </div>
      </section>
    </section>
  );
};

export default BalanceSheet;
