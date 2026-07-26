import JournalEntryForm from "../../components/JournalEntryForm/JournalEntryForm";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { formatMoney } from "../../utils/financeFormatters";

const Journals = ({ controller }) => (
  <section className="finance-view">
    <section className="finance-panel">
      <div className="finance-panel__head">
        <div>
          <span>Manual journal</span>
          <h2>Debit/Credit entry</h2>
        </div>
      </div>
      <JournalEntryForm
        accounts={controller.state.accounts}
        periods={controller.state.periods}
        onSubmit={controller.actions.createJournal}
      />
    </section>

    <section className="finance-panel">
      <div className="finance-panel__head">
        <div>
          <span>Journal register</span>
          <h2>Manual va automatic yozuvlar</h2>
        </div>
      </div>
      <div className="finance-table">
        {controller.state.journals.map((journal) => {
          const debit = journal.rows.reduce((total, row) => total + Number(row.debit || 0), 0);

          return (
            <article key={journal.id} className={journal.source === "Automatic" ? "is-automatic" : ""}>
              <div>
                <strong>{journal.id}</strong>
                <span>{journal.description}</span>
              </div>
              <StatusBadge status={journal.source === "Automatic" ? "success" : "Draft"} label={journal.source} />
              <b>{formatMoney(debit)}</b>
              <StatusBadge status={journal.status} />
              <div className="finance-row-actions">
                <button type="button" disabled={journal.status !== "Pending"} onClick={() => controller.actions.approveJournal(journal.id)}>Approve</button>
                <button type="button" disabled={journal.status !== "Approved"} onClick={() => controller.actions.postJournal(journal.id)}>Post</button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  </section>
);

export default Journals;
