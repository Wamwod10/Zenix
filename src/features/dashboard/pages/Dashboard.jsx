import { Navigate, useNavigate, useRoutes } from "react-router-dom";
import { ArrowLeft, SearchX } from "lucide-react";

import DashboardAnalytics from "./DashboardAnalytics";
import "./Dashboard.scss";

const DashboardRouteNotFound = () => {
  const navigate = useNavigate();

  return (
    <main className="zenix-dashboard">
      <section className="dashboard-route-state">
        <SearchX size={22} />
        <div>
          <strong>Bu dashboard sahifasi mavjud emas</strong>
          <span>Analitika va bo'limlar bosh sahifada jamlangan.</span>
        </div>
        <button type="button" onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={16} />
          Dashboardga qaytish
        </button>
      </section>
    </main>
  );
};

const Dashboard = () => {
  return useRoutes([
    { index: true, element: <DashboardAnalytics /> },
    { path: "analytics", element: <Navigate to="/dashboard" replace /> },
    { path: "*", element: <DashboardRouteNotFound /> },
  ]);
};

export default Dashboard;
