import { useCallback, useMemo, useState } from "react";

import { calculateOrderTotals } from "../utils/posCalculations";
import { createPOSId } from "../utils/posIds";

const createCartItem = (product, options = {}) => ({
  id: createPOSId("line"),
  productId: product.id,
  name: product.name,
  sku: product.sku,
  barcode: product.barcode ?? product.sku,
  category: product.category,
  basePrice: Number(product.price) || 0,
  price: Number(options.price ?? product.price) || 0,
  quantity: Number(options.quantity) || 1,
  stock: Number(product.stock) || 0,
  discount: options.discount || null,
  variant: options.variant || null,
  unit: options.unit || product.units?.[0] || null,
  serial: options.serial || "",
  weight: options.weight || null,
  manualPrice: Boolean(options.manualPrice),
});

const getLineSignature = (item) =>
  [
    item.productId,
    item.variant?.id || "default",
    item.unit?.id || "piece",
    item.serial || "no-serial",
    item.manualPrice ? item.price : "catalog",
  ].join(":");

const usePOSCart = ({
  initialItems = [],
  initialDiscount = null,
  initialNote = "",
  initialBonus = 0,
  taxRate = 0,
} = {}) => {
  const [items, setItems] = useState(initialItems);
  const [discount, setDiscount] = useState(initialDiscount);
  const [note, setNote] = useState(initialNote);
  const [bonus, setBonus] = useState(initialBonus);

  const addItem = useCallback((product, options = {}) => {
    if (!product || Number(product.stock) <= 0) {
      return;
    }

    setItems((currentItems) => {
      const nextItem = createCartItem(product, options);
      const nextSignature = getLineSignature(nextItem);
      const existingItem = currentItems.find(
        (item) => getLineSignature(item) === nextSignature,
      );

      if (!existingItem) {
        return [...currentItems, nextItem];
      }

      if (existingItem.quantity + nextItem.quantity > existingItem.stock) {
        return currentItems;
      }

      return currentItems.map((item) =>
        getLineSignature(item) === nextSignature
          ? {
              ...item,
              quantity: item.quantity + nextItem.quantity,
            }
          : item,
      );
    });
  }, []);

  const increaseItem = useCallback((itemId) => {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        if (item.quantity >= item.stock) {
          return item;
        }

        return {
          ...item,
          quantity: item.quantity + 1,
        };
      }),
    );
  }, []);

  const decreaseItem = useCallback((itemId) => {
    setItems((currentItems) =>
      currentItems.reduce((nextItems, item) => {
        if (item.id !== itemId) {
          nextItems.push(item);
          return nextItems;
        }

        if (item.quantity > 1) {
          nextItems.push({
            ...item,
            quantity: item.quantity - 1,
          });
        }

        return nextItems;
      }, []),
    );
  }, []);

  const removeItem = useCallback((itemId) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setDiscount(null);
    setNote("");
    setBonus(0);
  }, []);

  const updateItem = useCallback((itemId, patch) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              ...patch,
              price: Number(patch.price ?? item.price) || 0,
              quantity: Math.min(
                Math.max(Number(patch.quantity ?? item.quantity) || 1, 0.001),
                Number(item.stock) || 1,
              ),
            }
          : item,
      ),
    );
  }, []);

  const replaceCart = useCallback((payload = {}) => {
    if (Array.isArray(payload)) {
      setItems(payload);
      setDiscount(null);
      setNote("");
      return;
    }

    setItems(payload.items || []);
    setDiscount(payload.discount || null);
    setNote(payload.note || "");
    setBonus(payload.bonus || 0);
  }, []);

  const itemCount = useMemo(
    () =>
      items.reduce((totalQuantity, item) => totalQuantity + item.quantity, 0),
    [items],
  );

  const applyDiscount = useCallback((nextDiscount) => {
    setDiscount(nextDiscount);
  }, []);

  const removeDiscount = useCallback(() => {
    setDiscount(null);
  }, []);

  const applyBonus = useCallback((amount = 0) => {
    setBonus(Math.max(Number(amount) || 0, 0));
  }, []);

  const removeBonus = useCallback(() => {
    setBonus(0);
  }, []);

  const summary = useMemo(
    () => ({
      ...calculateOrderTotals({
        items,
        discount,
        taxRate,
        bonus,
      }),
      itemCount,
    }),
    [bonus, discount, itemCount, items, taxRate],
  );

  return {
    items,
    summary,
    discount,
    bonus,
    note,
    hasItems: items.length > 0,
    addItem,
    increaseItem,
    decreaseItem,
    removeItem,
    updateItem,
    clearCart,
    setNote,
    applyDiscount,
    removeDiscount,
    applyBonus,
    removeBonus,
    replaceCart,
  };
};

export default usePOSCart;
