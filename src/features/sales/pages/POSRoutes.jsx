import { Navigate, useRoutes } from "react-router-dom";
import { useSelector } from "react-redux";

import { selectCurrentUser } from "../../auth/authSlice";
import POS from "./POS";
import POSHub from "./POSHub";
import POSPanel from "./POSPanel";

const cashierRoles = new Set(["cashier", "kassir", "seller", "sales"]);

const POSIndex = () => {
  const user = useSelector(selectCurrentUser);
  const role = String(user?.role || "").toLowerCase();

  if (cashierRoles.has(role)) {
    return <Navigate to="/pos/terminal" replace />;
  }

  return <POSHub />;
};

const POSRoutes = () =>
  useRoutes([
    { index: true, element: <POSIndex /> },
    { path: "terminal", element: <POS /> },
    { path: "held", element: <POSPanel type="held" /> },
    { path: "history", element: <POSPanel type="history" /> },
    { path: "shift", element: <POSPanel type="shift" /> },
    { path: "returns", element: <POSPanel type="returns" /> },
    { path: "*", element: <Navigate to="/pos" replace /> },
  ]);

export default POSRoutes;
