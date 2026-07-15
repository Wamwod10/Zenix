import {
  BarChart3,
  CircleDollarSign,
  PackageCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import StatCard from "../StatCard/StatCard";
// ✅ BACKEND INTEGRATION: qiymatlar backend'dan, dizayn o'zgarmagan
import { useDashboardSummaryQuery, formatMoney } from "../../dashboardApi";

const StatsGrid = () => {
  const { data } = useDashboardSummaryQuery();

  const stats = data?.stats;
  const currency = data?.tenant?.currency ?? "uzs";

  const cards = [
    {
      title: "Bugungi savdo",
      value: formatMoney(stats?.todaySales, currency),
      change: stats?.todaySales ? "+0%" : "—",
      previous: `Kecha: ${formatMoney(stats?.yesterdaySales, currency)}`,
      icon: CircleDollarSign,
      color: "blue",
      trend: "up",
      priority: "primary",
    },
    {
      title: "Sof foyda",
      value: formatMoney(stats?.netProfit, currency),
      change: "—",
      previous: `Marja: ${stats?.profitMargin ?? 0}%`,
      icon: TrendingUp,
      color: "green",
      trend: "up",
      priority: "primary",
    },
    {
      title: "Mijozlar",
      value: String(stats?.customersTotal ?? 0),
      change: `+${stats?.newCustomersToday ?? 0}`,
      previous: `Yangi mijozlar: ${stats?.newCustomersToday ?? 0}`,
      icon: Users,
      color: "purple",
      trend: "up",
    },
    {
      title: "Ombor qoldig‘i",
      value: `${stats?.inventoryTotal ?? 0} ta`,
      change: "—",
      previous: `Kam qolgan: ${stats?.lowStockCount ?? 0} ta`,
      icon: PackageCheck,
      color: "orange",
      trend: "up",
    },
    {
      title: "O‘rtacha chek",
      value: formatMoney(stats?.avgReceipt, currency),
      change: "—",
      previous: "Oxirgi 7 kun",
      icon: BarChart3,
      color: "cyan",
      trend: "up",
    },
    {
      title: "AI tavsiyalar",
      value: `${stats?.aiRecommendations ?? 0} ta`,
      change: "—",
      previous: "AI moduli tayyorlanmoqda",
      icon: Sparkles,
      color: "blue",
      trend: "up",
    },
  ];

  return (
    <section className="zenix-dashboard__stats">
      {cards.map((stat, index) => (
        <StatCard key={stat.title} {...stat} index={index} />
      ))}
    </section>
  );
};

export default StatsGrid;
