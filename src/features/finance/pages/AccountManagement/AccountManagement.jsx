import { useMemo, useState } from "react";
import { Archive, Building2, Edit3, Eye, MoreHorizontal, Power, Repeat2 } from "lucide-react";

import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { ACCOUNT_STATUS, CASH_DIRECTION } from "../../constants/financeConstants";
import { formatDate, formatDateTime, formatMoney, formatStatusLabel } from "../../utils/financeFormatters";

const emptyBankForm = {
  id: "",
  name: "",
  code: "",
  bankName: "",
  accountNumber: "",
  mfo: "",
  currency: "UZS",
  openingBalance: "",
  blockedAmount: "",
  branch: "",
  owner: "",
  isMain: false,
  note: "",
};

const emptyTransferForm = {
  sourceId: "",
  destinationId: "",
  amount: "",
  currency: "UZS",
  rate: "",
  fee: "",
  date: new Date().toISOString().slice(0, 10),
  documentNumber: "",
  reason: "",
};

const emptyCashOperation = {
  accountId: "",
  direction: CASH_DIRECTION.IN,
  amount: "",
  category: "",
  counterparty: "",
  reason: "",
  date: new Date().toISOString().slice(0, 10),
};

const emptyCashClose = {
  accountId: "",
  actualBalance: "",
  reason: "",
};

const maskAccountNumber = (value = "") => {
  const clean = String(value || "").replace(/\s/g, "");
  if (!clean) return "Hisob raqami kiritilmagan";
  if (clean.length <= 8) return clean;
  return `${clean.slice(0, 4)} **** **** ${clean.slice(-4)}`;
};

const accountStatus = (account) => {
  if (account.status === ACCOUNT_STATUS.ARCHIVED) return "Archived";
  if (account.active === false || account.status === ACCOUNT_STATUS.INACTIVE) return "warning";
  return "success";
};

const ChoiceGroup = ({ label, value, options, onChange }) => (
  <div className="finance-choice">
    <span>{label}</span>
    <div className="finance-choice__grid">
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          className={value === option.value ? "is-active" : ""}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);

const BankAccountForm = ({ controller, form, setForm, errors }) => (
  <div className="finance-form-grid">
    <label>
      <span>Hisob nomi</span>
      <input value={form.name} aria-invalid={Boolean(errors.name)} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Asosiy bank hisobi" />
      {errors.name && <small className="finance-field-error">{errors.name}</small>}
    </label>
    <label>
      <span>Hisob kodi</span>
      <input value={form.code} aria-invalid={Boolean(errors.code)} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} placeholder="1010" />
      {errors.code && <small className="finance-field-error">{errors.code}</small>}
    </label>
    <label>
      <span>Bank nomi</span>
      <input value={form.bankName} aria-invalid={Boolean(errors.bankName)} onChange={(event) => setForm((current) => ({ ...current, bankName: event.target.value }))} placeholder="Kapitalbank" />
      {errors.bankName && <small className="finance-field-error">{errors.bankName}</small>}
    </label>
    <label>
      <span>Hisob raqami</span>
      <input value={form.accountNumber} aria-invalid={Boolean(errors.accountNumber)} onChange={(event) => setForm((current) => ({ ...current, accountNumber: event.target.value }))} placeholder="2020 8000 0000 0000 0000" />
      {errors.accountNumber && <small className="finance-field-error">{errors.accountNumber}</small>}
    </label>
    <label>
      <span>MFO</span>
      <input value={form.mfo} aria-invalid={Boolean(errors.mfo)} onChange={(event) => setForm((current) => ({ ...current, mfo: event.target.value }))} placeholder="00444" />
      {errors.mfo && <small className="finance-field-error">{errors.mfo}</small>}
    </label>
    <ChoiceGroup
      label="Valyuta"
      value={form.currency}
      options={controller.state.currencies.map((currency) => ({ value: currency.code, label: currency.code }))}
      onChange={(currency) => setForm((current) => ({ ...current, currency }))}
    />
    <label>
      <span>Boshlang'ich balans</span>
      <input type="number" min="0" value={form.openingBalance} aria-invalid={Boolean(errors.openingBalance)} onChange={(event) => setForm((current) => ({ ...current, openingBalance: event.target.value }))} />
      {errors.openingBalance && <small className="finance-field-error">{errors.openingBalance}</small>}
    </label>
    <label>
      <span>Bloklangan mablag'</span>
      <input type="number" min="0" value={form.blockedAmount} onChange={(event) => setForm((current) => ({ ...current, blockedAmount: event.target.value }))} />
    </label>
    <label>
      <span>Filial</span>
      <input value={form.branch} onChange={(event) => setForm((current) => ({ ...current, branch: event.target.value }))} placeholder="Bosh filial" />
    </label>
    <label>
      <span>Mas'ul shaxs</span>
      <input value={form.owner} onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))} placeholder="Bosh buxgalter" />
    </label>
    <label className="finance-switch">
      <input type="checkbox" checked={form.isMain} onChange={(event) => setForm((current) => ({ ...current, isMain: event.target.checked }))} />
      <span>Asosiy hisob sifatida belgilash</span>
    </label>
    <label className="finance-form-grid__wide">
      <span>Izoh</span>
      <textarea value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} placeholder="Bank hisobiga oid qo'shimcha ma'lumot" />
    </label>
  </div>
);

