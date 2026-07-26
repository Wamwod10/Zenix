import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import SettingsHeader from "../components/SettingsHeader/SettingsHeader";
import SettingsModal from "../components/SettingsModal/SettingsModal";
import SettingsNavigation from "../components/SettingsNavigation/SettingsNavigation";
import { settingsGroups, settingsPageMeta } from "../data/settingsNavigation";
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
  const pageId = segmentToPage[segment] || "home";
  const controller = useSettingsController(pageId);
  const meta = settingsPageMeta[pageId] || settingsPageMeta.home;
  const { touchRecent } = controller.actions;

  useEffect(() => {
    touchRecent(pageId);
  }, [pageId, touchRecent]);

  const isFavorite = controller.favorites.includes(pageId);
  const modalType = controller.activeModal;

  const header = useMemo(
    () => (
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
        onSave={() => controller.actions.showToast("Explicit save simulation bajarildi.")}
        onImport={() => controller.actions.setActiveModal("import")}
        onShare={() => controller.actions.setActiveModal("share")}
      />
    ),
    [controller, isFavorite, meta, pageId],
  );

  return (
    <main className="zenix-settings">
      {header}

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
            <SettingsDetailPage pageId={pageId} controller={controller} meta={meta} />
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
          onClose={() => controller.actions.setActiveModal(null)}
          onConfirm={(reason) => {
            if (modalType === "restore") {
              controller.actions.restoreBackup(reason);
              return;
            }
            controller.actions.showToast(`${modalType} simulation yakunlandi.`);
            controller.actions.setActiveModal(null);
          }}
        />
      )}
    </main>
  );
};

export default Settings;
