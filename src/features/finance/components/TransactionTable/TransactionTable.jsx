import { useMemo, useState } from "react";
import { ArrowDownUp, ChevronLeft, ChevronRight, Eye, Send, ShieldCheck } from "lucide-react";

import { formatMoney, formatSource } from "../../utils/financeFormatters";
import StatusBadge from "../StatusBadge/StatusBadge";

import "./TransactionTable.scss";

const TransactionTable = ({
  transactions,
  onOpen,
  onSubmit,
  onApprove,
  actionState,
}) => {
  const [sort, setSort] = useState({ key: "date", direction: "desc" });
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const sorted = useMemo(() => {
    const direction = sort.direction === "asc" ? 1 : -1;
    return [...transactions].sort((first, second) => {
      const firstValue = first[sort.key];
      const secondValue = second[sort.key];

      if (sort.key === "amount") {
        return (Number(firstValue || 0) - Number(secondValue || 0)) * direction;
      }

      return String(firstValue || "").localeCompare(String(secondValue || ""), "uz") * direction;
    });
  }, [sort, transactions]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (key) => {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  };

  const header = (key, label) => (
    <button type="button" onClick={() => toggleSort(key)} aria-label={`${label} bo'yicha saralash`}>
      {label}
      <ArrowDownUp size={13} />
    </button>
  );

  return (
    <div className="transaction-table">
      <div className="transaction-table__head" role="row">
        {header("reference", "Hujjat")}
        {header("counterparty", "Hamkor")}
        {header("amount", "Summa")}
        {header("status", "Holat")}
        <span>Amallar</span>
      </div>

      {visible.map((item) => {
        const approveState = actionState("approve", item);

        return (
          <article className="transaction-table__row" key={item.id}>
            <button type="button" onClick={() => onOpen(item.id)}>
              <strong>{item.reference}</strong>
              <small>{item.date} | {formatSource(item.source)}</small>
            </button>
            <span>{item.counterparty}</span>
            <strong>{formatMoney(item.amount, item.currency)}</strong>
            <StatusBadge status={item.status} />
            <div className="transaction-table__actions">
              <button type="button" aria-label="Tafsilotlarni ochish" title="Tafsilotlarni ochish" onClick={() => onOpen(item.id)}>
                <Eye size={15} />
              </button>
              <button
                type="button"
                aria-label={item.status === "Draft" ? "Tasdiqqa yuborish" : "Faqat qoralama tasdiqqa yuboriladi"}
                title={item.status === "Draft" ? "Tasdiqqa yuborish" : "Faqat qoralama tasdiqqa yuboriladi"}
                disabled={item.status !== "Draft"}
                onClick={() => onSubmit(item.id)}
              >
                <Send size={15} />
              </button>
              <button
                type="button"
                aria-label={approveState.reason || "Tasdiqlash"}
                title={approveState.reason || "Tasdiqlash"}
                disabled={!approveState.allowed || item.status !== "Pending"}
                onClick={() => onApprove(item.id)}
              >
                <ShieldCheck size={15} />
              </button>
            </div>
          </article>
        );
      })}

      <div className="transaction-table__pagination" aria-label="Tranzaksiya sahifalari">
        <span>{sorted.length} ta yozuv | {currentPage}/{totalPages}</span>
        <div>
          <button type="button" aria-label="Oldingi sahifa" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
            <ChevronLeft size={15} />
          </button>
          <button type="button" aria-label="Keyingi sahifa" disabled={currentPage >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionTable;
