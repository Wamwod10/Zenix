import { useMemo, useState } from "react";

import TransactionCreateDialog from "../../components/TransactionCreateDialog/TransactionCreateDialog";
import TransactionTable from "../../components/TransactionTable/TransactionTable";

const Expenses = ({ controller, onNavigate }) => {
  const [filters, setFilters] = useState({ search: "", status: "all", account: "all", category: "all", amountMin: "", amountMax: "", dateFrom: "", dateTo: "" });

  const rows = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return controller.state.transactions.filter((item) => {
      const matchesType = item.type === "expense";
      const matchesSearch = !query || `${item.reference} ${item.counterparty} ${item.description}`.toLowerCase().includes(query);
      const matchesStatus = filters.status === "all" || item.status === filters.status;
      const matchesAccount = filters.account === "all" || item.accountId === filters.account;
      const matchesCategory = filters.category === "all" || item.category === filters.category;
      const matchesDateFrom = !filters.dateFrom || item.date >= filters.dateFrom;
      const matchesDateTo = !filters.dateTo || item.date <= filters.dateTo;
      const matchesAmountMin = !filters.amountMin || Number(item.amount || 0) >= Number(filters.amountMin);
      const matchesAmountMax = !filters.amountMax || Number(item.amount || 0) <= Number(filters.amountMax);
      return matchesType && matchesSearch && matchesStatus && matchesAccount && matchesCategory && matchesDateFrom && matchesDateTo && matchesAmountMin && matchesAmountMax;
    });
  }, [controller.state.transactions, filters]);

  return (
    <section className="finance-view">
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Xarajat boshqaruvi</span>
            <h2>Xarajatlar</h2>
          </div>
          <button type="button" className="finance-button is-primary" onClick={() => controller.actions.setActiveModal("create-expense")}>
            Xarajat yaratish
          </button>
        </div>

        <div className="finance-filters">
          <label>
            <span>Qidirish</span>
            <input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Hujjat, hamkor yoki izoh" />
          </label>
          <label>
            <span>Holat</span>
            <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
              <option value="all">Barchasi</option>
              <option value="Draft">Qoralama</option>
              <option value="Pending">Tasdiq kutmoqda</option>
              <option value="Approved">Tasdiqlangan</option>
              <option value="Posted">To'langan</option>
              <option value="Cancelled">Bekor qilingan</option>
            </select>
          </label>
          <label>
            <span>Hisob</span>
            <select value={filters.account} onChange={(event) => setFilters((current) => ({ ...current, account: event.target.value }))}>
              <option value="all">Barchasi</option>
              {controller.state.accounts.map((account) => (
                <option key={account.id} value={account.id}>{account.code} | {account.name}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Kategoriya</span>
            <select value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}>
              <option value="all">Barchasi</option>
              {["Ijara", "Ish haqi", "Transport", "Kommunal to'lov", "Marketing", "Soliq", "Tovar xaridi", "Xizmat xaridi", "Ofis xarajatlari", "Boshqa"].map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label><span>Sana boshidan</span><input type="date" value={filters.dateFrom} onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))} /></label>
          <label><span>Sana oxiri</span><input type="date" value={filters.dateTo} onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))} /></label>
          <label><span>Summa min</span><input type="number" value={filters.amountMin} onChange={(event) => setFilters((current) => ({ ...current, amountMin: event.target.value }))} /></label>
          <button type="button" className="finance-button" onClick={() => setFilters({ search: "", status: "all", account: "all", category: "all", amountMin: "", amountMax: "", dateFrom: "", dateTo: "" })}>
            Filtrlarni tozalash
          </button>
        </div>

        {rows.length ? (
          <TransactionTable
            transactions={rows}
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
            Xarajat topilmadi.
            <button type="button" className="finance-button is-primary" onClick={() => controller.actions.setActiveModal("create-expense")}>Birinchi xarajatni yarating</button>
          </div>
        )}
      </section>

      <TransactionCreateDialog controller={controller} open={controller.activeModal === "create-expense"} initialType="expense" />
    </section>
  );
};

export default Expenses;
