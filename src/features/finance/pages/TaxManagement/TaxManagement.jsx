import { calculateTax } from "../../utils/financeCalculations";
import { formatMoney } from "../../utils/financeFormatters";

const TaxManagement = ({ controller }) => (
  <section className="finance-view">
    <section className="finance-panel">
      <div className="finance-panel__head">
        <div>
          <span>Tax engine</span>
          <h2>QQS va tax rules</h2>
        </div>
      </div>
      <div className="finance-warning">{controller.state.settings.taxWarning}</div>
      <div className="finance-card-grid">
        {controller.state.settings.taxRates.map((tax) => (
          <article className="finance-mini-card" key={tax.id}>
            <strong>{tax.name}</strong>
            <span>{tax.group} · effective {tax.effectiveDate}</span>
            <label>
              <span>Rate</span>
              <input type="number" min="0" value={tax.rate} onChange={(event) => controller.actions.updateTaxRate(tax.id, event.target.value)} />
            </label>
            <b>{formatMoney(calculateTax(1000000, tax.rate))} / 1 mln</b>
          </article>
        ))}
      </div>
    </section>
  </section>
);

export default TaxManagement;
