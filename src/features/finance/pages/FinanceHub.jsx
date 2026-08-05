import { ModuleHub, hydrateHubConfig, MODULE_HUB_PERMISSION_STATES } from "../../../shared/moduleHub";
import { financeHubConfig } from "../config/financeHubConfig";
import { canFinance } from "../utils/financePermissions";

const FinanceHub = ({ controller }) => {
  const resolvePermission = (permissionKey) => ({
    state: canFinance(controller.role, permissionKey)
      ? MODULE_HUB_PERMISSION_STATES.enabled
      : MODULE_HUB_PERMISSION_STATES.disabled,
    reason: "Bu moliya yo'nalishi joriy rol uchun cheklangan.",
  });

  return <ModuleHub config={hydrateHubConfig(financeHubConfig)} permissions={resolvePermission} />;
};

export default FinanceHub;
