import { useMemo, useState } from "react";

import TransactionCreateDialog from "../../components/TransactionCreateDialog/TransactionCreateDialog";
import TransactionTable from "../../components/TransactionTable/TransactionTable";

const Income = ({ controller, onNavigate }) => {
  const [filters, setFilters] = useState({ search: "", status: "all", account: "all", category: "all", branch: "all", amountMin: "", amountMax: "", dateFrom: "", dateTo: "" });

  const rows = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return controller.state.transactions.filter((item) => {
      const matchesType = item.type === "income";
      const matchesSearch = !query || `${item.reference} ${item.counterparty} ${item.description}`.toLowerCase().includes(query);
      const matchesStatus = filters.status === "all" || item.status === filters.status;
      const matchesAccount = filters.account === "all" || item.accountId === filters.account;
      const matchesCategory = filters.category === "all" || item.category === filters.category;
      const matchesBranch = filters.branch === "all" || item.branch === filters.branch;
      const matchesDateFrom = !filters.dateFrom || item.date >= filters.dateFrom;
      const matchesDateTo = !filters.dateTo || item.date <= filters.dateTo;
      const matchesAmountMin = !filters.amountMin || Number(item.amount || 0) >= Number(filters.amountMin);
      const matchesAmountMax = !filters.amountMax || Number(item.amount || 0) <= Number(filters.amountMax);
      return matchesType && matchesSearch && matchesStatus && matchesAccount && matchesCategory && matchesBranch && matchesDateFrom && matchesDateTo && matchesAmountMin && matchesAmountMax;
    });
  }, [controller.state.transactions, filters]);

  return (
    <section className="finance-view">
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Daromad boshqaruvi</span>
            <h2>Daromadlar</h2>
          </div>
          <button type="button" className="finance-button is-primary" onClick={() => controller.actions.setActiveModal("create-income")}>
            Daromad yaratish
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
              {["Mahsulot savdosi", "Xizmat", "Boshqa daromad", "Foiz daromadi", "Investitsiya", "Boshqa"].map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label><span>Sana boshidan</span><input type="date" value={filters.dateFrom} onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))} /></label>
          <label><span>Sana oxiri</span><input type="date" value={filters.dateTo} onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))} /></label>
          <label><span>Summa min</span><input type="number" value={filters.amountMin} onChange={(event) => setFilters((current) => ({ ...current, amountMin: event.target.value }))} /></label>
          <button type="button" className="finance-button" onClick={() => setFilters({ search: "", status: "all", account: "all", category: "all", branch: "all", amountMin: "", amountMax: "", dateFrom: "", dateTo: "" })}>
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
            Daromad topilmadi.
            <button type="button" className="finance-button is-primary" onClick={() => controller.actions.setActiveModal("create-income")}>Birinchi daromadni yarating</button>
          </div>
        )}
      </section>

      <TransactionCreateDialog controller={controller} open={controller.activeModal === "create-income"} initialType="income" />
    </section>
  );
};

export default Income;
