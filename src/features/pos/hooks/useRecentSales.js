import { useCallback, useEffect, useState } from "react";

import { createReceiptNumber, createSaleId } from "../utils/posIds";
import {
  readRecentSales,
  readReturns,
  writeRecentSales,
  writeReturns,
} from "../utils/posStorage";

const MAX_RECENT_SALES = 25;

const useRecentSales = () => {
  const [sales, setSales] = useState(() => readRecentSales());
  const [returns, setReturns] = useState(() => readReturns());

  useEffect(() => {
    writeRecentSales(sales);
  }, [sales]);

  useEffect(() => {
    writeReturns(returns);
  }, [returns]);

  const addSale = useCallback((payload) => {
    const createdSale = {
      id: createSaleId(),
      receiptNumber: createReceiptNumber(sales.length),
      createdAt: new Date().toISOString(),
      ...payload,
    };

    setSales((currentSales) =>
      [createdSale, ...currentSales].slice(0, MAX_RECENT_SALES),
    );

    return createdSale;
  }, [sales.length]);

  const addReturn = useCallback((payload) => {
    const createdReturn = {
      id: createSaleId().replace("sale", "return"),
      createdAt: new Date().toISOString(),
      ...payload,
    };

    setReturns((current) => [createdReturn, ...current].slice(0, MAX_RECENT_SALES));
    setSales((currentSales) =>
      currentSales.map((sale) =>
        sale.id === payload.saleId
          ? {
              ...sale,
              status: payload.type === "full" ? "returned" : "partially-returned",
              returnedAmount:
                Number(sale.returnedAmount || 0) + Number(payload.refundTotal || 0),
            }
          : sale,
      ),
    );

    return createdReturn;
  }, []);

  return {
    sales,
    returns,
    addSale,
    addReturn,
  };
};

export default useRecentSales;
