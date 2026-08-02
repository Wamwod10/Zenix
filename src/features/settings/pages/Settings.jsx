import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import SettingsHeader from "../components/SettingsHeader/SettingsHeader";
import SettingsModal from "../components/SettingsModal/SettingsModal";
import SettingsNavigation from "../components/SettingsNavigation/SettingsNavigation";
import { settingsGroups, settingsPageMeta, settingsRouteIds } from "../data/settingsNavigation";
import { settingsRoles } from "../data/settingsPermissions";
import useSettingsController from "../hooks/useSettingsController";
import SettingsDetailPage from "./SettingsDetailPage/SettingsDetailPage";
import SettingsHome from "./SettingsHome/SettingsHome";

import "./Settings.scss";

const segmentToPage = {
  "": "home",
  company: "company",
  business: "business",
  branches: "branches",
  warehouses: "warehouses",
  users: "users",
  roles: "roles",
  permissions: "permissions",
  finance: "finance",
  taxes: "taxes",
  payments: "payments",
  documents: "documents",
  notifications: "notifications",
  security: "security",
  integrations: "integrations",
  api: "api",
  backup: "backup",
  ai: "ai",
  appearance: "appearance",
  localization: "localization",
  advanced: "advanced",
  audit: "audit",
};

const Settings = () => {
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const segment = location.pathname.replace(/^\/settings\/?/, "").split("/")[0] || "";
  const matchedPageId = segmentToPage[segment];
  const pageId = matchedPageId || (segment ? "not-found" : "home");
  const validPageId = settingsRouteIds.includes(pageId) ? pageId : "home";
  const controller = useSettingsController(pageId);
  const meta = settingsPageMeta[pageId] || {
    eyebrow: "Topilmadi",
    title: "Sozlama topilmadi",
    description: "Bunday sozlama sahifasi mavjud emas.",
  };
  const { touchRecent } = controller.actions;

  useEffect(() => {
    if (settingsRouteIds.includes(pageId)) touchRecent(pageId);
  }, [pageId, touchRecent]);

  const isFavorite = controller.favorites.includes(pageId);
  const modalType = controller.activeModal;

  return (
    <main className="zenix-settings">
      <SettingsHeader
        meta={meta}
        role={controller.role}
        roles={settingsRoles}
        autosaveStatus={controller.autosaveStatus}
        isFavorite={isFavorite}
        search={controller.search}
        canUndo={controller.history.canUndo}
        canRedo={controller.history.canRedo}
        onRoleChange={controller.actions.setRole}
        onMenu={() => setMobileNavOpen(true)}
        onFavorite={() => controller.actions.toggleFavorite(pageId)}
        onUndo={controller.actions.undo}
        onRedo={controller.actions.redo}
        onSave={controller.actions.saveNow}
        onImport={() => controller.actions.setActiveModal("import")}
        onShare={() => controller.actions.setActiveModal("share")}
      />

      <div className="zenix-settings__workspace">
        <SettingsNavigation
          groups={settingsGroups}
          mobileOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />

        <section className="zenix-settings__content">
          {pageId === "home" ? (
            <SettingsHome controller={controller} />
          ) : (
            <SettingsDetailPage pageId={validPageId} isNotFound={pageId === "not-found"} controller={controller} meta={meta} />
          )}
        </section>
      </div>

      {controller.toast && (
        <div className="zenix-settings__toast" role="status">
          {controller.toast}
        </div>
      )}

      {modalType && (
        <SettingsModal
          type={modalType}
          backup={controller.selectedBackup}
          onClose={() => controller.actions.setActiveModal(null)}
          onConfirm={({ reason, fileMeta, shareEmail } = {}) => {
            if (modalType === "restore") {
              controller.actions.restoreBackup(reason);
              return;
            }
            const auditValue = fileMeta?.name || shareEmail || modalType;
            controller.actions.addAudit({
              action: modalType === "import" ? "import tasdiqlandi" : "ulashish tasdiqlandi",
              newValue: auditValue,
              reason: "Foydalanuvchi modal orqali tasdiqladi",
            });
            controller.actions.showToast(modalType === "import" ? "Import preview tasdiqlandi." : "Ulashish havolasi tayyorlandi.");
            controller.actions.setActiveModal(null);
          }}
        />
      )}
    </main>
  );
};

export default Settings;
