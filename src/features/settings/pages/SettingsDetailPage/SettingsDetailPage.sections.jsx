import { useState } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Copy,
  DatabaseBackup,
  Download,
  EyeOff,
  FileText,
  KeyRound,
  LockKeyhole,
  PlugZap,
  Plus,
  RotateCw,
  Send,
  ShieldAlert,
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
    ["lightLogo", "Light logo"],
    ["darkLogo", "Dark logo"],
    ["printLogo", "Print logo"],
    ["favicon", "Favicon"],
    ["watermark", "Watermark"],
    ["companyColor", "Kompaniya rangi"],
    ["companyTheme", "Kompaniya theme", "text", optionSets.theme],
    ["companyQr", "Kompaniya QR"],
    ["companyBarcode", "Kompaniya barcode"],
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
    ["googleMapsUrl", "Google Maps"],
    ["latitude", "Latitude", "number"],
    ["longitude", "Longitude", "number"],
    ["address", "Manzil", "textarea"],
    ["bankName", "Bank nomi"],
    ["bankAccount", "Bank hisob raqami"],
    ["director", "Direktor"],
    ["accountant", "Bosh buxgalter"],
    ["signature", "Elektron imzo"],
    ["workingCalendar", "Ish kalendari"],
    ["holidayCalendar", "Bayram kalendari"],
    ["workingHours", "Ish vaqti"],
    ["holidays", "Dam olish kunlari"],
    ["socialLinks", "Social links", "textarea"],
    ["contacts", "Multiple contacts", "textarea"],
    ["documents", "Kompaniya hujjatlari", "textarea"],
    ["branding", "Brending", "textarea"],
    ["stirAutoFillProvider", "STIR auto-fill adapter"],
  ],
  business: [
    ["operatingModel", "Ish modeli"],
    ["defaultBranch", "Asosiy filial"],
    ["fiscalCountry", "Fiskal mamlakat", "text", optionSets.fiscalCountry],
    ["inventoryValuation", "Zaxirani baholash", "text", ["FIFO", "LIFO", "Weighted average"]],
    ["costingMethod", "Costing method", "text", ["FIFO", "LIFO", "Weighted average", "Specific identification"]],
    ["approvalWorkflow", "Approval Workflow"],
    ["approvalFlow", "Tasdiqlash oqimi"],
    ["skuGenerator", "SKU Generator"],
    ["productCodeGenerator", "Product Code Generator"],
    ["supplierCodeGenerator", "Supplier Code Generator"],
    ["customerCodeGenerator", "Customer Code Generator"],
    ["reservationPolicy", "Reservation Policy"],
    ["draftPolicy", "Draft Policy"],
    ["fiscalRules", "Fiscal Rules", "textarea"],
  ],
  localization: [
    ["language", "Til", "text", optionSets.language],
    ["country", "Mamlakat", "text", optionSets.country],
    ["timezone", "Vaqt zonasi", "text", optionSets.timezone],
    ["dateFormat", "Sana formati", "text", optionSets.dateFormat],
    ["timeFormat", "Vaqt formati", "text", optionSets.timeFormat],
    ["weekStart", "Hafta boshlanishi", "text", optionSets.weekStart],
    ["weekendDays", "Dam olish kunlari"],
    ["measurementUnits", "Measurement units", "text", optionSets.measurementUnits],
    ["weightUnits", "Weight units", "text", optionSets.weightUnits],
    ["lengthUnits", "Length units", "text", optionSets.lengthUnits],
    ["decimalPrecision", "Decimal precision", "number"],
    ["currencyPrecision", "Currency precision", "number"],
    ["thousandsSeparator", "Thousands separator", "text", optionSets.thousandsSeparator],
    ["numberFormat", "Raqam formati"],
    ["currencyFormat", "Valyuta formati", "text", optionSets.currencyFormat],
  ],
  branding: [
    ["theme", "Theme", "text", optionSets.theme],
    ["sidebar", "Sidebar", "text", optionSets.sidebarSize],
    ["loginPage", "Login Page"],
    ["emailBranding", "Email Branding"],
    ["receiptBranding", "Receipt Branding"],
    ["invoiceBranding", "Invoice Branding"],
    ["companyColors", "Company colors"],
    ["preview", "Preview"],
  ],
  currencies: [
    ["baseCurrency", "Asosiy valyuta", "text", optionSets.baseCurrency],
    ["provider", "Kurs provayderi"],
    ["updateTime", "Update vaqti"],
    ["rules", "Moliyaviy qoidalar", "textarea"],
  ],
  notifications: [
    ["template", "Shablon matni", "textarea"],
    ["htmlTemplate", "HTML Template", "textarea"],
    ["variables", "Variables"],
    ["events", "Events", "textarea"],
    ["channelFallback", "Channel fallback"],
  ],
  documents: [
    ["documentDesigner", "Document Designer"],
    ["receiptTemplate", "Chek shabloni"],
    ["invoiceTemplate", "Invoice shabloni"],
    ["livePreview", "Live Preview"],
    ["printer", "Printer"],
    ["defaultPrinter", "Default Printer"],
    ["paperSize", "Qog'oz", "text", ["Thermal 80mm", "A4", "A5"]],
    ["margins", "Margins"],
    ["fontSettings", "Font Settings"],
    ["multiplePrinters", "Multiple Printers"],
    ["barcodeDesigner", "Barcode Designer"],
    ["qrDesigner", "QR Designer"],
    ["numbering", "Raqamlash"],
    ["invoicePrefix", "Invoice Prefix"],
    ["purchasePrefix", "Purchase Prefix"],
    ["warehousePrefix", "Warehouse Prefix"],
    ["returnPrefix", "Return Prefix"],
    ["pdfExport", "PDF eksport"],
    ["emailTemplate", "Email hujjat shabloni"],
  ],
  labels: [
    ["labelDesigner", "Label Designer"],
    ["barcodeDesigner", "Barcode Designer"],
    ["qrDesigner", "QR Designer"],
    ["scannerSettings", "Scanner Settings"],
    ["printerSettings", "Printer Settings"],
  ],
  security: [
    ["minPasswordLength", "Minimal parol uzunligi", "number"],
    ["passwordComplexity", "Password complexity"],
    ["passwordExpiration", "Password expiration", "number"],
    ["sessionMinutes", "Sessiya muddati", "number"],
    ["loginLimit", "Kirish urinishlari limiti", "number"],
    ["activeSessions", "Active sessions", "number"],
    ["loginHistory", "Login history"],
    ["trustedDevices", "Ishonchli qurilmalar", "number"],
    ["trustedBrowsers", "Trusted browsers"],
    ["countryRestriction", "Country restriction"],
    ["accountLock", "Account lock"],
    ["ipWhitelist", "IP oq ro'yxati"],
  ],
  ai: [
    ["provider", "Provider", "text", optionSets.aiProvider],
    ["model", "Model", "text", optionSets.aiModel],
    ["models", "Models"],
    ["dailyLimit", "Kunlik limit", "number"],
    ["tokenLimit", "Token limit", "number"],
    ["promptLibrary", "Prompt Library"],
    ["prompt", "Prompt boshqaruvi", "textarea"],
    ["knowledgeBase", "Knowledge Base", "textarea"],
    ["companyDocuments", "Company Documents"],
    ["aiRoles", "AI Roles"],
    ["automationRules", "Automation Rules", "textarea"],
    ["tokenUsage", "Token Usage", "number"],
    ["costAnalytics", "Cost Analytics"],
    ["promptLogs", "Prompt Logs"],
    ["responseLogs", "Response Logs"],
    ["latency", "Latency"],
    ["costLimitUsd", "USD xarajat limiti", "number"],
    ["securityMode", "AI xavfsizlik rejimi"],
  ],
  monitoring: [
    ["cpu", "CPU", "number"],
    ["ram", "RAM", "number"],
    ["database", "Database"],
    ["redis", "Redis"],
    ["api", "API"],
    ["queue", "Queue"],
    ["workers", "Workers", "number"],
    ["disk", "Disk", "number"],
    ["storage", "Storage", "number"],
    ["uptime", "Uptime"],
    ["latency", "Latency"],
    ["errorCount", "Error count", "number"],
    ["history", "History", "textarea"],
  ],
  advanced: [
    ["systemHealth", "Tizim holati", "number"],
    ["storageUsage", "Storage bandligi", "number"],
    ["cacheSizeMb", "Cache hajmi MB", "number"],
    ["backgroundJobs", "Fon joblari", "number"],
    ["scheduledTasks", "Rejalangan vazifalar", "number"],
    ["redis", "Redis"],
    ["cache", "Cache"],
    ["queue", "Queue"],
    ["smtp", "SMTP"],
    ["cdn", "CDN"],
    ["storage", "Storage"],
    ["environment", "Environment"],
    ["cronJobs", "Cron Jobs"],
    ["healthCheck", "Health Check"],
    ["license", "Litsenziya"],
    ["diagnostics", "Diagnostika"],
    ["performance", "Ishlash holati"],
  ],
  backup: [
    ["schedule", "Avtomatik jadval"],
    ["provider", "Saqlash provayderi"],
    ["retentionDays", "Saqlash muddati", "number"],
    ["lastStatus", "Oxirgi status"],
    ["providers", "Storage providerlar"],
    ["backupType", "Backup turi", "text", optionSets.backupType],
    ["retention", "Retention"],
    ["notification", "Notification"],
    ["verification", "Backup Verification"],
  ],
  billing: [
    ["subscription", "Subscription"],
    ["plan", "Plan"],
    ["invoices", "Invoices"],
    ["payments", "Payments"],
    ["usage", "Usage"],
    ["upgrade", "Upgrade"],
    ["downgrade", "Downgrade"],
    ["renew", "Renew"],
    ["planHistory", "Plan History", "textarea"],
    ["limits", "Limits", "textarea"],
    ["upcomingPayment", "Upcoming payment"],
  ],
};

