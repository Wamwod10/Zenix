import { useCallback, useEffect, useMemo, useState } from "react";

import {
  aiInsights as defaultAiInsights,
  defaultBuilder,
  defaultFilters,
  defaultScheduledReports,
  notifications as defaultNotifications,
  reportTemplates,
  reportsRoles,
} from "../data/reportsMockData";
import {
  getCalculatedChart,
  getCalculatedMetrics,
  getComparisonResult,
  getFilteredRows,
  getSearchIntent,
} from "../utils/reportsCalculations";
import { formatDateTime } from "../utils/reportsFormatters";
import { canReport, permissionMode } from "../utils/reportsPermissions";
import { reportsStorage } from "../utils/reportsStorage";
import { reportsMockAdapter } from "../services/reportsAdapters";

const defaultLayout = [
  { id: "revenue-trend", title: "Revenue trend", type: "Area", size: "wide", visible: true, favorite: true, minimized: false },
  { id: "profit-analysis", title: "Profit analysis", type: "Waterfall", size: "normal", visible: true, favorite: false, minimized: false },
  { id: "expense-distribution", title: "Expense distribution", type: "Donut", size: "normal", visible: true, favorite: false, minimized: false },
  { id: "sales-performance", title: "Sales performance", type: "Bar", size: "normal", visible: true, favorite: true, minimized: false },
  { id: "inventory-status", title: "Inventory status", type: "Heat Map", size: "normal", visible: true, favorite: false, minimized: false },
  { id: "customer-growth", title: "Customer growth", type: "Line", size: "normal", visible: true, favorite: false, minimized: false },
  { id: "branch-performance", title: "Branch performance", type: "Comparison", size: "wide", visible: true, favorite: false, minimized: false },
];

