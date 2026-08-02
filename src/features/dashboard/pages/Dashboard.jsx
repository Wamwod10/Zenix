import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { selectDashboardSummary } from "../../../core/businessOS/businessOSSlice";
import Activity from "../components/Activity/Activity";
import AIInsights from "../components/AIInsights/AIInsights";
import DashboardGreeting from "../components/DashboardGreeting/DashboardGreeting";
import EmployeeStatus from "../components/EmployeeStatus/EmployeeStatus";
import InventoryStatus from "../components/InventoryStatus/InventoryStatus";
import QuickActions from "../components/QuickActions/QuickActions";
import RevenueChart from "../components/RevenueChart/RevenueChart";
import SalesChart from "../components/SalesChart/SalesChart";
import StatsGrid from "../components/StatsGrid/StatsGrid";
import TopProducts from "../components/TopProducts/TopProducts";

import "./Dashboard.scss";

const Dashboard = () => {
  const summary = useSelector(selectDashboardSummary);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const fulfilledTimeStamp = useMemo(() => lastUpdated, [lastUpdated]);
  const currency = summary?.tenant?.currency ?? "uzs";

  return (
    <main className="zenix-dashboard">
      <section className="zenix-dashboard__top">
        <DashboardGreeting
          isFetching={false}
          lastUpdated={fulfilledTimeStamp}
          onRefresh={() => setLastUpdated(Date.now())}
          summary={summary}
        />
        <QuickActions />
      </section>

      <StatsGrid currency={currency} isLoading={false} stats={summary?.stats} />

      <section className="zenix-dashboard__section">
        <div className="zenix-dashboard__section-head">
          <span>Savdo va moliya</span>
          <strong>Bugungi tushum, foyda va savdo oqimi</strong>
        </div>
        <div className="zenix-dashboard__finance">
          <RevenueChart currency={currency} stats={summary?.stats} />
          <SalesChart currency={currency} stats={summary?.stats} summary={summary} />
        </div>
      </section>

      <section className="zenix-dashboard__section">
        <div className="zenix-dashboard__section-head">
          <span>Risklar va operatsiyalar</span>
          <strong>Ombor, jamoa va oxirgi faoliyat</strong>
        </div>

        <section className="zenix-dashboard__analytics">
          <AIInsights currency={currency} stats={summary?.stats} />
          <TopProducts currency={currency} products={summary?.topProducts} />
          <Activity items={summary?.activity} />
        </section>

        <section className="zenix-dashboard__widgets">
          <InventoryStatus stats={summary?.stats} />
          <EmployeeStatus employees={summary?.employees} />
        </section>
      </section>
    </main>
  );
};

export default Dashboard;
