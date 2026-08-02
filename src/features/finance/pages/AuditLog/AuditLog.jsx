import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { financeRoles } from "../../data/financePermissions";
import { formatDateTime } from "../../utils/financeFormatters";

const roleLabels = Object.fromEntries(financeRoles.map((role) => [role.id, role.label]));

const compactValue = (value) => {
  if (!value) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toLocaleString("uz-UZ");
  return Object.entries(value).slice(0, 3).map(([key, item]) => `${key}: ${item}`).join(", ");
};

const AuditLog = ({ controller }) => (
  <section className="finance-view">
    <section className="finance-panel">
      <div className="finance-panel__head">
        <div>
          <span>Audit jurnali</span>
          <h2>O'zgarmas moliyaviy iz</h2>
        </div>
        <StatusBadge status="success" label={`${controller.state.auditLog.length} yozuv`} />
      </div>
      <div className="finance-filters">
        <label><span>Sana</span><input type="date" /></label>
        <label><span>Foydalanuvchi</span><input placeholder="Foydalanuvchi" /></label>
        <label><span>Modul</span><input placeholder="account, cash, tax..." /></label>
        <label><span>Amal</span><input placeholder="create, approve..." /></label>
      </div>
      {controller.state.auditLog.length ? (
        <div className="finance-table finance-table--audit">
          {controller.state.auditLog.map((item) => (
            <article key={item.id}>
              <div>
                <strong>{formatDateTime(item.at)}</strong>
                <span>{item.by} | {roleLabels[item.role] || item.role || "Rol ko'rsatilmagan"}</span>
              </div>
              <b>{item.event}</b>
              <span>{item.area}</span>
              <span>{compactValue(item.oldValue)}</span>
              <span>{compactValue(item.newValue)}</span>
              <span>{item.sourceId || "—"}</span>
            </article>
          ))}
        </div>
      ) : (
        <div className="finance-empty">Audit yozuvlari topilmadi. Muhim moliyaviy actionlar bajarilganda bu yerda ko'rinadi.</div>
      )}
    </section>
  </section>
);

export default AuditLog;