const AccountManagement = ({ controller, kind = "bank" }) => {
  const isBank = kind === "bank";
  const accounts = controller.state.accounts.filter((account) => account.kind === kind);
  const [form, setForm] = useState({ ...emptyBankForm, kind });
  const [transfer, setTransfer] = useState(emptyTransferForm);
  const [cashOperation, setCashOperation] = useState(emptyCashOperation);
  const [cashClose, setCashClose] = useState(emptyCashClose);
  const [selectedId, setSelectedId] = useState(accounts[0]?.id || "");
  const [actionMenu, setActionMenu] = useState("");
  const selectedAccount = accounts.find((account) => account.id === selectedId);

  const accountMovements = useMemo(
    () => controller.state.transactions.filter((item) => item.accountId === selectedId),
    [controller.state.transactions, selectedId],
  );

  const paymentOrders = controller.state.paymentOrders.filter((order) => order.accountId === selectedId);
  const activeAccounts = accounts.filter((account) => account.active !== false && account.status !== ACCOUNT_STATUS.ARCHIVED);
  const today = new Date().toISOString().slice(0, 10);
  const todaysBankTransactions = controller.state.transactions.filter((item) => item.date === today && accounts.some((account) => account.id === item.accountId));
  const totalUzs = accounts.filter((account) => account.currency === "UZS").reduce((sum, account) => sum + Number(account.openingBalance || 0), 0);
  const totalUsd = accounts.filter((account) => account.currency === "USD").reduce((sum, account) => sum + Number(account.openingBalance || 0), 0);
  const todayIn = todaysBankTransactions.filter((item) => item.cashDirection === "in").reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const todayOut = todaysBankTransactions.filter((item) => item.cashDirection === "out").reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const unreconciled = controller.state.reconciliation.system.filter((item) => !item.matched).length;

  const validationErrors = useMemo(() => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Hisob nomi majburiy.";
    if (!form.code.trim()) errors.code = "Hisob kodi majburiy.";
    if (accounts.some((account) => account.id !== form.id && account.code === form.code.trim())) errors.code = "Bu kod mavjud.";
    if (isBank && !form.bankName.trim()) errors.bankName = "Bank nomi majburiy.";
    if (isBank && form.accountNumber.replace(/\D/g, "").length < 20) errors.accountNumber = "Hisob raqami kamida 20 raqam bo'lishi kerak.";
    if (isBank && form.mfo.replace(/\D/g, "").length !== 5) errors.mfo = "MFO 5 raqam bo'lishi kerak.";
    if (Number(form.openingBalance || 0) < 0) errors.openingBalance = "Manfiy balans mumkin emas.";
    return errors;
  }, [accounts, form, isBank]);

  const resetForm = () => setForm({ ...emptyBankForm, kind });
  const openCreate = () => {
    resetForm();
    controller.actions.setActiveModal(isBank ? "create-bank-account" : "create-cash-account");
  };
  const openEdit = (account) => {
    setForm({ ...emptyBankForm, ...account, openingBalance: account.openingBalance || "", blockedAmount: account.blockedAmount || "", kind });
    setActionMenu("");
    controller.actions.setActiveModal(isBank ? "edit-bank-account" : "edit-cash-account");
  };
  const submitAccount = () => {
    if (Object.keys(validationErrors).length) return false;
    const ok = form.id
      ? controller.actions.updateFinanceAccount(form.id, { ...form, kind })
      : controller.actions.createFinanceAccount({ ...form, kind });
    if (ok) {
      resetForm();
      controller.actions.closeModal();
    }
    return ok;
  };

  const startTransfer = (account) => {
    setTransfer({ ...emptyTransferForm, sourceId: account?.id || "", currency: account?.currency || "UZS" });
    setActionMenu("");
    controller.actions.setActiveModal("account-transfer");
  };

  const openCashOperation = (account, direction, category = "") => {
    setCashOperation({
      ...emptyCashOperation,
      accountId: account.id,
      direction,
      category,
      counterparty: account.cashier || controller.currentUser,
    });
    controller.actions.setActiveModal("cash-operation");
  };

  if (!isBank) {
    const openSessions = controller.state.cashSessions.filter((session) => session.status === "open");
    const todayTransactions = controller.state.transactions.filter((item) => item.date === today && accounts.some((account) => account.id === item.accountId));
    const totalCash = accounts.reduce((sum, account) => sum + Number(account.openingBalance || 0), 0);
    const cashIn = todayTransactions.filter((item) => item.cashDirection === CASH_DIRECTION.IN).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const cashOut = todayTransactions.filter((item) => item.cashDirection === CASH_DIRECTION.OUT).reduce((sum, item) => sum + Number(item.amount || 0), 0);

    return (
      <section className="finance-view">
        <section className="finance-panel">
          <div className="finance-panel__head">
            <div>
              <span>Kassa hisoblari</span>
              <h2>Kassa va smena boshqaruvi</h2>
            </div>
            <button type="button" className="finance-button is-primary" onClick={openCreate}>Hisob qo'shish</button>
          </div>

          <div className="finance-card-grid">
            <article className="finance-mini-card"><strong>{formatMoney(totalCash)}</strong><span>Jami kassa qoldig'i</span></article>
            <article className="finance-mini-card"><strong>{formatMoney(cashIn)}</strong><span>Bugungi kirim</span></article>
            <article className="finance-mini-card"><strong>{formatMoney(cashOut)}</strong><span>Bugungi chiqim</span></article>
            <article className="finance-mini-card"><strong>{openSessions.length}</strong><span>Ochiq smenalar</span></article>
          </div>

          <div className="finance-account-list">
            {accounts.map((account) => (
              <article className="finance-account-row" key={account.id}>
                <div className="finance-account-row__main">
                  <StatusBadge status={account.shiftStatus === "open" ? "success" : "warning"} label={account.shiftStatus === "open" ? "Smena ochiq" : "Smena yopiq"} />
                  <strong>{account.code} | {account.name}</strong>
                  <span>{account.branch || "Filial kiritilmagan"} | kassir: {account.cashier || "Belgilanmagan"}</span>
                </div>
                <div><span>Valyuta</span><strong>{account.currency}</strong></div>
                <div><span>Qoldiq</span><strong>{formatMoney(account.openingBalance, account.currency)}</strong></div>
                <div><span>Oxirgi inkassatsiya</span><strong>{formatDateTime(account.lastCollectionAt)}</strong></div>
                <div><span>Holat</span><strong>{account.active === false ? "Nofaol" : "Faol"}</strong></div>
                <button type="button" className="finance-icon-button" aria-label="Kassa amallari" onClick={() => setActionMenu(actionMenu === account.id ? "" : account.id)}>
                  <MoreHorizontal size={18} />
                </button>
                {actionMenu === account.id && (
                  <div className="finance-action-menu">
                    <button type="button" onClick={() => { controller.actions.openCashSession({ accountId: account.id, cashier: account.cashier || controller.currentUser, openingBalance: account.openingBalance }); setActionMenu(""); }}>Kassani ochish</button>
                    <button type="button" onClick={() => { setCashClose({ accountId: account.id, actualBalance: account.openingBalance || "", reason: "" }); controller.actions.setActiveModal("close-cash-session"); setActionMenu(""); }}>Kassani yopish</button>
                    <button type="button" onClick={() => { openCashOperation(account, CASH_DIRECTION.IN, "Qo'lda kirim"); setActionMenu(""); }}>Kirim kiritish</button>
                    <button type="button" onClick={() => { openCashOperation(account, CASH_DIRECTION.OUT, "Qo'lda chiqim"); setActionMenu(""); }}>Chiqim kiritish</button>
                    <button type="button" onClick={() => { openCashOperation(account, CASH_DIRECTION.OUT, "Inkassatsiya"); setActionMenu(""); }}>Inkassatsiya</button>
                    <button type="button" onClick={() => { startTransfer(account); setActionMenu(""); }}>Bankka topshirish</button>
                    <button type="button" onClick={() => { openEdit(account); setActionMenu(""); }}>Tahrirlash</button>
                    <button type="button" onClick={() => { controller.actions.toggleFinanceAccount(account.id); setActionMenu(""); }}>{account.active === false ? "Qayta faollashtirish" : "Nofaol qilish"}</button>
                  </div>
                )}
              </article>
            ))}
          </div>
          {!accounts.length && (
            <div className="finance-empty">
              Hozircha kassa hisoblari mavjud emas.
              <button type="button" className="finance-button is-primary" onClick={openCreate}>Birinchi kassani yarating</button>
            </div>
          )}
        </section>

        <ConfirmDialog
          open={controller.activeModal === "cash-operation"}
          title={cashOperation.direction === CASH_DIRECTION.IN ? "Kassa kirimi" : "Kassa chiqimi"}
          description="Kassa operatsiyasi balans, pul oqimi va audit jurnaliga bir vaqtda yoziladi."
          confirmLabel="Saqlash"
          onClose={controller.actions.closeModal}
          onConfirm={() => {
            if (controller.actions.createCashOperation(cashOperation)) {
              setCashOperation(emptyCashOperation);
              controller.actions.closeModal();
            }
          }}
          confirmDisabled={!cashOperation.accountId || Number(cashOperation.amount || 0) <= 0}
        >
          <div className="finance-form-grid">
            <label><span>Summa</span><input type="number" min="0" value={cashOperation.amount} onChange={(event) => setCashOperation((current) => ({ ...current, amount: event.target.value }))} /></label>
            <label><span>Kategoriya</span><input value={cashOperation.category} onChange={(event) => setCashOperation((current) => ({ ...current, category: event.target.value }))} /></label>
            <label><span>Sana</span><input type="date" value={cashOperation.date} onChange={(event) => setCashOperation((current) => ({ ...current, date: event.target.value }))} /></label>
            <label><span>Mas'ul</span><input value={cashOperation.counterparty} onChange={(event) => setCashOperation((current) => ({ ...current, counterparty: event.target.value }))} /></label>
            <label className="finance-form-grid__wide"><span>Izoh</span><textarea value={cashOperation.reason} onChange={(event) => setCashOperation((current) => ({ ...current, reason: event.target.value }))} /></label>
          </div>
        </ConfirmDialog>

        <ConfirmDialog
          open={controller.activeModal === "create-cash-account" || controller.activeModal === "edit-cash-account"}
          title={form.id ? "Kassa hisobini tahrirlash" : "Kassa hisobi qo'shish"}
          description="Kassa hisobi filial, kassir va balans nazorati bilan saqlanadi."
          confirmLabel={form.id ? "Saqlash" : "Kassa yaratish"}
          onClose={controller.actions.closeModal}
          onConfirm={submitAccount}
          confirmDisabled={Object.keys(validationErrors).length > 0}
        >
          <BankAccountForm controller={controller} form={form} setForm={setForm} errors={validationErrors} />
        </ConfirmDialog>

        <ConfirmDialog
          open={controller.activeModal === "close-cash-session"}
          title="Kassa smenasini yopish"
          description="Haqiqiy qoldiq tizimdagi qoldiq bilan solishtiriladi. Farq bo'lsa audit yozuvi yaratiladi."
          confirmLabel="Smenani yopish"
          onClose={controller.actions.closeModal}
          onConfirm={() => {
            if (controller.actions.closeCashSession(cashClose)) {
              setCashClose(emptyCashClose);
              controller.actions.closeModal();
            }
          }}
          confirmDisabled={!cashClose.accountId || cashClose.actualBalance === ""}
        >
          <div className="finance-form-grid">
            <label><span>Haqiqiy qoldiq</span><input type="number" min="0" value={cashClose.actualBalance} onChange={(event) => setCashClose((current) => ({ ...current, actualBalance: event.target.value }))} /></label>
            <label className="finance-form-grid__wide"><span>Sabab yoki izoh</span><textarea value={cashClose.reason} onChange={(event) => setCashClose((current) => ({ ...current, reason: event.target.value }))} /></label>
          </div>
        </ConfirmDialog>
      </section>
    );
  }

  return (
    <section className="finance-view">
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Bank hisoblari</span>
            <h2>Bank va hisob balanslari</h2>
          </div>
          <div className="finance-row-actions">
            <button type="button" className="finance-button" onClick={() => startTransfer(selectedAccount || accounts[0])}>
              <Repeat2 size={16} /> Hisoblararo o'tkazma
            </button>
            <button type="button" className="finance-button is-primary" onClick={openCreate}>
              <Building2 size={16} /> Hisob qo'shish
            </button>
          </div>
        </div>

        <div className="finance-card-grid">
          <article className="finance-mini-card"><strong>{formatMoney(totalUzs)}</strong><span>Jami UZS balans</span></article>
          <article className="finance-mini-card"><strong>{formatMoney(totalUsd, "USD")}</strong><span>Jami USD balans</span></article>
          <article className="finance-mini-card"><strong>{activeAccounts.length}</strong><span>Faol hisoblar soni</span></article>
          <article className="finance-mini-card"><strong>{formatMoney(todayIn)}</strong><span>Bugungi kirim</span></article>
          <article className="finance-mini-card"><strong>{formatMoney(todayOut)}</strong><span>Bugungi chiqim</span></article>
          <article className="finance-mini-card"><strong>{unreconciled}</strong><span>Sverka talab qilinadi</span></article>
        </div>

        {accounts.length ? (
          <div className="finance-account-list">
            {accounts.map((account) => {
              const blocked = Number(account.blockedAmount || 0);
              const available = Math.max(Number(account.openingBalance || 0) - blocked, 0);
              const lastTransaction = controller.state.transactions.find((item) => item.accountId === account.id);

              return (
                <article
                  key={account.id}
                  className={`finance-account-row ${selectedId === account.id ? "is-selected" : ""} ${account.active === false ? "is-muted" : ""}`}
                  onClick={() => setSelectedId(account.id)}
                >
                  <div className="finance-account-row__main">
                    <StatusBadge status={accountStatus(account)} label={account.active === false ? "Nofaol" : "Faol"} />
                    <strong>{account.name}</strong>
                    <span>{account.code} | {account.bankName || "Bank nomi kiritilmagan"} | {maskAccountNumber(account.accountNumber)}</span>
                  </div>
                  <div>
                    <span>Valyuta</span>
                    <strong>{account.currency}</strong>
                  </div>
                  <div>
                    <span>Joriy balans</span>
                    <strong>{formatMoney(account.openingBalance, account.currency)}</strong>
                  </div>
                  <div>
                    <span>Mavjud mablag'</span>
                    <strong>{formatMoney(available, account.currency)}</strong>
                  </div>
                  <div>
                    <span>Oxirgi operatsiya</span>
                    <strong>{formatDate(lastTransaction?.date)}</strong>
                  </div>
                  <button type="button" className="finance-icon-button" aria-label="Hisob amallari" onClick={(event) => {
                    event.stopPropagation();
                    setActionMenu(actionMenu === account.id ? "" : account.id);
                  }}>
                    <MoreHorizontal size={18} />
                  </button>
                  {actionMenu === account.id && (
                    <div className="finance-action-menu" onClick={(event) => event.stopPropagation()}>
                      <button type="button" onClick={() => { setSelectedId(account.id); setActionMenu(""); }}> <Eye size={15} /> Batafsil ko'rish</button>
                      <button type="button" onClick={() => openEdit(account)}> <Edit3 size={15} /> Tahrirlash</button>
                      <button type="button" onClick={() => startTransfer(account)}> <Repeat2 size={15} /> Tranzaksiyalar tarixi</button>
                      <button type="button" onClick={() => { controller.actions.toggleFinanceAccount(account.id); setActionMenu(""); }}> <Power size={15} /> {account.active === false ? "Qayta faollashtirish" : "Nofaol qilish"}</button>
                      <button type="button" className="is-danger" onClick={() => { controller.actions.archiveFinanceAccount(account.id); setActionMenu(""); }}> <Archive size={15} /> Arxivlash</button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="finance-empty">
            Hozircha bank hisoblari mavjud emas.
            <button type="button" className="finance-button is-primary" onClick={openCreate}>Birinchi bank hisobini yarating</button>
          </div>
        )}
      </section>

      {selectedAccount && (
        <section className="finance-panel">
          <div className="finance-panel__head">
            <div>
              <span>Hisob detail paneli</span>
              <h2>{selectedAccount.name}</h2>
            </div>
            <StatusBadge status={accountStatus(selectedAccount)} label={selectedAccount.active === false ? "Nofaol" : formatStatusLabel(selectedAccount.status || "success")} />
          </div>
          <div className="finance-detail-grid">
            <article><span>Balans</span><strong>{formatMoney(selectedAccount.openingBalance, selectedAccount.currency)}</strong></article>
            <article><span>Kirim</span><strong>{formatMoney(accountMovements.filter((item) => item.cashDirection === "in").reduce((sum, item) => sum + Number(item.amount || 0), 0), selectedAccount.currency)}</strong></article>
            <article><span>Chiqim</span><strong>{formatMoney(accountMovements.filter((item) => item.cashDirection === "out").reduce((sum, item) => sum + Number(item.amount || 0), 0), selectedAccount.currency)}</strong></article>
            <article><span>Kutilayotgan tranzaksiyalar</span><strong>{paymentOrders.filter((order) => order.status === "Pending").length}</strong></article>
            <article><span>Bank</span><strong>{selectedAccount.bankName || "Kiritilmagan"}</strong></article>
            <article><span>MFO</span><strong>{selectedAccount.mfo || "Kiritilmagan"}</strong></article>
            <article><span>Mas'ul</span><strong>{selectedAccount.owner || controller.currentUser}</strong></article>
            <article><span>Sverka holati</span><strong>{unreconciled ? "Tekshiruv kerak" : "Mos"}</strong></article>
          </div>
          <div className="finance-table">
            {accountMovements.slice(0, 5).map((item) => (
              <article key={item.id}>
                <div>
                  <strong>{item.reference}</strong>
                  <span>{formatDate(item.date)} | {item.counterparty}</span>
                </div>
                <b>{formatMoney(item.amount, item.currency)}</b>
                <StatusBadge status={item.status} />
              </article>
            ))}
            {!accountMovements.length && <div className="finance-empty">Bu hisob bo'yicha oxirgi operatsiyalar mavjud emas.</div>}
          </div>
        </section>
      )}

      <ConfirmDialog
        open={controller.activeModal === "create-bank-account" || controller.activeModal === "edit-bank-account"}
        title={form.id ? "Bank hisobini tahrirlash" : "Bank hisobi qo'shish"}
        description="Majburiy maydonlar tekshiriladi va barcha o'zgarishlar audit jurnaliga yoziladi."
        confirmLabel={form.id ? "Saqlash" : "Hisob yaratish"}
        onClose={controller.actions.closeModal}
        onConfirm={submitAccount}
        confirmDisabled={Object.keys(validationErrors).length > 0}
      >
        <BankAccountForm controller={controller} form={form} setForm={setForm} errors={validationErrors} />
      </ConfirmDialog>

      <ConfirmDialog
        open={controller.activeModal === "account-transfer"}
        title="Hisoblararo o'tkazma"
        description="Bir xil hisobga o'tkazish, yetarli bo'lmagan balans va kurs kiritilmagan valyuta o'tkazmalari bloklanadi."
        confirmLabel="O'tkazmani bajarish"
        onClose={controller.actions.closeModal}
        onConfirm={() => {
          if (controller.actions.transferBetweenAccounts(transfer)) {
            setTransfer(emptyTransferForm);
            controller.actions.closeModal();
          }
        }}
        confirmDisabled={!transfer.sourceId || !transfer.destinationId || transfer.sourceId === transfer.destinationId || Number(transfer.amount || 0) <= 0}
      >
        <div className="finance-form-grid">
          <ChoiceGroup
            label="Qaysi hisobdan"
            value={transfer.sourceId}
            options={accounts.map((account) => ({ value: account.id, label: `${account.code} | ${account.name}` }))}
            onChange={(sourceId) => {
              const account = accounts.find((item) => item.id === sourceId);
              setTransfer((current) => ({ ...current, sourceId, currency: account?.currency || current.currency }));
            }}
          />
          <ChoiceGroup
            label="Qaysi hisobga"
            value={transfer.destinationId}
            options={controller.state.accounts.filter((account) => account.kind === "bank" || account.kind === "cash").map((account) => ({ value: account.id, label: `${account.code} | ${account.name}` }))}
            onChange={(destinationId) => setTransfer((current) => ({ ...current, destinationId }))}
          />
          <label><span>Summa</span><input type="number" min="0" value={transfer.amount} onChange={(event) => setTransfer((current) => ({ ...current, amount: event.target.value }))} /></label>
          <label><span>Valyuta</span><input value={transfer.currency} disabled /></label>
          <label><span>Konvertatsiya kursi</span><input type="number" min="0" value={transfer.rate} onChange={(event) => setTransfer((current) => ({ ...current, rate: event.target.value }))} /></label>
          <label><span>Komissiya</span><input type="number" min="0" value={transfer.fee} onChange={(event) => setTransfer((current) => ({ ...current, fee: event.target.value }))} /></label>
          <label><span>Sana</span><input type="date" value={transfer.date} onChange={(event) => setTransfer((current) => ({ ...current, date: event.target.value }))} /></label>
          <label><span>Hujjat raqami</span><input value={transfer.documentNumber} onChange={(event) => setTransfer((current) => ({ ...current, documentNumber: event.target.value }))} placeholder="TRF-000001" /></label>
          <label className="finance-form-grid__wide"><span>Izoh</span><textarea value={transfer.reason} onChange={(event) => setTransfer((current) => ({ ...current, reason: event.target.value }))} /></label>
        </div>
      </ConfirmDialog>
    </section>
  );
};

export default AccountManagement;
