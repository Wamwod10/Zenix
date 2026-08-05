import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, CheckCircle2, CreditCard, PackageX, Truck, Users } from "lucide-react";
import { formatMoney, formatNumber } from "../../dashboardApi";
import "./DashboardAlerts.scss";

const buildAlerts = (metrics, currency) => {
  const alerts = [];

  if (metrics.lowStockCount > 0) {
    alerts.push({
      id: "low-stock",
      title: "Ombor qoldig'i pasaygan",
      text: `${formatNumber(metrics.lowStockCount)} ta mahsulot minimumga yaqin yoki past.`,
      count: metrics.lowStockCount,
      tone: "warning",
      icon: PackageX,
      route: "/warehouse/stock",
    });
  }

  if (metrics.duePurchaseOrdersToday > 0) {
    alerts.push({
      id: "purchases-due",
      title: "Xarid qabul muddati bugun",
      text: `${formatNumber(metrics.duePurchaseOrdersToday)} ta buyurtma bugun kelishi kerak.`,
      count: metrics.duePurchaseOrdersToday,
      tone: "info",
      icon: Truck,
      route: "/purchases/receiving",
    });
  }

  if (metrics.debt > 0) {
    alerts.push({
      id: "debt",
      title: "Qarzdorlik nazorati",
      text: `${formatMoney(metrics.debt, currency)} debitor oqimda turibdi.`,
      count: metrics.pendingPayments,
      tone: "warning",
      icon: CreditCard,
      route: "/finance/receivables",
    });
  }

  if (metrics.atRiskCustomers > 0) {
    alerts.push({
      id: "customer-risk",
      title: "Mijoz yo'qotish xavfi",
      text: `${formatNumber(metrics.atRiskCustomers)} ta mijozda churn riski yuqori.`,
      count: metrics.atRiskCustomers,
      tone: "danger",
      icon: Users,
      route: "/crm",
    });
  }

  return alerts.slice(0, 4);
};

const DashboardAlerts = ({ metrics, currency }) => {
  const alerts = buildAlerts(metrics, currency);

  return (
    <section className="dashboard-alerts" aria-labelledby="dashboard-alerts-title">
      <div className="dashboard-alerts__head">
        <div>
          <span>Biznes holati</span>
          <h2 id="dashboard-alerts-title">Muhim ogohlantirishlar</h2>
        </div>
      </div>

      {alerts.length ? (
        <div className="dashboard-alerts__list">
          {alerts.map((alert) => {
            const Icon = alert.icon || AlertTriangle;

            return (
              <Link
                className={`dashboard-alert dashboard-alert--${alert.tone}`}
                to={alert.route}
                key={alert.id}
                aria-label={`${alert.title}: ${alert.text}`}
              >
                <span className="dashboard-alert__icon" aria-hidden="true">
                  <Icon size={16} />
                </span>
                <span className="dashboard-alert__copy">
                  <strong>{alert.title}</strong>
                  <small>{alert.text}</small>
                </span>
                <span className="dashboard-alert__count">{formatNumber(alert.count)}</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="dashboard-alerts__empty" role="status">
          <CheckCircle2 size={17} aria-hidden="true" />
          <span>Muhim risk ko'rinmadi. Ma'lumotlar ko'payganda signallar shu yerda chiqadi.</span>
        </div>
      )}
    </section>
  );
};

export default DashboardAlerts;
