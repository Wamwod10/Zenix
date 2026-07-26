import { useState } from "react";

import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import TransactionTable from "../../components/TransactionTable/TransactionTable";

const Transactions = ({ controller, onNavigate }) => {
  const [form, setForm] = useState({
    type: "expense",
    amount: 1000000,
    currency: "UZS",
    accountId: "1010",
    counterparty: "Yangi counterparty",
    description: "Manual transaction",
    source: "Manual",
  });

  const update = (key, value) =>
    setForm((current) => ({
      ...current,
      [key]: key === "amount" ? Number(value || 0) : value,
    }));

  const submit = (submitForApproval) => {
    const ok = controller.actions.createTransaction({
      ...form,
      submit: submitForApproval,
      cashDirection: form.type === "income" ? "in" : "out",
    });

    if (ok) {
      controller.actions.closeModal();
    }
  };

  return (
    <section className="finance-view">
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Transaction lifecycle</span>
            <h2>Tranzaksiyalar</h2>
          </div>
          <button type="button" className="finance-button is-primary" onClick={() => controller.actions.setActiveModal("create-transaction")}>
            Yangi transaction
          </button>
        </div>

        <div className="finance-filters">
          <label>
            <span>Sana</span>
            <input type="date" value={controller.filters.date} onChange={(event) => controller.actions.updateFilter("date", event.target.value)} />
          </label>
          <label>
            <span>Hisob</span>
            <select value={controller.filters.account} onChange={(event) => controller.actions.updateFilter("account", event.target.value)}>
              <option value="all">Barchasi</option>
              {controller.state.accounts.map((account) => (
                <option key={account.id} value={account.id}>{account.code} · {account.name}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Valyuta</span>
            <select value={controller.filters.currency} onChange={(event) => controller.actions.updateFilter("currency", event.target.value)}>
              <option value="all">Barchasi</option>
              {controller.state.currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>{currency.code}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Type</span>
            <select value={controller.filters.type} onChange={(event) => controller.actions.updateFilter("type", event.target.value)}>
              <option value="all">Barchasi</option>
              <option value="income">Daromad</option>
              <option value="expense">Xarajat</option>
            </select>
          </label>
        </div>

        {controller.filteredTransactions.length ? (
          <TransactionTable
            transactions={controller.filteredTransactions}
            actionState={controller.actionState}
            onSubmit={controller.actions.submitTransaction}
            onApprove={controller.actions.approveTransaction}
            onOpen={(id) => {
              controller.actions.setSelectedTransactionId(id);
              onNavigate("transaction-details");
            }}
          />
        ) : (
          <div className="finance-empty">Filter bo'yicha transaction topilmadi.</div>
        )}
      </section>

      <ConfirmDialog
        open={controller.activeModal === "create-transaction"}
        title="Yangi transaction"
        description="Draft saqlash yoki maker-checker approval oqimiga yuborish mumkin."
        confirmLabel="Submit approval"
        onClose={controller.actions.closeModal}
        onConfirm={() => submit(true)}
        confirmDisabled={form.amount <= 0}
      >
        <div className="finance-form-grid">
          <label>
            <span>Type</span>
            <select value={form.type} onChange={(event) => update("type", event.target.value)}>
              <option value="income">Daromad</option>
              <option value="expense">Xarajat</option>
            </select>
          </label>
          <label>
            <span>Amount</span>
            <input type="number" min="1" value={form.amount} onChange={(event) => update("amount", event.target.value)} />
          </label>
          <label>
            <span>Currency</span>
            <select value={form.currency} onChange={(event) => update("currency", event.target.value)}>
              {controller.state.currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>{currency.code}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Account</span>
            <select value={form.accountId} onChange={(event) => update("accountId", event.target.value)}>
              {controller.state.accounts.map((account) => (
                <option key={account.id} value={account.id}>{account.code} · {account.name}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Counterparty</span>
            <input value={form.counterparty} onChange={(event) => update("counterparty", event.target.value)} />
          </label>
          <label>
            <span>Source</span>
            <select value={form.source} onChange={(event) => update("source", event.target.value)}>
              <option>Manual</option>
              <option>POS</option>
              <option>Warehouse</option>
              <option>CRM</option>
            </select>
          </label>
          <label className="finance-form-grid__wide">
            <span>Description</span>
            <textarea value={form.description} onChange={(event) => update("description", event.target.value)} />
          </label>
        </div>
        <button type="button" className="finance-button" onClick={() => submit(false)}>
          Draft saqlash
        </button>
      </ConfirmDialog>
    </section>
  );
};

export default Transactions;
