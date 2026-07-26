import { useMemo } from "react";

import { canAccessSettingsPage } from "../utils/settingsPermissions";

const useSettingsPermissions = (role, pageId) =>
  useMemo(
    () => ({
      canView: canAccessSettingsPage(role, pageId),
      canEdit: !["viewer", "cashier"].includes(role) && canAccessSettingsPage(role, pageId),
      requiresApproval: ["backup", "advanced", "permissions", "security"].includes(pageId),
      role,
    }),
    [pageId, role],
  );

export default useSettingsPermissions;
