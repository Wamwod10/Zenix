import TransactionCreateDialog from "../../components/TransactionCreateDialog/TransactionCreateDialog";
import TransactionTable from "../../components/TransactionTable/TransactionTable";

const Transactions = ({ controller, onNavigate }) => (
  <section className="finance-view">
    <section className="finance-panel">
      <div className="finance-panel__head">
        <div>
          <span>Tranzaksiya lifecycle</span>
          <h2>Tranzaksiyalar</h2>
        </div>
        <button type="button" className="finance-button is-primary" onClick={() => controller.actions.setActiveModal("create-transaction")}>
          Yangi tranzaksiya
        </button>
      </div>

      <div className="finance-filters">
        <label>
          <span>Sana boshidan</span>
          <input type="date" value={controller.filters.dateFrom} onChange={(event) => controller.actions.updateFilter("dateFrom", event.target.value)} />
        </label>
        <label>
          <span>Sana oxiri</span>
          <input type="date" value={controller.filters.dateTo} onChange={(event) => controller.actions.updateFilter("dateTo", event.target.value)} />
        </label>
        <label>
          <span>Hisob</span>
          <select value={controller.filters.account} onChange={(event) => controller.actions.updateFilter("account", event.target.value)}>
            <option value="all">Barchasi</option>
            {controller.state.accounts.map((account) => (
              <option key={account.id} value={account.id}>{account.code} | {account.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Valyuta</span>
          <select value={controller.filters.currency} onChange={(event) => controller.actions.updateFilter("currency", event.target.value)}>
            <option value="all">Barchasi</option>
            {controller.state.currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>{currency.code}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Tur</span>
          <select value={controller.filters.type} onChange={(event) => controller.actions.updateFilter("type", event.target.value)}>
            <option value="all">Barchasi</option>
            <option value="income">Daromad</option>
            <option value="expense">Xarajat</option>
            <option value="transfer">Hisoblararo o'tkazma</option>
            <option value="refund">Qaytarim</option>
            <option value="adjustment">Balans tuzatish</option>
            <option value="opening">Boshlang'ich qoldiq</option>
            <option value="exchange">Valyuta ayirboshlash</option>
          </select>
        </label>
        <label>
          <span>Holat</span>
          <select value={controller.filters.status} onChange={(event) => controller.actions.updateFilter("status", event.target.value)}>
            <option value="all">Barchasi</option>
            <option value="Draft">Qoralama</option>
            <option value="Pending">Tasdiq kutilmoqda</option>
            <option value="Approved">Tasdiqlangan</option>
            <option value="Posted">O'tkazilgan</option>
            <option value="Cancelled">Bekor qilingan</option>
          </select>
        </label>
        <label><span>Hamkor</span><input value={controller.filters.counterparty} onChange={(event) => controller.actions.updateFilter("counterparty", event.target.value)} placeholder="Hamkor nomi" /></label>
        <label><span>Kategoriya</span><input value={controller.filters.category === "all" ? "" : controller.filters.category} onChange={(event) => controller.actions.updateFilter("category", event.target.value || "all")} placeholder="Kategoriya" /></label>
        <label><span>Mas'ul xodim</span><input value={controller.filters.owner} onChange={(event) => controller.actions.updateFilter("owner", event.target.value)} placeholder="Mas'ul" /></label>
        <label><span>Summa min</span><input type="number" value={controller.filters.amountMin} onChange={(event) => controller.actions.updateFilter("amountMin", event.target.value)} /></label>
        <label><span>Summa max</span><input type="number" value={controller.filters.amountMax} onChange={(event) => controller.actions.updateFilter("amountMax", event.target.value)} /></label>
      </div>

      {controller.filteredTransactions.length ? (
        <TransactionTable
          transactions={controller.filteredTransactions}
          actionState={controller.actionState}
          onSubmit={controller.actions.submitTransaction}
          onApprove={controller.actions.approveTransaction}
          onOpen={(id) => {
            controller.actions.setSelectedTransactionId(id);
            onNavigate("transaction-details");
          }}
        />
      ) : (
        <div className="finance-empty">
          Filtr bo'yicha tranzaksiya topilmadi.
          <button type="button" className="finance-button is-primary" onClick={() => controller.actions.setActiveModal("create-transaction")}>Birinchi tranzaksiyani yarating</button>
        </div>
      )}
    </section>

    <TransactionCreateDialog
      controller={controller}
      open={controller.activeModal === "create-transaction"}
    />
  </section>
);

export default Transactions;
