import { GlassSelect } from "@/components/ui";
import { ArrowDownUp, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { tableColumnSchemas } from "../../data/reportsMockData";
import { formatTableCell, getValueLabel, normalizeSearch } from "../../utils/reportsFormatters";
import ReportsEmptyState from "../ReportsEmptyState/ReportsEmptyState";
import "./DataTable.scss";

const compareValues = (a, b, type) => {
  if (a === b) return 0;
  if (type === "currency" || type === "percent" || typeof a === "number" || typeof b === "number") {
    return (Number(a) || 0) - (Number(b) || 0);
  }
  return String(a || "").localeCompare(String(b || ""), "uz");
};

const DataTable = ({ title = "Hisobot jadvali", rows = [], columns, schema = "default", onOpen, onReset }) => {
  const [sort, setSort] = useState({ key: "value", direction: "desc" });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [query, setQuery] = useState("");
  const tableColumns = columns || tableColumnSchemas[schema] || tableColumnSchemas.default;

  const filteredRows = useMemo(() => {
    const normalized = normalizeSearch(query);
    if (!normalized) return rows;
    return rows.filter((row) =>
      normalizeSearch(Object.values(row).join(" ")).includes(normalized)
    );
  }, [query, rows]);

  const sortedRows = useMemo(() => {
    const direction = sort.direction === "asc" ? 1 : -1;
    const column = tableColumns.find((item) => item.key === sort.key);
    return [...filteredRows].sort((a, b) => compareValues(a[sort.key], b[sort.key], column?.type) * direction);
  }, [filteredRows, sort, tableColumns]);

  const pageCount = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = sortedRows.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const firstRow = sortedRows.length ? safePage * pageSize + 1 : 0;
  const lastRow = Math.min(sortedRows.length, (safePage + 1) * pageSize);

  useEffect(() => {
    setPage(0);
  }, [query, rows, pageSize]);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

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
          <span className="reports-eyebrow">Jadval</span>
          <h3>{title}</h3>
        </div>
        <strong>{sortedRows.length} qator</strong>
      </div>

      <div className="reports-table-card__toolbar">
        <label>
          <Search size={14} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Jadvaldan qidirish" />
        </label>
        <GlassSelect value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))} aria-label="Sahifadagi qatorlar soni">
          {[5, 10, 20].map((size) => <option key={size} value={size}>{size} ta</option>)}
        </GlassSelect>
        <button type="button" onClick={() => window.print()}>Print</button>
      </div>

      {!pageRows.length ? (
        <ReportsEmptyState title="Jadvalda ma'lumot yo'q" text="Qidiruv yoki filterlarni yumshatib ko'ring." actionLabel="Filterlarni tozalash" onAction={onReset} />
      ) : (
        <>
          <div className="reports-table-card__table">
            <table>
              <thead>
                <tr>
                  {tableColumns.map((column) => (
                    <th key={column.key} scope="col">
                      <button type="button" onClick={() => toggleSort(column.key)}>
                        {column.label}
                        <ArrowDownUp size={12} />
                      </button>
                    </th>
                  ))}
                  <th scope="col">Amal</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => (
                  <tr key={row.id}>
                    {tableColumns.map((column) => (
                      <td key={column.key} data-label={column.label}>
                        {column.type === "status" ? (
                          <i className={`is-${row[column.key]}`}>{getValueLabel(row[column.key])}</i>
                        ) : (
                          formatTableCell(row[column.key], column.type)
                        )}
                      </td>
                    ))}
                    <td data-label="Amal">
                      <button type="button" onClick={() => onOpen?.(row.id)}>Ochish</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="reports-table-card__cards">
            {pageRows.map((row) => (
              <article key={row.id}>
                <strong>{row.name}</strong>
                {tableColumns.slice(1, 5).map((column) => (
                  <span key={column.key}>{column.label}: {formatTableCell(row[column.key], column.type)}</span>
                ))}
                <button type="button" onClick={() => onOpen?.(row.id)}>Ochish</button>
              </article>
            ))}
          </div>
        </>
      )}

      <div className="reports-table-card__pagination">
        <button type="button" disabled={safePage === 0} onClick={() => setPage((current) => Math.max(0, current - 1))} aria-label="Oldingi sahifa">
          <ChevronLeft size={15} />
        </button>
        <span>{firstRow}-{lastRow} / {sortedRows.length}</span>
        {Array.from({ length: pageCount }).slice(0, 5).map((_, index) => (
          <button key={index} type="button" className={safePage === index ? "is-active" : ""} onClick={() => setPage(index)}>
            {index + 1}
          </button>
        ))}
        <button type="button" disabled={safePage >= pageCount - 1} onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))} aria-label="Keyingi sahifa">
          <ChevronRight size={15} />
        </button>
      </div>
    </article>
  );
};

export default DataTable;
