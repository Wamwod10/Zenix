import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { validateDoubleEntry } from "../../utils/financeCalculations";
import { formatMoney } from "../../utils/financeFormatters";

import "./JournalEntryForm.scss";

const emptyRow = (accountId = "") => ({ accountId, debit: 0, credit: 0 });

const JournalEntryForm = ({ accounts, periods, onSubmit }) => {
  const [form, setForm] = useState({
    description: "Manual adjustment",
    reason: "",
    attachmentName: "attachment-placeholder.pdf",
    reference: "MANUAL",
    rows: [emptyRow(accounts[0]?.id), emptyRow(accounts[1]?.id)],
  });

  const validation = useMemo(
    () => validateDoubleEntry(form.rows, accounts, periods),
    [accounts, form.rows, periods],
  );

  const updateRow = (index, key, value) => {
    setForm((current) => ({
      ...current,
      rows: current.rows.map((row, rowIndex) =>
        rowIndex === index
          ? { ...row, [key]: key === "accountId" ? value : Number(value || 0) }
          : row,
      ),
    }));
  };

  return (
    <form className="journal-form" onSubmit={(event) => event.preventDefault()}>
      <div className="journal-form__meta">
        <label>
          <span>Reference</span>
          <input
            value={form.reference}
            onChange={(event) => setForm((current) => ({ ...current, reference: event.target.value }))}
          />
        </label>
        <label>
          <span>Description</span>
          <input
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          />
        </label>
        <label>
          <span>Attachment placeholder</span>
          <input
            value={form.attachmentName}
            onChange={(event) => setForm((current) => ({ ...current, attachmentName: event.target.value }))}
          />
        </label>
        <label className="journal-form__wide">
          <span>Reason</span>
          <textarea
            value={form.reason}
            onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
          />
        </label>
      </div>

      <div className="journal-form__rows">
        {form.rows.map((row, index) => (
          <div className="journal-form__row" key={`${row.accountId}-${index}`}>
            <select
              value={row.accountId}
              onChange={(event) => updateRow(index, "accountId", event.target.value)}
              aria-label="Account"
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.code} · {account.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              value={row.debit}
              onChange={(event) => updateRow(index, "debit", event.target.value)}
              aria-label="Debit"
            />
            <input
              type="number"
              min="0"
              value={row.credit}
              onChange={(event) => updateRow(index, "credit", event.target.value)}
              aria-label="Credit"
            />
            <button
              type="button"
              aria-label="Qatorni o'chirish"
              disabled={form.rows.length <= 2}
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  rows: current.rows.filter((_, rowIndex) => rowIndex !== index),
                }))
              }
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      <div className="journal-form__footer">
        <button
          type="button"
          onClick={() =>
            setForm((current) => ({
              ...current,
              rows: [...current.rows, emptyRow(accounts[0]?.id)],
            }))
          }
        >
          <Plus size={15} />
          Add row
        </button>
        <span className={validation.ok ? "is-balanced" : "is-unbalanced"}>
          Debit {formatMoney(validation.debit)} · Credit {formatMoney(validation.credit)}
        </span>
        <button
          type="button"
          className="is-primary"
          disabled={!validation.ok || !form.reason.trim()}
          onClick={() => onSubmit({ ...form, submit: true })}
          title={!form.reason.trim() ? "Manual journal uchun sabab majburiy" : validation.errors[0]}
        >
          Submit journal
        </button>
      </div>
    </form>
  );
};

export default JournalEntryForm;
