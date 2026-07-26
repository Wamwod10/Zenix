import { ArrowDownUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { formatReportValue, formatSignedPercent } from "../../utils/reportsFormatters";
import "./DataTable.scss";

const DataTable = ({ title = "Report table", rows = [], onOpen }) => {
  const [sort, setSort] = useState({ key: "value", direction: "desc" });
  const [page, setPage] = useState(0);
  const pageSize = 5;
  const sortedRows = useMemo(() => {
    const direction = sort.direction === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => (a[sort.key] > b[sort.key] ? direction : -direction));
  }, [rows, sort]);
  const pageRows = sortedRows.slice(page * pageSize, page * pageSize + pageSize);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));

  const toggleSort = (key) => {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === "desc" ? "asc" : "desc",
    }));
  };

  return (
    <article className="reports-table-card">
      <div className="reports-table-card__head">
        <div>
          <span className="reports-eyebrow">Data table</span>
          <h3>{title}</h3>
        </div>
        <strong>{rows.length} rows</strong>
      </div>

      <div className="reports-table-card__table" role="table" aria-label={title}>
        <div role="row" className="reports-table-card__row reports-table-card__row--head">
          {["name", "module", "branch", "value", "change", "status"].map((key) => (
            <button key={key} type="button" role="columnheader" onClick={() => toggleSort(key)}>
              {key}
              <ArrowDownUp size={12} />
            </button>
          ))}
        </div>
        {pageRows.map((row) => (
          <button key={row.id} type="button" role="row" className="reports-table-card__row" onClick={() => onOpen?.(row.id)}>
            <span role="cell">
              <strong>{row.name}</strong>
              <small>{row.owner}</small>
            </span>
            <span role="cell">{row.module}</span>
            <span role="cell">{row.branch}</span>
            <span role="cell">{formatReportValue(row.value, "UZS")}</span>
            <span role="cell" className={row.change >= 0 ? "is-up" : "is-down"}>
              {formatSignedPercent(row.change)}
            </span>
            <span role="cell">
              <i className={`is-${row.status}`}>{row.status}</i>
            </span>
          </button>
        ))}
      </div>

      <div className="reports-table-card__pagination">
        <button type="button" disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))} aria-label="Previous table page">
          <ChevronLeft size={15} />
        </button>
        <span>{page + 1} / {pageCount}</span>
        <button type="button" disabled={page >= pageCount - 1} onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))} aria-label="Next table page">
          <ChevronRight size={15} />
        </button>
      </div>
    </article>
  );
};

export default DataTable;
