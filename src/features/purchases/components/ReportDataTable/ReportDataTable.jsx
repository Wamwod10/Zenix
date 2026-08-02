// Umumiy hisobot jadvali — ustunlar soni har bir hisobot turida farq
// qiladi (purchase-table.scss'dagi grid-ustunli jadvallar bitta ustun sonini
// taxmin qiladi), shu sabab semantik <table> asosida, lekin bir xil Liquid
// Glass uslubida qurilgan.

import "./ReportDataTable.scss";

const getAlignClass = (align = "left") =>
  ["center", "right"].includes(align) ? `report-table__cell--${align}` : "";

const ReportDataTable = ({ columns = [], rows = [], onRowClick, emptyText = "Ma'lumot yo'q." }) => {
  if (!rows.length) {
    return <p className="report-table__empty">{emptyText}</p>;
  }

  return (
    <div className="report-table">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={getAlignClass(column.align)}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.id || row.key || index}
              className={onRowClick ? "report-table__row--clickable" : ""}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((column) => (
                <td key={column.key} className={getAlignClass(column.align)}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportDataTable;
