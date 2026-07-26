import { MoveRight } from "lucide-react";

const Branches = ({ controller }) => {
  const { state } = controller;

  return (
    <div className="hr-view">
      <section className="hr-panel">
        <div className="hr-panel__head">
          <div>
            <span>Branches</span>
            <h2>Filial bo'yicha boshqarish</h2>
          </div>
        </div>
        <div className="hr-card-grid">
          {state.branches.map((branch) => (
            <article className="hr-mini-card" key={branch.id}>
              <strong>{branch.name}</strong>
              <span>{branch.city}</span>
              <span>{branch.employeeCount} xodim · {branch.averageAttendance}% attendance</span>
              <span>KPI {branch.averageKpi} · {branch.openVacancies} vakansiya</span>
              <button type="button" onClick={() => controller.actions.addNotification(`${branch.name} branch switcher active.`)}>
                <MoveRight size={15} /> Switch
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Branches;
