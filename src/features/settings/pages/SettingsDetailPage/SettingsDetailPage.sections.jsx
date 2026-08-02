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
import { optionSets, statusLabels } from "./SettingsDetailPage.constants";

const textFields = {
  company: [
    ["companyName", "Kompaniya nomi"],
    ["shortName", "Qisqa nom"],
    ["description", "Tavsif", "textarea"],
    ["businessType", "Biznes turi", "text", optionSets.businessType],
    ["stir", "STIR"],
    ["inn", "INN"],
    ["mfo", "MFO"],
    ["oked", "OKED"],
    ["vatNumber", "QQS raqami"],
    ["registrationDate", "Ro'yxatdan o'tgan sana", "date"],
    ["legalType", "Yuridik shakl", "text", optionSets.legalType],
    ["status", "Kompaniya statusi", "text", optionSets.status],
    ["phone", "Telefon"],
    ["email", "Email", "email"],
    ["website", "Veb-sayt"],
    ["telegram", "Telegram"],
    ["instagram", "Instagram"],
    ["address", "Manzil", "textarea"],
    ["bankName", "Bank nomi"],
    ["bankAccount", "Bank hisob raqami"],
    ["director", "Direktor"],
    ["accountant", "Bosh buxgalter"],
    ["signature", "Elektron imzo"],
    ["workingHours", "Ish vaqti"],
    ["holidays", "Dam olish kunlari"],
    ["documents", "Kompaniya hujjatlari", "textarea"],
    ["branding", "Brending", "textarea"],
  ],
  business: [
    ["operatingModel", "Ish modeli"],
    ["defaultBranch", "Asosiy filial"],
    ["fiscalCountry", "Fiskal mamlakat", "text", optionSets.fiscalCountry],
    ["inventoryValuation", "Zaxirani baholash", "text", ["FIFO", "LIFO", "Weighted average"]],
    ["approvalFlow", "Tasdiqlash oqimi"],
  ],
  localization: [
    ["language", "Til", "text", optionSets.language],
    ["country", "Mamlakat", "text", optionSets.country],
    ["timezone", "Vaqt zonasi", "text", optionSets.timezone],
    ["dateFormat", "Sana formati", "text", optionSets.dateFormat],
    ["timeFormat", "Vaqt formati", "text", optionSets.timeFormat],
    ["numberFormat", "Raqam formati"],
    ["currencyFormat", "Valyuta formati", "text", optionSets.currencyFormat],
  ],
  appearance: [
    ["theme", "Theme", "text", optionSets.theme],
    ["accentColor", "Accent rangi", "text", optionSets.accentColor],
    ["sidebarSize", "Sidebar o'lchami", "text", optionSets.sidebarSize],
    ["density", "Zichlik", "text", optionSets.density],
    ["cardRadius", "Burchak radiusi", "number"],
    ["transparency", "Shaffoflik", "number"],
    ["blur", "Blur", "number"],
    ["fontSize", "Shrift o'lchami", "number"],
    ["animationSpeed", "Animatsiya tezligi", "number"],
  ],
  finance: [
    ["baseCurrency", "Asosiy valyuta", "text", optionSets.baseCurrency],
    ["rules", "Moliyaviy qoidalar", "textarea"],
  ],
  notifications: [
    ["template", "Shablon matni", "textarea"],
  ],
  documents: [
    ["receiptTemplate", "Chek shabloni"],
    ["invoiceTemplate", "Invoice shabloni"],
    ["printer", "Printer"],
    ["numbering", "Raqamlash"],
    ["pdfExport", "PDF eksport"],
    ["emailTemplate", "Email hujjat shabloni"],
  ],
  security: [
    ["minPasswordLength", "Minimal parol uzunligi", "number"],
    ["sessionMinutes", "Sessiya muddati", "number"],
    ["loginLimit", "Kirish urinishlari limiti", "number"],
    ["trustedDevices", "Ishonchli qurilmalar", "number"],
    ["ipWhitelist", "IP oq ro'yxati"],
  ],
  ai: [
    ["dailyLimit", "Kunlik limit", "number"],
    ["prompt", "Prompt boshqaruvi", "textarea"],
    ["costLimitUsd", "USD xarajat limiti", "number"],
    ["securityMode", "AI xavfsizlik rejimi"],
  ],
  advanced: [
    ["systemHealth", "Tizim holati", "number"],
    ["storageUsage", "Storage bandligi", "number"],
    ["cacheSizeMb", "Cache hajmi MB", "number"],
    ["backgroundJobs", "Fon joblari", "number"],
    ["scheduledTasks", "Rejalangan vazifalar", "number"],
    ["license", "Litsenziya"],
    ["diagnostics", "Diagnostika"],
    ["performance", "Ishlash holati"],
  ],
  backup: [
    ["schedule", "Avtomatik jadval"],
    ["provider", "Saqlash provayderi"],
    ["retentionDays", "Saqlash muddati", "number"],
    ["lastStatus", "Oxirgi status"],
  ],
};

