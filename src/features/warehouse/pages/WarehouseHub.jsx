import { ModuleHub, hydrateHubConfig, MODULE_HUB_PERMISSION_STATES } from "../../../shared/moduleHub";
import { warehouseHubConfig } from "../config/warehouseHubConfig";
import { getPermissionState } from "../utils/warehousePermissions";

const permissionStateMap = {
  enabled: MODULE_HUB_PERMISSION_STATES.enabled,
  disabled: MODULE_HUB_PERMISSION_STATES.disabled,
  hidden: MODULE_HUB_PERMISSION_STATES.hidden,
  approval: MODULE_HUB_PERMISSION_STATES.approvalRequired,
};

const WarehouseHub = ({ controller }) => {
  const resolvePermission = (permission) => {
    const permissionKey = typeof permission === "string" ? permission : permission?.key;
    const fallback = typeof permission === "object" ? permission.fallback : MODULE_HUB_PERMISSION_STATES.enabled;

    if (!permissionKey) {
      return { state: MODULE_HUB_PERMISSION_STATES.enabled };
    }

    const state = permissionStateMap[getPermissionState(controller.role, permissionKey)] || fallback;

    return {
      state,
      reason: "Bu ombor amali joriy rol uchun cheklangan.",
    };
  };

  return (
    <ModuleHub
      config={hydrateHubConfig(warehouseHubConfig)}
      permissions={resolvePermission}
    />
  );
};

export default WarehouseHub;
