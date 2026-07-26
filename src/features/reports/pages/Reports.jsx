import { lazy, Suspense, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import DashboardSettings from "../components/DashboardSettings/DashboardSettings";
import DrillDownBreadcrumb from "../components/DrillDownBreadcrumb/DrillDownBreadcrumb";
import ExportModal from "../components/ExportModal/ExportModal";
import FilterDrawer from "../components/FilterDrawer/FilterDrawer";
import GlobalFilterBar from "../components/GlobalFilterBar/GlobalFilterBar";
import ReportsHeader from "../components/ReportsHeader/ReportsHeader";
import ReportsNavigation from "../components/ReportsNavigation/ReportsNavigation";
import ReportsSkeleton from "../components/ReportsSkeleton/ReportsSkeleton";
import ShareReportModal from "../components/ShareReportModal/ShareReportModal";
import { reportsNavigationGroups } from "../data/reportsMockData";
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

const segmentToView = {
  "": "dashboard",
  "business-health": "dashboard",
  sales: "sales",
  inventory: "inventory",
  purchases: "purchases",
  crm: "crm",
  finance: "finance",
  profit: "profit",
  "cash-flow": "cash-flow",
  budget: "budget",
  debt: "debt",
  hr: "hr",
  executive: "executive",
  ai: "ai",
  forecast: "forecast",
  comparison: "comparison",
  kpi: "kpi",
  builder: "builder",
  templates: "templates",
  scheduled: "scheduled",
  export: "export",
  saved: "saved",
  favorites: "favorites",
  recent: "recent",
  sharing: "sharing",
  permissions: "permissions",
  audit: "audit",
  settings: "settings",
};

const viewToPath = {
  dashboard: "",
  health: "business-health",
  sales: "sales",
  inventory: "inventory",
  purchases: "purchases",
  crm: "crm",
  finance: "finance",
  profit: "profit",
  "cash-flow": "cash-flow",
  budget: "budget",
  debt: "debt",
  hr: "hr",
  executive: "executive",
  ai: "ai",
  forecast: "forecast",
  comparison: "comparison",
  kpi: "kpi",
  builder: "builder",
  templates: "templates",
  scheduled: "scheduled",
  export: "export",
  saved: "saved",
  favorites: "favorites",
  recent: "recent",
  sharing: "sharing",
  permissions: "permissions",
  audit: "audit",
  settings: "settings",
};

const Reports = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const controller = useReportsController({ navigate });
  const pathParts = location.pathname.replace(/^\/reports\/?/, "").split("/").filter(Boolean);
  const segment = pathParts[0] || "";
  const detailId = pathParts[1];
  const activeView = segmentToView[segment] || "details";

  useEffect(() => {
    controller.actions.setSelectedReport(activeView);
  }, [activeView, controller.actions]);

  const navigateView = (view) => {
    navigate(`/reports/${viewToPath[view] || ""}`.replace(/\/$/, ""));
  };

  const applyCustomFilter = (id) => {
    const item = controller.state.customFilters.find((filter) => filter.id === id);
    if (item) controller.actions.applyFilters(item.filters);
  };

  const commonProps = { controller };
  const views = {
    dashboard: <ReportsDashboard {...commonProps} />,
    sales: <SalesReports {...commonProps} />,
    inventory: <InventoryReports {...commonProps} />,
    purchases: <PurchaseReports {...commonProps} />,
    crm: <CRMReports {...commonProps} />,
    finance: <FinanceReports {...commonProps} />,
    profit: <FinanceReports {...commonProps} />,
    "cash-flow": <FinanceReports {...commonProps} />,
    budget: <FinanceReports {...commonProps} />,
    debt: <FinanceReports {...commonProps} />,
    hr: <HRReports {...commonProps} />,
    executive: controller.permissions.can("executive") ? <ExecutiveReports {...commonProps} /> : <AuditLogs {...commonProps} mode="permissions" />,
    ai: controller.permissions.can("ai") ? <AIAnalytics {...commonProps} /> : <AuditLogs {...commonProps} mode="permissions" />,
    forecast: <AIAnalytics {...commonProps} />,
    comparison: <ReportsDashboard {...commonProps} />,
    kpi: controller.permissions.can("builder") ? <KPICenter {...commonProps} /> : <AuditLogs {...commonProps} mode="permissions" />,
    builder: controller.permissions.can("builder") ? <ReportBuilder {...commonProps} /> : <AuditLogs {...commonProps} mode="permissions" />,
    templates: <SavedReports {...commonProps} />,
    scheduled: <ScheduledReports {...commonProps} />,
    export: <ExportCenter {...commonProps} />,
    saved: <SavedReports {...commonProps} />,
    favorites: <FavoriteReports {...commonProps} />,
    recent: <SavedReports {...commonProps} mode="recent" />,
    sharing: <SavedReports {...commonProps} />,
    permissions: <AuditLogs {...commonProps} mode="permissions" />,
    audit: <AuditLogs {...commonProps} />,
    settings: (
      <DashboardSettings
        widgets={controller.state.widgetLayout}
        onWidgetAction={controller.actions.mutateWidget}
        backendPayload={controller.state.backendPayload}
      />
    ),
    details: <ReportDetails {...commonProps} reportId={detailId || segment || "report"} />,
  };

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
        onFilter={controller.actions.updateFilter}
        onSaveCustom={controller.actions.saveCustomFilter}
        onApplyCustom={applyCustomFilter}
        onOpenDrawer={() => controller.actions.setActiveModal("filters")}
      />

      <DrillDownBreadcrumb level={controller.state.drillLevel} onLevel={controller.actions.setDrillLevel} />

      <Suspense fallback={<ReportsSkeleton />}>{views[activeView] || views.details}</Suspense>

      <FilterDrawer
        open={controller.state.activeModal === "filters"}
        filters={controller.state.filters}
        onFilter={controller.actions.updateFilter}
        onClose={controller.actions.closeModal}
      />
      <ExportModal
        open={controller.state.activeModal === "export"}
        reportName={controller.state.selectedReport}
        onClose={controller.actions.closeModal}
        onExport={(format) => controller.actions.exportReport(format)}
      />
      <ShareReportModal
        open={controller.state.activeModal === "share"}
        reportName={controller.state.selectedReport}
        onClose={controller.actions.closeModal}
        onShare={controller.actions.shareReport}
      />

      {controller.state.toast && (
        <div className="zenix-reports__toast" role="status">
          {controller.state.toast}
        </div>
      )}
    </main>
  );
};

export default Reports;
