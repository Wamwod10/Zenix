import DashboardGreeting from "../components/DashboardGreeting/DashboardGreeting";
import "./Dashboard.scss";
import StatsGrid from "../components/StatsGrid/StatsGrid";
import RevenueChart from "../components/RevenueChart/RevenueChart";
import AIInsights from "../components/AIInsights/AIInsights";
import SalesChart from "../components/SalesChart/SalesChart";
import TopProducts from "../components/TopProducts/TopProducts";
import Activity from "../components/Activity/Activity";
import InventoryStatus from "../components/InventoryStatus/InventoryStatus";
import EmployeeStatus from "../components/EmployeeStatus/EmployeeStatus";
import QuickActions from "../components/QuickActions/QuickActions";
import { useDashboardSummaryQuery } from "../dashboardApi";

const Dashboard = () => {
  const { data: summary, isFetching } = useDashboardSummaryQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  return (
    <main className={`zenix-dashboard ${isFetching ? "is-refreshing" : ""}`}>
      <DashboardGreeting summary={summary} />

      <QuickActions />

      <StatsGrid stats={summary?.stats} />

      <RevenueChart />

      <AIInsights stats={summary?.stats} />

      <section className="zenix-dashboard__analytics">
        <SalesChart />
        <TopProducts products={summary?.topProducts} />
        <Activity items={summary?.activity} />
      </section>

      <section className="zenix-dashboard__widgets">
        <InventoryStatus stats={summary?.stats} />
        <EmployeeStatus employees={summary?.employees} />
      </section>
    </main>
  );
};

export default Dashboard;
