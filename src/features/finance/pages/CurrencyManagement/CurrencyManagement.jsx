import { useState } from "react";

import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import { formatDateTime, formatMoney } from "../../utils/financeFormatters";

const CurrencyManagement = ({ controller }) => {
  const [form, setForm] = useState({ code: "USD", amount: 0, newRate: 0 });
  const [exchange, setExchange] = useState({ fromAccountId: "1020", toAccountId: "1010", amount: "", rate: 0 });

  return (
    <section className="finance-view">
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Valyuta engine</span>
            <h2>UZS / USD / EUR / RUB</h2>
          </div>
          <div className="finance-row-actions">
            <button type="button" className="finance-button" onClick={() => controller.actions.setActiveModal("currency-exchange")}>Valyuta almashtirish</button>
            <button type="button" className="finance-button is-primary" onClick={() => controller.actions.setActiveModal("revaluation")}>Qayta baholash</button>
          </div>
        </div>
        <div className="finance-card-grid">
          {controller.state.currencies.map((currency) => {
            const gainLoss = (currency.cbuRate - currency.rate) * 1000;

            return (
              <article className="finance-mini-card" key={currency.code}>
                <strong>{currency.code}</strong>
                <span>{currency.name}</span>
                <label>
                  <span>Ichki kurs</span>
                  <input type="number" min="0" value={currency.rate} onChange={(event) => controller.actions.updateCurrencyRate(currency.code, event.target.value)} />
                </label>
                <span>MB kursi: {formatMoney(currency.cbuRate)}</span>
                <b className={gainLoss >= 0 ? "is-gain" : "is-loss"}>{formatMoney(gainLoss)} valyuta farqi preview</b>
                <small>{formatDateTime(currency.lastUpdated)} | {currency.updatedBy}</small>
              </article>
            );
          })}
        </div>
      </section>

      <ConfirmDialog
        open={controller.activeModal === "revaluation"}
        title="Valyutani qayta baholash"
        description="Valyutadagi qoldiq yangi kurs asosida qayta hisoblanadi."
        confirmLabel="Hisoblash"
        onClose={controller.actions.closeModal}
        onConfirm={() => controller.actions.runRevaluation(form.code, form.amount, form.newRate)}
      >
        <div className="finance-form-grid">
          <label>
            <span>Valyuta</span>
            <select value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}>
              {controller.state.currencies.filter((item) => item.code !== "UZS").map((currency) => (
                <option key={currency.code} value={currency.code}>{currency.code}</option>
              ))}
            </select>
          </label>
          <label><span>Valyuta summasi</span><input type="number" min="0" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: Number(event.target.value) }))} /></label>
          <label><span>Yangi kurs</span><input type="number" min="0" value={form.newRate} onChange={(event) => setForm((current) => ({ ...current, newRate: Number(event.target.value) }))} /></label>
        </div>
        {controller.revaluation && (
          <div className={`finance-warning ${controller.revaluation.result >= 0 ? "is-gain" : "is-loss"}`}>
            {controller.revaluation.code}: {formatMoney(controller.revaluation.result)} {controller.revaluation.result >= 0 ? "foyda" : "zarar"}
          </div>
        )}
      </ConfirmDialog>

      <ConfirmDialog
        open={controller.activeModal === "currency-exchange"}
        title="Valyuta almashtirish"
        description="Manba va qabul qiluvchi hisoblar qoldig'i real state'da yangilanadi."
        confirmLabel="Almashtirish"
        onClose={controller.actions.closeModal}
        onConfirm={() => {
          if (controller.actions.runCurrencyExchange(exchange)) {
            controller.actions.closeModal();
          }
        }}
        confirmDisabled={!exchange.fromAccountId || !exchange.toAccountId || exchange.fromAccountId === exchange.toAccountId || Number(exchange.amount || 0) <= 0 || Number(exchange.rate || 0) <= 0}
      >
        <div className="finance-form-grid">
          <label><span>Manba hisob</span><select value={exchange.fromAccountId} onChange={(event) => setExchange((current) => ({ ...current, fromAccountId: event.target.value }))}>{controller.state.accounts.map((account) => <option key={account.id} value={account.id}>{account.code} | {account.name}</option>)}</select></label>
          <label><span>Qabul qiluvchi hisob</span><select value={exchange.toAccountId} onChange={(event) => setExchange((current) => ({ ...current, toAccountId: event.target.value }))}>{controller.state.accounts.map((account) => <option key={account.id} value={account.id}>{account.code} | {account.name}</option>)}</select></label>
          <label><span>Summa</span><input type="number" min="0" value={exchange.amount} onChange={(event) => setExchange((current) => ({ ...current, amount: event.target.value }))} /></label>
          <label><span>Kurs</span><input type="number" min="0" value={exchange.rate} onChange={(event) => setExchange((current) => ({ ...current, rate: event.target.value }))} /></label>
        </div>
      </ConfirmDialog>
    </section>
  );
};

export default CurrencyManagement;
