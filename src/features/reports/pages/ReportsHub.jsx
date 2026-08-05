import { ModuleHub, hydrateHubConfig, MODULE_HUB_PERMISSION_STATES } from "../../../shared/moduleHub";
import { reportsHubConfig } from "../data/reportsHubConfig";

const ReportsHub = ({ controller }) => {
  const resolvePermission = (permissionKey) => {
    const mode = controller.permissions.mode(permissionKey);

    if (mode === "allowed") {
      return { state: MODULE_HUB_PERMISSION_STATES.enabled };
    }

    return {
      state: mode === "hidden" ? MODULE_HUB_PERMISSION_STATES.hidden : MODULE_HUB_PERMISSION_STATES.disabled,
      reason: "Bu report yo'nalishi joriy rol uchun cheklangan.",
    };
  };

  return <ModuleHub config={hydrateHubConfig(reportsHubConfig)} permissions={resolvePermission} />;
};

export default ReportsHub;
