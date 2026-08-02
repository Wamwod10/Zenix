import { calculateTax } from "../../utils/financeCalculations";
import { formatMoney, formatStatusLabel } from "../../utils/financeFormatters";
import StatusBadge from "../../components/StatusBadge/StatusBadge";

const TaxManagement = ({ controller }) => (
  <section className="finance-view">
    <section className="finance-panel">
      <div className="finance-panel__head">
        <div>
          <span>Soliq engine</span>
          <h2>QQS va soliq qoidalari</h2>
        </div>
        <div className="finance-row-actions">
          <button type="button" onClick={() => controller.actions.addNotification("Soliq sozlamalari saqlandi.")}>Saqlash</button>
          <button type="button" onClick={controller.actions.reviewTaxRates}>Reviewga yuborish</button>
          <button type="button" onClick={controller.actions.approveTaxRates}>Tasdiqlash</button>
        </div>
      </div>
      <div className="finance-warning">{controller.state.settings.taxWarning}</div>
      <div className="finance-card-grid">
        {controller.state.settings.taxRates.map((tax) => (
          <article className="finance-mini-card" key={tax.id}>
            <StatusBadge status={tax.status} label={formatStatusLabel(tax.status)} />
            <strong>{tax.name}</strong>
            <span>{formatStatusLabel(tax.group)} | kuchga kirgan sana {tax.effectiveDate || "Sana ko'rsatilmagan"}</span>
            <label>
              <span>Stavka</span>
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
