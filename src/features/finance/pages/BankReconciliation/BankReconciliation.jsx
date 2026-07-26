import { useState } from "react";

import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { formatMoney } from "../../utils/financeFormatters";

const BankReconciliation = ({ controller }) => {
  const [systemId, setSystemId] = useState("");
  const [bankId, setBankId] = useState("");
  const { system, bank, history } = controller.state.reconciliation;

  return (
    <section className="finance-view">
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Bank reconciliation</span>
            <h2>Tizim va bank vipiska sverkasi</h2>
          </div>
          <div className="finance-row-actions">
            <button type="button" onClick={controller.actions.autoMatchReconciliation}>Import + auto match</button>
            <button type="button" onClick={controller.actions.closeReconciliation}>Close reconciliation</button>
          </div>
        </div>

        <div className="reconciliation-board">
          <section>
            <h3>System transactions</h3>
            {system.map((item) => (
              <button
                type="button"
                key={item.id}
                className={item.matched ? "is-matched" : "is-warning"}
                aria-pressed={systemId === item.id}
                onClick={() => setSystemId(item.id)}
              >
                <strong>{item.description}</strong>
                <span>{item.date} · {formatMoney(item.amount)}</span>
                <StatusBadge status={item.matched ? "success" : "warning"} label={item.matched || "unmatched"} />
              </button>
            ))}
          </section>
          <section>
            <h3>Bank statement</h3>
            {bank.map((item) => (
              <button
                type="button"
                key={item.id}
                className={item.matched ? "is-matched" : "is-warning"}
                aria-pressed={bankId === item.id}
                onClick={() => setBankId(item.id)}
              >
                <strong>{item.description}</strong>
                <span>{item.date} · {formatMoney(item.amount)}</span>
                <StatusBadge status={item.matched ? "success" : "warning"} label={item.matched || "unmatched"} />
              </button>
            ))}
          </section>
        </div>
        <button
          type="button"
          className="finance-button is-primary"
          disabled={!systemId || !bankId}
          onClick={() => controller.actions.manualMatch(systemId, bankId)}
        >
          Manual match
        </button>
      </section>

      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>History</span>
            <h2>Sverka auditi</h2>
          </div>
        </div>
        <div className="finance-timeline">
          {history.map((item) => (
            <article key={`${item.at}-${item.event}`}>
              <strong>{item.event}</strong>
              <span>{item.by} · {item.at}</span>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
};

export default BankReconciliation;
