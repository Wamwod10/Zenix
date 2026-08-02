import { useState } from "react";
import { FileSpreadsheet, Link2, ShieldCheck } from "lucide-react";

import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { RECONCILIATION_STATUS } from "../../constants/financeConstants";
import { formatDate, formatDateTime, formatMoney, formatStatusLabel } from "../../utils/financeFormatters";

const matchLabels = {
  [RECONCILIATION_STATUS.FULL_MATCH]: "To'liq mos",
  [RECONCILIATION_STATUS.PARTIAL_MATCH]: "Qisman mos",
  [RECONCILIATION_STATUS.UNMATCHED]: "Mos topilmadi",
  [RECONCILIATION_STATUS.DUPLICATE]: "Takroriy",
  [RECONCILIATION_STATUS.MANUAL_MATCH]: "Qo'lda moslangan",
  [RECONCILIATION_STATUS.NEEDS_REVIEW]: "E'tibor talab qiladi",
};

const statusTone = (status, matched) => {
  if (matched || status === RECONCILIATION_STATUS.FULL_MATCH || status === RECONCILIATION_STATUS.MANUAL_MATCH) return "success";
  if (status === RECONCILIATION_STATUS.DUPLICATE || status === RECONCILIATION_STATUS.PARTIAL_MATCH) return "warning";
  return "danger";
};

const ReconciliationItem = ({ item, selected, onSelect }) => (
  <button
    type="button"
    className={`${item.matched ? "is-matched" : "is-warning"} ${selected ? "is-selected" : ""}`}
    aria-pressed={selected}
    onClick={onSelect}
  >
    <div>
      <strong>{item.reference || item.id}</strong>
      <span>{formatDate(item.date)} | {item.counterparty || "Kontragent kiritilmagan"}</span>
    </div>
    <span>{item.description || "Izoh kiritilmagan"}</span>
    <b>{item.direction === "out" ? "-" : "+"} {formatMoney(item.amount, item.currency)}</b>
    <StatusBadge
      status={statusTone(item.matchStatus, item.matched)}
      label={item.matched ? "Moslangan" : matchLabels[item.matchStatus] || "Moslanmagan"}
    />
  </button>
);

