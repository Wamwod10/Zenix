export const financeSettings = {
  currentUser: "",
  currentPeriodId: "",
  defaultCurrency: "UZS",
  branch: "",
  taxWarning:
    "Buxgalter va amaldagi O'zbekiston qonunchiligi asosida tasdiqlanishi kerak.",
  taxRates: [
    { id: "vat-standard", name: "QQS standart", rate: 0, group: "taxable", effectiveDate: "", futureRate: 0, status: "draft" },
    { id: "vat-exempt", name: "QQSsiz", rate: 0, group: "taxExempt", effectiveDate: "", futureRate: 0, status: "draft" },
  ],
  costMethods: ["FIFO", "O'rtacha og'irlik", "Harakatlanuvchi o'rtacha"],
  selectedCostMethod: "O'rtacha og'irlik",
  integrations: [
    { id: "click", name: "Click", status: "disconnected" },
    { id: "payme", name: "Payme", status: "disconnected" },
    { id: "uzum", name: "Uzum", status: "disconnected" },
    { id: "humo", name: "Humo", status: "disconnected" },
    { id: "uzcard", name: "Uzcard", status: "disconnected" },
    { id: "fiscal", name: "Fiskal chek", status: "disconnected" },
    { id: "vcr", name: "Virtual kassa", status: "disconnected" },
    { id: "ehf", name: "Elektron hisob-faktura", status: "disconnected" },
    { id: "payment-orders", name: "Bank to'lov topshiriqlari", status: "disconnected" },
  ],
};
