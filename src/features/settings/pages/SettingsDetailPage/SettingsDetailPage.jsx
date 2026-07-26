import { useState } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  DatabaseBackup,
  EyeOff,
  FileText,
  KeyRound,
  PlugZap,
  Plus,
  Trash2,
} from "lucide-react";

import PermissionMatrix from "../../components/PermissionMatrix/PermissionMatrix";
import SettingsField from "../../components/SettingsField/SettingsField";
import SettingsSectionCard from "../../components/SettingsSectionCard/SettingsSectionCard";
import SettingsToggle from "../../components/SettingsToggle/SettingsToggle";
import useSettingsPermissions from "../../hooks/useSettingsPermissions";
import { formatSettingDateTime } from "../../utils/settingsFormatters";

import "./SettingsDetailPage.scss";

const textFields = {
  company: [
    ["companyName", "Company name"],
    ["shortName", "Short name"],
    ["description", "Description", "textarea"],
    ["businessType", "Business type"],
    ["stir", "STIR"],
    ["inn", "INN"],
    ["mfo", "MFO"],
    ["oked", "OKED"],
    ["vatNumber", "QQS number"],
    ["registrationDate", "Registration date", "date"],
    ["legalType", "Legal type"],
    ["status", "Company status"],
    ["phone", "Phone"],
    ["email", "Email", "email"],
    ["website", "Website"],
    ["telegram", "Telegram"],
    ["instagram", "Instagram"],
    ["address", "Address", "textarea"],
    ["bankName", "Bank name"],
    ["bankAccount", "Bank account"],
    ["director", "Director"],
    ["accountant", "Chief accountant"],
    ["signature", "Electronic signature"],
    ["workingHours", "Working hours"],
    ["holidays", "Holidays"],
    ["documents", "Company documents", "textarea"],
    ["branding", "Branding", "textarea"],
  ],
  business: [
    ["operatingModel", "Operating model"],
    ["defaultBranch", "Default branch"],
    ["fiscalCountry", "Fiscal country"],
    ["inventoryValuation", "Inventory valuation"],
    ["approvalFlow", "Approval flow"],
  ],
  localization: [
    ["language", "Language"],
    ["country", "Country"],
    ["timezone", "Timezone"],
    ["dateFormat", "Date format"],
    ["timeFormat", "Time format"],
    ["numberFormat", "Number format"],
    ["currencyFormat", "Currency format"],
  ],
  appearance: [
    ["theme", "Theme"],
    ["accentColor", "Accent color"],
    ["sidebarSize", "Sidebar size"],
    ["density", "Density"],
    ["cardRadius", "Card radius", "number"],
    ["transparency", "Transparency", "number"],
    ["blur", "Blur", "number"],
    ["fontSize", "Font size", "number"],
    ["animationSpeed", "Animation speed", "number"],
  ],
  finance: [
    ["baseCurrency", "Base currency"],
    ["rules", "Financial rules", "textarea"],
  ],
  notifications: [
    ["template", "Template editor", "textarea"],
  ],
  documents: [
    ["receiptTemplate", "Receipt template"],
    ["invoiceTemplate", "Invoice template"],
    ["printer", "Printer"],
    ["numbering", "Numbering"],
    ["pdfExport", "PDF export"],
    ["emailTemplate", "Email document template"],
  ],
  security: [
    ["minPasswordLength", "Min password length", "number"],
    ["sessionMinutes", "Session minutes", "number"],
    ["loginLimit", "Login limit", "number"],
    ["trustedDevices", "Trusted devices", "number"],
    ["ipWhitelist", "IP whitelist"],
  ],
  ai: [
    ["dailyLimit", "Daily usage limit", "number"],
    ["prompt", "Prompt management", "textarea"],
    ["costLimitUsd", "Cost limit USD", "number"],
    ["securityMode", "AI security mode"],
  ],
  advanced: [
    ["systemHealth", "System health", "number"],
    ["storageUsage", "Storage usage", "number"],
    ["cacheSizeMb", "Cache size MB", "number"],
    ["backgroundJobs", "Background jobs", "number"],
    ["scheduledTasks", "Scheduled tasks", "number"],
    ["license", "License"],
    ["diagnostics", "Diagnostics"],
    ["performance", "Performance"],
  ],
  backup: [
    ["schedule", "Automatic schedule"],
    ["provider", "Storage provider"],
    ["retentionDays", "Retention days", "number"],
    ["lastStatus", "Last status"],
  ],
};

