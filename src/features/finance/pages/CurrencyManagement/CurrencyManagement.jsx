import { useState } from "react";

import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import { formatDateTime, formatMoney } from "../../utils/financeFormatters";

const CurrencyManagement = ({ controller }) => {
  const [form, setForm] = useState({ code: "USD", amount: 1000, newRate: 12740 });

  return (
    <section className="finance-view">
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Currency engine</span>
            <h2>UZS / USD / EUR / RUB</h2>
          </div>
          <button type="button" className="finance-button is-primary" onClick={() => controller.actions.setActiveModal("revaluation")}>
            Revaluation
          </button>
        </div>
        <div className="finance-card-grid">
          {controller.state.currencies.map((currency) => {
            const gainLoss = (currency.cbuRate - currency.rate) * 1000;

            return (
              <article className="finance-mini-card" key={currency.code}>
                <strong>{currency.code}</strong>
                <span>{currency.name}</span>
                <label>
                  <span>Manual rate</span>
                  <input type="number" min="1" value={currency.rate} onChange={(event) => controller.actions.updateCurrencyRate(currency.code, event.target.value)} />
                </label>
                <span>CBU placeholder: {formatMoney(currency.cbuRate)}</span>
                <b className={gainLoss >= 0 ? "is-gain" : "is-loss"}>{formatMoney(gainLoss)} gain/loss preview</b>
                <small>{formatDateTime(currency.lastUpdated)} · {currency.updatedBy}</small>
              </article>
            );
          })}
        </div>
      </section>

      <ConfirmDialog
        open={controller.activeModal === "revaluation"}
        title="Currency revaluation"
        description="Valyutadagi qoldiqni yangi kursda qayta baholash mock hisob-kitobi."
        confirmLabel="Hisoblash"
        onClose={controller.actions.closeModal}
        onConfirm={() => controller.actions.runRevaluation(form.code, form.amount, form.newRate)}
      >
        <div className="finance-form-grid">
          <label>
            <span>Currency</span>
            <select value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}>
              {controller.state.currencies.filter((item) => item.code !== "UZS").map((currency) => (
                <option key={currency.code} value={currency.code}>{currency.code}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Foreign amount</span>
            <input type="number" min="1" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: Number(event.target.value) }))} />
          </label>
          <label>
            <span>New rate</span>
            <input type="number" min="1" value={form.newRate} onChange={(event) => setForm((current) => ({ ...current, newRate: Number(event.target.value) }))} />
          </label>
        </div>
        {controller.revaluation && (
          <div className={`finance-warning ${controller.revaluation.result >= 0 ? "is-gain" : "is-loss"}`}>
            {controller.revaluation.code}: {formatMoney(controller.revaluation.result)} {controller.revaluation.result >= 0 ? "gain" : "loss"}
          </div>
        )}
      </ConfirmDialog>
    </section>
  );
};

export default CurrencyManagement;
