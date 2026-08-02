import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { formatAccountKind, formatAccountType, formatMoney, formatSource } from "../../utils/financeFormatters";

const accountName = (accounts, accountId) =>
  accounts.find((account) => account.id === accountId)?.name || accountId;

const GeneralLedger = ({ controller }) => (
  <section className="finance-view">
    <section className="finance-panel">
      <div className="finance-panel__head">
        <div>
          <span>Bosh kitob</span>
          <h2>Bosh kitob</h2>
        </div>
        <StatusBadge status="success" label="Debit = Kredit tekshirildi" />
      </div>
      <div className="ledger-table">
        {controller.state.journals.flatMap((journal) =>
          journal.rows.map((row, index) => (
            <article key={`${journal.id}-${index}`} className={journal.source === "Automatic" ? "is-automatic" : ""}>
              <div>
                <strong>{accountName(controller.state.accounts, row.accountId)}</strong>
                <span>{journal.date} | {journal.reference} | {formatSource(journal.source)}</span>
              </div>
              <b>{formatMoney(row.debit)}</b>
              <b>{formatMoney(row.credit)}</b>
              <StatusBadge status={journal.status} />
              <span>{journal.createdBy}</span>
            </article>
          )),
        )}
      </div>
    </section>

    <section className="finance-panel">
      <div className="finance-panel__head">
        <div>
          <span>Hisob mapping</span>
          <h2>Hisoblar rejasi</h2>
        </div>
      </div>
      <div className="finance-card-grid">
        {controller.state.accounts.map((account) => (
          <article className="finance-mini-card" key={account.id}>
            <strong>{account.code}</strong>
            <span>{account.name}</span>
            <span>{formatAccountType(account.type)} | {formatAccountKind(account.kind)}</span>
            <b>{formatMoney(account.openingBalance, account.currency)}</b>
          </article>
        ))}
      </div>
    </section>
  </section>
);

export default GeneralLedger;
