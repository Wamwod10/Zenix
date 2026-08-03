import { AlertTriangle } from "lucide-react";

import SettingsSectionCard from "../../components/SettingsSectionCard/SettingsSectionCard";
import useSettingsPermissions from "../../hooks/useSettingsPermissions";
import {
  AiAdvancedList,
  ApiPage,
  AuditPage,
  BackupPage,
  CollectionTable,
  CurrenciesPage,
  IntegrationsPage,
  NotificationsPage,
  ObjectForm,
  PermissionPage,
  RolesPage,
  SecurityPage,
} from "./SettingsDetailPage.sections";
import { nextCode, nextLogin, optionSets } from "./SettingsDetailPage.constants";

import "./SettingsDetailPage.scss";

const SettingsDetailPage = ({ pageId, controller, meta, isNotFound = false }) => {
  const permission = useSettingsPermissions(controller.role, pageId);

  if (isNotFound) {
    return (
      <SettingsSectionCard eyebrow="Topilmadi" title="Sozlama sahifasi topilmadi" description="URL manzilini tekshiring yoki sozlamalar bosh sahifasiga qayting.">
        <div className="settings-detail__denied">
          <AlertTriangle size={22} />
          <strong>Bunday sozlama route'i mavjud emas.</strong>
          <a className="settings-detail__button" href="/settings">Sozlamalarga qaytish</a>
        </div>
      </SettingsSectionCard>
    );
  }

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

  if (pageId === "security") return <SecurityPage controller={controller} meta={meta} />;

  if (["company", "business", "localization", "branding", "documents", "labels", "billing", "monitoring"].includes(pageId)) {
    return <ObjectForm pageId={pageId} controller={controller} title={meta.title} description={meta.description} />;
  }

  if (pageId === "branches") {
    return <CollectionTable pageId={pageId} collection="branches" title={meta.title} description={meta.description} controller={controller} fields={[["manager", "Menejer"], ["warehouseMapping", "Warehouse mapping"], ["cashRegister", "Cash register"], ["posDevices", "POS devices"], ["barcodePrefix", "Barcode prefix"], ["qrPrefix", "QR prefix"], ["receiptPrinter", "Receipt printer"], ["fiscalPrinter", "Fiscal printer"], ["gps", "GPS"], ["googleMapsUrl", "Google Maps"], ["workingDays", "Working days"], ["holidays", "Holidays"], ["timezone", "Timezone", "text", optionSets.timezone], ["currency", "Currency", "text", optionSets.baseCurrency], ["analyticsPreview", "Analytics preview"], ["deviceList", "Device list"], ["status", "Status", "text", optionSets.status]]} createLabel={() => ({ name: "Yangi filial", code: nextCode(controller.state.branches, "BR"), phone: "+998 90 000 00 00", email: "branch@zenix.uz", region: "Toshkent", city: "Toshkent", country: "UZ", manager: "Menejer", warehouseMapping: "", cashRegister: "", posDevices: "", barcodePrefix: "230", qrPrefix: "NEW", receiptPrinter: "", fiscalPrinter: "", gps: "disabled", googleMapsUrl: "", workingDays: "Mon-Fri", holidays: "", timezone: "Asia/Tashkent", currency: "UZS", analyticsPreview: "Yangi filial", deviceList: "", warehouses: 0, employees: 0, workingHours: "09:00 - 18:00" })} />;
  }

  if (pageId === "warehouses") {
    return <CollectionTable pageId={pageId} collection="warehouses" title={meta.title} description={meta.description} controller={controller} fields={[["warehouseType", "Warehouse type"], ["branch", "Filial"], ["responsible", "Mas'ul"], ["zones", "Zones"], ["bins", "Bins"], ["shelves", "Shelves"], ["barcode", "Barcode"], ["qr", "QR"], ["pickingStrategy", "Picking strategy"], ["putawayStrategy", "Putaway strategy"], ["receivingGate", "Receiving gate"], ["shippingGate", "Shipping gate"], ["capacity", "Capacity"], ["temperature", "Temperature"], ["humidity", "Humidity"], ["autoReservation", "Auto reservation", "boolean"], ["autoReorder", "Auto reorder", "boolean"], ["lotTracking", "Lot tracking", "boolean"], ["serialTracking", "Serial tracking", "boolean"], ["expiryRules", "Expiry rules"], ["minStock", "Minimal zaxira", "number"], ["maxStock", "Maksimal zaxira", "number"]]} createLabel={() => ({ name: "Yangi ombor", code: nextCode(controller.state.warehouses, "WH"), type: "Filial ombori", warehouseType: "Branch Warehouse", branch: "", responsible: "", contact: "", zones: "A", bins: "A-01", shelves: "S1", barcode: "", qr: "", pickingStrategy: "FIFO", putawayStrategy: "Open bin", receivingGate: "", shippingGate: "", capacity: "", temperature: "ambient", humidity: "normal", defaultWarehouse: false, negativeStock: false, autoReservation: false, autoReserve: false, autoReorder: false, lotTracking: false, serialTracking: false, expiryRules: "", minStock: 0, maxStock: 1, inventoryRule: "", transferRule: "", notifications: false })} />;
  }

  if (pageId === "users") {
    return <CollectionTable pageId={pageId} collection="users" title={meta.title} description={meta.description} controller={controller} fields={[["email", "Email", "email"], ["emailVerified", "Email verified", "boolean"], ["phone", "Phone"], ["phoneVerified", "Phone verified", "boolean"], ["telegram", "Telegram"], ["role", "Rol", "text", optionSets.role], ["allowedBranches", "Allowed branches"], ["allowedWarehouses", "Allowed warehouses"], ["allowedPOS", "Allowed POS"], ["shift", "Shift"], ["language", "Language", "text", optionSets.language], ["theme", "Theme", "text", optionSets.theme], ["lastLogin", "Last login"], ["loginHistory", "Login history"], ["activeSessions", "Active sessions", "number"], ["deviceList", "Device list"], ["ipAddress", "IP address"], ["browser", "Browser"], ["country", "Country"], ["twoFactor", "2FA", "boolean"], ["status", "Status", "text", ["active", "invited", "blocked", "archived"]]]} createLabel={() => ({ name: "Yangi foydalanuvchi", login: nextLogin(controller.state.users), avatar: "YU", email: "user@zenix.uz", emailVerified: false, phone: "+998 90 000 00 00", phoneVerified: false, telegram: "", role: "viewer", branch: "", warehouse: "", allowedBranches: "", allowedWarehouses: "", allowedPOS: "", shift: "", language: "uz", theme: "system", lastLogin: "Hali kirmagan", loginHistory: "0 successful", activeSessions: 0, deviceList: "", ipAddress: "", browser: "", country: "UZ", twoFactor: false, device: "" })} />;
  }

  if (pageId === "roles") return <RolesPage controller={controller} />;
  if (pageId === "permissions") return <PermissionPage controller={controller} />;

  if (pageId === "currencies") return <CurrenciesPage controller={controller} meta={meta} />;

  if (pageId === "taxes") {
    return <CollectionTable pageId={pageId} collection="taxes" title={meta.title} description={meta.description} controller={controller} fields={[["rate", "Foiz", "number"], ["type", "Turi", "text", optionSets.taxType], ["group", "Tax Group"], ["fiscalRule", "Fiscal Rule"], ["region", "Regional Tax"], ["inclusive", "Inclusive", "boolean"], ["exclusive", "Exclusive", "boolean"], ["autoCalculation", "Auto Calculation", "boolean"], ["active", "Faol", "boolean"]]} createLabel={() => ({ name: "Yangi soliq", rate: 0, type: "VAT", group: "custom", fiscalRule: "configurable", region: "UZ", inclusive: false, exclusive: true, autoCalculation: true, active: true })} />;
  }

  if (pageId === "payments") {
    return <CollectionTable pageId={pageId} collection="payments" title={meta.title} description={meta.description} controller={controller} fields={[["type", "Turi", "text", optionSets.paymentType], ["status", "Status", "text", optionSets.status], ["fee", "Komissiya", "number"], ["refundRules", "Refund rules"], ["cashback", "Cashback", "number"], ["bonus", "Bonus", "number"], ["fiscalReceipt", "Fiscal receipt", "boolean"], ["branchAvailability", "Branch availability"], ["posAvailability", "POS availability"], ["active", "Faol", "boolean"]]} createLabel={() => ({ name: "Yangi to'lov usuli", type: "online", status: "pending", fee: 0, refundRules: "manual approval", cashback: 0, bonus: 0, fiscalReceipt: true, branchAvailability: "all", posAvailability: "all", active: true })} />;
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

