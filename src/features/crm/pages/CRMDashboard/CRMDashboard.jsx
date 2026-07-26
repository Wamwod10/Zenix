import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  CakeSlice,
  Clock3,
  Crown,
  Database,
  HandCoins,
  HeartPulse,
  Plus,
  RefreshCw,
  Sparkles,
  UserCheck,
  UserPlus,
  UsersRound,
} from "lucide-react";

import DashboardActivityFeed from "../../components/DashboardActivityFeed/DashboardActivityFeed";
import DashboardCustomerPanels from "../../components/DashboardCustomerPanels/DashboardCustomerPanels";
import CRMMetricCard from "../../components/CRMMetricCard/CRMMetricCard";
import CRMPageHeader from "../../components/CRMPageHeader/CRMPageHeader";

import {
  crmDashboardData,
  getCrmDashboardMetricList,
} from "../../data/crmAnalytics";

import {
  formatCurrency,
  formatDateTime,
  formatNumber,
} from "../../utils/crmFormatters";

import "./CRMDashboard.scss";

const metricIcons = {
  "total-customers": UsersRound,
  "new-customers": UserPlus,
  "active-customers": UserCheck,
  "total-debt": HandCoins,
  "vip-customers": Crown,
  "birthdays-today": CakeSlice,
};

const formatMetricValue = (metric) => {
  if (metric.valueType === "currency") {
    return formatCurrency(metric.value);
  }

  return formatNumber(metric.value);
};

