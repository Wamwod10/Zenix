import { lazy, Suspense, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import DashboardSettings from "../components/DashboardSettings/DashboardSettings";
import DrillDownBreadcrumb from "../components/DrillDownBreadcrumb/DrillDownBreadcrumb";
import ExportModal from "../components/ExportModal/ExportModal";
import FilterDrawer from "../components/FilterDrawer/FilterDrawer";
import GlobalFilterBar from "../components/GlobalFilterBar/GlobalFilterBar";
import ReportsEmptyState from "../components/ReportsEmptyState/ReportsEmptyState";
import ReportsHeader from "../components/ReportsHeader/ReportsHeader";
import ReportsNavigation from "../components/ReportsNavigation/ReportsNavigation";
import ReportsSkeleton from "../components/ReportsSkeleton/ReportsSkeleton";
import ShareReportModal from "../components/ShareReportModal/ShareReportModal";
import { reportsNavigationGroups, reportsRouteConfig } from "../data/reportsMockData";
import { useReportsController } from "../hooks/useReportsController";
import "./Reports.scss";

const ReportsDashboard = lazy(() => import("./ReportsDashboard/ReportsDashboard"));
const SalesReports = lazy(() => import("./SalesReports/SalesReports"));
const InventoryReports = lazy(() => import("./InventoryReports/InventoryReports"));
const PurchaseReports = lazy(() => import("./PurchaseReports/PurchaseReports"));
const CRMReports = lazy(() => import("./CRMReports/CRMReports"));
const FinanceReports = lazy(() => import("./FinanceReports/FinanceReports"));
const HRReports = lazy(() => import("./HRReports/HRReports"));
const ExecutiveReports = lazy(() => import("./ExecutiveReports/ExecutiveReports"));
const AIAnalytics = lazy(() => import("./AIAnalytics/AIAnalytics"));
const KPICenter = lazy(() => import("./KPICenter/KPICenter"));
const ReportBuilder = lazy(() => import("./ReportBuilder/ReportBuilder"));
const ScheduledReports = lazy(() => import("./ScheduledReports/ScheduledReports"));
const ExportCenter = lazy(() => import("./ExportCenter/ExportCenter"));
const SavedReports = lazy(() => import("./SavedReports/SavedReports"));
const FavoriteReports = lazy(() => import("./FavoriteReports/FavoriteReports"));
const AuditLogs = lazy(() => import("./AuditLogs/AuditLogs"));
const ReportDetails = lazy(() => import("./ReportDetails/ReportDetails"));

const routeByPath = new Map(reportsRouteConfig.map((item) => [item.path, item]));
const routeByView = new Map(reportsRouteConfig.map((item) => [item.view, item]));

const PermissionDenied = ({ route, controller }) => (
  <ReportsEmptyState
    title="Bu hisobotga ruxsat yo'q"
    text={`${controller.state.roles.find((item) => item.id === controller.state.role)?.label || controller.state.role} roli uchun "${route.title}" sahifasini ochish cheklangan.`}
    actionLabel="Dashboardga qaytish"
    onAction={() => controller.actions.openReport("dashboard")}
  />
);

const ReportsNotFound = ({ onBack }) => (
  <ReportsEmptyState
    title="Hisobot sahifasi topilmadi"
    text="URL noto'g'ri yoki bu report konfiguratsiyasi hali mavjud emas."
    actionLabel="Dashboardga qaytish"
    onAction={onBack}
  />
);

const Reports = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const controller = useReportsController({ navigate });
  const relativePath = location.pathname.replace(/^\/reports\/?/, "").replace(/\/$/, "");
  const activeRoute = routeByPath.get(relativePath) || (relativePath.startsWith("details/") ? { view: "details", path: "details/:reportId" } : null);
  const detailId = relativePath.startsWith("details/") ? relativePath.split("/").slice(1).join("/") : "";
  const activeView = activeRoute?.view || "not-found";
  const {
    setSelectedReport,
    setComparisonMode,
  } = controller.actions;

  useEffect(() => {
    setSelectedReport(activeRoute?.reportType || activeRoute?.view || "not-found");
  }, [activeRoute?.reportType, activeRoute?.view, setSelectedReport]);

  useEffect(() => {
    if (activeView === "comparison") setComparisonMode("month-month");
  }, [activeView, setComparisonMode]);

  const navigateView = (view) => {
    const route = routeByView.get(view);
    navigate(`/reports/${route?.path || ""}`.replace(/\/$/, ""));
  };

  const commonProps = { controller };
  const views = {
    dashboard: <ReportsDashboard {...commonProps} />,
    health: <ExecutiveReports {...commonProps} compactHealth />,
    sales: <SalesReports {...commonProps} />,
    inventory: <InventoryReports {...commonProps} />,
    purchases: <PurchaseReports {...commonProps} />,
    crm: <CRMReports {...commonProps} />,
    finance: <FinanceReports {...commonProps} reportType="finance" />,
    profit: <FinanceReports {...commonProps} reportType="profit" />,
    "cash-flow": <FinanceReports {...commonProps} reportType="cash-flow" />,
    budget: <FinanceReports {...commonProps} reportType="budget" />,
    debt: <FinanceReports {...commonProps} reportType="debt" />,
    hr: <HRReports {...commonProps} />,
    executive: <ExecutiveReports {...commonProps} />,
    ai: <AIAnalytics {...commonProps} />,
    forecast: <AIAnalytics {...commonProps} mode="forecast" />,
    comparison: <ReportsDashboard {...commonProps} initialMode="comparison" />,
    kpi: <KPICenter {...commonProps} />,
    builder: <ReportBuilder {...commonProps} />,
    templates: <SavedReports {...commonProps} mode="templates" />,
    scheduled: <ScheduledReports {...commonProps} />,
    export: <ExportCenter {...commonProps} />,
    saved: <SavedReports {...commonProps} />,
    favorites: <FavoriteReports {...commonProps} />,
    recent: <SavedReports {...commonProps} mode="recent" />,
    sharing: <SavedReports {...commonProps} mode="sharing" />,
    permissions: <AuditLogs {...commonProps} mode="permissions" />,
    audit: <AuditLogs {...commonProps} />,
    settings: (
      <DashboardSettings
        widgets={controller.state.widgetLayout}
        onWidgetAction={controller.actions.mutateWidget}
        backendPayload={controller.state.backendPayload}
      />
    ),
    details: <ReportDetails controller={controller} reportId={detailId || "report"} />,
  };

  const guardedView = activeRoute?.permission && !controller.permissions.can(activeRoute.permission)
    ? <PermissionDenied route={activeRoute} controller={controller} />
    : views[activeView] || <ReportsNotFound onBack={() => navigate("/reports")} />;

  return (
    <main className="zenix-reports">
      <ReportsHeader
        search={controller.state.search}
        role={controller.state.role}
        roles={controller.state.roles}
        unreadCount={controller.state.unreadCount}
        canExport={controller.permissions.can("export")}
        onSearch={(value, run = false) => (run ? controller.actions.runSmartSearch(value) : controller.actions.setSearch(value))}
        onRoleChange={controller.actions.setRole}
        onOpenFilters={() => controller.actions.setActiveModal("filters")}
        onOpenExport={() => controller.actions.setActiveModal("export")}
        onOpenSettings={() => navigateView("settings")}
      />

      <ReportsNavigation groups={reportsNavigationGroups} activeView={activeView} onNavigate={navigateView} />

      <GlobalFilterBar
        filters={controller.state.filters}
        customFilters={controller.state.customFilters}
        activeCustomFilter={controller.state.activeCustomFilter}
        onFilter={controller.actions.updateFilter}
        onSaveCustom={controller.actions.saveCustomFilter}
        onApplyCustom={controller.actions.applyCustomFilter}
        onDeleteCustom={controller.actions.deleteCustomFilter}
        onReset={controller.actions.resetFilters}
        onOpenDrawer={() => controller.actions.setActiveModal("filters")}
      />

      {activeView !== "details" && (
        <DrillDownBreadcrumb level={controller.state.drillLevel} onLevel={controller.actions.setDrillLevel} />
      )}

      <Suspense fallback={<ReportsSkeleton />}>{guardedView}</Suspense>

      <FilterDrawer
        open={controller.state.activeModal === "filters"}
        filters={controller.state.filters}
        onFilter={controller.actions.updateFilter}
        onClose={controller.actions.closeModal}
      />
      <ExportModal
        open={controller.state.activeModal === "export"}
        reportName={controller.state.selectedReport}
        filters={controller.state.filters}
        pending={controller.state.pendingAction === "export"}
        onClose={controller.actions.closeModal}
        onExport={(format) => controller.actions.exportReport(format)}
      />
      <ShareReportModal
        open={controller.state.activeModal === "share"}
        reportName={controller.state.selectedReport}
        pending={controller.state.pendingAction === "share"}
        onClose={controller.actions.closeModal}
        onShare={controller.actions.shareReport}
      />

      {(controller.state.toast || controller.state.storageNotice) && (
        <div className="zenix-reports__toast" role="status">
          {controller.state.toast || controller.state.storageNotice}
        </div>
      )}
    </main>
  );
};

export default Reports;