const boolFields = {
  business: [["realtimeSave", "Real-time save"], ["strictValidation", "Strict validation"], ["shareSettings", "Sharing"]],
  localization: [["reducedMotion", "Reduced motion"], ["highContrast", "High contrast"]],
  appearance: [["glassEffect", "Glass effect"]],
  finance: [["automaticRates", "Automatic rate update"]],
  documents: [["autoPrint", "Auto print"], ["barcodeLabels", "Barcode labels"], ["qrEnabled", "QR settings"]],
  backup: [["automatic", "Automatic backup"], ["encryption", "Encryption"]],
  security: [["requireNumbers", "Require numbers"], ["requireSymbols", "Require symbols"], ["twoFactor", "2FA"], ["suspiciousActivity", "Suspicious activity"], ["emergencyLocked", "Emergency lock"]],
  ai: [["enabled", "AI enabled"], ["automation", "Automation"], ["emergencyStop", "Emergency stop"]],
  advanced: [["maintenanceMode", "Maintenance mode"]],
};

const ObjectForm = ({ pageId, controller, title, description }) => {
  const data = controller.state[pageId];
  const canEdit = useSettingsPermissions(controller.role, pageId).canEdit;
  const update = (key, value) => controller.actions.updatePageObject(pageId, { [key]: value });

  const uploadPreview = (key, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update(key, reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <SettingsSectionCard eyebrow="Form" title={title} description={description}>
      {pageId === "company" && (
        <div className="settings-detail__uploads">
          {["logo", "favicon", "seal"].map((key) => (
            <label key={key}>
              <span>{key}</span>
              {data[key] ? <img src={data[key]} alt={`${key} preview`} /> : <i>Preview</i>}
              <input type="file" accept="image/*" disabled={!canEdit} onChange={(event) => uploadPreview(key, event.target.files?.[0])} />
            </label>
          ))}
        </div>
      )}
      <div className="settings-detail__form-grid">
        {(textFields[pageId] || []).map(([key, label, type = "text"]) => (
          <SettingsField
            key={key}
            label={label}
            type={type}
            value={data[key] ?? ""}
            disabled={!canEdit}
            error={controller.errors[key]}
            onChange={(value) => update(key, value)}
          />
        ))}
      </div>
      <div className="settings-detail__toggle-grid">
        {(boolFields[pageId] || []).map(([key, label]) => (
          <SettingsToggle
            key={key}
            label={label}
            checked={Boolean(data[key])}
            disabled={!canEdit}
            onChange={(value) => update(key, value)}
          />
        ))}
      </div>
      {pageId === "appearance" && (
        <div className="settings-detail__preview" aria-label="Appearance preview">
          <article>
            <strong>Glass preview</strong>
            <span>{data.theme} theme - {data.density} density - {data.transparency}% transparency</span>
            <button type="button">Preview only</button>
          </article>
        </div>
      )}
    </SettingsSectionCard>
  );
};

const CollectionTable = ({ pageId, collection, title, description, fields, controller, createLabel }) => {
  const rows = controller.state[collection];

  return (
    <SettingsSectionCard
      eyebrow="Live data"
      title={title}
      description={description}
      action={
        <button
          type="button"
          className="settings-detail__button is-primary"
          onClick={() => controller.actions.createCollectionItem(collection, createLabel(), `${collection} created`)}
        >
          <Plus size={15} />
          Create
        </button>
      }
    >
      <div className="settings-detail__table">
        {rows.map((row) => (
          <article key={row.id}>
            <div>
              <strong>{row.name || row.login || row.code}</strong>
              <small>{row.code || row.type || row.role || row.status}</small>
            </div>
            {fields.map(([key, label, type = "text"]) =>
              type === "boolean" ? (
                <SettingsToggle
                  key={key}
                  label={label}
                  checked={Boolean(row[key])}
                  onChange={(value) => controller.actions.updateCollectionItem(collection, row.id, { [key]: value }, `${collection} changed`)}
                />
              ) : (
                <SettingsField
                  key={key}
                  label={label}
                  type={type}
                  value={row[key] ?? ""}
                  onChange={(value) => controller.actions.updateCollectionItem(collection, row.id, { [key]: value }, `${collection} changed`)}
                />
              ),
            )}
            {["taxes", "payments"].includes(collection) && (
              <button
                type="button"
                className="settings-detail__icon-button"
                aria-label="Delete"
                onClick={() => controller.actions.deleteCollectionItem(collection, row.id, `${collection} deleted`)}
              >
                <Trash2 size={16} />
              </button>
            )}
          </article>
        ))}
      </div>
    </SettingsSectionCard>
  );
};

const FinanceExtras = ({ controller }) => (
  <SettingsSectionCard eyebrow="Exchange rates" title="Currencies">
    <div className="settings-detail__mini-grid">
      {controller.state.finance.rates.map((rate) => (
        <article key={rate.id}>
          <strong>{rate.code}</strong>
          <SettingsField
            label="Rate"
            type="number"
            value={rate.rate}
            onChange={(value) =>
              controller.actions.updatePageObject("finance", {
                rates: controller.state.finance.rates.map((item) =>
                  item.id === rate.id ? { ...item, rate: Number(value) } : item,
                ),
              })
            }
          />
          <small>{rate.source} - {rate.active ? "active" : "disabled"}</small>
        </article>
      ))}
    </div>
  </SettingsSectionCard>
);

const NotificationsPage = ({ controller }) => (
  <>
    <SettingsSectionCard eyebrow="Channels" title="Notification channels">
      <div className="settings-detail__mini-grid">
        {controller.state.notifications.channels.map((channel) => (
          <article key={channel.id}>
            <SettingsToggle
              label={channel.name}
              description={channel.events.join(", ")}
              checked={channel.enabled}
              onChange={(value) =>
                controller.actions.updatePageObject("notifications", {
                  channels: controller.state.notifications.channels.map((item) =>
                    item.id === channel.id ? { ...item, enabled: value } : item,
                  ),
                })
              }
            />
          </article>
        ))}
      </div>
    </SettingsSectionCard>
    <ObjectForm pageId="notifications" controller={controller} title="Template editor" description="Dynamic variables: {{user}}, {{event}}, {{company}}. Test send simulation modal orqali ishlaydi." />
  </>
);

const IntegrationsPage = ({ controller }) => (
  <SettingsSectionCard eyebrow="Monitoring" title="Integration cards" description="Har bir karta connected, disconnected, checking, error, test/live mode va sync statusga ega.">
    <div className="settings-detail__integration-grid">
      {controller.state.integrations.map((item) => (
        <article className={`is-${item.status}`} key={item.id}>
          <div>
            <PlugZap size={18} />
            <strong>{item.name}</strong>
            <span>{item.type} - {item.mode}</span>
          </div>
          <meter value={item.health} max="100" />
          <small>{item.status} - last sync {item.lastSync}</small>
          <button type="button" onClick={() => controller.actions.toggleIntegration(item.id)}>
            Test connection
          </button>
        </article>
      ))}
    </div>
  </SettingsSectionCard>
);

const ApiPage = ({ controller }) => (
  <>
    <SettingsSectionCard eyebrow="Secrets" title="API keys">
      <div className="settings-detail__table">
        {controller.state.api.keys.map((key) => (
          <article key={key.id}>
            <KeyRound size={18} />
            <div><strong>{key.name}</strong><small><EyeOff size={13} /> {key.secret}</small></div>
            <span>{key.scopes.join(", ")}</span>
            <SettingsToggle
              label="Active"
              checked={key.active}
              onChange={(value) =>
                controller.actions.updatePageObject("api", {
                  keys: controller.state.api.keys.map((item) => item.id === key.id ? { ...item, active: value } : item),
                })
              }
            />
          </article>
        ))}
      </div>
    </SettingsSectionCard>
    <SettingsSectionCard eyebrow="Delivery" title="Webhooks">
      <div className="settings-detail__mini-grid">
        {controller.state.api.webhooks.map((hook) => (
          <article key={hook.id}>
            <strong>{hook.url}</strong>
            <small>{hook.events.join(", ")}</small>
            <span>{hook.status}</span>
          </article>
        ))}
      </div>
    </SettingsSectionCard>
  </>
);

const BackupPage = ({ controller }) => (
  <>
    <ObjectForm pageId="backup" controller={controller} title="Backup policy" description="Automatic schedule, retention, encryption va provider mock state." />
    <SettingsSectionCard
      eyebrow="Danger zone"
      title="Backup history"
      action={<button type="button" className="settings-detail__button is-primary" onClick={controller.actions.runBackup}><DatabaseBackup size={15} /> Manual backup</button>}
    >
      {controller.progress && <div className="settings-detail__progress"><span>{controller.progress.label}</span><meter value={controller.progress.value} max="100" /></div>}
      <div className="settings-detail__table">
        {controller.state.backup.history.map((backup) => (
          <article key={backup.id}>
            <CheckCircle2 size={17} />
            <div><strong>{backup.version}</strong><small>{formatSettingDateTime(backup.createdAt)}</small></div>
            <span>{backup.type}</span>
            <span>{backup.sizeGb} GB</span>
            <button type="button" className="settings-detail__button is-danger" onClick={() => controller.actions.setActiveModal("restore")}>Restore</button>
          </article>
        ))}
      </div>
    </SettingsSectionCard>
  </>
);

const AuditPage = ({ controller }) => (
  <SettingsSectionCard eyebrow="Audit-ready" title="Settings audit log" description="User, time, device, IP, branch, old value, new value va reason har eventda saqlanadi.">
    <div className="settings-detail__audit">
      {controller.state.auditLog.map((item) => (
        <article key={item.id}>
          <FileText size={16} />
          <div>
            <strong>{item.action}</strong>
            <small>{item.user} - {formatSettingDateTime(item.time)} - {item.ip} - {item.branch}</small>
          </div>
          <span>{item.oldValue}</span>
          <span>{item.newValue}</span>
          <em>{item.reason}</em>
        </article>
      ))}
    </div>
  </SettingsSectionCard>
);

const RolesPage = ({ controller }) => (
  <SettingsSectionCard eyebrow="Role templates" title="Roles">
    <div className="settings-detail__role-grid">
      {controller.state.roles.map((role) => (
        <article key={role.id}>
          <ShieldIcon />
          <strong>{role.name}</strong>
          <small>{role.description}</small>
          <span>{role.type} - {role.users} active users</span>
          <button
            type="button"
            onClick={() =>
              controller.actions.createCollectionItem("roles", {
                name: `${role.name} Copy`,
                type: "custom",
                users: 0,
                description: role.description,
              }, "role duplicated")
            }
          >
            Duplicate role
          </button>
        </article>
      ))}
    </div>
  </SettingsSectionCard>
);

const ShieldIcon = () => <CheckCircle2 size={18} />;

const PermissionPage = ({ controller }) => (
  <SettingsSectionCard eyebrow="Dynamic navigation mock" title="Permission matrix" description="Allowed, disabled, hidden va approval required holatlari audit logga yoziladi.">
    <PermissionMatrix matrix={controller.state.permissions} onToggle={controller.actions.cyclePermission} />
  </SettingsSectionCard>
);

const AiAdvancedList = ({ pageId, controller }) => (
  <>
    <ObjectForm pageId={pageId} controller={controller} title={pageId === "ai" ? "AI controls" : "System controls"} description="Backend boshqaruvi real emas, monitoring simulation va adapter tayyor." />
    <SettingsSectionCard eyebrow={pageId === "ai" ? "Sources" : "System"} title={pageId === "ai" ? "Knowledge and activity" : "Feature flags and jobs"}>
      <div className="settings-detail__mini-grid">
        {(pageId === "ai" ? controller.state.ai.knowledgeSources : controller.state.advanced.featureFlags).map((item) => (
          <article key={item}>
            {pageId === "ai" ? <Bot size={17} /> : <AlertTriangle size={17} />}
            <strong>{item}</strong>
            <small>Selected, permission-aware, audit-ready.</small>
          </article>
        ))}
      </div>
    </SettingsSectionCard>
  </>
);

const SettingsDetailPage = ({ pageId, controller, meta }) => {
  const permission = useSettingsPermissions(controller.role, pageId);

  if (!permission.canView) {
    return (
      <SettingsSectionCard eyebrow="Permission denied" title="Bu sahifa cheklangan">
        <div className="settings-detail__denied">
          <AlertTriangle size={22} />
          <strong>{controller.role} roli uchun {pageId} sahifasi hidden.</strong>
          <small>Role switch preview orqali Owner rolida tekshirishingiz mumkin.</small>
        </div>
      </SettingsSectionCard>
    );
  }

  if (["company", "business", "localization", "appearance", "documents", "security"].includes(pageId)) {
    return <ObjectForm pageId={pageId} controller={controller} title={meta.title} description={meta.description} />;
  }

  if (pageId === "branches") {
    return <CollectionTable pageId={pageId} collection="branches" title={meta.title} description={meta.description} controller={controller} fields={[["phone", "Phone"], ["manager", "Manager"], ["workingHours", "Working hours"], ["status", "Status"]]} createLabel={() => ({ name: "New Branch", code: "NEW", phone: "+998", email: "new@zenix.uz", region: "Toshkent", city: "Toshkent", country: "UZ", manager: "Manager", warehouses: 0, employees: 0, workingHours: "09:00 - 18:00", currency: "UZS" })} />;
  }

  if (pageId === "warehouses") {
    return <CollectionTable pageId={pageId} collection="warehouses" title={meta.title} description={meta.description} controller={controller} fields={[["type", "Type"], ["branch", "Branch"], ["responsible", "Responsible"], ["minStock", "Min stock", "number"], ["maxStock", "Max stock", "number"]]} createLabel={() => ({ name: "New Warehouse", code: "WH-NEW", type: "Filial ombori", branch: "Toshkent HQ", responsible: "Manager", contact: "+998", defaultWarehouse: false, negativeStock: false, autoReserve: true, minStock: 1, maxStock: 100, inventoryRule: "Weekly", transferRule: "Approval", notifications: true })} />;
  }

  if (pageId === "users") {
    return <CollectionTable pageId={pageId} collection="users" title={meta.title} description={meta.description} controller={controller} fields={[["role", "Role"], ["branch", "Branch"], ["warehouse", "Warehouse"], ["status", "Status"], ["device", "Device"]]} createLabel={() => ({ name: "New User", login: "new.user", role: "viewer", branch: "Toshkent HQ", warehouse: "All", lastLogin: "Never", device: "Invited" })} />;
  }

  if (pageId === "roles") return <RolesPage controller={controller} />;
  if (pageId === "permissions") return <PermissionPage controller={controller} />;

  if (pageId === "finance") {
    return (
      <>
        <ObjectForm pageId="finance" controller={controller} title={meta.title} description={meta.description} />
        <FinanceExtras controller={controller} />
      </>
    );
  }

  if (pageId === "taxes") {
    return <CollectionTable pageId={pageId} collection="taxes" title={meta.title} description={meta.description} controller={controller} fields={[["rate", "Rate", "number"], ["type", "Type"], ["active", "Active", "boolean"]]} createLabel={() => ({ name: "New tax", rate: 0, type: "VAT", active: true })} />;
  }

  if (pageId === "payments") {
    return <CollectionTable pageId={pageId} collection="payments" title={meta.title} description={meta.description} controller={controller} fields={[["type", "Type"], ["fee", "Fee", "number"], ["active", "Active", "boolean"]]} createLabel={() => ({ name: "New payment", type: "online", fee: 0, active: true })} />;
  }

  if (pageId === "notifications") return <NotificationsPage controller={controller} />;
  if (pageId === "integrations") return <IntegrationsPage controller={controller} />;
  if (pageId === "api") return <ApiPage controller={controller} />;
  if (pageId === "backup") return <BackupPage controller={controller} />;
  if (pageId === "ai" || pageId === "advanced") return <AiAdvancedList pageId={pageId} controller={controller} />;
  if (pageId === "audit") return <AuditPage controller={controller} />;

  return (
    <SettingsSectionCard eyebrow="Empty" title="Settings section">
      <div className="settings-detail__denied">Bu section uchun frontend shell tayyor.</div>
    </SettingsSectionCard>
  );
};

export default SettingsDetailPage;
