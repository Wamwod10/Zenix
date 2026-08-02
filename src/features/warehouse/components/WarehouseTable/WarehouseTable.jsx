import "./WarehouseTable.scss";
import { useMemo, useState } from "react";

const WarehouseTable = ({ columns, rows = [], getRowKey, onRowClick, emptyText, emptyAction, pageSize = 10 }) => {
  const [sort, setSort] = useState({ key: "", direction: "asc" });
  const [page, setPage] = useState(1);
  const sortedRows = useMemo(() => {
    if (!sort.key) return rows;

    return [...rows].sort((first, second) => {
      const left = first[sort.key];
      const right = second[sort.key];
      const direction = sort.direction === "asc" ? 1 : -1;

      if (typeof left === "number" && typeof right === "number") {
        return (left - right) * direction;
      }

      return String(left || "").localeCompare(String(right || ""), "uz-UZ") * direction;
    });
  }, [rows, sort]);
  const pageCount = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const visibleRows = sortedRows.slice((page - 1) * pageSize, page * pageSize);

  if (!rows.length) {
    return (
      <div className="warehouse-table warehouse-table--empty">
        <p>{emptyText || "Ma'lumot topilmadi"}</p>
        {emptyAction}
      </div>
    );
  }

  const toggleSort = (key) => {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  };

  return (
    <div className="warehouse-table" role="region" aria-label="Ombor jadvali">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>
                <button type="button" onClick={() => toggleSort(column.key)}>
                  {column.label}
                  {sort.key === column.key ? (sort.direction === "asc" ? " ↑" : " ↓") : ""}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row) => (
            <tr
              key={getRowKey ? getRowKey(row) : row.id}
              className={onRowClick ? "is-clickable" : ""}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => (
                <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {pageCount > 1 && (
        <div className="warehouse-table__pagination">
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>Oldingi</button>
          <span>{page} / {pageCount}</span>
          <button type="button" disabled={page >= pageCount} onClick={() => setPage(page + 1)}>Keyingi</button>
        </div>
      )}
    </div>
  );
};

export default WarehouseTable;
