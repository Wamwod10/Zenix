import { sensitiveActions } from "../../data/hrPermissions";
import { canHR } from "../../utils/hrPermissions";

const HRSettings = ({ controller }) => {
  const { state, role, roles } = controller;

  return (
    <div className="hr-view">
      <section className="hr-grid">
        <article className="hr-panel">
          <div className="hr-panel__head"><div><span>Permissions</span><h2>RBAC action states</h2></div></div>
          <div className="hr-list">
            {sensitiveActions.map((action) => (
              <article key={action.id}>
                <strong>{action.label}</strong>
                <span>{action.area} · current role: {role}</span>
                <b>{canHR(role, action.id) ? "allowed" : "hidden/disabled"}</b>
              </article>
            ))}
          </div>
        </article>
        <article className="hr-panel">
          <div className="hr-panel__head"><div><span>HR Settings</span><h2>Payroll config va privacy</h2></div></div>
          <div className="hr-detail-grid">
            <article><span>Roles</span><strong>{roles.length}</strong></article>
            <article><span>Tax rate</span><strong>{state.settings.payrollConfig.taxRate * 100}%</strong></article>
            <article><span>INPS</span><strong>{state.settings.payrollConfig.inpsRate * 100}%</strong></article>
            <article><span>Age visible</span><strong>{state.settings.ageVisible ? "yes" : "no"}</strong></article>
          </div>
          <div className="hr-warning">{state.settings.payrollConfig.legalNotice}</div>
        </article>
      </section>
    </div>
  );
};

export default HRSettings;
