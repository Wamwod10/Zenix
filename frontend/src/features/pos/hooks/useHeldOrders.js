import { useCallback, useEffect, useState } from "react";

import { createHeldOrderId } from "../utils/posIds";
import { readHeldOrders, writeHeldOrders } from "../utils/posStorage";

const useHeldOrders = () => {
  const [orders, setOrders] = useState(() => readHeldOrders());

  useEffect(() => {
    writeHeldOrders(orders);
  }, [orders]);

  const addHeldOrder = useCallback((payload) => {
    setOrders((currentOrders) => {
      const nextOrder = {
        id: createHeldOrderId(),
        orderNumber: String(currentOrders.length + 1).padStart(3, "0"),
        createdAt: new Date().toISOString(),
        ...payload,
      };

      return [nextOrder, ...currentOrders];
    });
  }, []);

  const removeHeldOrder = useCallback((orderId) => {
    setOrders((currentOrders) =>
      currentOrders.filter((order) => order.id !== orderId),
    );
  }, []);

  const resumeHeldOrder = useCallback((orderId) => {
    const resumedOrder = orders.find((order) => order.id === orderId) || null;

    if (!resumedOrder) {
      return null;
    }

    setOrders((currentOrders) =>
      currentOrders.filter((order) => order.id !== orderId),
    );

    return resumedOrder;
  }, [orders]);

  return {
    orders,
    addHeldOrder,
    removeHeldOrder,
    resumeHeldOrder,
  };
};

export default useHeldOrders;
