import { receiptPrinterAdapter } from "./posAdapters";

export const printReceipt = (sale) => {
  receiptPrinterAdapter.print(sale);
};
