import { formatAccountKind, formatAccountType, formatMoney } from "../../utils/financeFormatters";

const ChartOfAccounts = ({ controller }) => (
  <section className="finance-view">
    <section className="finance-panel">
      <div className="finance-panel__head">
        <div>
          <span>Hisoblar rejasi</span>
          <h2>Moliyaviy hisoblar</h2>
        </div>
      </div>
      <div className="finance-card-grid">
        {controller.state.accounts.map((account) => (
          <article className="finance-mini-card" key={account.id}>
            <strong>{account.code} | {account.name}</strong>
            <span>{formatAccountType(account.type)} / {formatAccountKind(account.kind)} / {account.currency}</span>
            <b>{formatMoney(account.openingBalance, account.currency)}</b>
          </article>
        ))}
      </div>
    </section>
  </section>
);

export default ChartOfAccounts;
