import { ModuleHub, hydrateHubConfig, MODULE_HUB_PERMISSION_STATES } from "../../../shared/moduleHub";
import { settingsHubConfig } from "../data/settingsHubConfig";
import { canAccessSettingsPage } from "../utils/settingsPermissions";

const SettingsHub = ({ controller }) => {
  const resolvePermission = (permission) => {
    const pageId = typeof permission === "string" ? permission : permission?.key;

    if (canAccessSettingsPage(controller.role, pageId)) {
      return { state: MODULE_HUB_PERMISSION_STATES.enabled };
    }

    return {
      state:
        pageId === "advanced"
          ? MODULE_HUB_PERMISSION_STATES.hidden
          : MODULE_HUB_PERMISSION_STATES.disabled,
      reason: "Bu settings yo'nalishi joriy rol uchun cheklangan.",
    };
  };

  return <ModuleHub config={hydrateHubConfig(settingsHubConfig)} permissions={resolvePermission} />;
};

export default SettingsHub;
