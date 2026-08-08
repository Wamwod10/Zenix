import { GlassSelect } from "@/components/ui";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { AlertTriangle, RotateCw } from "lucide-react";

import { selectCurrentUser } from "../../auth/authSlice";
import { ModuleHub } from "../../../shared/moduleHub";
import { useBusinessType } from "../../../hooks/useBusinessType";
import { createDashboardModulesConfig } from "../config/dashboardModulesConfig";
import { useDashboardSummaryQuery } from "../dashboardApi";
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

const PERIOD_OPTIONS = [
  { value: "today", label: "Bugun" },
  { value: "yesterday", label: "Kecha" },
  { value: "week", label: "Hafta" },
  { value: "month", label: "Oy" },
];

const resolveUserPermissions = (user) => {
  if (Array.isArray(user?.permissions)) return user.permissions;
  if (Array.isArray(user?.role?.permissions)) return user.role.permissions;
  return undefined;
};

const toSelectOptions = (items, fallbackLabel) => {
  const rows = Array.isArray(items) ? items : [];

  return [
    { id: "all", name: fallbackLabel },
    ...rows
      .filter((item) => item?.id)
      .map((item) => ({
        id: String(item.id),
        name: item.name || item.title || item.code || item.id,
      })),
  ];
};

const getFetchedAt = (summary, fulfilledTimeStamp) =>
  summary?.meta?.fetchedAt || summary?.fetchedAt || fulfilledTimeStamp;

const isOlderThan = (timestamp, minutes) => {
  if (!timestamp) return false;

  const parsed =
    typeof timestamp === "number" ? timestamp : new Date(timestamp).getTime();

  if (!Number.isFinite(parsed)) return false;

  return Date.now() - parsed > minutes * 60 * 1000;
};

const getErrorMessage = (error) =>
  error?.data?.error?.message ||
  error?.data?.message ||
  "Ma'lumotlarni yuklab bo'lmadi. Backend yoki internet aloqasini tekshiring.";

const DashboardAnalytics = () => {
  const user = useSelector(selectCurrentUser);
  const { businessTypeId } = useBusinessType();
  const [filters, setFilters] = useState({
    period: "today",
    branchId: "all",
    warehouseId: "all",
    currency: undefined,
  });

  const permissions = useMemo(() => resolveUserPermissions(user), [user]);
  const modulesConfig = useMemo(
    () => createDashboardModulesConfig({ businessTypeId }),
    [businessTypeId],
  );
  const queryArgs = useMemo(
    () => ({
      period: filters.period,
      branchId: filters.branchId,
      warehouseId: filters.warehouseId,
      currency: filters.currency,
    }),
    [filters],
  );
  const {
    data: summary,
    error,
    fulfilledTimeStamp,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useDashboardSummaryQuery(queryArgs, {
    pollingInterval: 60_000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const currency = filters.currency || summary?.tenant?.currency || "uzs";
  const fetchedAt = getFetchedAt(summary, fulfilledTimeStamp);
  const isStale = isOlderThan(fetchedAt, 10);
  const branchOptions = useMemo(
    () =>
      toSelectOptions(
        summary?.branches || summary?.tenant?.branches,
        "Barcha filiallar",
      ),
    [summary],
  );
  const warehouseOptions = useMemo(
    () =>
      toSelectOptions(
        summary?.warehouses || summary?.tenant?.warehouses,
        "Barcha omborlar",
      ),
    [summary],
  );

  const updateFilter = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  return (
    <main className="zenix-dashboard">
      <nav className="dashboard-breadcrumb" aria-label="Breadcrumb">
        <span>Dashboard</span>
        <strong>Analitika</strong>
      </nav>

      <section className="dashboard-filterbar" aria-label="Dashboard filtrlari">
        <div
          className="dashboard-filterbar__period"
          role="group"
          aria-label="Davr"
        >
          {PERIOD_OPTIONS.map((period) => (
            <button
              className={filters.period === period.value ? "is-active" : ""}
              key={period.value}
              type="button"
              onClick={() => updateFilter("period", period.value)}
            >
              {period.label}
            </button>
          ))}
        </div>

        <label>
          {/* <span>Filial</span> */}
          <GlassSelect
            value={filters.branchId}
            onChange={(event) => updateFilter("branchId", event.target.value)}
          >
            {branchOptions.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </GlassSelect>
        </label>

        <label>
          {/* <span>Ombor</span> */}
          <GlassSelect
            value={filters.warehouseId}
            onChange={(event) =>
              updateFilter("warehouseId", event.target.value)
            }
          >
            {warehouseOptions.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </GlassSelect>
        </label>
      </section>

      {isError ? (
        <section className="zenix-dashboard__notice" role="alert">
          <div style={{ display: "flex", alignItems: "center", columnGap: 8 }}>
            <AlertTriangle size={18} />
            <div>
              <strong>Ma'lumotlarni yuklab bo'lmadi</strong>
              <span>{getErrorMessage(error)}</span>
            </div>
          </div>
          <button type="button" disabled={isFetching} onClick={refetch}>
            <RotateCw size={14} />
            Qayta urinish
          </button>
        </section>
      ) : null}

      <section className="zenix-dashboard__top">
        <DashboardGreeting
          isFetching={isFetching}
          isStale={isStale}
          lastUpdated={fetchedAt}
          onRefresh={refetch}
          summary={summary}
        />
        <QuickActions />
      </section>

      <StatsGrid
        currency={currency}
        isLoading={isLoading && !summary}
        stats={summary?.stats}
      />

      {isStale ? (
        <section className="zenix-dashboard__notice zenix-dashboard__notice--warning">
          <AlertTriangle size={18} />
          <div>
            <strong>Ma'lumot eskirgan bo'lishi mumkin</strong>
            <span>Oxirgi yangilanish 10 daqiqadan oldin bo'lgan.</span>
          </div>
          <button type="button" disabled={isFetching} onClick={refetch}>
            <RotateCw size={14} />
            Yangilash
          </button>
        </section>
      ) : null}

      <section className="zenix-dashboard__section">
        <div className="zenix-dashboard__section-head">
          <span>Savdo va moliya</span>
          <strong>Tanlangan davr bo'yicha tushum, foyda va savdo oqimi</strong>
        </div>
        <div className="zenix-dashboard__finance">
          <RevenueChart currency={currency} stats={summary?.stats} />
          <SalesChart
            currency={currency}
            stats={summary?.stats}
            summary={summary}
          />
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

      <section className="dashboard-modules-section">
        <ModuleHub
          as="section"
          config={modulesConfig}
          permissions={permissions}
        />
      </section>
    </main>
  );
};

export default DashboardAnalytics;
