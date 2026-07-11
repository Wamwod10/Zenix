import { useMemo, useState } from "react";

import { defaultPOSRole } from "../data/posPermissions";
import { getRolePermissions, hasPOSPermission } from "../utils/posPermissions";

const usePOSPermissions = () => {
  const [role, setRole] = useState(defaultPOSRole);

  const permissions = useMemo(() => getRolePermissions(role), [role]);

  return {
    role,
    setRole,
    permissions,
    hasPermission: (permission) => hasPOSPermission(permission, role),
  };
};

export default usePOSPermissions;
