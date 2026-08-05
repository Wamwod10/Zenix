import { useMemo } from "react";
import { useSelector } from "react-redux";

import { selectCurrentUser } from "../../auth/authSlice";
import { ModuleHub } from "../../../shared/moduleHub";
import { createDashboardModulesConfig } from "../config/dashboardModulesConfig";

const resolveUserPermissions = (user) => {
  if (Array.isArray(user?.permissions)) return user.permissions;
  if (Array.isArray(user?.role?.permissions)) return user.role.permissions;
  return undefined;
};

const DashboardHub = () => {
  const user = useSelector(selectCurrentUser);
  const permissions = useMemo(() => resolveUserPermissions(user), [user]);
  const config = useMemo(() => createDashboardModulesConfig(), []);

  return (
    <main className="zenix-dashboard zenix-dashboard--hub">
      <ModuleHub config={config} permissions={permissions} />
    </main>
  );
};

export default DashboardHub;
