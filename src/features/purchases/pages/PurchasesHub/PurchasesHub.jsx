import { ModuleHub, hydrateHubConfig, MODULE_HUB_PERMISSION_STATES } from "../../../../shared/moduleHub";
import { purchasesHubConfig } from "../../config/purchasesHubConfig";
import { hasPurchasePermission } from "../../constants/purchasePermissions";
import usePurchasesStore from "../../hooks/usePurchasesStore";

const PurchasesHub = () => {
  const purchases = usePurchasesStore();

  const resolvePermission = (permissionKey) => ({
    state: hasPurchasePermission(purchases.currentUser.role, permissionKey)
      ? MODULE_HUB_PERMISSION_STATES.enabled
      : MODULE_HUB_PERMISSION_STATES.disabled,
    reason: "Bu xarid yo'nalishi joriy rol uchun cheklangan.",
  });

  return (
    <ModuleHub
      config={hydrateHubConfig(purchasesHubConfig)}
      permissions={resolvePermission}
    />
  );
};

export default PurchasesHub;
