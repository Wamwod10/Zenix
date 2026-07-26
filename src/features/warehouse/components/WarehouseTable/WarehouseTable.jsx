import "./WarehouseTable.scss";

const WarehouseTable = ({ columns, rows, getRowKey, onRowClick, emptyText }) => {
  if (!rows.length) {
    return (
      <div className="warehouse-table warehouse-table--empty">
        <p>{emptyText || "Ma'lumot topilmadi"}</p>
      </div>
    );
  }

  return (
    <div className="warehouse-table" role="region" aria-label="Ombor jadvali">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
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
    </div>
  );
};

export default WarehouseTable;
