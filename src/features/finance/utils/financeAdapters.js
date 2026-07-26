const wait = (duration = 360) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });

export const financeAdapter = {
  async postTransaction(transaction) {
    await wait();
    return {
      ok: true,
      ledgerReference: `GL-${transaction.id}`,
    };
  },

  async importBankStatement() {
    await wait(620);
    return {
      ok: true,
      imported: 6,
      source: "bank-statement-preview.csv",
    };
  },

  async exportReport(reportName) {
    await wait();
    return {
      ok: true,
      fileName: `${reportName.toLowerCase().replaceAll(" ", "-")}.xlsx`,
    };
  },

  async fetchCbuRates() {
    await wait(520);
    return {
      ok: true,
      rates: {
        USD: 12650,
        EUR: 13740,
        RUB: 142,
      },
    };
  },

  warehouseCostingAdapter: {
    source: "ZENIX Warehouse",
    status: "ready-for-api",
    endpoints: ["/warehouse/valuation", "/warehouse/cogs", "/warehouse/landed-cost"],
  },

  uzbekistanIntegrationAdapter: {
    providers: ["Click", "Payme", "Uzum", "Humo", "Uzcard", "Fiscal", "EHF"],
    status: "mock-contract-ready",
  },
};
