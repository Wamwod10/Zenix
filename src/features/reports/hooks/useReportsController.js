import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { selectReportsDataset } from "../../../core/businessOS/businessOSSlice";
import {
  aiInsights as defaultAiInsights,
  defaultBuilder,
  defaultFilters,
  defaultScheduledReports,
  notifications as defaultNotifications,
  reportTemplates,
  reportsRouteConfig,
  reportsRoles,
} from "../data/reportsMockData";
import {
  getCalculatedChart,
  getCalculatedMetrics,
  getComparisonResult,
  getSearchIntent,
} from "../utils/reportsCalculations";
import { formatDateTime, getReportTitle } from "../utils/reportsFormatters";
import { canReport, permissionMode } from "../utils/reportsPermissions";
import { reportsStorage } from "../utils/reportsStorage";
import { reportsMockAdapter } from "../services/reportsAdapters";

const defaultLayout = [
  { id: "revenue-trend", title: "Daromad dinamikasi", type: "Area", size: "wide", visible: true, favorite: true, minimized: false },
  { id: "profit-analysis", title: "Foyda tahlili", type: "Waterfall", size: "normal", visible: true, favorite: false, minimized: false },
  { id: "expense-distribution", title: "Xarajat tarkibi", type: "Donut", size: "normal", visible: true, favorite: false, minimized: false },
  { id: "sales-performance", title: "Savdo samaradorligi", type: "Bar", size: "normal", visible: true, favorite: true, minimized: false },
  { id: "inventory-status", title: "Ombor holati", type: "Heat Map", size: "normal", visible: true, favorite: false, minimized: false },
  { id: "customer-growth", title: "Mijozlar o'sishi", type: "Line", size: "normal", visible: true, favorite: false, minimized: false },
  { id: "branch-performance", title: "Filiallar taqqoslashi", type: "Comparison", size: "wide", visible: true, favorite: false, minimized: false },
];

