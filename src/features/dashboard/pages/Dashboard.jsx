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

const Dashboard = () => {
  return (
    <main className="zenix-dashboard">
      <DashboardGreeting />

      <StatsGrid />

      <RevenueChart />

      <AIInsights />

      <section className="zenix-dashboard__analytics">
        <SalesChart />
        <TopProducts />
        <Activity />
      </section>

      <section className="zenix-dashboard__widgets">
        <InventoryStatus />
        <EmployeeStatus />
        <QuickActions />
      </section>
    </main>
  );
};

export default Dashboard;
