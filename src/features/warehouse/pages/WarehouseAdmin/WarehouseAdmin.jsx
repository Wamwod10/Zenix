import { useState } from "react";

import StatusBadge from "../../components/StatusBadge/StatusBadge";
import WarehouseTable from "../../components/WarehouseTable/WarehouseTable";
import { warehousePermissionMatrix, warehouseRoles } from "../../utils/warehousePermissions";
import { formatDateTime } from "../../utils/warehouseFormatters";

const tabs = ["Hisobotlar", "Import / eksport", "Sozlamalar", "Bildirishnomalar", "Ruxsatlar", "Audit jurnali"];

const reports = [
  "Zaxira holati",
  "Kirim / chiqim",
  "Kam qoldiq",
  "O'lik zaxira",
  "Inventar qiymati",
  "Muddat hisoboti",
  "Aylanma hisoboti",
  "ABC / XYZ",
  "Inventarizatsiya farqi",
  "Hisobdan chiqarish",
];

const roleLabels = {
  owner: "Egasi",
  admin: "Administrator",
  manager: "Menejer",
  employee: "Ombor xodimi",
  cashier: "Kassir / sotuvchi",
};

const permissionLabels = {
  view: "Ko'rish",
  receipt: "Kirim",
  issue: "Chiqim",
  transfer: "Transfer",
  counting: "Sanoq",
  adjustment: "Tuzatish",
  writeOff: "Hisobdan chiqarish",
  value: "Qiymat",
  settings: "Sozlama",
  importExport: "Import / eksport",
};

const permissionStateLabels = {
  enabled: "Ruxsat bor",
  approval: "Tasdiq kerak",
  disabled: "Cheklangan",
  hidden: "Yashirilgan",
};

