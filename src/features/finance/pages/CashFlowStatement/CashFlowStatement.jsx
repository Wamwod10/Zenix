import { GlassSelect } from "@/components/ui";
import { Banknote, Landmark, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

import { FinanceTrendChart } from "../../components/FinanceCharts/FinanceCharts";
import { sumBy } from "../../utils/financeCalculations";
import { formatDate, formatMoney, normalizeDateValue } from "../../utils/financeFormatters";

const activityRows = [
  { id: "customerReceipts", title: "Mijozlardan tushum", type: "income", cashDirection: "in", group: "Operatsion faoliyat" },
  { id: "supplierPayments", title: "Yetkazib beruvchilarga to'lov", type: "expense", cashDirection: "out", group: "Operatsion faoliyat" },
  { id: "salary", title: "Ish haqi va ijara", type: "expense", cashDirection: "out", group: "Operatsion faoliyat", categories: ["Ish haqi", "Ijara"] },
  { id: "tax", title: "Soliq to'lovlari", type: "expense", cashDirection: "out", group: "Operatsion faoliyat", categories: ["Soliq"] },
  { id: "investing", title: "Investitsion faoliyat", cashDirection: "out", group: "Investitsion faoliyat", categories: ["Investitsiya", "Asosiy vosita"] },
  { id: "financing", title: "Moliyalashtirish faoliyati", cashDirection: "in", group: "Moliyalashtirish faoliyati", categories: ["Kapital", "Kredit"] },
];

const isInsideRange = (item, filters) => {
  const date = normalizeDateValue(item.date);

  if (!date) {
    return false;
  }

  const value = date.toISOString().slice(0, 10);
  const matchesFrom = !filters.dateFrom || value >= filters.dateFrom;
  const matchesTo = !filters.dateTo || value <= filters.dateTo;
  const matchesCurrency = filters.currency === "all" || item.currency === filters.currency;
  const matchesBranch = filters.branch === "all" || item.branch === filters.branch;

  return matchesFrom && matchesTo && matchesCurrency && matchesBranch;
};

const CashFlowStatement = ({ controller }) => {
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    branch: "all",
    currency: "all",
  });

  const postedTransactions = useMemo(
    () => controller.state.transactions.filter((item) =>
      (item.status === "Posted" || item.status === "Approved") &&
      item.cashDirection !== "none" &&
      isInsideRange(item, filters),
    ),
    [controller.state.transactions, filters],
  );

  const reportRows = activityRows.map((row) => {
    const amount = sumBy(
      postedTransactions.filter((item) => {
        const matchesType = !row.type || item.type === row.type;
        const matchesDirection = !row.cashDirection || item.cashDirection === row.cashDirection;
        const matchesCategory = !row.categories || row.categories.includes(item.category);
        return matchesType && matchesDirection && matchesCategory;
      }),
      (item) => item.amount,
    );

    return {
      ...row,
      amount,
    };
  });

  const inflow = sumBy(postedTransactions.filter((item) => item.cashDirection === "in"), (item) => item.amount);
  const outflow = sumBy(postedTransactions.filter((item) => item.cashDirection === "out"), (item) => item.amount);
  const openingCash = controller.summary.bank + controller.summary.cash - inflow + outflow;
  const endingCash = openingCash + inflow - outflow;
  const trendRows = postedTransactions.slice(-12).map((item) => ({
    label: formatDate(item.date),
    value: item.cashDirection === "out" ? -Number(item.amount || 0) : Number(item.amount || 0),
  }));

  const exportRows = [
    ["Bo'lim", "Qator", "Summa"],
    ...reportRows.map((row) => [row.group, row.title, row.amount]),
    ["Summary", "Davr boshidagi pul", openingCash],
    ["Summary", "Sof o'zgarish", inflow - outflow],
    ["Summary", "Davr oxiridagi pul", endingCash],
  ];
  const summaryCards = [
    {
      icon: Banknote,
      label: "Davr boshidagi pul",
      value: formatMoney(openingCash),
      hint: "Hisobot davri boshidagi qoldiq",
      tone: "is-flow",
    },
    {
      icon: TrendingUp,
      label: "Jami kirim",
      value: formatMoney(inflow),
      hint: "Davr ichidagi pul tushumlari",
      tone: "is-income",
    },
    {
      icon: TrendingDown,
      label: "Jami chiqim",
      value: formatMoney(outflow),
      hint: "Davr ichidagi pul chiqimlari",
      tone: "is-expense",
    },
    {
      icon: Landmark,
      label: "Davr oxiridagi pul",
      value: formatMoney(endingCash),
      hint: "Yakuniy bank va kassa qoldig'i",
      tone: "is-bank",
    },
  ];

  return (
    <section className="finance-view">
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Hisobotlar</span>
            <h2>Pul oqimi hisoboti</h2>
          </div>
          <button type="button" className="finance-button" onClick={() => controller.actions.exportFinanceCsv("pul-oqimi-hisoboti", exportRows)}>
            CSV eksport
          </button>
        </div>

        <div className="finance-filters">
          <label><span>Sana boshidan</span><input type="date" value={filters.dateFrom} onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))} /></label>
          <label><span>Sana oxiri</span><input type="date" value={filters.dateTo} onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))} /></label>
          <label><span>Filial</span><input value={filters.branch === "all" ? "" : filters.branch} placeholder="Barcha filiallar" onChange={(event) => setFilters((current) => ({ ...current, branch: event.target.value.trim() || "all" }))} /></label>
          <label>
            <span>Valyuta</span>
            <GlassSelect value={filters.currency} onChange={(event) => setFilters((current) => ({ ...current, currency: event.target.value }))}>
              <option value="all">Barchasi</option>
              {controller.state.currencies.map((currency) => <option key={currency.code} value={currency.code}>{currency.code}</option>)}
            </GlassSelect>
          </label>
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

        {postedTransactions.length ? (
          <>
            <FinanceTrendChart rows={trendRows} title="Hisobot davri bo'yicha sof pul oqimi" />
            <div className="finance-statement">
              {["Operatsion faoliyat", "Investitsion faoliyat", "Moliyalashtirish faoliyati"].map((group) => (
                <section key={group}>
                  <h3>{group}</h3>
                  {reportRows.filter((row) => row.group === group).map((row) => (
                    <article key={row.id}>
                      <span>{row.title}</span>
                      <strong>{formatMoney(row.amount)}</strong>
                    </article>
                  ))}
                </section>
              ))}
              <article className="is-total">
                <span>Sof pul oqimi</span>
                <strong>{formatMoney(inflow - outflow)}</strong>
              </article>
            </div>
          </>
        ) : (
          <div className="finance-empty">
            Tanlangan davr uchun pul oqimi hisobotini shakllantiradigan tranzaksiyalar mavjud emas.
            <button type="button" className="finance-button is-primary" onClick={() => controller.actions.setActiveModal("create-transaction")}>
              Birinchi tranzaksiyani yarating
            </button>
          </div>
        )}

        {postedTransactions.some((item) => !normalizeDateValue(item.date)) && (
          <div className="finance-warning">
            Ayrim tranzaksiyalarda sana noto'g'ri. Ular hisobot hisob-kitobiga kiritilmadi.
          </div>
        )}
      </section>
    </section>
  );
};

export default CashFlowStatement;
