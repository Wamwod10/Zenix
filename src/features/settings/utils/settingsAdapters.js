const wait = (ms = 650) => new Promise((resolve) => window.setTimeout(resolve, ms));

export const settingsMockAdapter = {
  async save(pageId, patch) {
    await wait();
    return {
      ok: true,
      pageId,
      patch,
      syncedAt: new Date().toISOString(),
    };
  },
  async exportSettings(pageId) {
    await wait(500);
    return {
      fileName: `zenix-${pageId}-settings.json`,
      rows: 42,
    };
  },
  async importSettings(pageId) {
    await wait(720);
    return {
      pageId,
      validRows: 38,
      warnings: 3,
      errors: 0,
    };
  },
  async testIntegration(name) {
    await wait(900);
    return {
      name,
      status: "connected",
      latency: Math.round(80 + Math.random() * 220),
    };
  },
  async runBackup(type = "manual") {
    await wait(1200);
    return {
      id: `backup-${Date.now().toString(36)}`,
      type,
      status: "completed",
      sizeGb: 8.4,
      version: "v2026.07.24",
      encrypted: true,
      createdAt: new Date().toISOString(),
    };
  },
};
