import { useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  FileClock,
  Hourglass,
  Send,
  WalletCards,
  XCircle,
} from "lucide-react";

import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { PAYMENT_ORDER_STATUS } from "../../constants/financeConstants";
import { formatDate, formatMoney, formatStatusLabel } from "../../utils/financeFormatters";

const emptyForm = {
  supplier: "",
  supplierTaxId: "",
  supplierAccountNumber: "",
  supplierBank: "",
  supplierMfo: "",
  amount: "",
  currency: "UZS",
  accountId: "",
  date: new Date().toISOString().slice(0, 10),
  dueDate: "",
  paymentPurpose: "",
  documentNumber: "",
  contractNumber: "",
  invoiceId: "",
  payableId: "",
  reason: "",
  fee: "",
  budgetCategory: "",
  expenseCategory: "",
  approver: "",
  approvalStage: "1-bosqich",
  priority: "normal",
  attachmentName: "",
};

const statusTone = (status) => {
  if ([PAYMENT_ORDER_STATUS.PAID, PAYMENT_ORDER_STATUS.APPROVED, PAYMENT_ORDER_STATUS.READY].includes(status)) return "success";
  if ([PAYMENT_ORDER_STATUS.PENDING, PAYMENT_ORDER_STATUS.SENT].includes(status)) return "warning";
  if ([PAYMENT_ORDER_STATUS.REJECTED, PAYMENT_ORDER_STATUS.CANCELLED, PAYMENT_ORDER_STATUS.OVERDUE].includes(status)) return "danger";
  return "Draft";
};

