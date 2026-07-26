export const financeSettings = {
  currentUser: "accountant.zenix",
  currentPeriodId: "2026-07",
  defaultCurrency: "UZS",
  branch: "Toshkent HQ",
  taxWarning:
    "Buxgalter va amaldagi O'zbekiston qonunchiligi asosida tasdiqlanishi kerak.",
  taxRates: [
    { id: "vat-standard", name: "QQS standart", rate: 12, group: "taxable", effectiveDate: "2026-01-01", futureRate: 12, status: "valid" },
    { id: "vat-exempt", name: "QQSsiz", rate: 0, group: "taxExempt", effectiveDate: "2026-01-01", futureRate: 0, status: "valid" },
    { id: "preferential", name: "Imtiyozli", rate: 5, group: "preferential", effectiveDate: "2026-03-01", futureRate: 5, status: "review" },
  ],
  costMethods: ["FIFO", "Weighted Average", "Moving Average"],
  selectedCostMethod: "Weighted Average",
  integrations: [
    { id: "click", name: "Click", status: "connected" },
    { id: "payme", name: "Payme", status: "connected" },
    { id: "uzum", name: "Uzum", status: "setup required" },
    { id: "humo", name: "Humo", status: "checking" },
    { id: "uzcard", name: "Uzcard", status: "connected" },
    { id: "fiscal", name: "Fiscal receipt", status: "error" },
    { id: "vcr", name: "Virtual cash register", status: "setup required" },
    { id: "ehf", name: "EHF", status: "disconnected" },
    { id: "payment-orders", name: "Bank payment orders", status: "connected" },
  ],
};