const boolFields = {
  company: [["gpsEnabled", "GPS yoqilgan"]],
  business: [["autoNumbering", "Auto Numbering"], ["negativeStock", "Negative Stock"], ["multiBranch", "Multi Branch"], ["multiWarehouse", "Multi Warehouse"], ["offlineMode", "Offline Mode"], ["realtimeSave", "Real-time saqlash"], ["strictValidation", "Qattiq validatsiya"], ["shareSettings", "Ulashish"]],
  localization: [["rtlSupport", "RTL support"], ["reducedMotion", "Kam animatsiya"], ["highContrast", "Yuqori kontrast"]],
  branding: [["darkMode", "Dark Mode"]],
  currencies: [["automaticRates", "Kurslarni avtomatik yangilash"], ["lockWeekendRates", "Dam olish kurslarini lock qilish"]],
  documents: [["dragDropDesigner", "Drag & Drop Designer"], ["pdfDesigner", "PDF Designer"], ["receiptDesigner", "Receipt Designer"], ["invoiceDesigner", "Invoice Designer"], ["labelDesigner", "Label Designer"], ["autoPrint", "Avtomatik chop etish"], ["barcodeLabels", "Barcode yorliqlari"], ["qrEnabled", "QR sozlamalari"], ["escpos", "ESC/POS"], ["zebra", "Zebra"], ["xprinter", "XPrinter"], ["shelfLabels", "Shelf Labels"], ["priceLabels", "Price Labels"], ["shippingLabels", "Shipping Labels"], ["productLabels", "Product Labels"], ["yearReset", "Year Reset"], ["monthReset", "Month Reset"], ["dayReset", "Day Reset"]],
  labels: [["shelfLabels", "Shelf Labels"], ["priceLabels", "Price Labels"], ["shippingLabels", "Shipping Labels"], ["productLabels", "Product Labels"], ["bulkPrint", "Bulk Print"]],
  backup: [["automatic", "Avtomatik backup"], ["daily", "Daily"], ["weekly", "Weekly"], ["monthly", "Monthly"], ["encryption", "Shifrlash"]],
  security: [["requireNumbers", "Raqam talab qilish"], ["requireSymbols", "Belgilar talab qilish"], ["twoFactor", "2FA"], ["geoLogin", "Geo login"], ["ipRestriction", "IP restriction"], ["suspiciousActivity", "Shubhali faollik"], ["emergencyLocked", "Favqulodda blok"]],
  ai: [["enabled", "AI yoqilgan"], ["automation", "Avtomatlashtirish"], ["memory", "Memory"], ["faq", "FAQ"], ["pdf", "PDF"], ["excel", "Excel"], ["website", "Website"], ["emergencyStop", "Emergency stop"]],
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
          {["lightLogo", "darkLogo", "printLogo", "favicon", "watermark", "seal"].map((key) => (
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
      {pageId === "localization" && <LocalizationPreview data={data} />}
      {pageId === "branding" && <BrandingPreview data={data} />}
      {pageId === "documents" && <DocumentPreview data={data} />}
      {pageId === "labels" && <LabelPreview data={data} />}
      {pageId === "monitoring" && <MonitoringPreview data={data} />}
    </SettingsSectionCard>
  );
};

const LocalizationPreview = ({ data }) => (
  <div className="settings-detail__preview" aria-label="Localization preview">
    <article>
      <strong>{data.dateFormat} | {data.timeFormat} | {data.timezone}</strong>
      <span>1 234 567.89 {"->"} {data.numberFormat}; aniqlik {data.decimalPrecision}/{data.currencyPrecision}; weekend {data.weekendDays}</span>
    </article>
  </div>
);

const BrandingPreview = ({ data }) => (
  <div className="settings-detail__preview settings-detail__preview--brand" aria-label="Branding preview">
    <article>
      <strong>{data.theme} theme</strong>
      <span>{data.sidebar} sidebar | {data.loginPage} | {data.companyColors}</span>
      <button type="button">Preview aktiv</button>
    </article>
  </div>
);

const DocumentPreview = ({ data }) => (
  <div className="settings-detail__preview settings-detail__preview--document" aria-label="Document live preview">
    <article>
      <strong>{data.invoicePrefix}-2026-00042</strong>
      <span>{data.paperSize} | {data.fontSettings} | {data.defaultPrinter}</span>
      <small>{data.watermark} watermark, {data.signature}, {data.stamp}</small>
    </article>
  </div>
);

const LabelPreview = ({ data }) => (
  <div className="settings-detail__preview settings-detail__preview--label" aria-label="Label live preview">
    <article>
      <strong>{data.labelDesigner}</strong>
      <span>{data.barcodeDesigner} | {data.qrDesigner} | {data.printerSettings}</span>
      <small>Queue: {data.printQueue?.length || 0}; History: {data.printHistory?.length || 0}</small>
    </article>
  </div>
);

const MonitoringPreview = ({ data }) => (
  <div className="settings-detail__preview settings-detail__preview--monitoring" aria-label="Monitoring preview">
    <article>
      <strong>{data.uptime} uptime | {data.latency} latency</strong>
      <span>CPU {data.cpu}% | RAM {data.ram}% | Disk {data.disk}% | Errors {data.errorCount}</span>
      <small>{data.history}</small>
    </article>
  </div>
);

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
      {!visibleRows.length && (
        <div className="settings-detail__empty">
          <ShieldAlert size={22} />
          <strong>Filter bo'yicha yozuv topilmadi</strong>
          <span>Qidiruv yoki status filteri juda tor bo'lishi mumkin.</span>
          <div className="settings-detail__empty-actions">
            <button type="button" onClick={() => { setQuery(""); setStatus("all"); setPage(1); }}>Filterni tozalash</button>
            <button type="button" className="is-primary" disabled={!canEdit} onClick={() => controller.actions.createCollectionItem(collection, createLabel(), `${collection} created`)}>
              <Plus size={15} />
              Yaratish
            </button>
            <a href="/settings/audit">Auditni ko'rish</a>
          </div>
        </div>
      )}
      <div className="settings-detail__pagination">
        <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Oldingi</button>
        <span>{page} / {totalPages}</span>
        <button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>Keyingi</button>
      </div>
    </SettingsSectionCard>
  );
};

