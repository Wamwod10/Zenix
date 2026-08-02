import { useMemo } from "react";

import { calculatePayroll } from "../utils/hrCalculations";

const usePayroll = (payroll = [], config = {}) => {
  const entries = useMemo(
    () =>
      payroll.map((entry) => ({
        ...entry,
        result: entry.result || calculatePayroll(entry, config),
      })),
    [config, payroll],
  );

  const totals = useMemo(
    () =>
      entries.reduce(
        (sum, entry) => ({
          gross: sum.gross + Number(entry.result.gross || 0),
          net: sum.net + Number(entry.result.net || 0),
          tax: sum.tax + Number(entry.result.tax || 0),
          deductions: sum.deductions + Number(entry.result.reductions || 0),
        }),
        { gross: 0, net: 0, tax: 0, deductions: 0 },
      ),
    [entries],
  );

  return { entries, totals, calculate: (entry) => calculatePayroll(entry, config) };
};

export { calculatePayroll };
export default usePayroll;
