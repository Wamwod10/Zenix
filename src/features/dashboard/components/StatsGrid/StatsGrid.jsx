import {
  BarChart3,
  CircleDollarSign,
  PackageCheck,
  TrendingUp,
  Users,
  AlertTriangle,
  ReceiptText,
  ShoppingBag,
  WalletCards,
} from "lucide-react";
import {
  formatCompactMoney,
  formatMoney,
  formatNumber,
  formatPercentChange,
} from "../../dashboardApi";
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
  const outOfStockCount = Number(stats?.outOfStockCount ?? 0);
  const profitMargin = Number(stats?.profitMargin);

  const cards = [
    {
      title: "Bugungi tushum",
      value: formatCompactMoney(stats?.todaySales, currency),
      change: salesChange.label,
      previous: stats?.yesterdaySales != null
        ? `Kecha: ${formatMoney(stats.yesterdaySales, currency)}`
        : "Kecha bilan taqqoslash yo'q",
      icon: CircleDollarSign,
      color: "blue",
      trend: salesChange.trend,
      priority: "primary",
      path: "/reports/sales",
    },
    {
      title: "Savdolar soni",
      value: formatNumber(stats?.ordersToday ?? stats?.todayOrders ?? stats?.ordersCount),
      change: "Tanlangan davr",
      previous: "00:00-hozirgacha",
      icon: ShoppingBag,
      color: "cyan",
      trend: null,
      priority: "primary",
      path: "/reports/sales",
    },
    {
      title: "Sof foyda",
      value: formatCompactMoney(stats?.netProfit, currency),
      change:
        Number.isFinite(profitMargin)
          ? `${profitMargin.toFixed(1)}% marja`
          : "Marja yo'q",
      previous: "Tushum - tannarx - xarajat - qaytarish",
      icon: TrendingUp,
      color: "green",
      trend: null,
      priority: "primary",
      path: "/finance/profit-and-loss",
    },
    {
      title: "O'rtacha chek",
      value: formatCompactMoney(stats?.avgReceipt, currency),
      change: receiptChange.label,
      previous: "Savdo davri bo'yicha",
      icon: BarChart3,
      color: "cyan",
      trend: receiptChange.trend,
      path: "/reports/sales",
    },
    {
      title: "Xarajatlar",
      value: formatCompactMoney(stats?.expenses, currency),
      change: "Kategoriyalar kesimi",
      previous: "Moliya nazorati",
      icon: ReceiptText,
      color: "orange",
      trend: null,
      path: "/finance/expenses",
    },
    {
      title: "Qarzdorlik",
      value: formatCompactMoney(stats?.debt, currency),
      change: "Debitor qarz",
      previous: "Mijoz va to'lovlar",
      icon: WalletCards,
      color: "purple",
      trend: Number(stats?.debt ?? 0) > 0 ? "down" : null,
      path: "/finance/debts",
    },
    {
      title: "Ombor riski",
      value: `${formatNumber(lowStockCount + outOfStockCount)} ta`,
      change: outOfStockCount ? `${formatNumber(outOfStockCount)} tugagan` : "Barqaror",
      previous: `${formatNumber(stats?.inventoryTotal)} jami SKU`,
      icon: outOfStockCount ? AlertTriangle : PackageCheck,
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
      {cards.map((stat, index) => (
        <StatCard key={stat.title} {...stat} index={index} />
      ))}
    </section>
  );
};

export default StatsGrid;
