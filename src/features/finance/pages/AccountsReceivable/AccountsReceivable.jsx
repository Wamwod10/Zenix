import { useMemo, useState } from "react";

import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { formatMoney, formatStatusLabel } from "../../utils/financeFormatters";

const AccountsReceivable = ({ controller }) => {
  const [filters, setFilters] = useState({ search: "", status: "all", sort: "dueDate" });
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const rows = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return controller.state.receivables
      .filter((item) => {
        const matchesSearch = !query || `${item.customer} ${item.invoice}`.toLowerCase().includes(query);
        const matchesStatus = filters.status === "all" || item.status === filters.status;
        return matchesSearch && matchesStatus;
      })
      .sort((first, second) => (
        filters.sort === "balance"
          ? Number(second.balance || 0) - Number(first.balance || 0)
          : String(first[filters.sort]).localeCompare(String(second[filters.sort]), "uz")
      ));
  }, [controller.state.receivables, filters]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const visible = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <section className="finance-view">
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Debitor qarzdorlik</span>
            <h2>Olinadigan hisoblar</h2>
          </div>
        </div>
        <div className="finance-filters">
          <label><span>Qidirish</span><input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Mijoz yoki invoice" /></label>
          <label><span>Holat</span><select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}><option value="all">Barchasi</option><option value="open">Ochiq</option><option value="overdue">Muddati o'tgan</option><option value="partial">Qisman</option><option value="paid">To'langan</option></select></label>
          <label><span>Saralash</span><select value={filters.sort} onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))}><option value="dueDate">Muddat</option><option value="customer">Mijoz</option><option value="balance">Qoldiq</option></select></label>
          <button type="button" className="finance-button" onClick={() => { setFilters({ search: "", status: "all", sort: "dueDate" }); setPage(1); }}>Filtrlarni tozalash</button>
        </div>
        {visible.length ? (
          <div className="finance-table">
            {visible.map((item) => (
            <article key={item.id}>
              <div><strong>{item.customer}</strong><span>{item.invoice} | muddati {item.dueDate}</span></div>
              <b>{formatMoney(item.balance)}</b>
              <StatusBadge status={item.status === "overdue" ? "danger" : "success"} label={formatStatusLabel(item.status)} />
              <button type="button" onClick={() => controller.actions.createReminder(item.id)}>Eslatma yuborish</button>
            </article>
            ))}
          </div>
        ) : (
          <div className="finance-empty">Hozircha debitor yozuvlari mavjud emas.</div>
        )}
        {rows.length > 0 && (
          <div className="finance-pagination">
            <span>{rows.length} ta yozuv | {page}/{totalPages}</span>
            <button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Oldingi</button>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Keyingi</button>
          </div>
        )}
      </section>
    </section>
  );
};

export default AccountsReceivable;
