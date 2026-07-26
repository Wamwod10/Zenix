import { Download, Grid2X2, List, MessageSquare, UserPlus } from "lucide-react";

import EmployeeFilters from "../../components/EmployeeFilters/EmployeeFilters";
import EmployeeTable from "../../components/EmployeeTable/EmployeeTable";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { formatEmployeeName, formatMoney } from "../../utils/hrFormatters";

const Employees = ({ controller, onNavigate }) => {
  const { state, employeeFilters, dictionaries, pagination } = controller;
  const salaryVisible = controller.actionState("salary.view").visible;
  const start = (pagination.page - 1) * pagination.pageSize;
  const employees = employeeFilters.filteredEmployees.slice(start, start + pagination.pageSize);
  const pages = Math.max(1, Math.ceil(employeeFilters.filteredEmployees.length / pagination.pageSize));

  return (
    <div className="hr-view">
      <section className="hr-panel">
        <div className="hr-panel__head">
          <div>
            <span>Employees</span>
            <h2>Xodimlar ro'yxati</h2>
          </div>
          <div className="hr-actions-row">
            <button type="button" onClick={() => onNavigate("employee-create")}>
              <UserPlus size={15} /> Yangi
            </button>
            <button type="button" onClick={() => controller.actions.addNotification("Employee export simulyatsiya qilindi.")}>
              <Download size={15} /> Eksport
            </button>
            <button type="button" aria-label="Table view">
              <List size={15} />
            </button>
            <button type="button" aria-label="Card view">
              <Grid2X2 size={15} />
            </button>
          </div>
        </div>

        <EmployeeFilters
          filters={employeeFilters.filters}
          onChange={employeeFilters.updateFilter}
          onReset={employeeFilters.resetFilters}
          departments={state.departments}
          positions={state.positions}
          branches={state.branches}
        />

        {employees.length ? (
          <EmployeeTable
            employees={employees}
            dictionaries={dictionaries}
            salaryVisible={salaryVisible}
            onOpen={(id) => {
              controller.actions.setSelectedEmployeeId(id);
              onNavigate("employee-details", id);
            }}
            onMessage={(id) => {
              controller.actions.setSelectedEmployeeId(id);
              onNavigate("messages");
            }}
            onTransfer={(id) => controller.actions.transferEmployee(id, "br-tashkent")}
          />
        ) : (
          <div className="hr-empty">Filter bo'yicha xodim topilmadi.</div>
        )}

        <div className="hr-pagination">
          <span>{employeeFilters.filteredEmployees.length} ta natija</span>
          <button type="button" disabled={pagination.page === 1} onClick={() => controller.actions.setPagination({ ...pagination, page: pagination.page - 1 })}>
            Oldingi
          </button>
          <strong>{pagination.page} / {pages}</strong>
          <button type="button" disabled={pagination.page === pages} onClick={() => controller.actions.setPagination({ ...pagination, page: pagination.page + 1 })}>
            Keyingi
          </button>
        </div>
      </section>

      <section className="hr-card-grid">
        {employeeFilters.filteredEmployees.slice(0, 4).map((employee) => (
          <article className="hr-mini-card" key={employee.id}>
            <span className="hr-avatar">{employee.photo}</span>
            <strong>{formatEmployeeName(employee)}</strong>
            <span>{dictionaries.positionById[employee.positionId]?.title}</span>
            <StatusBadge status={employee.status} />
            <span>{salaryVisible ? formatMoney(employee.salary) : "Salary hidden"}</span>
            <button type="button" onClick={() => controller.actions.sendMessage({ text: "HR xabari", to: [employee.id], type: "personal" })}>
              <MessageSquare size={15} /> Xabar
            </button>
          </article>
        ))}
      </section>
    </div>
  );
};

export default Employees;
