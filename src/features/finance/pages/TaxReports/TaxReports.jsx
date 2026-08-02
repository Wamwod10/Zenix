import { useMemo, useState } from "react";

import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { calculateTax, sumBy } from "../../utils/financeCalculations";
import { formatDate, formatMoney, formatStatusLabel, normalizeDateValue } from "../../utils/financeFormatters";

const taxReportTypes = [
  { id: "vat", label: "QQS hisoboti", rateIds: ["vat-standard"] },
  { id: "turnover", label: "Aylanmadan soliq", rateIds: [] },
  { id: "profit", label: "Foyda solig'i", rateIds: [] },
  { id: "social", label: "Ijtimoiy soliq", rateIds: [] },
  { id: "income-tax", label: "JShDS", rateIds: [] },
];

const isInsideRange = (item, filters) => {
  const date = normalizeDateValue(item.date);

  if (!date) {
    return false;
  }

  const value = date.toISOString().slice(0, 10);
  const matchesFrom = !filters.dateFrom || value >= filters.dateFrom;
  const matchesTo = !filters.dateTo || value <= filters.dateTo;
  const matchesBranch = filters.branch === "all" || item.branch === filters.branch;

  return matchesFrom && matchesTo && matchesBranch;
};

const TaxReports = ({ controller }) => {
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    type: "all",
    branch: "all",
  });

  const postedTransactions = useMemo(
    () => controller.state.transactions.filter((item) =>
      (item.status === "Posted" || item.status === "Approved") &&
      isInsideRange(item, filters),
    ),
    [controller.state.transactions, filters],
  );

  const income = sumBy(postedTransactions.filter((item) => item.type === "income"), (item) => item.amount);
  const expenses = sumBy(postedTransactions.filter((item) => item.type === "expense"), (item) => item.amount);
  const profit = Math.max(income - expenses, 0);

  const rows = taxReportTypes
    .filter((type) => filters.type === "all" || filters.type === type.id)
    .map((type) => {
      const rate = controller.state.settings.taxRates.find((item) => type.rateIds.includes(item.id));
      const calculated =
        type.id === "vat" ? calculateTax(income, rate?.rate || 0) :
        type.id === "profit" ? calculateTax(profit, 0) :
        calculateTax(income, 0);
      const paid = sumBy(
        postedTransactions.filter((item) => item.category === "Soliq" && item.taxType === type.id),
        (item) => item.amount,
      );

      return {
        id: type.id,
        label: type.label,
        calculated,
        paid,
        balance: Math.max(calculated - paid, 0),
        dueDate: rate?.effectiveDate || "",
        declarationNumber: rate?.declarationNumber || "Shakllanmagan",
        status: calculated > paid ? "pending" : "valid",
      };
    });

  const totalCalculated = sumBy(rows, (row) => row.calculated);
  const totalPaid = sumBy(rows, (row) => row.paid);
  const exportRows = [
    ["Soliq turi", "Hisoblangan", "To'langan", "Qoldiq", "Muddat", "Holat", "Deklaratsiya"],
    ...rows.map((row) => [row.label, row.calculated, row.paid, row.balance, formatDate(row.dueDate), formatStatusLabel(row.status), row.declarationNumber]),
  ];

  return (
    <section className="finance-view">
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Hisobotlar</span>
            <h2>Soliq hisobotlari</h2>
          </div>
          <button type="button" className="finance-button" onClick={() => controller.actions.exportFinanceCsv("soliq-hisobotlari", exportRows)}>
            CSV eksport
          </button>
        </div>

        <div className="finance-filters">
          <label><span>Sana boshidan</span><input type="date" value={filters.dateFrom} onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))} /></label>
          <label><span>Sana oxiri</span><input type="date" value={filters.dateTo} onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))} /></label>
          <label>
            <span>Soliq turi</span>
            <select value={filters.type} onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))}>
              <option value="all">Barchasi</option>
              {taxReportTypes.map((type) => <option key={type.id} value={type.id}>{type.label}</option>)}
            </select>
          </label>
          <label><span>Filial</span><input value={filters.branch === "all" ? "" : filters.branch} placeholder="Barcha filiallar" onChange={(event) => setFilters((current) => ({ ...current, branch: event.target.value.trim() || "all" }))} /></label>
        </div>

        <div className="finance-card-grid">
          <article className="finance-mini-card"><strong>{formatMoney(totalCalculated)}</strong><span>Hisoblangan soliqlar</span></article>
          <article className="finance-mini-card"><strong>{formatMoney(totalPaid)}</strong><span>To'langan soliqlar</span></article>
          <article className="finance-mini-card"><strong>{formatMoney(Math.max(totalCalculated - totalPaid, 0))}</strong><span>Soliq majburiyati</span></article>
          <article className="finance-mini-card"><strong>{rows.filter((row) => row.balance > 0).length}</strong><span>Muddati yaqin hisobotlar</span></article>
        </div>

        {postedTransactions.length || controller.state.settings.taxRates.length ? (
          <div className="finance-table">
            {rows.map((row) => (
              <article key={row.id}>
                <div>
                  <strong>{row.label}</strong>
                  <span>Deklaratsiya: {row.declarationNumber} | muddat: {formatDate(row.dueDate)}</span>
                </div>
                <b>{formatMoney(row.calculated)}</b>
                <b>{formatMoney(row.paid)}</b>
                <b>{formatMoney(row.balance)}</b>
                <StatusBadge status={row.status} label={formatStatusLabel(row.status)} />
              </article>
            ))}
          </div>
        ) : (
          <div className="finance-empty">
            Tanlangan davr uchun soliq hisoboti hali shakllanmagan.
            <button type="button" className="finance-button is-primary" onClick={() => controller.actions.setActiveModal("create-transaction")}>
              Soliq operatsiyasini kiriting
            </button>
          </div>
        )}
      </section>
    </section>
  );
};

export default TaxReports;
