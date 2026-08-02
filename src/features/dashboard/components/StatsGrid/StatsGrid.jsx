import {
  BarChart3,
  CircleDollarSign,
  PackageCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { formatMoney, formatPercentChange, formatNumber } from "../../dashboardApi";
import StatCard from "../StatCard/StatCard";

const getChange = (current, previous, positiveDown = false) =>
  formatPercentChange(current, previous, positiveDown) ?? {
    label: "Taqqoslash yo'q",
    trend: null,
  };

const StatsGrid = ({ currency = "uzs", isLoading = false, stats = {} }) => {
  if (isLoading) {
    return (
      <section className="zenix-dashboard__stats" aria-label="KPI yuklanmoqda">
        {[0, 1, 2, 3].map((index) => (
          <article className="zenix-dashboard__skeleton-card" key={index} />
        ))}
      </section>
    );
  }

  const salesChange = getChange(stats?.todaySales, stats?.yesterdaySales);
  const receiptChange = getChange(stats?.avgReceipt, stats?.yesterdayAvgReceipt);
  const lowStockCount = Number(stats?.lowStockCount ?? 0);

  const cards = [
    {
      title: "Bugungi savdo",
      value: formatMoney(stats?.todaySales, currency),
      change: salesChange.label,
      previous: stats?.yesterdaySales
        ? `Kecha: ${formatMoney(stats.yesterdaySales, currency)}`
        : "Kecha bilan taqqoslash yo'q",
      icon: CircleDollarSign,
      color: "blue",
      trend: salesChange.trend,
      priority: "primary",
      path: "/reports/sales",
    },
    {
      title: "Sof foyda",
      value: formatMoney(stats?.netProfit, currency),
      change: stats?.profitMargin != null ? `${stats.profitMargin}% marja` : "Marja yo'q",
      previous: "Foyda hisoboti",
      icon: TrendingUp,
      color: "green",
      trend: null,
      priority: "primary",
      path: "/finance/profit-and-loss",
    },
    {
      title: "O'rtacha chek",
      value: formatMoney(stats?.avgReceipt, currency),
      change: receiptChange.label,
      previous: "Savdo davri bo'yicha",
      icon: BarChart3,
      color: "cyan",
      trend: receiptChange.trend,
      path: "/reports/sales",
    },
    {
      title: "Ombor riski",
      value: `${formatNumber(lowStockCount)} ta`,
      change: lowStockCount ? "E'tibor kerak" : "Barqaror",
      previous: `${formatNumber(stats?.inventoryTotal)} jami SKU`,
      icon: PackageCheck,
      color: lowStockCount ? "orange" : "green",
      trend: lowStockCount ? "down" : null,
      path: "/warehouse/stock",
    },
    {
      title: "Mijozlar",
      value: formatNumber(stats?.customersTotal),
      change:
        stats?.newCustomersToday != null
          ? `${formatNumber(stats.newCustomersToday)} yangi`
          : "Yangi mijoz yo'q",
      previous: "CRM ro'yxati",
      icon: Users,
      color: "purple",
      trend: null,
      path: "/crm/customers",
      compact: true,
    },
  ];

  return (
    <section className="zenix-dashboard__stats">
      {cards.slice(0, 4).map((stat, index) => (
        <StatCard key={stat.title} {...stat} index={index} />
      ))}
    </section>
  );
};

export default StatsGrid;