const boolFields = {
  business: [["realtimeSave", "Real-time saqlash"], ["strictValidation", "Qattiq validatsiya"], ["shareSettings", "Ulashish"]],
  localization: [["reducedMotion", "Kam animatsiya"], ["highContrast", "Yuqori kontrast"]],
  appearance: [["glassEffect", "Glass effekti"]],
  finance: [["automaticRates", "Kurslarni avtomatik yangilash"]],
  documents: [["autoPrint", "Avtomatik chop etish"], ["barcodeLabels", "Barcode yorliqlari"], ["qrEnabled", "QR sozlamalari"]],
  backup: [["automatic", "Avtomatik backup"], ["encryption", "Shifrlash"]],
  security: [["requireNumbers", "Raqam talab qilish"], ["requireSymbols", "Belgilar talab qilish"], ["twoFactor", "2FA"], ["suspiciousActivity", "Shubhali faollik"], ["emergencyLocked", "Favqulodda blok"]],
  ai: [["enabled", "AI yoqilgan"], ["automation", "Avtomatlashtirish"], ["emergencyStop", "Emergency stop"]],
  advanced: [["maintenanceMode", "Texnik xizmat rejimi"]],
};

export const ObjectForm = ({ pageId, controller, title, description }) => {
  const data = controller.state[pageId];
  const canEdit = useSettingsPermissions(controller.role, pageId).canEdit;
  const update = (key, value) => controller.actions.updatePageObject(pageId, { [key]: value });

  const uploadPreview = (key, file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      controller.actions.showToast("Faqat rasm faylini yuklash mumkin.");
      return;
    }
    if (file.size > 1024 * 1024) {
      controller.actions.showToast("Fayl hajmi 1 MB dan oshmasligi kerak.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      if (image.width < 64 || image.height < 64) {
        URL.revokeObjectURL(previewUrl);
        controller.actions.showToast("Rasm o'lchami kamida 64x64 bo'lishi kerak.");
        return;
      }
      update(key, {
        name: file.name,
        size: file.size,
        type: file.type,
        width: image.width,
        height: image.height,
        previewUrl,
      });
    };
    image.src = previewUrl;
  };

  return (
    <SettingsSectionCard eyebrow="Form" title={title} description={description}>
      {pageId === "company" && (
        <div className="settings-detail__uploads">
          {["logo", "favicon", "seal"].map((key) => (
            <label key={key}>
              <span>{key}</span>
              {data[key]?.previewUrl ? <img src={data[key].previewUrl} alt={`${key} preview`} /> : <i>Preview</i>}
              <input type="file" accept="image/*" disabled={!canEdit} onChange={(event) => uploadPreview(key, event.target.files?.[0])} />
            </label>
          ))}
        </div>
      )}
      <div className="settings-detail__form-grid">
        {(textFields[pageId] || []).map(([key, label, type = "text", options]) => (
          <SettingsField
            key={key}
            id={`settings-${pageId}-${key}`}
            label={label}
            type={type}
            options={options}
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
          <article
            style={{
              "--settings-preview-radius": `${data.cardRadius}px`,
              "--settings-preview-alpha": `${Math.max(20, Number(data.transparency) || 0) / 100}`,
              "--settings-preview-blur": `${data.blur}px`,
            }}
          >
            <strong>Ko'rinish previewi</strong>
            <span>{data.theme} theme - {data.density} zichlik - {data.transparency}% shaffoflik</span>
            <button type="button" onClick={() => controller.actions.showToast("Ko'rinish previewi vaqtincha qo'llandi.")}>Qo'llash</button>
          </article>
        </div>
      )}
    </SettingsSectionCard>
  );
};

