import { formatMoney } from "../../utils/financeFormatters";

const BalanceSheet = ({ controller }) => {
  const assets = controller.state.accounts.filter((item) => item.type === "asset");
  const liabilities = controller.state.accounts.filter((item) => item.type === "liability");
  const equity = controller.state.accounts.filter((item) => item.type === "equity");

  return (
    <section className="finance-view">
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Balance sheet</span>
            <h2>Balans preview</h2>
          </div>
        </div>
        {[["Assets", assets], ["Liabilities", liabilities], ["Equity", equity]].map(([title, rows]) => (
          <div className="finance-statement" key={title}>
            <h3>{title}</h3>
            {rows.map((account) => (
              <article key={account.id}>
                <span>{account.name}</span>
                <strong>{formatMoney(account.openingBalance, account.currency)}</strong>
              </article>
            ))}
          </div>
        ))}
      </section>
    </section>
  );
};

export default BalanceSheet;
