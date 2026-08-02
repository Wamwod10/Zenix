import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { validateDoubleEntry } from "../../utils/financeCalculations";
import { formatMoney } from "../../utils/financeFormatters";

import "./JournalEntryForm.scss";

const emptyRow = (accountId = "") => ({ accountId, debit: 0, credit: 0 });

const JournalEntryForm = ({ accounts, periods, onSubmit }) => {
  const [form, setForm] = useState({
    description: "",
    reason: "",
    attachmentName: "",
    reference: "MANUAL",
    rows: [emptyRow(accounts[0]?.id), emptyRow(accounts[1]?.id)],
  });
  const [touched, setTouched] = useState(false);

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

  const canSubmit = validation.ok && form.reason.trim() && form.reference.trim() && form.description.trim();

  return (
    <form className="journal-form" onSubmit={(event) => event.preventDefault()}>
      <div className="journal-form__meta">
        <label>
          <span>Hujjat raqami</span>
          <input
            value={form.reference}
            onChange={(event) => setForm((current) => ({ ...current, reference: event.target.value }))}
            aria-invalid={Boolean(touched && !form.reference.trim())}
          />
          {touched && !form.reference.trim() && <small className="finance-field-error">Hujjat raqami majburiy.</small>}
        </label>
        <label>
          <span>Izoh</span>
          <input
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            aria-invalid={Boolean(touched && !form.description.trim())}
          />
          {touched && !form.description.trim() && <small className="finance-field-error">Izoh majburiy.</small>}
        </label>
        <label>
          <span>Hujjat nomi</span>
          <input
            value={form.attachmentName}
            placeholder="Masalan: dalolatnoma.pdf"
            onChange={(event) => setForm((current) => ({ ...current, attachmentName: event.target.value }))}
          />
        </label>
        <label className="journal-form__wide">
          <span>Sabab</span>
          <textarea
            value={form.reason}
            onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
            aria-invalid={Boolean(touched && !form.reason.trim())}
          />
          {touched && !form.reason.trim() && <small className="finance-field-error">Manual journal uchun sabab majburiy.</small>}
        </label>
      </div>

      <div className="journal-form__rows">
        {form.rows.map((row, index) => (
          <div className="journal-form__row" key={`${row.accountId}-${index}`}>
            <select
              value={row.accountId}
              onChange={(event) => updateRow(index, "accountId", event.target.value)}
              aria-label="Hisob"
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.code} | {account.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              value={row.debit}
              onChange={(event) => updateRow(index, "debit", event.target.value)}
              aria-label="Debit summa"
            />
            <input
              type="number"
              min="0"
              value={row.credit}
              onChange={(event) => updateRow(index, "credit", event.target.value)}
              aria-label="Kredit summa"
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
          Qator qo'shish
        </button>
        <span className={validation.ok ? "is-balanced" : "is-unbalanced"}>
          Debit {formatMoney(validation.debit)} | Kredit {formatMoney(validation.credit)}
        </span>
        {touched && validation.errors[0] && <small className="finance-field-error">{validation.errors[0]}</small>}
        <button
          type="button"
          className="is-primary"
          disabled={!canSubmit}
          onClick={() => {
            setTouched(true);
            if (canSubmit) {
              onSubmit({ ...form, submit: true });
            }
          }}
          title={!form.reason.trim() ? "Manual journal uchun sabab majburiy" : validation.errors[0]}
        >
          Journalni tasdiqqa yuborish
        </button>
      </div>
    </form>
  );
};

export default JournalEntryForm;