export const CurrenciesPage = ({ controller, meta }) => (
  <>
    <ObjectForm pageId="currencies" controller={controller} title={meta.title} description={meta.description} />
    <SettingsSectionCard eyebrow="Valyuta kurslari" title="UZS, USD, EUR, RUB, KZT, TRY, CNY" description="Invalid rate yoki date UI'ni yiqitmaydi; xatolar field validatsiya orqali ko'rsatiladi.">
      <div className="settings-detail__currency-table">
        {controller.state.currencies.rates.map((rate) => (
          <article key={rate.id}>
            <strong>{rate.code}</strong>
            <SettingsField
              label="Buy Rate"
              type="number"
              value={Number.isFinite(Number(rate.buyRate)) ? rate.buyRate : ""}
              onChange={(value) =>
                controller.actions.updatePageObject("currencies", {
                  rates: controller.state.currencies.rates.map((item) =>
                    item.id === rate.id ? { ...item, buyRate: Math.max(0, Number(value) || 0), averageRate: Math.max(0, Number(value) || 0) } : item,
                  ),
                }, { action: "currency buy rate updated" })
              }
            />
            <SettingsField
              label="Sell Rate"
              type="number"
              value={Number.isFinite(Number(rate.sellRate)) ? rate.sellRate : ""}
              onChange={(value) =>
                controller.actions.updatePageObject("currencies", {
                  rates: controller.state.currencies.rates.map((item) =>
                    item.id === rate.id ? { ...item, sellRate: Math.max(0, Number(value) || 0) } : item,
                  ),
                }, { action: "currency sell rate updated" })
              }
            />
            <span>Avg {rate.averageRate}</span>
            <span>{rate.forecast}</span>
            <SettingsToggle
              label="Auto Update"
              checked={Boolean(rate.autoUpdate)}
              onChange={(value) =>
                controller.actions.updatePageObject("currencies", {
                  rates: controller.state.currencies.rates.map((item) =>
                    item.id === rate.id ? { ...item, autoUpdate: value } : item,
                  ),
                })
              }
            />
            <SettingsToggle
              label="Lock Rate"
              checked={Boolean(rate.locked)}
              onChange={(value) =>
                controller.actions.updatePageObject("currencies", {
                  rates: controller.state.currencies.rates.map((item) =>
                    item.id === rate.id ? { ...item, locked: value } : item,
                  ),
                })
              }
            />
          </article>
        ))}
      </div>
    </SettingsSectionCard>
  </>
);

