import { GlassSelect } from "@/components/ui";
import { useEffect, useMemo, useState } from "react";

import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";

const buildInitialForm = (type = "expense") => ({
  type,
  amount: "",
  currency: "UZS",
  accountId: "1010",
  destinationAccountId: "1000",
  date: new Date().toISOString().slice(0, 10),
  partnerType: "Customer",
  counterparty: "",
  category: type === "income" ? "Mahsulot savdosi" : "Boshqa",
  description: "",
  source: "Naqd",
  branch: "",
  department: "",
  project: "",
  attachmentName: "",
});

const TransactionCreateDialog = ({ controller, open, initialType = "expense" }) => {
  const [form, setForm] = useState(() => buildInitialForm(initialType));
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(buildInitialForm(initialType));
      setTouched(false);
    }
  }, [initialType, open]);

  const errors = useMemo(() => {
    const next = {};
    if (!form.type) next.type = "Tranzaksiya turi majburiy.";
    if (Number(form.amount || 0) <= 0) next.amount = "Summa 0 dan katta bo'lishi kerak.";
    if (!form.currency) next.currency = "Valyuta tanlang.";
    if (!form.accountId) next.accountId = "Moliyaviy hisob tanlang.";
    if (form.type === "transfer" && (!form.destinationAccountId || form.destinationAccountId === form.accountId)) {
      next.destinationAccountId = "Qabul qiluvchi hisob manbadan farqli bo'lishi kerak.";
    }
    if (form.type !== "opening" && !form.counterparty.trim()) next.counterparty = "Hamkor nomini kiriting.";
    if (!form.category.trim()) next.category = "Kategoriya majburiy.";
    if (!form.description.trim()) next.description = "Izoh kiriting.";
    return next;
  }, [form]);

  const hasErrors = Object.keys(errors).length > 0;

  const update = (key, value) =>
    setForm((current) => ({
      ...current,
      [key]: key === "amount" ? value : value,
    }));

  const submit = (submitForApproval) => {
    setTouched(true);
    if (hasErrors) return;

    if (form.type === "transfer") {
      const ok = controller.actions.transferBetweenAccounts({
        sourceId: form.accountId,
        destinationId: form.destinationAccountId,
        amount: Number(form.amount),
        date: form.date,
        reason: form.description,
      });

      if (ok) {
        setForm(buildInitialForm(initialType));
        setTouched(false);
        controller.actions.closeModal();
      }
      return;
    }

    const ok = controller.actions.createTransaction({
      ...form,
      amount: Number(form.amount),
      submit: submitForApproval,
      cashDirection: form.type === "income" ? "in" : form.type === "expense" ? "out" : "none",
    });

    if (ok) {
      setForm(buildInitialForm(initialType));
      setTouched(false);
      controller.actions.closeModal();
    }
  };

  const fieldError = (key) =>
    touched && errors[key] ? <small className="finance-field-error">{errors[key]}</small> : null;

  return (
    <ConfirmDialog
      open={open}
      title="Yangi tranzaksiya"
      description="Qoralama saqlash yoki maker-checker tasdiqlash oqimiga yuborish mumkin."
      confirmLabel="Tasdiqqa yuborish"
      onClose={controller.actions.closeModal}
      onConfirm={() => submit(true)}
      confirmDisabled={touched && hasErrors}
    >
      <div className="finance-form-grid">
        <label>
          <span>Tur</span>
          <GlassSelect value={form.type} onChange={(event) => update("type", event.target.value)} aria-invalid={Boolean(touched && errors.type)}>
            <option value="income">Daromad</option>
            <option value="expense">Xarajat</option>
            <option value="transfer">Hisoblararo o'tkazma</option>
            <option value="refund">Qaytarim</option>
            <option value="adjustment">Balans tuzatish</option>
            <option value="opening">Boshlang'ich qoldiq</option>
            <option value="exchange">Valyuta ayirboshlash</option>
          </GlassSelect>
          {fieldError("type")}
        </label>
        <label>
          <span>Sana</span>
          <input type="date" value={form.date} onChange={(event) => update("date", event.target.value)} />
        </label>
        <label>
          <span>Summa</span>
          <input type="number" min="1" value={form.amount} onChange={(event) => update("amount", event.target.value)} aria-invalid={Boolean(touched && errors.amount)} />
          {fieldError("amount")}
        </label>
        <label>
          <span>Valyuta</span>
          <GlassSelect value={form.currency} onChange={(event) => update("currency", event.target.value)} aria-invalid={Boolean(touched && errors.currency)}>
            {controller.state.currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>{currency.code}</option>
            ))}
          </GlassSelect>
          {fieldError("currency")}
        </label>
        <label>
          <span>{form.type === "transfer" ? "Qaysi hisobdan" : "Hisob (Bank/Kassa)"}</span>
          <GlassSelect value={form.accountId} onChange={(event) => update("accountId", event.target.value)} aria-invalid={Boolean(touched && errors.accountId)}>
            {controller.state.accounts.map((account) => (
              <option key={account.id} value={account.id}>{account.code} | {account.name}</option>
            ))}
          </GlassSelect>
          {fieldError("accountId")}
        </label>
        {form.type === "transfer" && (
          <label>
            <span>Qaysi hisobga</span>
            <GlassSelect value={form.destinationAccountId} onChange={(event) => update("destinationAccountId", event.target.value)} aria-invalid={Boolean(touched && errors.destinationAccountId)}>
              {controller.state.accounts.map((account) => (
                <option key={account.id} value={account.id}>{account.code} | {account.name}</option>
              ))}
            </GlassSelect>
            {fieldError("destinationAccountId")}
          </label>
        )}
        <label>
          <span>Hamkor turi</span>
          <GlassSelect value={form.partnerType} onChange={(event) => update("partnerType", event.target.value)}>
            <option value="Customer">Customer</option>
            <option value="Supplier">Supplier</option>
            <option value="Other">Other</option>
          </GlassSelect>
        </label>
        <label>
          <span>Hamkor</span>
          <input value={form.counterparty} onChange={(event) => update("counterparty", event.target.value)} aria-invalid={Boolean(touched && errors.counterparty)} />
          {fieldError("counterparty")}
        </label>
        <label>
          <span>Kategoriya</span>
          <GlassSelect value={form.category} onChange={(event) => update("category", event.target.value)} aria-invalid={Boolean(touched && errors.category)}>
            {(form.type === "income"
              ? ["Mahsulot savdosi", "Xizmat", "Boshqa daromad", "Foiz daromadi", "Investitsiya", "Boshqa"]
              : ["Ijara", "Ish haqi", "Transport", "Kommunal to'lov", "Marketing", "Soliq", "Tovar xaridi", "Xizmat xaridi", "Ofis xarajatlari", "Boshqa"]
            ).map((category) => <option key={category} value={category}>{category}</option>)}
          </GlassSelect>
          {fieldError("category")}
        </label>
        <label>
          <span>Manba</span>
          <GlassSelect value={form.source} onChange={(event) => update("source", event.target.value)}>
            <option value="Naqd">Naqd</option>
            <option value="Bank">Bank</option>
            <option value="Click">Click</option>
            <option value="Payme">Payme</option>
            <option value="Terminal">Terminal</option>
            <option value="Boshqa">Boshqa</option>
          </GlassSelect>
        </label>
        <label>
          <span>Filial</span>
          <input value={form.branch} onChange={(event) => update("branch", event.target.value)} />
        </label>
        <label>
          <span>Bo'lim / loyiha</span>
          <input value={form.department || form.project} onChange={(event) => { update("department", event.target.value); update("project", event.target.value); }} />
        </label>
        <label>
          <span>Hujjat yoki chek</span>
          <input value={form.attachmentName} onChange={(event) => update("attachmentName", event.target.value)} placeholder="invoice.pdf yoki chek.jpg" />
        </label>
        <label className="finance-form-grid__wide">
          <span>Izoh</span>
          <textarea value={form.description} onChange={(event) => update("description", event.target.value)} aria-invalid={Boolean(touched && errors.description)} />
          {fieldError("description")}
        </label>
      </div>
      <button type="button" className="finance-button" onClick={() => submit(false)}>
        Qoralama saqlash
      </button>
    </ConfirmDialog>
  );
};

export default TransactionCreateDialog;