const WarehouseAdmin = ({
  state,
  productsById,
  warehousesById,
  importPreview,
  asyncStatus,
  onExport,
  onValidateImport,
  onConfirmImport,
  onUpdateSettings,
  onMarkNotificationRead,
}) => {
  const [tab, setTab] = useState("Hisobotlar");

  return (
    <div className="warehouse-view">
      <section className="warehouse-panel">
        <div className="warehouse-panel__head">
          <div>
            <span>Boshqaruv</span>
            <h2>Hisobot, import/eksport, sozlama, bildirishnoma, ruxsat va audit</h2>
          </div>
          {asyncStatus && <StatusBadge status={asyncStatus.type === "success" ? "healthy" : "planned"} label={asyncStatus.message} />}
        </div>

        <div className="warehouse-tabs" role="tablist">
          {tabs.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={tab === item}
              className={tab === item ? "is-active" : ""}
              onClick={() => setTab(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {tab === "Hisobotlar" && (
          <div className="warehouse-card-grid">
            {reports.map((report) => (
              <article className="warehouse-mini-card" key={report}>
                <strong>{report}</strong>
                <span>Vaqt, ombor, filial va kategoriya filtrlari bilan</span>
                <div className="warehouse-row-actions warehouse-row-actions--text">
                  <button type="button" onClick={() => onExport(report)}>
                    Excel
                  </button>
                  <button type="button" onClick={() => onExport(`${report} PDF`)}>
                    PDF
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {tab === "Import / eksport" && (
          <div className="warehouse-import">
            <div className="warehouse-card-grid">
              <article className="warehouse-mini-card">
                <strong>1. Shablon yuklab olish</strong>
                <span>Mahsulot, SKU, quantity, cost, location ustunlari</span>
                <button type="button" className="warehouse-mini-button" onClick={() => onExport("Import template")}>
                  Shablon
                </button>
              </article>
              <article className="warehouse-mini-card">
                <strong>2. Excel/CSV yuklash simulyatsiyasi</strong>
                <span>Column mapping va validation preview</span>
                <button type="button" className="warehouse-mini-button" onClick={onValidateImport}>
                  Faylni tekshirish
                </button>
              </article>
              <article className="warehouse-mini-card">
                <strong>3. Tasdiqlash</strong>
                <span>Valid rows import qilinadi, error rows auditga tushadi</span>
                <button type="button" className="warehouse-mini-button" disabled={!importPreview} onClick={onConfirmImport}>
                  Importni tasdiqlash
                </button>
              </article>
            </div>

            {importPreview && (
              <WarehouseTable
                rows={importPreview.errorRows}
                columns={[
                  { key: "row", label: "Row" },
                  { key: "field", label: "Field" },
                  { key: "message", label: "Validation" },
                ]}
                emptyText="Xato qatorlar yo'q"
              />
            )}
          </div>
        )}

        {tab === "Sozlamalar" && (
          <div className="warehouse-settings-grid">
            {Object.entries(state.settings).map(([key, value]) => (
              <label key={key}>
                <span>{key}</span>
                {typeof value === "boolean" ? (
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(event) => onUpdateSettings({ [key]: event.target.checked })}
                  />
                ) : (
                  <input
                    type={typeof value === "number" ? "number" : "text"}
                    value={value}
                    onChange={(event) =>
                      onUpdateSettings({
                        [key]: typeof value === "number" ? Number(event.target.value) : event.target.value,
                      })
                    }
                  />
                )}
              </label>
            ))}
          </div>
        )}

        {tab === "Bildirishnomalar" && (
          <WarehouseTable
            rows={state.notifications}
            columns={[
              { key: "title", label: "Signal", render: (row) => <><strong>{row.title}</strong><small>{row.message}</small></> },
              { key: "type", label: "Type" },
              { key: "level", label: "Daraja", render: (row) => <StatusBadge status={row.level} /> },
              { key: "createdAt", label: "Vaqt", render: (row) => formatDateTime(row.createdAt) },
              { key: "read", label: "O'qilgan", render: (row) => <StatusBadge status={row.read ? "healthy" : "important"} label={row.read ? "O'qilgan" : "O'qilmagan"} /> },
              {
                key: "action",
                label: "Amal",
                render: (row) => (
                  <button type="button" className="warehouse-mini-button" disabled={row.read} onClick={() => onMarkNotificationRead(row.id)}>
                    O'qildi
                  </button>
                ),
              },
            ]}
          />
        )}

        {tab === "Ruxsatlar" && (
          <WarehouseTable
            rows={warehouseRoles}
            columns={[
              { key: "label", label: "Rol", render: (row) => <strong>{roleLabels[row.id] || row.label}</strong> },
              ...["view", "receipt", "issue", "transfer", "counting", "adjustment", "writeOff", "value", "settings", "importExport"].map((permission) => ({
                key: permission,
                label: permissionLabels[permission],
                render: (row) => {
                  const state = warehousePermissionMatrix[row.id][permission];

                  return (
                    <StatusBadge
                      status={state === "enabled" ? "healthy" : state === "approval" ? "important" : "inactive"}
                      label={permissionStateLabels[state] || state}
                    />
                  );
                },
              })),
            ]}
          />
        )}

        {tab === "Audit jurnali" && (
          <WarehouseTable
            rows={state.auditLog}
            columns={[
              { key: "time", label: "Vaqt", render: (row) => formatDateTime(row.time) },
              { key: "user", label: "User" },
              { key: "action", label: "Amal", render: (row) => <strong>{row.action}</strong> },
              { key: "warehouse", label: "Ombor", render: (row) => warehousesById[row.warehouseId]?.name || row.warehouseId },
              { key: "product", label: "Mahsulot", render: (row) => productsById[row.productId]?.name || row.productId },
              { key: "oldValue", label: "Old" },
              { key: "newValue", label: "New" },
              { key: "reason", label: "Reason" },
              { key: "approval", label: "Approval" },
              { key: "ip", label: "IP" },
            ]}
          />
        )}
      </section>
    </div>
  );
};

export default WarehouseAdmin;
