import { permissionActions, permissionModules } from "../../data/settingsPermissions";
import "./PermissionMatrix.scss";

const labels = {
  allowed: "Ruxsat berilgan",
  disabled: "Bloklangan",
  hidden: "Yashirilgan",
  approval: "Tasdiq talab qilinadi",
};

const moduleLabels = {
  dashboard: "Boshqaruv paneli",
  pos: "Savdo terminali",
  warehouse: "Ombor",
  crm: "CRM",
  finance: "Moliya",
  hr: "Xodimlar",
  reports: "Hisobotlar",
  settings: "Sozlamalar",
  integrations: "Integratsiyalar",
  ai: "AI",
};

const actionLabels = {
  view: "Ko'rish",
  create: "Yaratish",
  edit: "Tahrirlash",
  delete: "O'chirish",
  export: "Eksport",
  approve: "Tasdiqlash",
  field: "Maydon",
  branch: "Filial",
  warehouse: "Ombor",
};

const PermissionMatrix = ({ matrix, onToggle }) => (
  <div className="permission-matrix" role="table" aria-label="Ruxsatlar matritsasi">
    <div className="permission-matrix__row permission-matrix__row--head" role="row">
      <strong role="columnheader">Modul</strong>
      {permissionActions.map((action) => (
        <span key={action} role="columnheader">{actionLabels[action] || action}</span>
      ))}
    </div>
    {permissionModules.map((moduleId) => (
      <div className="permission-matrix__row" role="row" key={moduleId}>
        <strong role="rowheader">{moduleLabels[moduleId] || moduleId}</strong>
        {permissionActions.map((action) => {
          const state = matrix[moduleId]?.[action] || "disabled";
          return (
            <button
              key={action}
              type="button"
              className={`is-${state}`}
              aria-label={`${moduleLabels[moduleId] || moduleId} ${actionLabels[action] || action}: ${labels[state]}`}
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