const makeAudit = (action, details = "", result = "success") => ({
  id: `aud-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  action,
  user: "Tizim",
  role: reportsStorage.read(reportsStorage.keys.role, "owner"),
  date: formatDateTime(),
  device: "Web app",
  ip: "127.0.0.1",
  branch: "",
  result,
  details,
});

const addUniqueRecent = (items, reportId) => [
  { id: reportId, name: getReportTitle(reportId), openedAt: formatDateTime() },
  ...items.filter((item) => item.id !== reportId),
].slice(0, 20);

const reportPathMap = new Map(reportsRouteConfig.map((item) => [item.view, item.path]));

const number = (value) => Number(value || 0);

const buildMetric = (base, value, previous = 0) => {
  const percent = previous ? ((value - previous) / Math.abs(previous)) * 100 : 0;
  return {
    ...base,
    value: Math.round(value),
    previous: Math.round(previous),
    percent: Number(percent.toFixed(1)),
    trend: percent > 0 ? "up" : percent < 0 ? "down" : "flat",
    status: value > 0 ? "healthy" : "empty",
    forecast: Math.round(value * 1.05),
    progress: base.goal ? Math.min(100, Math.round((value / base.goal) * 100)) : value > 0 ? 100 : 0,
    lastUpdated: "Hozir",
  };
};

const buildRealReports = (dataset, fallbackMetrics, filters, search) => {
  const revenue = dataset.finance
    .filter((trx) => trx.type === "income")
    .reduce((sum, trx) => sum + number(trx.amount), 0);
  const expenses = dataset.finance
    .filter((trx) => trx.type === "expense")
    .reduce((sum, trx) => sum + number(trx.amount), 0);
  const inventory = dataset.stock.reduce((sum, balance) => {
    const product = dataset.products.find((item) => item.id === balance.productId);
    return sum + number(balance.onHand) * number(product?.cost);
  }, 0);
  const debt = dataset.finance
    .filter((trx) => trx.cashDirection === "receivable" || trx.accountId === "2000")
    .reduce((sum, trx) => sum + number(trx.amount), 0);
  const values = {
    revenue,
    profit: revenue - expenses,
    inventory,
    customers: dataset.customers.length,
    employees: dataset.employees.length,
    debt,
  };
  const metrics = fallbackMetrics.map((metric) => buildMetric(metric, values[metric.id] || 0, metric.previous || 0));
  const query = search.trim().toLowerCase();
  const rows = [
    ...dataset.sales.map((sale) => ({
      id: sale.id,
      name: sale.receiptNumber || sale.id,
      module: "Sales",
      branch: sale.branchId || "all",
      owner: sale.cashierId || "",
      value: number(sale.total),
      change: 0,
      status: sale.status || "Posted",
      risk: "low",
    })),
    ...dataset.purchases.map((order) => ({
      id: order.id,
      name: order.number || order.id,
      module: "Purchases",
      branch: order.branchId || "all",
      owner: order.buyer?.name || "",
      value: (order.items || []).reduce((sum, item) => sum + number(item.quantity) * number(item.price), 0),
      change: 0,
      status: order.status,
      risk: order.status === "rejected" ? "high" : "low",
    })),
    ...dataset.finance.map((trx) => ({
      id: trx.id,
      name: trx.description || trx.reference || trx.id,
      module: "Finance",
      branch: trx.branch || "all",
      owner: trx.createdBy || "",
      value: number(trx.amount),
      change: 0,
      status: trx.status || "Posted",
      risk: trx.cashDirection === "receivable" ? "medium" : "low",
    })),
  ].filter((row) => {
    const matchesBranch = filters.branch === "all" || row.branch === filters.branch;
    const matchesStatus = filters.status === "all" || row.status === filters.status;
    const matchesSearch = !query || `${row.name} ${row.module} ${row.owner}`.toLowerCase().includes(query);
    return matchesBranch && matchesStatus && matchesSearch;
  });

  const charts = ["Savdo", "Moliya", "Ombor", "CRM", "HR", "Xarid"].map((label, index) => ({
    label,
    value: [revenue, expenses, inventory, dataset.customers.length, dataset.employees.length, dataset.purchases.length][index] || 0,
    compare: 0,
    forecast: Math.round(([revenue, expenses, inventory, dataset.customers.length, dataset.employees.length, dataset.purchases.length][index] || 0) * 1.05),
  }));

  return { metrics, rows, charts };
};

export const useReportsController = ({ navigate }) => {
  const reportsDataset = useSelector(selectReportsDataset);
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
  const [storageNotice, setStorageNotice] = useState("");
  const [pendingAction, setPendingAction] = useState("");
  const [activeCustomFilter, setActiveCustomFilter] = useState("");
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
    reportsStorage.read(reportsStorage.keys.favorites, [])
  );
  const [recentReports, setRecentReports] = useState(() =>
    reportsStorage.read(reportsStorage.keys.recent, [])
  );
  const [scheduledReports, setScheduledReports] = useState(() =>
    reportsStorage.read(reportsStorage.keys.schedules, defaultScheduledReports)
  );
  const [auditLog, setAuditLog] = useState(() =>
    reportsStorage.read(reportsStorage.keys.audit, [])
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
  const [shareHistory, setShareHistory] = useState(() =>
    reportsStorage.read(reportsStorage.keys.shareHistory, [])
  );
  const [exportHistory, setExportHistory] = useState(() =>
    reportsStorage.read(reportsStorage.keys.exportHistory, [])
  );
  const [insights, setInsights] = useState(defaultAiInsights);

  const audit = useCallback((action, details = "", result = "success") => {
    setAuditLog((current) => [makeAudit(action, details, result), ...current].slice(0, 80));
  }, []);

  const persist = useCallback((key, value) => {
    const result = reportsStorage.write(key, value);
    if (!result?.ok) setStorageNotice("Brauzer saqlash xotirasi ishlamadi, o'zgarishlar faqat joriy sessiyada qoladi.");
  }, []);

  useEffect(() => persist(reportsStorage.keys.filters, filters), [filters, persist]);
  useEffect(() => persist(reportsStorage.keys.customFilters, customFilters), [customFilters, persist]);
  useEffect(() => persist(reportsStorage.keys.role, role), [role, persist]);
  useEffect(() => persist(reportsStorage.keys.savedReports, savedReports), [savedReports, persist]);
  useEffect(() => persist(reportsStorage.keys.favorites, favoriteReports), [favoriteReports, persist]);
  useEffect(() => persist(reportsStorage.keys.recent, recentReports), [recentReports, persist]);
  useEffect(() => persist(reportsStorage.keys.schedules, scheduledReports), [scheduledReports, persist]);
  useEffect(() => persist(reportsStorage.keys.audit, auditLog), [auditLog, persist]);
  useEffect(() => persist(reportsStorage.keys.layout, widgetLayout), [widgetLayout, persist]);
  useEffect(() => persist(reportsStorage.keys.builder, builder), [builder, persist]);
  useEffect(() => persist(reportsStorage.keys.notifications, notifications), [notifications, persist]);
  useEffect(() => persist(reportsStorage.keys.shareHistory, shareHistory), [shareHistory, persist]);
  useEffect(() => persist(reportsStorage.keys.exportHistory, exportHistory), [exportHistory, persist]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const fallbackMetrics = useMemo(() => getCalculatedMetrics(filters), [filters]);
  const realReports = useMemo(
    () => buildRealReports(reportsDataset, fallbackMetrics, filters, search),
    [fallbackMetrics, filters, reportsDataset, search],
  );
  const metrics = realReports.metrics;
  const rows = realReports.rows;
  const charts = realReports.charts.length ? realReports.charts : getCalculatedChart(filters);
  const comparison = useMemo(() => getComparisonResult(metrics, comparisonMode), [metrics, comparisonMode]);
  const unreadCount = notifications.filter((item) => !item.read).length;

  const updateFilter = useCallback((key, value) => {
    setFilters((current) => {
      const next = { ...current, [key]: value };
      if (key === "startDate" || key === "endDate") next.datePreset = "custom";
      if (next.startDate && next.endDate && next.startDate > next.endDate) {
        if (key === "startDate") next.endDate = next.startDate;
        if (key === "endDate") next.startDate = next.endDate;
        setToast("Sana oralig'i avtomatik to'g'rilandi.");
      }
      return next;
    });
    setActiveCustomFilter("");
    audit("filter changed", `${key}: ${value}`);
  }, [audit]);

  const applyFilters = useCallback((nextFilters) => {
    setFilters((current) => ({ ...current, ...nextFilters }));
    audit("filter changed", "Smart/global filter applied");
  }, [audit]);

  const saveCustomFilter = useCallback((name) => {
    const normalizedName = name.trim();
    if (!normalizedName) {
      setToast("Filter nomini kiriting.");
      return;
    }
    if (customFilters.some((item) => item.name.toLowerCase() === normalizedName.toLowerCase())) {
      setToast("Bu nomdagi filter allaqachon bor.");
      return;
    }
    setCustomFilters((current) => [{ id: `cf-${Date.now()}`, name: normalizedName, filters }, ...current].slice(0, 10));
    audit("filter changed", `Custom filter saved: ${name}`);
    setToast("Custom filter saqlandi.");
  }, [audit, customFilters, filters]);

  const applyCustomFilter = useCallback((id) => {
    const item = customFilters.find((filter) => filter.id === id);
    if (!item) return;
    setActiveCustomFilter(id);
    applyFilters(item.filters);
    setToast(`${item.name} filteri qo'llandi.`);
  }, [applyFilters, customFilters]);

  const deleteCustomFilter = useCallback((id) => {
    setCustomFilters((current) => current.filter((item) => item.id !== id));
    if (activeCustomFilter === id) setActiveCustomFilter("");
    audit("filter changed", `Custom filter deleted: ${id}`);
  }, [activeCustomFilter, audit]);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
    setActiveCustomFilter("");
    audit("filter changed", "All filters reset");
    setToast("Barcha filterlar tozalandi.");
  }, [audit]);

  const openReport = useCallback((reportId) => {
    const path = reportPathMap.get(reportId);
    const route = reportId === "dashboard"
      ? "/reports"
      : path !== undefined
        ? `/reports/${path}`.replace(/\/$/, "")
        : `/reports/details/${reportId}`;
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
    const normalizedName = name.trim();
    if (!normalizedName) {
      setToast("Hisobot nomini kiriting.");
      return;
    }
    if (savedReports.some((item) => item.name.toLowerCase() === normalizedName.toLowerCase())) {
      setToast("Bu nomdagi hisobot allaqachon saqlangan.");
      return;
    }
    const item = {
      id: `saved-${Date.now()}`,
      name: normalizedName,
      report,
      filters,
      dateRange: `${filters.startDate} - ${filters.endDate}`,
      chartConfig: builder.chartType,
      tableColumns: builder.columns,
      layout: builder.layout,
      widgets: builder.widgets,
      snapshot: {
        filters,
        comparisonMode,
        widgetLayout,
        selectedReport: report,
      },
      createdAt: formatDateTime(),
    };
    setSavedReports((current) => [item, ...current]);
    audit("report created", item.name);
    setToast("Report saqlandi.");
  }, [audit, builder, comparisonMode, filters, role, savedReports, selectedReport, widgetLayout]);

  const toggleFavorite = useCallback((reportId) => {
    setFavoriteReports((current) =>
      current.includes(reportId) ? current.filter((id) => id !== reportId) : [reportId, ...current]
    );
    audit("widget changed", `Favorite toggled: ${reportId}`);
  }, [audit]);

  const removeSavedReport = useCallback((reportId) => {
    setSavedReports((current) => current.filter((item) => item.id !== reportId));
    setFavoriteReports((current) => current.filter((id) => id !== reportId));
    audit("report deleted", reportId);
    setToast("Saqlangan hisobot o'chirildi.");
  }, [audit]);

  const duplicateSavedReport = useCallback((report) => {
    const copy = {
      ...report,
      id: `saved-${Date.now()}`,
      name: `${report.name} nusxasi`,
      createdAt: formatDateTime(),
    };
    setSavedReports((current) => [copy, ...current]);
    audit("report created", copy.name);
    setToast("Hisobot nusxasi yaratildi.");
  }, [audit]);

  const exportReport = useCallback((format = "PDF", reportName = selectedReport) => {
    if (pendingAction === "export") return null;
    if (!canReport(role, "export")) {
      audit("permission denied", "export report", "denied");
      setToast("Bu rol eksport qilishga ruxsatga ega emas.");
      return null;
    }
    setPendingAction("export");
    const result = reportsMockAdapter.exportReport({ reportName, format, filters });
    setExportHistory((current) => [result, ...current].slice(0, 20));
    audit("report exported", `${reportName} ${format}`);
    setToast(`${format} export tayyorlandi.`);
    setPendingAction("");
    return result;
  }, [audit, filters, pendingAction, role, selectedReport]);

  const shareReport = useCallback((payload) => {
    if (pendingAction === "share") return null;
    if (!canReport(role, "share")) {
      audit("permission denied", "share report", "denied");
      setToast("Bu rol ulashishga ruxsatga ega emas.");
      return null;
    }
    if (!payload.recipient || !payload.channel || !payload.permission) {
      setToast("Ulashish uchun kanal, qabul qiluvchi va ruxsatni tanlang.");
      return null;
    }
    setPendingAction("share");
    const result = reportsMockAdapter.shareReport(payload);
    audit("report shared", `${payload.reportName} via ${payload.channel}`);
    setShareHistory((current) => [result, ...current].slice(0, 20));
    setToast("Ulashish so'rovi yaratildi.");
    setPendingAction("");
    return result;
  }, [audit, pendingAction, role]);

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

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    audit("notification viewed", "All notifications marked read");
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

  const actions = useMemo(() => ({
    setSearch,
    runSmartSearch,
    updateFilter,
    applyFilters,
    saveCustomFilter,
    applyCustomFilter,
    deleteCustomFilter,
    resetFilters,
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
    removeSavedReport,
    duplicateSavedReport,
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
    markAllNotificationsRead,
    audit,
  }), [
    applyCustomFilter,
    applyFilters,
    audit,
    createSchedule,
    deleteCustomFilter,
    deleteSchedule,
    duplicateSavedReport,
    exportReport,
    markAllNotificationsRead,
    mutateWidget,
    openReport,
    removeSavedReport,
    resetFilters,
    runAiAction,
    runSmartSearch,
    saveCustomFilter,
    saveReport,
    setRole,
    shareReport,
    toggleFavorite,
    updateFilter,
    updateSchedule,
  ]);

  return {
    state: {
      filters,
      customFilters,
      role,
      roles: reportsRoles,
      search,
      activeModal,
      activeCustomFilter,
      pendingAction,
      storageNotice,
      selectedReport,
      selectedReportTitle: getReportTitle(selectedReport),
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
      shareHistory,
      exportHistory,
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
    actions,
  };
};
