import TransactionTable from "../../components/TransactionTable/TransactionTable";

const Income = ({ controller, onNavigate }) => (
  <section className="finance-view">
    <section className="finance-panel">
      <div className="finance-panel__head">
        <div>
          <span>Income management</span>
          <h2>Daromadlar</h2>
        </div>
      </div>
      <TransactionTable
        transactions={controller.state.transactions.filter((item) => item.type === "income")}
        actionState={controller.actionState}
        onSubmit={controller.actions.submitTransaction}
        onApprove={controller.actions.approveTransaction}
        onOpen={(id) => {
          controller.actions.setSelectedTransactionId(id);
          onNavigate("transaction-details");
        }}
      />
    </section>
  </section>
);

export default Income;
