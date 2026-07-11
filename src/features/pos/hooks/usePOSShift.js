import { useCallback, useEffect, useState } from "react";

import { createPOSId } from "../utils/posIds";
import { readShift, writeShift } from "../utils/posStorage";

const createShift = ({ openingCash = 0, cashier = "Admin" } = {}) => ({
  id: createPOSId("shift"),
  status: "open",
  cashier,
  openedAt: new Date().toISOString(),
  closedAt: null,
  openingCash: Number(openingCash) || 0,
  closingCash: 0,
  cashMovements: [],
  reports: [],
});

const usePOSShift = () => {
  const [shift, setShift] = useState(() => readShift() || createShift());

  useEffect(() => {
    writeShift(shift);
  }, [shift]);

  const openShift = useCallback((payload) => {
    setShift(createShift(payload));
  }, []);

  const addCashMovement = useCallback(({ type, amount, reason }) => {
    setShift((current) => ({
      ...current,
      cashMovements: [
        {
          id: createPOSId("cash"),
          type,
          amount: Number(amount) || 0,
          reason: reason || "",
          createdAt: new Date().toISOString(),
        },
        ...(current.cashMovements || []),
      ],
    }));
  }, []);

  const createShiftReport = useCallback((type, sales = []) => {
    const report = {
      id: createPOSId(type.toLowerCase()),
      type,
      createdAt: new Date().toISOString(),
      saleCount: sales.length,
      grossSales: sales.reduce(
        (total, sale) => total + Number(sale.summary?.total || 0),
        0,
      ),
    };

    setShift((current) => ({
      ...current,
      reports: [report, ...(current.reports || [])],
    }));

    return report;
  }, []);

  const closeShift = useCallback(({ closingCash = 0, sales = [] } = {}) => {
    const report = {
      id: createPOSId("z-report"),
      type: "Z-report",
      createdAt: new Date().toISOString(),
      saleCount: sales.length,
      grossSales: sales.reduce(
        (total, sale) => total + Number(sale.summary?.total || 0),
        0,
      ),
    };

    setShift((current) => ({
      ...current,
      status: "closed",
      closingCash: Number(closingCash) || 0,
      closedAt: new Date().toISOString(),
      reports: [report, ...(current.reports || [])],
    }));

    return report;
  }, []);

  return {
    shift,
    openShift,
    closeShift,
    addCashMovement,
    createShiftReport,
  };
};

export default usePOSShift;
