import { formatMoney } from "../../utils/financeFormatters";

const CostAccounting = ({ controller }) => {
  const cost = controller.state.costAccounting;

  return (
    <section className="finance-view">
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Tannarx hisobi</span>
            <h2>Tannarx usullari</h2>
          </div>
        </div>
        <div className="finance-segmented" role="tablist" aria-label="Tannarx usuli">
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
          <article className="finance-mini-card"><strong>{formatMoney(cost.inventoryValuation)}</strong><span>Tovar qiymati</span></article>
          <article className="finance-mini-card"><strong>{formatMoney(cost.cogs)}</strong><span>Sotilgan tovar tannarxi</span></article>
          <article className="finance-mini-card"><strong>{formatMoney(controller.costBreakdown.landedCost)}</strong><span>Yetkazish va bojxona xarajati</span></article>
          <article className="finance-mini-card"><strong>{formatMoney(controller.costBreakdown.finalCost)}</strong><span>Yakuniy tannarx</span></article>
          <article className="finance-mini-card"><strong>{formatMoney(controller.costBreakdown.unitCost)}</strong><span>Birlik tannarxi</span></article>
        </div>
      </section>
    </section>
  );
};

export default CostAccounting;
