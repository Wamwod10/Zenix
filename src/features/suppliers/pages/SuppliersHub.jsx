import { ModuleHub, hydrateHubConfig, MODULE_HUB_PERMISSION_STATES } from "../../../shared/moduleHub";
import {
  hasSupplierPermission,
  supplierCurrentUser,
} from "../suppliersApi";
import { suppliersHubConfig } from "../config/suppliersHubConfig";

const SuppliersHub = () => {
  const resolvePermission = (permissionKey) => ({
    state: hasSupplierPermission(supplierCurrentUser.role, permissionKey)
      ? MODULE_HUB_PERMISSION_STATES.enabled
      : MODULE_HUB_PERMISSION_STATES.disabled,
    reason: "Bu supplier yo'nalishi joriy rol uchun cheklangan.",
  });

  return (
    <ModuleHub
      config={hydrateHubConfig(suppliersHubConfig)}
      permissions={resolvePermission}
    />
  );
};

export default SuppliersHub;
