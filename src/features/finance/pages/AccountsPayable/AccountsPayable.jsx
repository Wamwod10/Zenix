import { GlassSelect } from "@/components/ui";
import { useMemo, useState } from "react";

import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { formatMoney, formatStatusLabel } from "../../utils/financeFormatters";

const AccountsPayable = ({ controller, onNavigate }) => {
  const [filters, setFilters] = useState({ search: "", status: "all", sort: "dueDate" });
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const rows = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return controller.state.payables
      .filter((item) => {
        const matchesSearch = !query || `${item.supplier} ${item.bill}`.toLowerCase().includes(query);
        const matchesStatus = filters.status === "all" || item.status === filters.status;
        return matchesSearch && matchesStatus;
      })
      .sort((first, second) => (
        filters.sort === "balance"
          ? Number(second.balance || 0) - Number(first.balance || 0)
          : String(first[filters.sort]).localeCompare(String(second[filters.sort]), "uz")
      ));
  }, [controller.state.payables, filters]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const visible = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <section className="finance-view">
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Kreditor qarzdorlik</span>
            <h2>To'lanadigan hisoblar</h2>
          </div>
        </div>
        <div className="finance-filters">
          <label><span>Qidirish</span><input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Yetkazib beruvchi yoki hujjat" /></label>
          <label><span>Holat</span><GlassSelect value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}><option value="all">Barchasi</option><option value="pending">Kutilmoqda</option><option value="partial">Qisman</option><option value="paid">To'langan</option></GlassSelect></label>
          <label><span>Saralash</span><GlassSelect value={filters.sort} onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))}><option value="dueDate">Muddat</option><option value="supplier">Yetkazib beruvchi</option><option value="balance">Qoldiq</option></GlassSelect></label>
          <button type="button" className="finance-button" onClick={() => { setFilters({ search: "", status: "all", sort: "dueDate" }); setPage(1); }}>Filtrlarni tozalash</button>
        </div>
        {visible.length ? (
          <div className="finance-table">
            {visible.map((item) => (
            <article key={item.id}>
              <div><strong>{item.supplier}</strong><span>{item.bill} | muddati {item.dueDate}</span></div>
              <b>{formatMoney(item.balance)}</b>
              <StatusBadge status={item.status === "partial" ? "warning" : "Pending"} label={formatStatusLabel(item.status)} />
              <button type="button" onClick={() => onNavigate("payment-orders")}>To'lov topshirig'i</button>
            </article>
            ))}
          </div>
        ) : (
          <div className="finance-empty">Hozircha kreditor yozuvlari mavjud emas.</div>
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

export default AccountsPayable;
