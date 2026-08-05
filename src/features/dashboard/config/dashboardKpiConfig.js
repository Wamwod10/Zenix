import {
  CircleDollarSign,
  PackageCheck,
  ReceiptText,
  TrendingUp,
} from "lucide-react";

import { formatMoney, formatNumber, formatPercentChange } from "../dashboardApi";

export const createDashboardKpis = ({ metrics, currency }) => {
  const salesChange = formatPercentChange(metrics.todaySales, metrics.yesterdaySales);

  return [
    {
      id: "today-sales",
      title: "Bugungi savdo",
      value: formatMoney(metrics.todaySales, currency),
      meta: salesChange?.label || "Kecha bilan taqqoslash yo'q",
      status: metrics.ordersToday ? `${formatNumber(metrics.ordersToday)} buyurtma` : "Buyurtma yo'q",
      tone: salesChange?.trend === "down" ? "warning" : "success",
      icon: CircleDollarSign,
      route: "/reports/sales",
    },
    {
      id: "net-profit",
      title: "Sof foyda",
      value: formatMoney(metrics.netProfit, currency),
      meta: metrics.profitMargin != null ? `${metrics.profitMargin}% marja` : "Marja yo'q",
      status: "Foyda hisoboti",
      tone: metrics.netProfit >= 0 ? "success" : "danger",
      icon: TrendingUp,
      route: "/finance/profit-loss",
    },
    {
      id: "warehouse-risk",
      title: "Ombor riski",
      value: `${formatNumber(metrics.lowStockCount)} ta`,
      meta: metrics.lowStockCount ? "E'tibor kerak" : "Barqaror",
      status: `${formatNumber(metrics.outOfStockCount)} qoldiqsiz`,
      tone: metrics.lowStockCount ? "warning" : "success",
      icon: PackageCheck,
      route: "/warehouse/stock",
    },
    {
      id: "debt",
      title: "Qarzdorlik",
      value: formatMoney(metrics.debt, currency),
      meta: metrics.debt ? "Nazorat kerak" : "Qarz yo'q",
      status: `${formatNumber(metrics.pendingPayments)} kutilayotgan to'lov`,
      tone: metrics.debt ? "warning" : "success",
      icon: ReceiptText,
      route: "/finance/receivables",
    },
  ];
};
