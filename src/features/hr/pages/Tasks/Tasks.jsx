import { useState } from "react";
import { Plus } from "lucide-react";

import StatusBadge from "../../components/StatusBadge/StatusBadge";

const statuses = ["New", "In Progress", "Completed", "Approved", "Returned"];

const Tasks = ({ controller }) => {
  const { state, dictionaries } = controller;
  const [title, setTitle] = useState("");

  return (
    <div className="hr-view">
      <section className="hr-panel">
        <div className="hr-panel__head"><div><span>Tasks</span><h2>List, board, my/team/overdue</h2></div></div>
        <div className="hr-form-grid">
          <label>Yangi task<input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
          <button type="button" onClick={() => { if (controller.actions.createTask({ title, assigneeIds: ["emp-003"] })) setTitle(""); }}>
            <Plus size={15} /> Create
          </button>
        </div>
        <div className="hr-board">
          {statuses.map((status) => (
            <section key={status}>
              <h3>{status}</h3>
              {state.tasks.filter((task) => task.status === status).map((task) => (
                <article key={task.id}>
                  <strong>{task.title}</strong>
                  <span>{task.description}</span>
                  <span>{task.assigneeIds.map((id) => dictionaries.employeeById[id]?.firstName).join(", ")} · {task.deadline}</span>
                  <StatusBadge status={task.priority} label={task.priority} />
                  <select value={task.status} onChange={(event) => controller.actions.updateTaskStatus(task.id, event.target.value)} aria-label="Task status">
                    {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </article>
              ))}
            </section>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Tasks;
