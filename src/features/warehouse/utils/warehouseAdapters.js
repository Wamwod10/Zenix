const wait = (duration = 420) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });

export const warehouseMockAdapter = {
  async exportReport(reportName) {
    await wait();
    return {
      ok: true,
      fileName: `${reportName.toLowerCase().replaceAll(" ", "-")}.xlsx`,
    };
  },

  async downloadTemplate() {
    await wait(300);
    return { ok: true, fileName: "zenix-wms-import-template.csv" };
  },

  async validateImport(fileName = "import.csv") {
    await wait(700);
    return {
      fileName,
      validRows: 38,
      duplicateRows: 2,
      errorRows: [
        { row: 7, field: "SKU", message: "SKU bo'sh" },
        { row: 19, field: "Barcode", message: "Barcode takrorlangan" },
      ],
      mapping: {
        name: "Mahsulot nomi",
        sku: "SKU",
        quantity: "Qoldiq",
        cost: "Tannarx",
        location: "Joylashuv",
      },
    };
  },
};
