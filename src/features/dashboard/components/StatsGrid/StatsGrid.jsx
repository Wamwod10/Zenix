import {
  BarChart3,
  CircleDollarSign,
  PackageCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import StatCard from "../StatCard/StatCard";
import { formatMoney } from "../../dashboardApi";

const fallbackStats = [
  {
    title: "Bugungi savdo",
    value: "14 280 000 so'm",
    change: "+23.5%",
    previous: "Kecha: 11 560 000 so'm",
    icon: CircleDollarSign,
    color: "blue",
    trend: "up",
    priority: "primary",
  },
  {
    title: "Sof foyda",
    value: "4 120 000 so'm",
    change: "+18.2%",
    previous: "Marja: 28.8%",
    icon: TrendingUp,
    color: "green",
    trend: "up",
    priority: "primary",
  },
  {
    title: "Mijozlar",
    value: "248",
    change: "+12",
    previous: "Yangi mijozlar: 34",
    icon: Users,
    color: "purple",
    trend: "up",
  },
  {
    title: "Ombor qoldig'i",
    value: "1 842 ta",
    change: "-4.8%",
    previous: "Kam qolgan: 17 ta",
    icon: PackageCheck,
    color: "orange",
    trend: "down",
  },
  {
    title: "O'rtacha chek",
    value: "186 000 so'm",
    change: "+9.6%",
    previous: "Oxirgi 7 kun",
    icon: BarChart3,
    color: "cyan",
    trend: "up",
  },
  {
    title: "AI tavsiyalar",
    value: "5 ta",
    change: "+2",
    previous: "3 tasi muhim",
    icon: Sparkles,
    color: "blue",
    trend: "up",
  },
];

function percentChange(current, previous) {
  if (!previous) {
    return current ? "+100%" : "0%";
  }

  const value = ((Number(current) - Number(previous)) / Number(previous)) * 100;
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function buildStats(stats) {
  if (!stats) {
    return fallbackStats;
  }

  return [
    {
      title: "Bugungi savdo",
      value: formatMoney(stats.todaySales),
      change: percentChange(stats.todaySales, stats.yesterdaySales),
      previous: `Kecha: ${formatMoney(stats.yesterdaySales)}`,
      icon: CircleDollarSign,
      color: "blue",
      trend: Number(stats.todaySales) >= Number(stats.yesterdaySales) ? "up" : "down",
      priority: "primary",
    },
    {
      title: "Sof foyda",
      value: formatMoney(stats.netProfit),
      change: `${Number(stats.profitMargin || 0).toFixed(1)}%`,
      previous: `Marja: ${Number(stats.profitMargin || 0).toFixed(1)}%`,
      icon: TrendingUp,
      color: "green",
      trend: Number(stats.netProfit) >= 0 ? "up" : "down",
      priority: "primary",
    },
    {
      title: "Mijozlar",
      value: Number(stats.customersTotal || 0).toLocaleString("ru-RU"),
      change: `+${Number(stats.newCustomersToday || 0)}`,
      previous: `Yangi mijozlar: ${Number(stats.newCustomersToday || 0)}`,
      icon: Users,
      color: "purple",
      trend: "up",
    },
    {
      title: "Ombor qoldig'i",
      value: `${Number(stats.inventoryTotal || 0).toLocaleString("ru-RU")} ta`,
      change: `${Number(stats.lowStockCount || 0)} risk`,
      previous: `Kam qolgan: ${Number(stats.lowStockCount || 0)} ta`,
      icon: PackageCheck,
      color: Number(stats.lowStockCount || 0) ? "orange" : "cyan",
      trend: Number(stats.lowStockCount || 0) ? "down" : "up",
    },
    {
      title: "O'rtacha chek",
      value: formatMoney(stats.avgReceipt),
      change: "+0%",
      previous: "Bugungi o'rtacha",
      icon: BarChart3,
      color: "cyan",
      trend: "up",
    },
    {
      title: "AI tavsiyalar",
      value: `${Number(stats.aiRecommendations || stats.lowStockCount || 0)} ta`,
      change: Number(stats.lowStockCount || 0) ? "risk" : "stable",
      previous: "Real-time monitoring",
      icon: Sparkles,
      color: "blue",
      trend: Number(stats.lowStockCount || 0) ? "down" : "up",
    },
  ];
}

const StatsGrid = ({ stats }) => {
  const cards = buildStats(stats);

  return (
    <section className="zenix-dashboard__stats">
      {cards.map((stat, index) => (
        <StatCard key={stat.title} {...stat} index={index} />
      ))}
    </section>
  );
};

export default StatsGrid;
