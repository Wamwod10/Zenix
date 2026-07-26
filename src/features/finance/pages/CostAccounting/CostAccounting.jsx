import { formatMoney } from "../../utils/financeFormatters";

const CostAccounting = ({ controller }) => {
  const cost = controller.state.costAccounting;

  return (
    <section className="finance-view">
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Cost accounting</span>
            <h2>Tannarx usullari</h2>
          </div>
        </div>
        <div className="finance-segmented" role="tablist" aria-label="Cost method">
          {controller.state.settings.costMethods.map((method) => (
            <button
              type="button"
              role="tab"
              aria-selected={cost.method === method}
              className={cost.method === method ? "is-active" : ""}
              key={method}
              onClick={() => controller.actions.updateCostMethod(method)}
            >
              {method}
            </button>
          ))}
        </div>
        <div className="finance-card-grid">
          <article className="finance-mini-card"><strong>{formatMoney(cost.inventoryValuation)}</strong><span>Inventory valuation</span></article>
          <article className="finance-mini-card"><strong>{formatMoney(cost.cogs)}</strong><span>COGS</span></article>
          <article className="finance-mini-card"><strong>{formatMoney(controller.costBreakdown.landedCost)}</strong><span>Landed cost</span></article>
          <article className="finance-mini-card"><strong>{formatMoney(controller.costBreakdown.finalCost)}</strong><span>Final cost</span></article>
          <article className="finance-mini-card"><strong>{formatMoney(controller.costBreakdown.unitCost)}</strong><span>Unit cost</span></article>
        </div>
      </section>
    </section>
  );
};

export default CostAccounting;
