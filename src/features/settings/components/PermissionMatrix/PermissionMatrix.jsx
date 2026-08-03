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
  products: "Mahsulotlar",
  sales: "Savdo",
  purchases: "Xaridlar",
  warehouse: "Ombor",
  crm: "CRM",
  finance: "Moliya",
  hr: "Xodimlar",
  reports: "Hisobotlar",
  settings: "Sozlamalar",
  documents: "Hujjatlar",
  integrations: "Integratsiyalar",
  api: "API",
  ai: "AI",
  billing: "Billing",
};

const actionLabels = {
  view: "Ko'rish",
  create: "Yaratish",
  edit: "Tahrirlash",
  delete: "O'chirish",
  restore: "Tiklash",
  archive: "Arxiv",
  print: "Chop etish",
  share: "Ulashish",
  duplicate: "Nusxalash",
  import: "Import",
  export: "Eksport",
  approve: "Tasdiqlash",
  reject: "Rad etish",
  viewCost: "Tannarx",
  viewProfit: "Foyda",
  priceEdit: "Narx",
  discount: "Chegirma",
  api: "API",
  ai: "AI",
  audit: "Audit",
  settings: "Sozlama",
  bulkEdit: "Bulk edit",
  permanentDelete: "Butunlay o'chirish",
  field: "Maydon",
  branch: "Filial",
  warehouse: "Ombor",
  device: "Qurilma",
  ip: "IP",
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