const PaymentOrders = ({ controller }) => {
  const bankAccounts = controller.state.accounts.filter((account) => account.kind === "bank");
  const [form, setForm] = useState({ ...emptyForm, accountId: bankAccounts[0]?.id || "" });
  const [filters, setFilters] = useState({ search: "", status: "all", accountId: "all", currency: "all", overdueOnly: false });
  const [reject, setReject] = useState({ id: "", reason: "" });

  const selectedAccount = controller.state.accounts.find((account) => account.id === form.accountId);
  const afterBalance = selectedAccount ? Number(selectedAccount.openingBalance || 0) - Number(form.amount || 0) - Number(form.fee || 0) : 0;

  const rows = useMemo(() => controller.state.paymentOrders.filter((order) => {
    const query = filters.search.trim().toLowerCase();
    const haystack = `${order.id} ${order.number} ${order.supplier} ${order.paymentPurpose} ${order.documentNumber}`.toLowerCase();
    const overdue = order.dueDate && new Date(order.dueDate) < new Date() && ![PAYMENT_ORDER_STATUS.PAID, PAYMENT_ORDER_STATUS.CANCELLED].includes(order.status);
    return (
      (!query || haystack.includes(query)) &&
      (filters.status === "all" || order.status === filters.status) &&
      (filters.accountId === "all" || order.accountId === filters.accountId) &&
      (filters.currency === "all" || order.currency === filters.currency) &&
      (!filters.overdueOnly || overdue)
    );
  }), [controller.state.paymentOrders, filters]);

  const summary = {
    total: controller.state.paymentOrders.length,
    pending: controller.state.paymentOrders.filter((order) => order.status === PAYMENT_ORDER_STATUS.PENDING).length,
    dueToday: controller.state.paymentOrders.filter((order) => order.dueDate === new Date().toISOString().slice(0, 10)).length,
    overdue: controller.state.paymentOrders.filter((order) => order.dueDate && new Date(order.dueDate) < new Date() && order.status !== PAYMENT_ORDER_STATUS.PAID).length,
    planned: controller.state.paymentOrders.reduce((sum, order) => sum + Number(order.amount || 0), 0),
  };
  const summaryCards = [
    {
      icon: FileClock,
      label: "Jami topshiriqlar",
      value: summary.total,
      hint: "Barcha bank to'lov topshiriqlari",
      tone: "is-flow",
    },
    {
      icon: Hourglass,
      label: "Tasdiq kutilmoqda",
      value: summary.pending,
      hint: "Tasdiqlash jarayonidagi hujjatlar",
      tone: "is-bank",
    },
    {
      icon: CalendarClock,
      label: "Bugun to'lanadi",
      value: summary.dueToday,
      hint: "Bugungi muddatli topshiriqlar",
      tone: "is-income",
    },
    {
      icon: CircleAlert,
      label: "Muddati o'tgan",
      value: summary.overdue,
      hint: "E'tibor talab qiladigan to'lovlar",
      tone: "is-expense",
    },
    {
      icon: WalletCards,
      label: "Rejalashtirilgan summa",
      value: formatMoney(summary.planned),
      hint: "To'lovga rejalangan umumiy summa",
      tone: "is-net",
    },
  ];

  const fillFromPayable = (payableId) => {
    const payable = controller.state.payables.find((item) => item.id === payableId);
    if (!payable) return;
    setForm((current) => ({
      ...current,
      payableId,
      supplier: payable.supplier || "",
      amount: payable.balance || payable.total || "",
      dueDate: payable.dueDate || current.dueDate,
      documentNumber: payable.bill || current.documentNumber,
      paymentPurpose: `Kreditor qarzdorlik to'lovi: ${payable.bill || payable.id}`,
    }));
  };

  const resetForm = () => setForm({ ...emptyForm, accountId: bankAccounts[0]?.id || "" });
  const submit = (submitForApproval) => {
    const ok = controller.actions.createPaymentOrder({ ...form, submit: submitForApproval });
    if (ok) {
      resetForm();
      controller.actions.closeModal();
    }
  };

  return (
    <section className="finance-view">
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Bank to'lov topshiriqlari</span>
            <h2>To'lov topshiriqlari</h2>
          </div>
          <button type="button" className="finance-button is-primary" onClick={() => controller.actions.setActiveModal("create-payment-order")}>
            <FileClock size={16} /> To'lov topshirig'i yaratish
          </button>
        </div>

        <div className="finance-card-grid">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <article className={`finance-mini-card finance-mini-card--metric ${card.tone}`} key={card.label}>
                <span className="finance-mini-card__icon" aria-hidden="true">
                  <Icon size={18} />
                </span>
                <span className="finance-mini-card__label">{card.label}</span>
                <strong>{card.value}</strong>
                <small>{card.hint}</small>
              </article>
            );
          })}
        </div>

        <div className="finance-filters">
          <label><span>Qidiruv</span><input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Supplier, hujjat yoki maqsad" /></label>
          <label><span>Holat</span><input value={filters.status === "all" ? "" : filters.status} placeholder="Barcha holatlar" onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value.trim() || "all" }))} /></label>
          <label><span>Bank hisobi</span><input value={filters.accountId === "all" ? "" : filters.accountId} placeholder="Barcha hisoblar" onChange={(event) => setFilters((current) => ({ ...current, accountId: event.target.value.trim() || "all" }))} /></label>
          <button type="button" className={`finance-button ${filters.overdueOnly ? "is-primary" : ""}`} onClick={() => setFilters((current) => ({ ...current, overdueOnly: !current.overdueOnly }))}>Faqat muddati o'tganlar</button>
        </div>

        {rows.length ? (
          <div className="finance-table finance-table--payment-orders">
            {rows.map((order) => {
              const account = controller.state.accounts.find((item) => item.id === order.accountId);
              return (
                <article key={order.id}>
                  <div>
                    <strong>{order.number || order.id}</strong>
                    <span>{formatDate(order.date)} | muddat {formatDate(order.dueDate)}</span>
                  </div>
                  <div>
                    <strong>{order.supplier}</strong>
                    <span>{order.paymentPurpose || order.reason}</span>
                  </div>
                  <b>{account ? `${account.code} | ${account.name}` : "Hisob topilmadi"}</b>
                  <b>{formatMoney(order.amount, order.currency)}</b>
                  <StatusBadge status={statusTone(order.status)} label={formatStatusLabel(order.status)} />
                  <div className="finance-row-actions">
                    <button type="button" disabled={order.status !== PAYMENT_ORDER_STATUS.PENDING} onClick={() => controller.actions.approvePaymentOrder(order.id)}>
                      <CheckCircle2 size={15} /> Tasdiqlash
                    </button>
                    <button type="button" disabled={order.status !== PAYMENT_ORDER_STATUS.PENDING} onClick={() => { setReject({ id: order.id, reason: "" }); controller.actions.setActiveModal("reject-payment-order"); }}>
                      <XCircle size={15} /> Rad etish
                    </button>
                    <button type="button" disabled={order.status !== PAYMENT_ORDER_STATUS.APPROVED} onClick={() => controller.actions.postPaymentOrder(order.id)}>
                      <Send size={15} /> To'lash
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="finance-empty">
            Hozircha to'lov topshiriqlari yaratilmagan.
            <button type="button" className="finance-button is-primary" onClick={() => controller.actions.setActiveModal("create-payment-order")}>Birinchi to'lov topshirig'ini yarating</button>
          </div>
        )}
      </section>

      <ConfirmDialog
        open={controller.activeModal === "create-payment-order"}
        title="To'lov topshirig'i yaratish"
        description="Qoralama saqlash yoki tasdiqqa yuborish mumkin. Balans va majburiy maydonlar tekshiriladi."
        confirmLabel="Tasdiqqa yuborish"
        onClose={controller.actions.closeModal}
        onConfirm={() => submit(true)}
        confirmDisabled={!form.supplier.trim() || Number(form.amount || 0) <= 0 || !form.accountId || afterBalance < 0}
      >
        <div className="finance-modal-sections">
          <section>
            <h3>Oluvchi</h3>
            <div className="finance-form-grid">
              <label><span>Yetkazib beruvchi yoki kontragent</span><input value={form.supplier} onChange={(event) => setForm((current) => ({ ...current, supplier: event.target.value }))} /></label>
              <label><span>STIR</span><input value={form.supplierTaxId} onChange={(event) => setForm((current) => ({ ...current, supplierTaxId: event.target.value }))} /></label>
              <label><span>Hisob raqami</span><input value={form.supplierAccountNumber} onChange={(event) => setForm((current) => ({ ...current, supplierAccountNumber: event.target.value }))} /></label>
              <label><span>Bank / MFO</span><input value={`${form.supplierBank}${form.supplierMfo ? ` / ${form.supplierMfo}` : ""}`} onChange={(event) => setForm((current) => ({ ...current, supplierBank: event.target.value, supplierMfo: current.supplierMfo }))} /></label>
            </div>
          </section>
          <section>
            <h3>To'lov ma'lumotlari</h3>
            <div className="finance-form-grid">
              <label><span>Summa</span><input type="number" min="1" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} /></label>
              <label><span>Valyuta</span><input value={form.currency} onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value }))} /></label>
              <label><span>To'lov sanasi</span><input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} /></label>
              <label><span>Muddat</span><input type="date" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} /></label>
              <label><span>Hujjat raqami</span><input value={form.documentNumber} onChange={(event) => setForm((current) => ({ ...current, documentNumber: event.target.value }))} /></label>
              <label><span>Shartnoma yoki invoice</span><input value={form.contractNumber} onChange={(event) => setForm((current) => ({ ...current, contractNumber: event.target.value }))} /></label>
              <label className="finance-form-grid__wide"><span>To'lov maqsadi</span><textarea value={form.paymentPurpose} onChange={(event) => setForm((current) => ({ ...current, paymentPurpose: event.target.value }))} /></label>
            </div>
          </section>
          <section>
            <h3>Mablag' manbasi</h3>
            <div className="finance-form-grid">
              <label><span>Bank hisobi</span><input value={form.accountId} onChange={(event) => setForm((current) => ({ ...current, accountId: event.target.value }))} list="payment-bank-accounts" /></label>
              <datalist id="payment-bank-accounts">{bankAccounts.map((account) => <option key={account.id} value={account.id}>{account.code} | {account.name}</option>)}</datalist>
              <label><span>Joriy balans</span><input value={selectedAccount ? formatMoney(selectedAccount.openingBalance, selectedAccount.currency) : "Hisob tanlanmagan"} disabled /></label>
              <label><span>To'lovdan keyingi balans</span><input value={selectedAccount ? formatMoney(afterBalance, selectedAccount.currency) : "—"} disabled aria-invalid={afterBalance < 0} /></label>
              <label><span>Komissiya</span><input type="number" min="0" value={form.fee} onChange={(event) => setForm((current) => ({ ...current, fee: event.target.value }))} /></label>
              <label><span>Byudjet kategoriyasi</span><input value={form.budgetCategory} onChange={(event) => setForm((current) => ({ ...current, budgetCategory: event.target.value }))} /></label>
              <label><span>Xarajat kategoriyasi</span><input value={form.expenseCategory} onChange={(event) => setForm((current) => ({ ...current, expenseCategory: event.target.value }))} /></label>
            </div>
          </section>
          <section>
            <h3>Tasdiqlash</h3>
            <div className="finance-form-grid">
              <label><span>Tasdiqlovchi</span><input value={form.approver} onChange={(event) => setForm((current) => ({ ...current, approver: event.target.value }))} /></label>
              <label><span>Bosqich</span><input value={form.approvalStage} onChange={(event) => setForm((current) => ({ ...current, approvalStage: event.target.value }))} /></label>
              <label><span>Ustuvorlik</span><input value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))} /></label>
              <label><span>Qo'shimcha fayl</span><input value={form.attachmentName} onChange={(event) => setForm((current) => ({ ...current, attachmentName: event.target.value }))} placeholder="invoice.pdf" /></label>
            </div>
          </section>
          {controller.state.payables.length > 0 && (
            <section>
              <h3>Kreditor qarzdorlikdan to'ldirish</h3>
              <div className="finance-row-actions">
                {controller.state.payables.slice(0, 4).map((payable) => (
                  <button type="button" className="finance-button" key={payable.id} onClick={() => fillFromPayable(payable.id)}>
                    {payable.supplier} | {formatMoney(payable.balance)}
                  </button>
                ))}
              </div>
            </section>
          )}
          {afterBalance < 0 && <div className="finance-warning">Tanlangan bank hisobida mablag' yetarli emas.</div>}
          <div className="finance-actions-row">
            <button type="button" className="finance-button" onClick={() => submit(false)}>Qoralama saqlash</button>
          </div>
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={controller.activeModal === "reject-payment-order"}
        title="To'lov topshirig'ini rad etish"
        description="Rad etish sababi audit jurnaliga yoziladi."
        confirmLabel="Rad etish"
        onClose={controller.actions.closeModal}
        onConfirm={() => {
          if (controller.actions.rejectPaymentOrder(reject.id, reject.reason)) {
            setReject({ id: "", reason: "" });
            controller.actions.closeModal();
          }
        }}
        confirmDisabled={!reject.reason.trim()}
      >
        <div className="finance-form-grid">
          <label className="finance-form-grid__wide"><span>Sabab</span><textarea value={reject.reason} onChange={(event) => setReject((current) => ({ ...current, reason: event.target.value }))} /></label>
        </div>
      </ConfirmDialog>
    </section>
  );
};

export default PaymentOrders;