const createGrowthPoints = (items) => {
  if (!items.length) {
    return "";
  }

  const values = items.map((item) => item.customers);
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const range = Math.max(maximum - minimum, 1);

  return items
    .map((item, index) => {
      const x = (index / Math.max(items.length - 1, 1)) * 100;
      const normalizedValue = (item.customers - minimum) / range;
      const y = 86 - normalizedValue * 66;

      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
};

const CRMDashboard = () => {
  const refreshTimerRef = useRef(null);

  const [refreshStatus, setRefreshStatus] = useState("idle");
  const [lastUpdatedAt, setLastUpdatedAt] = useState(
    crmDashboardData.generatedAt,
  );

  const metrics = useMemo(() => getCrmDashboardMetricList(), []);

  const growthData = useMemo(() => crmDashboardData.growth.slice(-8), []);

  const growthPoints = useMemo(
    () => createGrowthPoints(growthData),
    [growthData],
  );

  const totalGrowth =
    growthData[growthData.length - 1].customers - growthData[0].customers;

  useEffect(
    () => () => {
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
      }
    },
    [],
  );

  const handleRefresh = () => {
    if (refreshStatus === "loading") {
      return;
    }

    setRefreshStatus("loading");

    refreshTimerRef.current = window.setTimeout(() => {
      setLastUpdatedAt(new Date().toISOString());
      setRefreshStatus("success");

      refreshTimerRef.current = window.setTimeout(() => {
        setRefreshStatus("idle");
      }, 1600);
    }, 700);
  };

  const refreshLabel = {
    idle: "Yangilash",
    loading: "Yangilanmoqda",
    success: "Yangilandi",
  }[refreshStatus];

  return (
    <main
      className={`crm-dashboard ${
        refreshStatus === "loading" ? "is-refreshing" : ""
      }`}
    >
      <CRMPageHeader
        eyebrow="Mijozlar boshqaruv markazi"
        title="Har bir mijoz — aniq ko‘rinadigan imkoniyat."
        description="Faollik, sodiqlik, qarz, churn xavfi va keyingi eng yaxshi harakatni bitta premium CRM ish maydonida boshqaring."
        meta={[
          {
            id: "customer-database",
            label: "Mijoz bazasi",
            value: formatNumber(crmDashboardData.summary.totalCustomers.value),
            icon: Database,
          },
          {
            id: "crm-health",
            label: "CRM salomatligi",
            value: `${crmDashboardData.customerHealth.score}%`,
            icon: HeartPulse,
          },
          {
            id: "last-update",
            label: "Yangilangan",
            value: formatDateTime(lastUpdatedAt),
            icon: Clock3,
          },
        ]}
        actions={
          <>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshStatus === "loading"}
              aria-busy={refreshStatus === "loading"}
            >
              <RefreshCw
                className={refreshStatus === "loading" ? "is-spinning" : ""}
                size={16}
                aria-hidden="true"
              />
              {refreshLabel}
            </button>

            <Link className="is-primary" to="/crm/customers/new">
              <Plus size={16} aria-hidden="true" />
              Yangi mijoz
            </Link>
          </>
        }
      />

      <section
        className="crm-dashboard__metrics"
        aria-label="CRM asosiy ko‘rsatkichlari"
      >
        {metrics.map((metric) => (
          <CRMMetricCard
            key={metric.id}
            label={metric.label}
            value={formatMetricValue(metric)}
            description={metric.description}
            change={metric.change}
            changeType={metric.changeType}
            trend={metric.trend}
            positiveTrend={metric.positiveTrend}
            tone={metric.tone}
            icon={metricIcons[metric.id]}
            secondaryValue={metric.secondaryValue}
            secondaryLabel={metric.secondaryLabel}
          />
        ))}
      </section>

      <section className="crm-dashboard__overview">
        <article className="crm-dashboard__panel crm-dashboard__growth">
          <div className="crm-dashboard__panel-header">
            <div>
              <span className="crm-dashboard__section-label">
                Mijozlar dinamikasi
              </span>

              <h2>Barqaror o‘sish</h2>

              <p>
                Oxirgi sakkiz oyda mijoz bazasi{" "}
                <strong>+{formatNumber(totalGrowth)}</strong> taga kengaydi.
              </p>
            </div>

            <Link to="/crm/analytics">
              Batafsil
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>

          <div className="crm-dashboard__growth-summary">
            <div>
              <span>Joriy baza</span>
              <strong>
                {formatNumber(growthData[growthData.length - 1].customers)}
              </strong>
            </div>

            <div>
              <span>Bu oy yangi</span>
              <strong>
                +{formatNumber(growthData[growthData.length - 1].newCustomers)}
              </strong>
            </div>

            <div>
              <span>Faol mijoz</span>
              <strong>
                {formatNumber(
                  growthData[growthData.length - 1].activeCustomers,
                )}
              </strong>
            </div>
          </div>

          <div className="crm-dashboard__chart">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              role="img"
              aria-labelledby="crm-growth-chart-title"
            >
              <title id="crm-growth-chart-title">
                Oxirgi sakkiz oydagi mijozlar o‘sishi
              </title>

              <defs>
                <linearGradient id="crmGrowthArea" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="rgb(105 91 115)"
                    stopOpacity="0.24"
                  />

                  <stop
                    offset="100%"
                    stopColor="rgb(105 91 115)"
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>

              <g className="crm-dashboard__chart-grid" aria-hidden="true">
                <line x1="0" y1="20" x2="100" y2="20" />
                <line x1="0" y1="42" x2="100" y2="42" />
                <line x1="0" y1="64" x2="100" y2="64" />
                <line x1="0" y1="86" x2="100" y2="86" />
              </g>

              <polygon
                className="crm-dashboard__chart-area"
                points={`0,100 ${growthPoints} 100,100`}
              />

              <polyline
                className="crm-dashboard__chart-line"
                points={growthPoints}
              />
            </svg>

            <div className="crm-dashboard__chart-labels" aria-hidden="true">
              {growthData.map((item) => (
                <span key={item.id}>{item.label}</span>
              ))}
            </div>
          </div>
        </article>

        <article className="crm-dashboard__panel crm-dashboard__health">
          <div className="crm-dashboard__panel-header">
            <div>
              <span className="crm-dashboard__section-label">
                Baza salomatligi
              </span>

              <h2>{crmDashboardData.customerHealth.label}</h2>
            </div>

            <span className="crm-dashboard__live-status">
              <span aria-hidden="true" />
              Jonli
            </span>
          </div>

          <div className="crm-dashboard__health-main">
            <div
              className="crm-dashboard__health-ring"
              aria-label={`CRM salomatligi ${crmDashboardData.customerHealth.score} foiz`}
            >
              <svg viewBox="0 0 42 42" aria-hidden="true">
                <circle
                  className="crm-dashboard__health-track"
                  cx="21"
                  cy="21"
                  r="15.9155"
                />

                <circle
                  className="crm-dashboard__health-progress"
                  cx="21"
                  cy="21"
                  r="15.9155"
                  strokeDasharray={`${crmDashboardData.customerHealth.score} ${
                    100 - crmDashboardData.customerHealth.score
                  }`}
                />
              </svg>

              <div>
                <strong>{crmDashboardData.customerHealth.score}</strong>
                <span>/100</span>
              </div>
            </div>

            <p>{crmDashboardData.customerHealth.description}</p>
          </div>

          <ul className="crm-dashboard__health-metrics">
            {crmDashboardData.customerHealth.metrics.map((metric) => (
              <li className={`is-${metric.tone}`} key={metric.id}>
                <span>{metric.label}</span>

                <strong>
                  {metric.value.toLocaleString("uz-UZ", {
                    maximumFractionDigits: 1,
                  })}
                  {metric.unit}
                </strong>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <DashboardCustomerPanels
        topCustomers={crmDashboardData.topCustomers}
        debtors={crmDashboardData.debtors}
        churnRisks={crmDashboardData.churnRisks}
        birthdays={crmDashboardData.birthdays}
        referenceDate={crmDashboardData.generatedAt}
      />

      <DashboardActivityFeed
        items={crmDashboardData.recentActivities}
        referenceDate={crmDashboardData.generatedAt}
      />

      <section className="crm-dashboard__insight-layout">
        <article className="crm-dashboard__panel crm-dashboard__ai">
          <div className="crm-dashboard__panel-header">
            <div>
              <span className="crm-dashboard__section-label">
                AI mijoz tahlili
              </span>

              <h2>Bugungi muhim signallar</h2>

              <p>
                ZENIX AI mijozlar xulqi, xarid va moliyaviy tarixni tahlil
                qildi.
              </p>
            </div>

            <span className="crm-dashboard__ai-icon" aria-hidden="true">
              <Sparkles size={18} strokeWidth={1.9} />
            </span>
          </div>

          <div className="crm-dashboard__ai-list">
            {crmDashboardData.aiInsights.map((insight) => (
              <article
                className={`crm-dashboard__ai-item is-${insight.priority}`}
                key={insight.id}
              >
                <div className="crm-dashboard__ai-item-content">
                  <span>AI ishonchi: {insight.confidence}%</span>

                  <h3>{insight.title}</h3>
                  <p>{insight.description}</p>
                </div>

                <Link to={insight.actionTarget}>
                  {insight.actionLabel}

                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </article>

        <aside className="crm-dashboard__panel crm-dashboard__tasks">
          <div className="crm-dashboard__panel-header">
            <div>
              <span className="crm-dashboard__section-label">
                Bugungi fokus
              </span>

              <h2>Vazifalar holati</h2>
            </div>

            <span className="crm-dashboard__task-icon" aria-hidden="true">
              <Activity size={18} />
            </span>
          </div>

          <div className="crm-dashboard__task-list">
            {crmDashboardData.pendingActions.map((item) => {
              const remaining = Math.max(item.value - item.completed, 0);

              return (
                <Link key={item.id} to={item.target}>
                  <div>
                    <span>{item.label}</span>

                    <strong>
                      {item.completed}/{item.value}
                    </strong>
                  </div>

                  <small>
                    {remaining > 0
                      ? `${remaining} ta qoldi`
                      : "Barchasi bajarildi"}
                  </small>
                </Link>
              );
            })}
          </div>

          <Link className="crm-dashboard__all-activities" to="/crm/activities">
            Barcha vazifalarni ochish
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </aside>
      </section>
    </main>
  );
};

export default CRMDashboard;
