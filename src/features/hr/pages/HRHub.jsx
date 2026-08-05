import { ModuleHub, hydrateHubConfig, MODULE_HUB_PERMISSION_STATES } from "../../../shared/moduleHub";
import { hrHubConfig } from "../config/hrHubConfig";
import { canHR } from "../utils/hrPermissions";

const HRHub = ({ controller }) => {
  const resolvePermission = (permissionKey) => ({
    state: canHR(controller.role, permissionKey)
      ? MODULE_HUB_PERMISSION_STATES.enabled
      : MODULE_HUB_PERMISSION_STATES.disabled,
    reason: "Bu HR yo'nalishi joriy rol uchun cheklangan.",
  });

  return <ModuleHub config={hydrateHubConfig(hrHubConfig)} permissions={resolvePermission} />;
};

export default HRHub;
