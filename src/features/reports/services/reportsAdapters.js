import { formatDateTime } from "../utils/reportsFormatters";

export const reportsMockAdapter = {
  exportReport({ reportName, format, filters }) {
    return {
      id: `exp-${Date.now()}`,
      reportName,
      format,
      filters,
      status: "ready",
      generatedAt: formatDateTime(),
      rowsCount: 12540,
      executionTime: "1.4s",
      encrypted: true,
      watermark: "ZENIX Reports Preview",
    };
  },

  shareReport({ reportName, channel, recipient, permission }) {
    return {
      id: `share-${Date.now()}`,
      reportName,
      channel,
      recipient,
      permission,
      status: "queued",
      sharedAt: formatDateTime(),
    };
  },

  createBackendPayload(state) {
    return {
      filters: state.filters,
      savedReports: state.savedReports,
      scheduledReports: state.scheduledReports,
      builder: state.builder,
      widgetLayout: state.widgetLayout,
      auditVersion: "reports-v1",
    };
  },
};