export const NotificationsPage = ({ controller }) => (
  <>
    <SettingsSectionCard eyebrow="Kanallar" title="Bildirishnoma kanallari" description="Email, SMS, Telegram, WhatsApp, Slack va Push kanallari event fallback bilan boshqariladi.">
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
            <small>Fallback: {channel.fallback}</small>
            <button type="button" onClick={() => controller.actions.showToast(`${channel.name} test xabari yuborildi.`)}><Send size={15} /> Test Send</button>
          </article>
        ))}
      </div>
    </SettingsSectionCard>
    <ObjectForm pageId="notifications" controller={controller} title="Shablon tahriri" description="Dinamik o'zgaruvchilar: {{user}}, {{event}}, {{company}}." />
    <SettingsSectionCard eyebrow="Event matrix" title="Event-channel matrix">
      <div className="settings-detail__matrix-list">
        {["New Order", "Purchase", "Payment", "Debt", "Low Stock", "Backup Failed", "API Error", "AI Limit", "User Login", "Password Changed"].map((eventName) => (
          <article key={eventName}>
            <strong>{eventName}</strong>
            <span>{controller.state.notifications.channels.filter((channel) => channel.events.includes(eventName)).map((channel) => channel.name).join(", ") || "Fallback orqali"}</span>
          </article>
        ))}
      </div>
      <div className="settings-detail__preview" aria-label="Notification preview">
        <article>
          <strong>Preview</strong>
          <span>{controller.state.notifications.template.replace("{{user}}", "Madina").replace("{{event}}", "Low Stock").replace("{{company}}", controller.state.company.companyName)}</span>
        </article>
      </div>
    </SettingsSectionCard>
  </>
);