export const CollectionTable = ({ pageId, collection, title, description, fields, controller, createLabel }) => {
  const rows = controller.state[collection];
  const canEdit = useSettingsPermissions(controller.role, pageId).canEdit;
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sortKey, setSortKey] = useState("name");
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const filteredRows = rows
    .filter((row) => status === "all" || row.status === status || String(row.active) === status)
    .filter((row) => JSON.stringify(row).toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => String(a[sortKey] || "").localeCompare(String(b[sortKey] || "")));
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const visibleRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <SettingsSectionCard
      eyebrow="Ma'lumotlar"
      title={title}
      description={description}
      action={
        <button
          type="button"
          className="settings-detail__button is-primary"
          disabled={!canEdit}
          onClick={() => controller.actions.createCollectionItem(collection, createLabel(), `${collection} created`)}
        >
          <Plus size={15} />
          Yaratish
        </button>
      }
    >
      <div className="settings-detail__table-controls">
        <SettingsField
          id={`settings-${collection}-search`}
          label="Qidiruv"
          value={query}
          onChange={(value) => {
            setQuery(value);
            setPage(1);
          }}
        />
        <SettingsField
          id={`settings-${collection}-status`}
          label="Status"
          value={status}
          options={[{ value: "all", label: "Barchasi" }, { value: "active", label: "Faol" }, { value: "pending", label: "Kutilmoqda" }, { value: "archived", label: "Arxivlangan" }, { value: "false", label: "O'chirilgan" }]}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />
        <SettingsField
          id={`settings-${collection}-sort`}
          label="Saralash"
          value={sortKey}
          options={[{ value: "name", label: "Nom" }, { value: "code", label: "Kod" }, { value: "status", label: "Status" }, { value: "login", label: "Login" }]}
          onChange={setSortKey}
        />
      </div>
      <div className="settings-detail__table">
        {visibleRows.map((row) => (
          <article key={row.id}>
            <div>
              <strong>{row.name || row.login || row.code}</strong>
              <small>{row.code || row.type || row.role || statusLabels[row.status] || row.status}</small>
            </div>
            {fields.map(([key, label, type = "text", options]) =>
              type === "boolean" ? (
                <SettingsToggle
                  key={key}
                  label={label}
                  checked={Boolean(row[key])}
                  disabled={!canEdit}
                  onChange={(value) => controller.actions.updateCollectionItem(collection, row.id, { [key]: value }, `${collection} changed`)}
                />
              ) : (
                <SettingsField
                  key={key}
                  id={`settings-${collection}-${row.id}-${key}`}
                  label={label}
                  type={type}
                  options={options}
                  value={row[key] ?? ""}
                  disabled={!canEdit}
                  error={controller.errors[`${row.id}.${key}`]}
                  onChange={(value) => controller.actions.updateCollectionItem(collection, row.id, { [key]: value }, `${collection} changed`)}
                />
              ),
            )}
            {["branches", "warehouses", "users", "taxes", "payments"].includes(collection) && (
              <button
                type="button"
                className="settings-detail__icon-button"
                aria-label="Arxivlash"
                disabled={!canEdit || row.status === "archived"}
                onClick={() => controller.actions.deleteCollectionItem(collection, row.id, `${collection} deleted`)}
              >
                <Trash2 size={16} />
              </button>
            )}
          </article>
        ))}
      </div>
      {!visibleRows.length && <div className="settings-detail__empty">Yozuv topilmadi. Qidiruv yoki filterlarni tozalang.</div>}
      <div className="settings-detail__pagination">
        <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Oldingi</button>
        <span>{page} / {totalPages}</span>
        <button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>Keyingi</button>
      </div>
    </SettingsSectionCard>
  );
};

