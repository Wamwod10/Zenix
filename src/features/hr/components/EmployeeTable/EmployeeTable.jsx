import { Eye, MessageCircle, MoveRight } from "lucide-react";

import { formatMoney, yearsBetween } from "../../utils/hrFormatters";
import StatusBadge from "../StatusBadge/StatusBadge";
import "./EmployeeTable.scss";

const EmployeeTable = ({
  employees,
  dictionaries,
  salaryVisible,
  onOpen,
  onMessage,
  onTransfer,
}) => (
  <section className="employee-table" aria-label="Xodimlar ro'yxati">
    <div className="employee-table__head">
      <span>Xodim</span>
      <span>Lavozim</span>
      <span>Filial</span>
      <span>Status</span>
      <span>KPI</span>
      <span>Action</span>
    </div>
    {employees.map((employee) => (
      <article className="employee-table__row" key={employee.id}>
        <div className="employee-table__person">
          <span className="employee-table__avatar">{employee.photo}</span>
          <div>
            <strong>{employee.firstName} {employee.lastName}</strong>
            <small>{employee.phone} · {yearsBetween(employee.hireDate)} yil staj</small>
          </div>
        </div>
        <span>
          <strong>{dictionaries.positionById[employee.positionId]?.title}</strong>
          <small>{dictionaries.departmentById[employee.departmentId]?.name}</small>
        </span>
        <span>{dictionaries.branchById[employee.branchId]?.name}</span>
        <StatusBadge status={employee.status} />
        <span>
          <strong>{employee.attendanceRate}% / {employee.kpiScore}</strong>
          <small>{salaryVisible ? formatMoney(employee.salary) : "Salary hidden"}</small>
        </span>
        <div className="employee-table__actions">
          <button type="button" onClick={() => onOpen(employee.id)} aria-label="Profilni ochish">
            <Eye size={15} />
          </button>
          <button type="button" onClick={() => onMessage(employee.id)} aria-label="Xabar yuborish">
            <MessageCircle size={15} />
          </button>
          <button type="button" onClick={() => onTransfer(employee.id)} aria-label="Filialga o'tkazish">
            <MoveRight size={15} />
          </button>
        </div>
      </article>
    ))}
  </section>
);

export default EmployeeTable;
