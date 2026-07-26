import { formatMoney } from "../../utils/financeFormatters";

const CashFlow = ({ controller }) => (
  <section className="finance-view">
    <section className="finance-panel">
      <div className="finance-panel__head">
        <div>
          <span>Cash flow</span>
          <h2>Pul oqimi</h2>
        </div>
      </div>
      <div className="finance-card-grid">
        <article className="finance-mini-card"><strong>{formatMoney(controller.summary.cashFlow)}</strong><span>Net cash flow</span></article>
        <article className="finance-mini-card"><strong>{formatMoney(controller.summary.bank)}</strong><span>Bank balances</span></article>
        <article className="finance-mini-card"><strong>{formatMoney(controller.summary.cash)}</strong><span>Cash balances</span></article>
      </div>
      <div className="finance-timeline">
        {controller.state.transactions.filter((item) => item.cashDirection !== "none").map((item) => (
          <article key={item.id}>
            <strong>{item.cashDirection === "in" ? "+" : "-"} {formatMoney(item.amount, item.currency)}</strong>
            <span>{item.date} · {item.counterparty} · {item.status}</span>
          </article>
        ))}
      </div>
    </section>
  </section>
);

export default CashFlow;
