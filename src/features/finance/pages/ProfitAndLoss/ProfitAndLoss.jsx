import { formatMoney } from "../../utils/financeFormatters";

const ProfitAndLoss = ({ controller }) => (
  <section className="finance-view">
    <section className="finance-panel">
      <div className="finance-panel__head">
        <div>
          <span>Profit & Loss</span>
          <h2>Daromad - xarajat</h2>
        </div>
      </div>
      <div className="finance-statement">
        <article><span>Revenue</span><strong>{formatMoney(controller.summary.income)}</strong></article>
        <article><span>Expenses</span><strong>{formatMoney(controller.summary.expenses)}</strong></article>
        <article><span>COGS</span><strong>{formatMoney(controller.state.costAccounting.cogs)}</strong></article>
        <article className="is-total"><span>Net profit</span><strong>{formatMoney(controller.summary.netProfit)}</strong></article>
      </div>
    </section>
  </section>
);

export default ProfitAndLoss;
