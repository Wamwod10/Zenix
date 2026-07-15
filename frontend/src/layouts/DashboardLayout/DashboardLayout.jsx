import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import "./DashboardLayout.scss";

const DashboardLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <main
      className={`zenix-dashboard-layout ${
        isSidebarCollapsed ? "zenix-dashboard-layout--collapsed" : ""
      }`}
    >
      <section className="zenix-dashboard-layout__shell">
        <aside className="zenix-dashboard-layout__sidebar">
          <Sidebar
            collapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed((current) => !current)}
          />
        </aside>

        <div className="zenix-dashboard-layout__workspace">
          <header className="zenix-dashboard-layout__header">
            <Header />
          </header>

          <section className="zenix-dashboard-layout__content">
            <Outlet />
          </section>
        </div>
      </section>
    </main>
  );
};

export default DashboardLayout;
