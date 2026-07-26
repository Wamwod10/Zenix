import { Plus } from "lucide-react";

import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { formatEmployeeName } from "../../utils/hrFormatters";

const Departments = ({ controller }) => {
  const { state, dictionaries } = controller;

  return (
    <div className="hr-view">
      <section className="hr-panel">
        <div className="hr-panel__head">
          <div>
            <span>Departments</span>
            <h2>Bo'limlar ierarxiyasi</h2>
          </div>
          <button type="button" onClick={() => controller.actions.addNotification("Department create drawer simulyatsiya qilindi.")}>
            <Plus size={15} /> Create
          </button>
        </div>
        <div className="hr-card-grid">
          {state.departments.map((department) => {
            const count = state.employees.filter((employee) => employee.departmentId === department.id).length;
            const manager = dictionaries.employeeById[department.managerId];
            return (
              <article className="hr-mini-card" key={department.id}>
                <strong>{department.name}</strong>
                <span>{department.parentId ? `Parent: ${dictionaries.departmentById[department.parentId]?.name}` : "Root department"}</span>
                <span>Manager: {formatEmployeeName(manager)}</span>
                <span>{count} xodim</span>
                <StatusBadge status={department.status} />
                <div className="hr-actions-row">
                  <button type="button" onClick={() => controller.actions.addNotification(`${department.name} edit ochildi.`)}>Edit</button>
                  <button type="button" onClick={() => controller.actions.addNotification(`${department.name} archived preview.`, "warning")}>Archive</button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Departments;