export const FinanceExtras = ({ controller }) => (
  <SettingsSectionCard eyebrow="Valyuta kurslari" title="Valyutalar">
    <div className="settings-detail__mini-grid">
      {controller.state.finance.rates.map((rate) => (
        <article key={rate.id}>
          <strong>{rate.code}</strong>
          <SettingsField
            label="Kurs"
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
          <small>{rate.source} - {rate.active ? "faol" : "bloklangan"}</small>
        </article>
      ))}
    </div>
  </SettingsSectionCard>
);

export const NotificationsPage = ({ controller }) => (
  <>
    <SettingsSectionCard eyebrow="Kanallar" title="Bildirishnoma kanallari">
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
    <ObjectForm pageId="notifications" controller={controller} title="Shablon tahriri" description="Dinamik o'zgaruvchilar: {{user}}, {{event}}, {{company}}." />
  </>
);

export const IntegrationsPage = ({ controller }) => (
  <SettingsSectionCard eyebrow="Monitoring" title="Integratsiya kartalari" description="Har bir ulanish status, retry, test rejimi va sync holati bilan nazorat qilinadi.">
    <div className="settings-detail__integration-grid">
      {controller.state.integrations.map((item) => (
        <article className={`is-${item.status}`} key={item.id}>
          <div>
            <PlugZap size={18} />
            <strong>{item.name}</strong>
            <span>{item.type} - {item.mode}</span>
          </div>
          <meter value={item.health} max="100" />
          <small>{statusLabels[item.status] || item.status} - oxirgi sync {item.lastSync}</small>
          {item.lastError && <small>{item.lastError}</small>}
          <button type="button" disabled={item.status === "checking"} onClick={() => controller.actions.toggleIntegration(item.id)}>
            {item.status === "checking" ? "Tekshirilmoqda" : item.status === "error" ? "Qayta urinish" : "Ulanishni tekshirish"}
          </button>
        </article>
      ))}
    </div>
  </SettingsSectionCard>
);

