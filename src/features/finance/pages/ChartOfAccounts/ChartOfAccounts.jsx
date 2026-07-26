import { formatMoney } from "../../utils/financeFormatters";

const ChartOfAccounts = ({ controller }) => (
  <section className="finance-view">
    <section className="finance-panel">
      <div className="finance-panel__head">
        <div>
          <span>Chart of accounts</span>
          <h2>Hisoblar rejasi</h2>
        </div>
      </div>
      <div className="finance-card-grid">
        {controller.state.accounts.map((account) => (
          <article className="finance-mini-card" key={account.id}>
            <strong>{account.code} · {account.name}</strong>
            <span>{account.type} / {account.kind} / {account.currency}</span>
            <b>{formatMoney(account.openingBalance, account.currency)}</b>
          </article>
        ))}
      </div>
    </section>
  </section>
);

export default ChartOfAccounts;
