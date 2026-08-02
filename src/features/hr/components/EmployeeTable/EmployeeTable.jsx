import { ArrowDownUp, Eye, MessageCircle, MoveRight } from "lucide-react";

import { calculateDocumentExpiry } from "../../utils/hrCalculations";
import { formatMoney, yearsBetween } from "../../utils/hrFormatters";
import StatusBadge from "../StatusBadge/StatusBadge";
import "./EmployeeTable.scss";

const riskLabel = (employee) => {
  const riskyDocument = employee.documents.find((document) =>
    ["critical", "expired", "warning"].includes(calculateDocumentExpiry(document).status),
  );
  if (employee.probation?.status === "active" || employee.probation?.status === "ending-soon") return "Sinov muddati";
  if (riskyDocument) return "Hujjat xavfi";
  if (employee.attendanceRate < 85) return "Davomat xavfi";
  return "";
};

const EmployeeTable = ({
  employees,
  dictionaries,
  salaryVisible,
  selectedIds,
  onToggle,
  onToggleAll,
  allSelected,
  sort,
  onSort,
  onOpen,
  onMessage,
  onTransfer,
}) => (
  <div className="employee-table" aria-label="Xodimlar ro'yxati">
    <table>
      <thead>
        <tr>
          <th>
            <input type="checkbox" checked={allSelected} onChange={onToggleAll} aria-label="Barcha xodimlarni tanlash" />
          </th>
          {[
            ["name", "Xodim"],
            ["position", "Lavozim"],
            ["branch", "Filial"],
            ["status", "Status"],
            ["kpi", "KPI"],
          ].map(([key, label]) => (
            <th key={key}>
              <button type="button" onClick={() => onSort(key)} aria-label={`${label} bo'yicha saralash`}>
                {label}
                <ArrowDownUp size={13} className={sort.key === key ? "is-active" : ""} />
              </button>
            </th>
          ))}
          <th>Amallar</th>
        </tr>
      </thead>
      <tbody>
        {employees.map((employee) => {
          const risk = riskLabel(employee);

          return (
            <tr key={employee.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(employee.id)}
                  onChange={() => onToggle(employee.id)}
                  aria-label={`${employee.firstName} ${employee.lastName} tanlash`}
                />
              </td>
              <td>
                <div className="employee-table__person">
                  <span className="employee-table__avatar">{employee.photo}</span>
                  <div>
                    <strong>{employee.firstName} {employee.lastName}</strong>
                    <small>{employee.phone} - {yearsBetween(employee.hireDate)} yil staj</small>
                  </div>
                </div>
              </td>
              <td>
                <strong>{dictionaries.positionById[employee.positionId]?.title}</strong>
                <small>{dictionaries.departmentById[employee.departmentId]?.name}</small>
              </td>
              <td>{dictionaries.branchById[employee.branchId]?.name}</td>
              <td>
                <StatusBadge status={employee.status} />
                {risk && <span className="employee-table__risk">{risk}</span>}
              </td>
              <td>
                <strong>{employee.attendanceRate}% / {employee.kpiScore}</strong>
                <small>{salaryVisible ? formatMoney(employee.salary) : "Oylik ma'lumoti yashirilgan"}</small>
              </td>
              <td>
                <div className="employee-table__actions">
                  <button type="button" onClick={() => onOpen(employee.id)} aria-label="Profilni ochish" title="Profilni ochish">
                    <Eye size={15} />
                  </button>
                  <button type="button" onClick={() => onMessage(employee.id)} aria-label="Xabar yuborish" title="Xabar yuborish">
                    <MessageCircle size={15} />
                  </button>
                  <button type="button" onClick={() => onTransfer(employee.id)} aria-label="Filialga o'tkazish" title="Filialga o'tkazish">
                    <MoveRight size={15} />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export default EmployeeTable;