export const ApiPage = ({ controller }) => (
  <>
    <SettingsSectionCard
      eyebrow="Secretlar"
      title="API keylar"
      action={
        <button
          type="button"
          className="settings-detail__button is-primary"
          onClick={() =>
            controller.actions.updatePageObject("api", {
              keys: [
                {
                  id: `key-${Date.now().toString(36)}`,
                  name: "Yangi API key",
                  secret: `zx_live_****${Date.now().toString(36).slice(-4)}`,
                  scopes: ["settings"],
                  createdAt: new Date().toISOString().slice(0, 10),
                  active: true,
                },
                ...controller.state.api.keys,
              ],
            }, { action: "api key yaratildi" })
          }
        >
          Yaratish
        </button>
      }
    >
      <div className="settings-detail__table">
        {controller.state.api.keys.map((key) => (
          <article key={key.id}>
            <KeyRound size={18} />
            <div><strong>{key.name}</strong><small><EyeOff size={13} /> {key.secret}</small></div>
            <span>{key.scopes.join(", ")}</span>
            <SettingsToggle
              label="Faol"
              checked={key.active}
              onChange={(value) =>
                controller.actions.updatePageObject("api", {
                  keys: controller.state.api.keys.map((item) => item.id === key.id ? { ...item, active: value } : item),
                })
              }
            />
            <button type="button" onClick={() => navigator.clipboard?.writeText(key.secret)}>Copy</button>
            <button
              type="button"
              onClick={() =>
                controller.actions.updatePageObject("api", {
                  keys: controller.state.api.keys.map((item) =>
                    item.id === key.id
                      ? { ...item, secret: `${item.secret.slice(0, 8)}****${Date.now().toString(36).slice(-4)}` }
                      : item,
                  ),
                }, { action: "api key rotate qilindi" })
              }
            >
              Rotate
            </button>
            <button
              type="button"
              className="settings-detail__button is-danger"
              onClick={() =>
                controller.actions.updatePageObject("api", {
                  keys: controller.state.api.keys.map((item) =>
                    item.id === key.id ? { ...item, active: false, status: "revoked" } : item,
                  ),
                }, { action: "api key bekor qilindi" })
              }
            >
              Revoke
            </button>
          </article>
        ))}
      </div>
    </SettingsSectionCard>
    <SettingsSectionCard eyebrow="Yetkazish" title="Webhooklar">
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

export const BackupPage = ({ controller }) => (
  <>
    <ObjectForm pageId="backup" controller={controller} title="Backup siyosati" description="Avtomatik jadval, saqlash muddati, shifrlash va provider sozlamalari." />
    <SettingsSectionCard
      eyebrow="Ehtiyot zonasi"
      title="Backup tarixi"
      action={<button type="button" className="settings-detail__button is-primary" onClick={controller.actions.runBackup}><DatabaseBackup size={15} /> Backup yaratish</button>}
    >
      {controller.progress && <div className="settings-detail__progress"><span>{controller.progress.label}</span><meter value={controller.progress.value} max="100" /></div>}
      <div className="settings-detail__table">
        {controller.state.backup.history.map((backup) => (
          <article key={backup.id}>
            <CheckCircle2 size={17} />
            <div><strong>{backup.version}</strong><small>{formatSettingDateTime(backup.createdAt)}</small></div>
            <span>{backup.type}</span>
            <span>{backup.sizeGb} GB</span>
            <button
              type="button"
              className="settings-detail__button is-danger"
              onClick={() => {
                controller.actions.setSelectedBackup(backup);
                controller.actions.setActiveModal("restore");
              }}
            >
              Tiklash
            </button>
          </article>
        ))}
      </div>
    </SettingsSectionCard>
  </>
);

export const AuditPage = ({ controller }) => {
  const [query, setQuery] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const users = [...new Set(controller.state.auditLog.map((item) => item.user))];
  const rows = controller.state.auditLog
    .filter((item) => userFilter === "all" || item.user === userFilter)
    .filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const visibleRows = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <SettingsSectionCard eyebrow="Audit-ready" title="Audit jurnali" description="Har bir hodisada user, rol, vaqt, qurilma, IP, filial, eski qiymat, yangi qiymat va sabab saqlanadi.">
      <div className="settings-detail__table-controls">
        <SettingsField id="settings-audit-search" label="Qidiruv" value={query} onChange={(value) => { setQuery(value); setPage(1); }} />
        <SettingsField id="settings-audit-user" label="User" value={userFilter} options={[{ value: "all", label: "Barchasi" }, ...users.map((user) => ({ value: user, label: user }))]} onChange={(value) => { setUserFilter(value); setPage(1); }} />
        <button type="button" className="settings-detail__button" onClick={() => controller.actions.showToast("Audit eksport fayli tayyorlandi.")}>Eksport</button>
      </div>
      <div className="settings-detail__audit">
        {visibleRows.map((item) => (
          <article key={item.id}>
            <FileText size={16} />
            <div>
              <strong>{item.action}</strong>
              <small>{item.user} ({item.role || "role yo'q"}) - {formatSettingDateTime(item.time)} - {item.ip} - {item.branch}</small>
            </div>
            <span>{item.oldValue}</span>
            <span>{item.newValue}</span>
            <em>{item.reason}</em>
          </article>
        ))}
      </div>
      {!visibleRows.length && <div className="settings-detail__empty">Audit yozuvi topilmadi.</div>}
      <div className="settings-detail__pagination">
        <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Oldingi</button>
        <span>{page} / {totalPages}</span>
        <button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>Keyingi</button>
      </div>
    </SettingsSectionCard>
  );
};

