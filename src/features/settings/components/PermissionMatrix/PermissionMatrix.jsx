import { permissionActions, permissionModules } from "../../data/settingsPermissions";
import "./PermissionMatrix.scss";

const labels = {
  allowed: "Allowed",
  disabled: "Disabled",
  hidden: "Hidden",
  approval: "Approval",
};

const PermissionMatrix = ({ matrix, onToggle }) => (
  <div className="permission-matrix" role="table" aria-label="Permission matrix">
    <div className="permission-matrix__row permission-matrix__row--head" role="row">
      <strong role="columnheader">Module</strong>
      {permissionActions.map((action) => (
        <span key={action} role="columnheader">{action}</span>
      ))}
    </div>
    {permissionModules.map((moduleId) => (
      <div className="permission-matrix__row" role="row" key={moduleId}>
        <strong role="rowheader">{moduleId}</strong>
        {permissionActions.map((action) => {
          const state = matrix[moduleId]?.[action] || "disabled";
          return (
            <button
              key={action}
              type="button"
              className={`is-${state}`}
              aria-label={`${moduleId} ${action} ${labels[state]}`}
              onClick={() => onToggle(moduleId, action)}
            >
              {labels[state]}
            </button>
          );
        })}
      </div>
    ))}
  </div>
);

export default PermissionMatrix;
