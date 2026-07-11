export const paymentAdapter = {
  async charge(payment) {
    return {
      ok: true,
      providerReference: `${payment.method}-${Date.now().toString(36)}`,
      completedAt: new Date().toISOString(),
    };
  },
};

export const offlineSyncAdapter = {
  async syncSales(sales = []) {
    return sales.map((sale) => ({
      ...sale,
      syncedAt: new Date().toISOString(),
      syncStatus: "synced",
    }));
  },
};

export const receiptPrinterAdapter = {
  print() {
    if (typeof window !== "undefined") {
      window.print();
    }
  },
};
