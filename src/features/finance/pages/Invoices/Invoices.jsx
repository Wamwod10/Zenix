import { GlassSelect } from "@/components/ui";
import { useMemo, useState } from "react";

import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { formatMoney, formatStatusLabel } from "../../utils/financeFormatters";

const Invoices = ({ controller }) => {
  const [form, setForm] = useState({
    number: "",
    customer: "",
    customerDetails: "",
    date: new Date().toISOString().slice(0, 10),
    dueDate: "",
    currency: "UZS",
    branch: "",
    owner: "",
    accountId: "1010",
    description: "",
    attachmentName: "",
    items: [{ id: "line-1", name: "", quantity: 1, unit: "dona", price: "", discount: 0, tax: 0 }],
  });
  const [payment, setPayment] = useState({ invoiceId: "", amount: "", accountId: "1010" });
  const [query, setQuery] = useState("");

  const invoices = useMemo(() => {
    const search = query.trim().toLowerCase();
    return controller.state.invoices.filter((invoice) =>
      !search || `${invoice.id} ${invoice.customer} ${invoice.description}`.toLowerCase().includes(search),
    );
  }, [controller.state.invoices, query]);

  const selectedInvoice = controller.state.invoices.find((item) => item.id === payment.invoiceId);
  const remaining = selectedInvoice ? selectedInvoice.amount - selectedInvoice.paid : 0;
  const invoiceTotal = useMemo(
    () => form.items.reduce((sum, item) => {
      const subtotal = Number(item.quantity || 0) * Number(item.price || 0);
      const discount = (subtotal * Number(item.discount || 0)) / 100;
      const tax = ((subtotal - discount) * Number(item.tax || 0)) / 100;
      return sum + subtotal - discount + tax;
    }, 0),
    [form.items],
  );
  const updateLine = (lineId, key, value) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === lineId ? { ...item, [key]: value } : item)),
    }));
  };

  return (
    <section className="finance-view">
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Hisob-faktura workflow</span>
            <h2>Hisob-faktura va to'lovlar</h2>
          </div>
          <button type="button" className="finance-button is-primary" onClick={() => controller.actions.setActiveModal("create-invoice")}>Invoice yaratish</button>
        </div>
        <div className="finance-filters">
          <label>
            <span>Qidirish</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Hisob-faktura, mijoz yoki izoh" />
          </label>
        </div>
        <div className="finance-table">
          {invoices.map((invoice) => (
            <article key={invoice.id}>
              <div>
                <strong>{invoice.number || invoice.id}</strong>
                <span>{invoice.customer} | muddati {invoice.dueDate}</span>
              </div>
              <b>{formatMoney(invoice.amount - invoice.paid)}</b>
              <b>{formatMoney(invoice.paid)}</b>
              <StatusBadge status={invoice.status} label={formatStatusLabel(invoice.status)} />
              <button type="button" onClick={() => {
                setPayment({ invoiceId: invoice.id, amount: invoice.amount - invoice.paid, accountId: "1010" });
                controller.actions.setActiveModal("invoice-payment");
              }}>To'lov qabul qilish</button>
            </article>
          ))}
        </div>
      </section>

      <ConfirmDialog
        open={controller.activeModal === "create-invoice"}
        title="Hisob-faktura yaratish"
        description="Hisob-faktura saqlanganda avtomatik debitor qarzdorlik yozuvi ham ochiladi."
        confirmLabel="Hisob-faktura yaratish"
        onClose={controller.actions.closeModal}
        onConfirm={() => {
          if (controller.actions.createInvoice(form)) {
            setForm({
              number: "",
              customer: "",
              customerDetails: "",
              date: new Date().toISOString().slice(0, 10),
              dueDate: "",
              currency: "UZS",
              branch: "",
              owner: "",
              accountId: "1010",
              description: "",
              attachmentName: "",
              items: [{ id: "line-1", name: "", quantity: 1, unit: "dona", price: "", discount: 0, tax: 0 }],
            });
            controller.actions.closeModal();
          }
        }}
        confirmDisabled={!form.customer.trim() || invoiceTotal <= 0 || !form.dueDate}
      >
        <div className="finance-form-grid">
          <label><span>Hisob-faktura raqami</span><input value={form.number} onChange={(event) => setForm((current) => ({ ...current, number: event.target.value }))} placeholder="Avtomatik" /></label>
          <label><span>Mijoz</span><input value={form.customer} onChange={(event) => setForm((current) => ({ ...current, customer: event.target.value }))} /></label>
          <label><span>Mijoz rekvizitlari</span><input value={form.customerDetails} onChange={(event) => setForm((current) => ({ ...current, customerDetails: event.target.value }))} /></label>
          <label><span>Yaratilgan sana</span><input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} /></label>
          <label><span>Muddat</span><input type="date" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} /></label>
          <label><span>Valyuta</span><GlassSelect value={form.currency} onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value }))}>{controller.state.currencies.map((currency) => <option key={currency.code}>{currency.code}</option>)}</GlassSelect></label>
          <label><span>Filial</span><input value={form.branch} onChange={(event) => setForm((current) => ({ ...current, branch: event.target.value }))} /></label>
          <label><span>Mas'ul xodim</span><input value={form.owner} onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))} /></label>
          <label><span>To'lov hisobi</span><GlassSelect value={form.accountId} onChange={(event) => setForm((current) => ({ ...current, accountId: event.target.value }))}>{controller.state.accounts.map((account) => <option key={account.id} value={account.id}>{account.code} | {account.name}</option>)}</GlassSelect></label>
          <label><span>Fayl</span><input value={form.attachmentName} onChange={(event) => setForm((current) => ({ ...current, attachmentName: event.target.value }))} placeholder="invoice.pdf" /></label>
          <div className="finance-form-grid__wide finance-invoice-lines">
            <div className="finance-panel__head">
              <div><span>Mahsulot yoki xizmatlar</span><h2>Qatorlar</h2></div>
              <button type="button" className="finance-button" onClick={() => setForm((current) => ({ ...current, items: [...current.items, { id: `line-${Date.now()}`, name: "", quantity: 1, unit: "dona", price: "", discount: 0, tax: 0 }] }))}>Qator qo'shish</button>
            </div>
            {form.items.map((item) => (
              <div className="finance-invoice-lines__row" key={item.id}>
                <input placeholder="Mahsulot yoki xizmat" value={item.name} onChange={(event) => updateLine(item.id, "name", event.target.value)} />
                <input type="number" min="0" value={item.quantity} onChange={(event) => updateLine(item.id, "quantity", event.target.value)} />
                <input placeholder="Birlik" value={item.unit} onChange={(event) => updateLine(item.id, "unit", event.target.value)} />
                <input type="number" min="0" placeholder="Narx" value={item.price} onChange={(event) => updateLine(item.id, "price", event.target.value)} />
                <input type="number" min="0" max="100" placeholder="Chegirma %" value={item.discount} onChange={(event) => updateLine(item.id, "discount", event.target.value)} />
                <input type="number" min="0" placeholder="Soliq %" value={item.tax} onChange={(event) => updateLine(item.id, "tax", event.target.value)} />
              </div>
            ))}
            <strong>Jami to'lov: {formatMoney(invoiceTotal, form.currency)}</strong>
          </div>
          <label className="finance-form-grid__wide"><span>Izoh</span><textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></label>
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={controller.activeModal === "invoice-payment"}
        title="Hisob-faktura to'lovi"
        description={`Qolgan summa: ${formatMoney(remaining)}`}
        confirmLabel="To'lovni o'tkazish"
        onClose={controller.actions.closeModal}
        onConfirm={() => {
          if (controller.actions.recordInvoicePayment(payment.invoiceId, payment.amount, payment.accountId)) {
            controller.actions.closeModal();
          }
        }}
        confirmDisabled={!payment.invoiceId || Number(payment.amount || 0) <= 0 || Number(payment.amount || 0) > remaining}
      >
        <div className="finance-form-grid">
          <label><span>Summa</span><input type="number" min="1" value={payment.amount} onChange={(event) => setPayment((current) => ({ ...current, amount: event.target.value }))} /></label>
          <label>
            <span>Qabul qiluvchi hisob</span>
            <GlassSelect value={payment.accountId} onChange={(event) => setPayment((current) => ({ ...current, accountId: event.target.value }))}>
              {controller.state.accounts.filter((account) => account.kind === "bank" || account.kind === "cash").map((account) => (
                <option key={account.id} value={account.id}>{account.code} | {account.name}</option>
              ))}
            </GlassSelect>
          </label>
        </div>
      </ConfirmDialog>
    </section>
  );
};

export default Invoices;
