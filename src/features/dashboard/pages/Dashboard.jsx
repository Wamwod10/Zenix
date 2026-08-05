import { Navigate, useRoutes } from "react-router-dom";

import DashboardAnalytics from "./DashboardAnalytics";
import DashboardHub from "./DashboardHub";
import "./Dashboard.scss";

const Dashboard = () => {
  return useRoutes([
    { index: true, element: <DashboardHub /> },
    { path: "analytics", element: <DashboardAnalytics /> },
    { path: "*", element: <Navigate to="/dashboard" replace /> },
  ]);
};

export default Dashboard;