export const IntegrationsPage = ({ controller }) => {
  const [selected, setSelected] = useState(null);
  const selectedIntegration = controller.state.integrations.find((item) => item.id === selected);

  return (
    <>
      <SettingsSectionCard eyebrow="Monitoring" title="Integratsiya kartalari" description="Har bir ulanish status, retry, reconnect, logs, webhook va API test oqimi bilan nazorat qilinadi.">
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
              <small>{item.statistics} | {item.syncHistory}</small>
              {item.errorDetails && <small>{item.errorDetails}</small>}
              <div className="settings-detail__actions">
                <button type="button" onClick={() => setSelected(item.id)}>Configuration</button>
                <button type="button" disabled={item.status === "checking"} onClick={() => controller.actions.toggleIntegration(item.id)}>
                  {item.status === "checking" ? "Tekshirilmoqda" : item.status === "error" ? "Retry" : "API Test"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    controller.actions.updateCollectionItem("integrations", item.id, {
                      status: item.status === "paused" ? "disconnected" : "paused",
                    }, "integration pause toggled")
                  }
                >
                  {item.status === "paused" ? "Enable" : "Disable"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </SettingsSectionCard>
      {selectedIntegration && (
        <SettingsSectionCard eyebrow="Configuration" title={`${selectedIntegration.name} konfiguratsiyasi`} description="Serverga real ulanish o'rniga monitoring adapter state'i yangilanadi.">
          <div className="settings-detail__form-grid">
            <SettingsField label="Webhook" value={selectedIntegration.webhook || ""} onChange={(value) => controller.actions.updateCollectionItem("integrations", selectedIntegration.id, { webhook: value }, "integration webhook updated")} />
            <SettingsField label="Configuration" value={selectedIntegration.configuration || ""} onChange={(value) => controller.actions.updateCollectionItem("integrations", selectedIntegration.id, { configuration: value }, "integration config updated")} />
            <SettingsField label="Logs" value={selectedIntegration.logs || ""} onChange={(value) => controller.actions.updateCollectionItem("integrations", selectedIntegration.id, { logs: value }, "integration logs noted")} />
          </div>
          <div className="settings-detail__actions">
            <button type="button" onClick={() => controller.actions.toggleIntegration(selectedIntegration.id)}><RotateCw size={15} /> Reconnect</button>
            <button type="button" onClick={() => setSelected(null)}>Yopish</button>
          </div>
        </SettingsSectionCard>
      )}
    </>
  );
};

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
                  rateLimit: "600/min",
                  allowedIp: "",
                  expireDate: "2026-12-31",
                  permissions: "read",
                  lastUsed: "never",
                  createdBy: controller.role,
                  logs: "0 requests",
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
            <span>{(key.scopes || []).join(", ") || key.permissions}</span>
            <span>{key.rateLimit}</span>
            <span>{key.allowedIp || "IP ochiq"}</span>
            <span>{key.lastUsed}</span>
            <SettingsToggle
              label="Faol"
              checked={key.active}
              onChange={(value) =>
                controller.actions.updatePageObject("api", {
                  keys: controller.state.api.keys.map((item) => item.id === key.id ? { ...item, active: value } : item),
                })
              }
            />
            <button
              type="button"
              aria-label={`${key.name} secret copy`}
              onClick={async () => {
                await navigator.clipboard?.writeText(key.secret);
                controller.actions.showToast("Secret clipboardga nusxalandi.");
              }}
            >
              <Copy size={15} /> Copy
            </button>
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
              <RotateCw size={15} /> Rotate
            </button>
            <button
              type="button"
              onClick={() => {
                const payload = JSON.stringify({ id: key.id, name: key.name, scopes: key.scopes, permissions: key.permissions, rateLimit: key.rateLimit, allowedIp: key.allowedIp, expireDate: key.expireDate }, null, 2);
                const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
                const link = document.createElement("a");
                link.href = url;
                link.download = `${key.id}.json`;
                link.click();
                URL.revokeObjectURL(url);
                controller.actions.addAudit({ action: "api json download", newValue: key.id, reason: "API key metadata export" });
              }}
            >
              <Download size={15} /> JSON
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
            <span>{hook.status} | {hook.lastDelivery}</span>
            <button type="button" onClick={() => controller.actions.showToast(`${hook.url} test delivery yuborildi.`)}><Send size={15} /> Test Send</button>
          </article>
        ))}
      </div>
      <div className="settings-detail__usage">
        <article><strong>{controller.state.api.usage?.requestsToday || 0}</strong><span>API Usage today</span></article>
        <article><strong>{controller.state.api.usage?.errorRate || 0}%</strong><span>Error rate</span></article>
        <article><strong>{controller.state.api.usage?.averageLatency || 0}ms</strong><span>Average latency</span></article>
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
  <>
    <SettingsSectionCard
      eyebrow="Rol shablonlari"
      title="Rollar"
      description="Built-in va custom rollar permission count, clone, compare, import/export va version history bilan boshqariladi."
      action={
        <button
          type="button"
          className="settings-detail__button is-primary"
          onClick={() =>
            controller.actions.createCollectionItem("roles", {
              name: uniqueRoleName(controller.state.roles, "Yangi rol"),
              type: "custom",
              users: 0,
              category: "Custom",
              permissionCount: 0,
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
            <span>{role.type} | {role.category || "Standard"} | {role.users} user | {role.permissionCount || 28} permissions</span>
            <div className="settings-detail__actions">
              <button
                type="button"
                onClick={() =>
                  controller.actions.createCollectionItem("roles", {
                    name: uniqueRoleName(controller.state.roles, role.name),
                    type: "custom",
                    users: 0,
                    category: role.category || "Cloned",
                    permissionCount: role.permissionCount || 28,
                    description: role.description,
                  }, "rol duplicate qilindi")
                }
              >
                Duplicate
              </button>
              <button type="button" onClick={() => controller.actions.showToast(`${role.name} compare preview ochildi.`)}>Compare</button>
              <button type="button" onClick={() => controller.actions.showToast(`${role.name} export tayyorlandi.`)}>Export</button>
              {role.type === "custom" && (
                <button type="button" className="settings-detail__button is-danger" onClick={() => controller.actions.deleteCollectionItem("roles", role.id, "rol arxivlandi")}>
                  Arxivlash
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </SettingsSectionCard>
    <SettingsSectionCard eyebrow="Role Tree" title="Role Tree va Version History">
      <div className="settings-detail__tree">
        {controller.state.roles.map((role) => (
          <article key={`tree-${role.id}`}>
            <LockKeyhole size={16} />
            <strong>{role.name}</strong>
            <span>{role.type === "standard" ? "Built-in Role" : "Custom Role"}</span>
            <small>{controller.state.versions.find((version) => version.pageId === "roles")?.label || "Version history hali toza"}</small>
          </article>
        ))}
      </div>
      <div className="settings-detail__actions">
        <button type="button" onClick={() => controller.actions.setActiveModal("import")}>Import</button>
        <button type="button" onClick={() => controller.actions.setActiveModal("export")}>Export</button>
      </div>
    </SettingsSectionCard>
  </>
);

const ShieldIcon = () => <CheckCircle2 size={18} />;

export const PermissionPage = ({ controller }) => (
  <SettingsSectionCard eyebrow="Dinamik ruxsatlar" title="Ruxsatlar matritsasi" description="Ruxsat, blok, yashirish va tasdiq talab qilish holatlari audit logga aniq eski/yangi qiymat bilan yoziladi.">
    <PermissionMatrix matrix={controller.state.permissions} onToggle={controller.actions.cyclePermission} />
  </SettingsSectionCard>
);

export const SecurityPage = ({ controller, meta }) => (
  <>
    <ObjectForm pageId="security" controller={controller} title={meta.title} description={meta.description} />
    <SettingsSectionCard eyebrow="Real checks" title={`Security Score: ${controller.metrics.securityScore}%`}>
      <div className="settings-detail__security-checks">
        {[
          ["2FA", controller.state.security.twoFactor, "Barcha owner/adminlarda 2FA yoqilsin."],
          ["Password length", controller.state.security.minPasswordLength >= 12, "Minimal uzunlik 12+ bo'lishi kerak."],
          ["Password expiration", Boolean(controller.state.security.passwordExpiration), "Parollar rotation siyosati bilan himoyalansin."],
          ["Encrypted backup", controller.state.backup.encryption, "Backup shifrlangan holda saqlansin."],
          ["IP restriction", controller.state.security.ipRestriction, "Admin access IP/Country kesimida cheklansin."],
        ].map(([label, passed, recommendation]) => (
          <article key={label} className={passed ? "is-pass" : "is-risk"}>
            {passed ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />}
            <strong>{label}</strong>
            <span>{passed ? "OK" : "Risk"}</span>
            <small>{recommendation}</small>
          </article>
        ))}
      </div>
    </SettingsSectionCard>
    <SettingsSectionCard eyebrow="Sessions" title="Login history va active sessions">
      <div className="settings-detail__table">
        {controller.state.users.map((user) => (
          <article key={`session-${user.id}`}>
            <div><strong>{user.name}</strong><small>{user.loginHistory}</small></div>
            <span>{user.activeSessions} sessions</span>
            <span>{user.deviceList}</span>
            <span>{user.ipAddress}</span>
            <span>{user.browser}</span>
            <button
              type="button"
              onClick={() =>
                controller.actions.updateCollectionItem("users", user.id, { activeSessions: 0, deviceList: "revoked" }, "user sessions revoked")
              }
            >
              Revoke session
            </button>
          </article>
        ))}
      </div>
    </SettingsSectionCard>
    <DangerZone controller={controller} />
  </>
);

const DangerZone = ({ controller }) => {
  const [reason, setReason] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const canRun = reason.trim().length >= 8 && confirmation === "ZENIX";
  const runDangerAction = (action, patch) => {
    if (!canRun) {
      controller.actions.showToast("Danger action uchun sabab va ZENIX tasdig'i kerak.");
      return;
    }
    controller.actions.updatePageObject("security", patch, { action, reason });
    setReason("");
    setConfirmation("");
  };

  return (
    <SettingsSectionCard eyebrow="Danger Zone" title="Xavfli system amallar" className="settings-detail__danger">
      <div className="settings-detail__form-grid">
        <SettingsField label="Reason" value={reason} onChange={setReason} placeholder="Kamida 8 belgi" />
        <SettingsField label="Confirmation" value={confirmation} onChange={setConfirmation} placeholder="ZENIX" />
      </div>
      <div className="settings-detail__actions">
        <button type="button" className="is-danger" disabled={!canRun} onClick={() => runDangerAction("emergency stop toggled", { emergencyLocked: !controller.state.security.emergencyLocked })}>Emergency Stop</button>
        <button type="button" className="is-danger" disabled={!canRun} onClick={() => runDangerAction("api revoked from danger zone", { ipWhitelist: "" })}>Revoke API</button>
        <button type="button" className="is-danger" disabled={!canRun} onClick={() => controller.actions.updatePageObject("ai", { emergencyStop: true }, { action: "ai reset from danger zone", reason })}>Reset AI</button>
        <button type="button" className="is-danger" disabled={!canRun} onClick={() => { controller.actions.resetState(); controller.actions.showToast("Settings reset qilindi."); }}>Reset Settings</button>
      </div>
    </SettingsSectionCard>
  );
};

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