const BankReconciliation = ({ controller }) => {
  const [systemId, setSystemId] = useState("");
  const [bankId, setBankId] = useState("");
  const [filters, setFilters] = useState({
    accountId: "all",
    dateFrom: "",
    dateTo: "",
    currency: "all",
    status: "all",
    search: "",
    issuesOnly: false,
  });
  const { system, bank, history, status, closedAt, closedBy, importFile } = controller.state.reconciliation;

  const bankAccounts = controller.state.accounts.filter((account) => account.kind === "bank");
  const applyFilters = (item) => {
    const query = filters.search.trim().toLowerCase();
    const haystack = `${item.reference} ${item.counterparty} ${item.description}`.toLowerCase();
    const matchesAccount = filters.accountId === "all" || item.accountId === filters.accountId;
    const matchesFrom = !filters.dateFrom || item.date >= filters.dateFrom;
    const matchesTo = !filters.dateTo || item.date <= filters.dateTo;
    const matchesCurrency = filters.currency === "all" || item.currency === filters.currency;
    const matchesStatus = filters.status === "all" || item.matchStatus === filters.status;
    const matchesSearch = !query || haystack.includes(query);
    const matchesIssues = !filters.issuesOnly || !item.matched || item.matchStatus === RECONCILIATION_STATUS.DUPLICATE;
    return matchesAccount && matchesFrom && matchesTo && matchesCurrency && matchesStatus && matchesSearch && matchesIssues;
  };

  const systemRows = system.filter(applyFilters);
  const bankRows = bank.filter(applyFilters);
  const matched = system.filter((item) => item.matched).length;
  const unmatched = system.filter((item) => !item.matched).length + bank.filter((item) => !item.matched && item.matchStatus !== RECONCILIATION_STATUS.DUPLICATE).length;
  const duplicates = bank.filter((item) => item.matchStatus === RECONCILIATION_STATUS.DUPLICATE).length;
  const systemTotal = system.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const bankTotal = bank.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return (
    <section className="finance-view">
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Bank sverkasi</span>
            <h2>Tizim tranzaksiyalari va bank vipiskasi</h2>
          </div>
          <div className="finance-row-actions">
            <button type="button" className="finance-button" onClick={() => controller.actions.importBankStatement({ accountId: filters.accountId })}>
              <FileSpreadsheet size={16} /> Import preview
            </button>
            <button type="button" className="finance-button" onClick={controller.actions.autoMatchReconciliation}>
              <Link2 size={16} /> Auto-match
            </button>
            <button type="button" className="finance-button is-primary" onClick={controller.actions.closeReconciliation}>
              <ShieldCheck size={16} /> Sverkani yopish
            </button>
          </div>
        </div>

        {status === RECONCILIATION_STATUS.CLOSED && (
          <div className="finance-warning is-gain">
            Sverka {closedBy} tomonidan {formatDateTime(closedAt)} da yopilgan.
          </div>
        )}

        <div className="finance-filters">
          <label><span>Bank hisobi</span><input placeholder="Barcha hisoblar" value={filters.accountId === "all" ? "" : filters.accountId} onChange={(event) => setFilters((current) => ({ ...current, accountId: event.target.value.trim() || "all" }))} list="finance-bank-accounts" /></label>
          <datalist id="finance-bank-accounts">{bankAccounts.map((account) => <option key={account.id} value={account.id}>{account.code} | {account.name}</option>)}</datalist>
          <label><span>Sana boshidan</span><input type="date" value={filters.dateFrom} onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))} /></label>
          <label><span>Sana oxiri</span><input type="date" value={filters.dateTo} onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))} /></label>
          <label><span>Qidiruv</span><input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Hujjat, kontragent yoki izoh" /></label>
        </div>

        <div className="finance-card-grid">
          <article className="finance-mini-card"><strong>{system.length}</strong><span>Jami tizim tranzaksiyalari</span></article>
          <article className="finance-mini-card"><strong>{bank.length}</strong><span>Jami bank yozuvlari</span></article>
          <article className="finance-mini-card"><strong>{matched}</strong><span>Mos tushganlar</span></article>
          <article className="finance-mini-card"><strong>{unmatched}</strong><span>Mos tushmaganlar</span></article>
          <article className="finance-mini-card"><strong>{formatMoney(Math.abs(systemTotal - bankTotal))}</strong><span>Summa farqi</span></article>
          <article className="finance-mini-card"><strong>{duplicates}</strong><span>Takroriy yozuvlar</span></article>
        </div>

        <div className="finance-row-actions">
          <button type="button" className={`finance-button ${filters.issuesOnly ? "is-primary" : ""}`} onClick={() => setFilters((current) => ({ ...current, issuesOnly: !current.issuesOnly }))}>
            Faqat muammoli yozuvlar
          </button>
          {importFile && <span className="finance-inline-note">Import fayl: {importFile}</span>}
        </div>

        <div className="reconciliation-board">
          <section>
            <h3>Tizim tranzaksiyalari</h3>
            {systemRows.map((item) => (
              <ReconciliationItem key={item.id} item={item} selected={systemId === item.id} onSelect={() => setSystemId(item.id)} />
            ))}
            {!systemRows.length && (
              <div className="finance-empty">
                Tanlangan filter bo'yicha tizim tranzaksiyalari topilmadi.
                <button type="button" className="finance-button is-primary" onClick={() => controller.actions.importBankStatement({ accountId: filters.accountId })}>Vipiska import qilish</button>
              </div>
            )}
          </section>
          <section>
            <h3>Bank vipiskasi</h3>
            {bankRows.map((item) => (
              <ReconciliationItem key={item.id} item={item} selected={bankId === item.id} onSelect={() => setBankId(item.id)} />
            ))}
            {!bankRows.length && (
              <div className="finance-empty">
                Sverka uchun bank vipiskasi import qilinmagan.
                <button type="button" className="finance-button is-primary" onClick={() => controller.actions.importBankStatement({ accountId: filters.accountId })}>Import preview ochish</button>
              </div>
            )}
          </section>
        </div>

        <div className="finance-actions-row">
          <button
            type="button"
            className="finance-button is-primary"
            disabled={!systemId || !bankId}
            onClick={() => controller.actions.manualMatch(systemId, bankId)}
          >
            Qo'lda moslash
          </button>
          <button type="button" className="finance-button" onClick={() => { setSystemId(""); setBankId(""); }}>
            Tanlovni tozalash
          </button>
        </div>
      </section>

      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Sverka tarixi</span>
            <h2>Audit</h2>
          </div>
          <StatusBadge status={status === RECONCILIATION_STATUS.CLOSED ? "success" : "warning"} label={formatStatusLabel(status)} />
        </div>
        <div className="finance-timeline">
          {history.map((item) => (
            <article key={`${item.at}-${item.event}`}>
              <strong>{item.event}</strong>
              <span>{item.by} | {formatDateTime(item.at)} | {item.file || "Fayl yo'q"} | moslash: {item.matchRate ?? 0}</span>
            </article>
          ))}
          {!history.length && <div className="finance-empty">Hozircha sverka audit yozuvlari mavjud emas.</div>}
        </div>
      </section>
    </section>
  );
};

export default BankReconciliation;