const makeAudit = (action, details = "", result = "success") => ({
  id: `aud-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  action,
  user: "Admin",
  role: reportsStorage.read(reportsStorage.keys.role, "owner"),
  date: formatDateTime(),
  device: "Web app",
  ip: "127.0.0.1",
  branch: "Toshkent HQ",
  result,
  details,
});

const addUniqueRecent = (items, reportId) => [
  { id: reportId, openedAt: formatDateTime() },
  ...items.filter((item) => item.id !== reportId),
].slice(0, 20);

export const useReportsController = ({ navigate }) => {
  const [filters, setFilters] = useState(() =>
    reportsStorage.read(reportsStorage.keys.filters, defaultFilters)
  );
  const [customFilters, setCustomFilters] = useState(() =>
    reportsStorage.read(reportsStorage.keys.customFilters, [])
  );
  const [role, setRoleState] = useState(() =>
    reportsStorage.read(reportsStorage.keys.role, "owner")
  );
  const [search, setSearch] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [toast, setToast] = useState("");
  const [selectedReport, setSelectedReport] = useState("dashboard");
  const [drillLevel, setDrillLevel] = useState(0);
  const [comparisonMode, setComparisonMode] = useState("month-month");
  const [savedReports, setSavedReports] = useState(() =>
    reportsStorage.read(reportsStorage.keys.savedReports, reportTemplates.slice(0, 3).map((item) => ({
      id: item.id,
      name: item.name,
      report: item.module.toLowerCase(),
      filters: defaultFilters,
      chartConfig: item.chart,
      tableColumns: item.columns,
      layout: "Dashboard",
      widgets: ["KPI", "Chart", "Table"],
      createdAt: formatDateTime(),
    })))
  );
  const [favoriteReports, setFavoriteReports] = useState(() =>
    reportsStorage.read(reportsStorage.keys.favorites, ["tpl-sales", "tpl-finance", "tpl-exec"])
  );
  const [recentReports, setRecentReports] = useState(() =>
    reportsStorage.read(reportsStorage.keys.recent, [])
  );
  const [scheduledReports, setScheduledReports] = useState(() =>
    reportsStorage.read(reportsStorage.keys.schedules, defaultScheduledReports)
  );
  const [auditLog, setAuditLog] = useState(() =>
    reportsStorage.read(reportsStorage.keys.audit, [makeAudit("report opened", "Reports Dashboard")])
  );
  const [widgetLayout, setWidgetLayout] = useState(() =>
    reportsStorage.read(reportsStorage.keys.layout, defaultLayout)
  );
  const [builder, setBuilder] = useState(() =>
    reportsStorage.read(reportsStorage.keys.builder, defaultBuilder)
  );
  const [notifications, setNotifications] = useState(() =>
    reportsStorage.read(reportsStorage.keys.notifications, defaultNotifications)
  );
  const [insights, setInsights] = useState(defaultAiInsights);

  const audit = useCallback((action, details = "", result = "success") => {
    setAuditLog((current) => [makeAudit(action, details, result), ...current].slice(0, 80));
  }, []);

  useEffect(() => reportsStorage.write(reportsStorage.keys.filters, filters), [filters]);
  useEffect(() => reportsStorage.write(reportsStorage.keys.customFilters, customFilters), [customFilters]);
  useEffect(() => reportsStorage.write(reportsStorage.keys.role, role), [role]);
  useEffect(() => reportsStorage.write(reportsStorage.keys.savedReports, savedReports), [savedReports]);
  useEffect(() => reportsStorage.write(reportsStorage.keys.favorites, favoriteReports), [favoriteReports]);
  useEffect(() => reportsStorage.write(reportsStorage.keys.recent, recentReports), [recentReports]);
  useEffect(() => reportsStorage.write(reportsStorage.keys.schedules, scheduledReports), [scheduledReports]);
  useEffect(() => reportsStorage.write(reportsStorage.keys.audit, auditLog), [auditLog]);
  useEffect(() => reportsStorage.write(reportsStorage.keys.layout, widgetLayout), [widgetLayout]);
  useEffect(() => reportsStorage.write(reportsStorage.keys.builder, builder), [builder]);
  useEffect(() => reportsStorage.write(reportsStorage.keys.notifications, notifications), [notifications]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const metrics = useMemo(() => getCalculatedMetrics(filters), [filters]);
  const rows = useMemo(() => getFilteredRows(filters, search), [filters, search]);
  const charts = useMemo(() => getCalculatedChart(filters), [filters]);
  const comparison = useMemo(() => getComparisonResult(metrics, comparisonMode), [metrics, comparisonMode]);
  const unreadCount = notifications.filter((item) => !item.read).length;

  const updateFilter = useCallback((key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    audit("filter changed", `${key}: ${value}`);
  }, [audit]);

  const applyFilters = useCallback((nextFilters) => {
    setFilters((current) => ({ ...current, ...nextFilters }));
    audit("filter changed", "Smart/global filter applied");
  }, [audit]);

  const saveCustomFilter = useCallback((name) => {
    if (!name.trim()) return;
    setCustomFilters((current) => [{ id: `cf-${Date.now()}`, name, filters }, ...current].slice(0, 10));
    audit("filter changed", `Custom filter saved: ${name}`);
    setToast("Custom filter saqlandi.");
  }, [audit, filters]);

  const openReport = useCallback((reportId) => {
    const route = reportId === "dashboard" ? "/reports" : `/reports/${reportId}`;
    setSelectedReport(reportId);
    setRecentReports((current) => addUniqueRecent(current, reportId));
    audit("report opened", reportId);
    navigate(route);
  }, [audit, navigate]);

  const runSmartSearch = useCallback((query) => {
    setSearch(query);
    const intent = getSearchIntent(query);
    if (!intent) return;
    applyFilters(intent.filters);
    openReport(intent.report);
    setToast(`Smart Search: ${intent.report} ochildi.`);
  }, [applyFilters, openReport]);

  const saveReport = useCallback((name = builder.name, report = selectedReport) => {
    if (!canReport(role, "create")) {
      audit("permission denied", "save report", "denied");
      setToast("Bu rol report yaratishga ruxsatga ega emas.");
      return;
    }
    const item = {
      id: `saved-${Date.now()}`,
      name,
      report,
      filters,
      dateRange: `${filters.startDate} - ${filters.endDate}`,
      chartConfig: builder.chartType,
      tableColumns: builder.columns,
      layout: builder.layout,
      widgets: builder.widgets,
      createdAt: formatDateTime(),
    };
    setSavedReports((current) => [item, ...current]);
    audit("report created", item.name);
    setToast("Report saqlandi.");
  }, [audit, builder, filters, role, selectedReport]);

  const toggleFavorite = useCallback((reportId) => {
    setFavoriteReports((current) =>
      current.includes(reportId) ? current.filter((id) => id !== reportId) : [reportId, ...current]
    );
    audit("widget changed", `Favorite toggled: ${reportId}`);
  }, [audit]);

  const exportReport = useCallback((format = "PDF", reportName = selectedReport) => {
    if (!canReport(role, "export")) {
      audit("permission denied", "export report", "denied");
      setToast("Bu rol eksport qilishga ruxsatga ega emas.");
      return null;
    }
    const result = reportsMockAdapter.exportReport({ reportName, format, filters });
    audit("report exported", `${reportName} ${format}`);
    setToast(`${format} export tayyorlandi.`);
    return result;
  }, [audit, filters, role, selectedReport]);

  const shareReport = useCallback((payload) => {
    if (!canReport(role, "share")) {
      audit("permission denied", "share report", "denied");
      setToast("Bu rol ulashishga ruxsatga ega emas.");
      return null;
    }
    const result = reportsMockAdapter.shareReport(payload);
    audit("report shared", `${payload.reportName} via ${payload.channel}`);
    setToast("Share so'rovi yaratildi.");
    return result;
  }, [audit, role]);

  const mutateWidget = useCallback((widgetId, action) => {
    setWidgetLayout((current) => {
      const index = current.findIndex((item) => item.id === widgetId);
      const widget = current[index];
      if (!widget) return current;

      if (action === "delete") return current.filter((item) => item.id !== widgetId);
      if (action === "duplicate") {
        return [...current, { ...widget, id: `${widget.id}-${Date.now()}`, title: `${widget.title} copy` }];
      }
      if (action === "move") {
        const next = [...current];
        const [moved] = next.splice(index, 1);
        next.splice(Math.max(0, index - 1), 0, moved);
        return next;
      }

      return current.map((item) => {
        if (item.id !== widgetId) return item;
        if (action === "resize") return { ...item, size: item.size === "wide" ? "normal" : "wide" };
        if (action === "minimize") return { ...item, minimized: !item.minimized };
        if (action === "hide") return { ...item, visible: false };
        if (action === "favorite") return { ...item, favorite: !item.favorite };
        if (action === "refresh") return { ...item, refreshedAt: formatDateTime() };
        return item;
      });
    });
    audit("widget changed", `${action}: ${widgetId}`);
  }, [audit]);

  const createSchedule = useCallback((schedule) => {
    if (!canReport(role, "schedule")) {
      audit("permission denied", "scheduled report created", "denied");
      setToast("Bu rol scheduled report yaratolmaydi.");
      return;
    }
    setScheduledReports((current) => [{ ...schedule, id: `sch-${Date.now()}`, status: "active" }, ...current]);
    audit("scheduled report created", schedule.name);
    setToast("Scheduled report yaratildi.");
  }, [audit, role]);

  const updateSchedule = useCallback((scheduleId, patch) => {
    setScheduledReports((current) =>
      current.map((item) => (item.id === scheduleId ? { ...item, ...patch } : item))
    );
    audit("scheduled report created", `Schedule updated: ${scheduleId}`);
  }, [audit]);

  const deleteSchedule = useCallback((scheduleId) => {
    setScheduledReports((current) => current.filter((item) => item.id !== scheduleId));
    audit("scheduled report created", `Schedule deleted: ${scheduleId}`);
  }, [audit]);

  const runAiAction = useCallback((insight, action) => {
    audit("AI insight viewed", `${insight.title}: ${action}`);
    if (action === "open") openReport(insight.report);
    if (action === "filter") applyFilters({ risk: "high", priority: insight.priority });
    if (action === "compare") setComparisonMode("month-month");
    if (action === "save") saveReport(insight.title, insight.report);
    if (action === "dismiss" || action === "resolve") {
      setInsights((current) => current.map((item) => (item.id === insight.id ? { ...item, status: action } : item)));
    }
    setToast("AI action bajarildi.");
  }, [applyFilters, audit, openReport, saveReport]);

  const setRole = useCallback((nextRole) => {
    setRoleState(nextRole);
    audit("permission changed", `Role switched to ${nextRole}`);
  }, [audit]);

  return {
    state: {
      filters,
      customFilters,
      role,
      roles: reportsRoles,
      search,
      activeModal,
      selectedReport,
      drillLevel,
      comparisonMode,
      savedReports,
      favoriteReports,
      recentReports,
      scheduledReports,
      auditLog,
      widgetLayout,
      builder,
      notifications,
      insights,
      metrics,
      rows,
      charts,
      comparison,
      unreadCount,
      toast,
      templates: reportTemplates,
      backendPayload: reportsMockAdapter.createBackendPayload({
        filters,
        savedReports,
        scheduledReports,
        builder,
        widgetLayout,
      }),
    },
    permissions: {
      can: (action) => canReport(role, action),
      mode: (action) => permissionMode(role, action),
    },
    actions: {
      setSearch,
      runSmartSearch,
      updateFilter,
      applyFilters,
      saveCustomFilter,
      openReport,
      setActiveModal,
      closeModal: () => setActiveModal(null),
      setRole,
      setSelectedReport,
      setDrillLevel,
      setComparisonMode,
      setBuilder,
      saveReport,
      toggleFavorite,
      exportReport,
      shareReport,
      mutateWidget,
      createSchedule,
      updateSchedule,
      deleteSchedule,
      runAiAction,
      markNotificationRead: (id) => {
        setNotifications((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)));
        audit("notification viewed", id);
      },
      audit,
    },
  };
};
