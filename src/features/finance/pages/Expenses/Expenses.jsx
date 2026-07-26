import TransactionTable from "../../components/TransactionTable/TransactionTable";

const Expenses = ({ controller, onNavigate }) => (
  <section className="finance-view">
    <section className="finance-panel">
      <div className="finance-panel__head">
        <div>
          <span>Expense management</span>
          <h2>Xarajatlar</h2>
        </div>
      </div>
      <TransactionTable
        transactions={controller.state.transactions.filter((item) => item.type === "expense")}
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

export default Expenses;
