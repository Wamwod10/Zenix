const Shifts = ({ controller }) => {
  const { state, dictionaries } = controller;
  const schedule = state.schedules[0];

  return (
    <div className="hr-view">
      <section className="hr-panel">
        <div className="hr-panel__head">
          <div><span>Work schedule</span><h2>Smenalar va haftalik grid</h2></div>
          <button type="button" onClick={() => controller.actions.addNotification("Shift assignment saqlandi.")}>Assign shift</button>
        </div>
        <div className="hr-schedule-grid">
          {(schedule?.days || []).map((day) => (
            <button key={day.day} type="button" className={day.work ? "is-work" : ""} onClick={() => controller.actions.addNotification(`${day.day} shift swap request preview.`)}>
              <strong>{day.day}</strong>
              <span>{day.work ? `${day.start}-${day.end}` : "Dam"}</span>
              <small>{day.work ? `${day.lunchStart}-${day.lunchEnd}` : schedule?.rotation}</small>
            </button>
          ))}
        </div>
        <div className="hr-card-grid">
          {state.employees.slice(0, 4).map((employee) => (
            <article className="hr-mini-card" key={employee.id}>
              <strong>{formatName(employee)}</strong>
              <span>{dictionaries.branchById[employee.branchId]?.name}</span>
              <span>Conflict validation: clear</span>
              <button type="button" onClick={() => controller.actions.addNotification("Employee override effective date saqlandi.")}>Override</button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

const formatName = (employee) => `${employee.firstName} ${employee.lastName}`;

export default Shifts;