const uniqueRoleName = (roles, baseName) => {
  const used = new Set(roles.map((role) => role.name));
  let index = 1;
  let name = `${baseName} nusxasi`;
  while (used.has(name)) {
    index += 1;
    name = `${baseName} nusxasi ${index}`;
  }
  return name;
};

export const RolesPage = ({ controller }) => (
  <SettingsSectionCard
    eyebrow="Rol shablonlari"
    title="Rollar"
    action={
      <button
        type="button"
        className="settings-detail__button is-primary"
        onClick={() =>
          controller.actions.createCollectionItem("roles", {
            name: uniqueRoleName(controller.state.roles, "Yangi rol"),
            type: "custom",
            users: 0,
            description: "Custom rol uchun boshlang'ich shablon.",
          }, "rol yaratildi")
        }
      >
        <Plus size={15} />
        Rol yaratish
      </button>
    }
  >
    <div className="settings-detail__role-grid">
      {controller.state.roles.map((role) => (
        <article key={role.id}>
          <ShieldIcon />
          <strong>{role.name}</strong>
          <small>{role.description}</small>
          <span>{role.type} - {role.users} faol foydalanuvchi</span>
          <button
            type="button"
            onClick={() =>
              controller.actions.createCollectionItem("roles", {
                name: uniqueRoleName(controller.state.roles, role.name),
                type: "custom",
                users: 0,
                description: role.description,
              }, "rol duplicate qilindi")
            }
          >
            Duplicate
          </button>
          {role.type === "custom" && (
            <button type="button" className="settings-detail__button is-danger" onClick={() => controller.actions.deleteCollectionItem("roles", role.id, "rol arxivlandi")}>
              Arxivlash
            </button>
          )}
        </article>
      ))}
    </div>
  </SettingsSectionCard>
);

const ShieldIcon = () => <CheckCircle2 size={18} />;

export const PermissionPage = ({ controller }) => (
  <SettingsSectionCard eyebrow="Dinamik ruxsatlar" title="Ruxsatlar matritsasi" description="Ruxsat, blok, yashirish va tasdiq talab qilish holatlari audit logga aniq eski/yangi qiymat bilan yoziladi.">
    <PermissionMatrix matrix={controller.state.permissions} onToggle={controller.actions.cyclePermission} />
  </SettingsSectionCard>
);

export const AiAdvancedList = ({ pageId, controller }) => (
  <>
    <ObjectForm pageId={pageId} controller={controller} title={pageId === "ai" ? "AI boshqaruvi" : "Tizim boshqaruvi"} description="Limitlar, emergency stop, monitoring va feature flag holatlari yagona state orqali boshqariladi." />
    <SettingsSectionCard eyebrow={pageId === "ai" ? "Manbalar" : "Tizim"} title={pageId === "ai" ? "Knowledge va faollik" : "Feature flaglar va joblar"}>
      <div className="settings-detail__mini-grid">
        {(pageId === "ai" ? controller.state.ai.knowledgeSources : controller.state.advanced.featureFlags).map((item) => (
          <article key={item}>
            {pageId === "ai" ? <Bot size={17} /> : <AlertTriangle size={17} />}
            <strong>{item}</strong>
            <small>Tanlangan, ruxsat bilan himoyalangan va auditga tayyor.</small>
          </article>
        ))}
      </div>
    </SettingsSectionCard>
  </>
);

