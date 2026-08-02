import { AlertTriangle } from "lucide-react";

import SettingsSectionCard from "../../components/SettingsSectionCard/SettingsSectionCard";
import useSettingsPermissions from "../../hooks/useSettingsPermissions";
import {
  AiAdvancedList,
  ApiPage,
  AuditPage,
  BackupPage,
  CollectionTable,
  FinanceExtras,
  IntegrationsPage,
  NotificationsPage,
  ObjectForm,
  PermissionPage,
  RolesPage,
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

  if (["company", "business", "localization", "appearance", "documents", "security"].includes(pageId)) {
    return <ObjectForm pageId={pageId} controller={controller} title={meta.title} description={meta.description} />;
  }

  if (pageId === "branches") {
    return <CollectionTable pageId={pageId} collection="branches" title={meta.title} description={meta.description} controller={controller} fields={[["phone", "Telefon"], ["manager", "Menejer"], ["workingHours", "Ish vaqti"], ["status", "Status", "text", optionSets.status]]} createLabel={() => ({ name: "Yangi filial", code: nextCode(controller.state.branches, "BR"), phone: "+998 90 000 00 00", email: "branch@zenix.uz", region: "Toshkent", city: "Toshkent", country: "UZ", manager: "Menejer", warehouses: 0, employees: 0, workingHours: "09:00 - 18:00", currency: "UZS" })} />;
  }

  if (pageId === "warehouses") {
    return <CollectionTable pageId={pageId} collection="warehouses" title={meta.title} description={meta.description} controller={controller} fields={[["type", "Turi"], ["branch", "Filial"], ["responsible", "Mas'ul"], ["minStock", "Minimal zaxira", "number"], ["maxStock", "Maksimal zaxira", "number"]]} createLabel={() => ({ name: "Yangi ombor", code: nextCode(controller.state.warehouses, "WH"), type: "Filial ombori", branch: "", responsible: "", contact: "", defaultWarehouse: false, negativeStock: false, autoReserve: false, minStock: 0, maxStock: 0, inventoryRule: "", transferRule: "", notifications: false })} />;
  }

  if (pageId === "users") {
    return <CollectionTable pageId={pageId} collection="users" title={meta.title} description={meta.description} controller={controller} fields={[["role", "Rol", "text", optionSets.role], ["branch", "Filial"], ["warehouse", "Ombor"], ["status", "Status", "text", ["active", "invited", "blocked", "archived"]], ["device", "Qurilma"]]} createLabel={() => ({ name: "Yangi foydalanuvchi", login: nextLogin(controller.state.users), role: "viewer", branch: "", warehouse: "", lastLogin: "Hali kirmagan", device: "" })} />;
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
    return <CollectionTable pageId={pageId} collection="taxes" title={meta.title} description={meta.description} controller={controller} fields={[["rate", "Foiz", "number"], ["type", "Turi", "text", optionSets.taxType], ["active", "Faol", "boolean"]]} createLabel={() => ({ name: "Yangi soliq", rate: 0, type: "VAT", active: true })} />;
  }

  if (pageId === "payments") {
    return <CollectionTable pageId={pageId} collection="payments" title={meta.title} description={meta.description} controller={controller} fields={[["type", "Turi", "text", optionSets.paymentType], ["fee", "Komissiya", "number"], ["active", "Faol", "boolean"]]} createLabel={() => ({ name: "Yangi to'lov usuli", type: "online", fee: 0, active: true })} />;
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

