import { Plus } from "lucide-react";

import { formatMoney } from "../../utils/hrFormatters";

const Positions = ({ controller }) => {
  const { state, dictionaries } = controller;

  return (
    <div className="hr-view">
      <section className="hr-panel">
        <div className="hr-panel__head">
          <div>
            <span>Positions</span>
            <h2>Lavozimlar va salary grade</h2>
          </div>
          <button type="button" onClick={() => controller.actions.addNotification("Position create modal simulyatsiya qilindi.")}>
            <Plus size={15} /> Create
          </button>
        </div>
        <div className="hr-card-grid">
          {state.positions.map((position) => {
            const count = state.employees.filter((employee) => employee.positionId === position.id).length;
            return (
              <article className="hr-mini-card" key={position.id}>
                <strong>{position.title}</strong>
                <span>{dictionaries.departmentById[position.departmentId]?.name} · {position.grade}</span>
                <span>{formatMoney(position.salaryMin)} - {formatMoney(position.salaryMax)}</span>
                <span>{count} xodim · {position.permissionTemplate} template</span>
                <button type="button" onClick={() => controller.actions.addNotification(`${position.title} permissions template ochildi.`)}>
                  Permissions template
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Positions;
