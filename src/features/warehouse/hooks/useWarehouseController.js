import { useCallback, useDeferredValue, useMemo, useRef, useState } from "react";

import {
  calculateAvailableStock,
  calculateInventoryValue,
  calculateProjectedStock,
  calculateReorderPoint,
  calculateStockDifference,
  calculateTransferDifference,
  getExpiryStatus,
  getStockStatus,
  toNumber,
} from "../utils/warehouseCalculations";
import { generateWarehouseId } from "../utils/warehouseIds";
import {
  safeStorageRead,
  safeStorageWrite,
  warehouseStorageKeys,
} from "../utils/warehouseStorage";
import { warehouseMockAdapter } from "../utils/warehouseAdapters";
import useWarehouseKeyboard from "./useWarehouseKeyboard";
import useWarehouseStorage from "./useWarehouseStorage";

const defaultFilters = {
  warehouseId: "all",
  branch: "all",
  category: "all",
  brand: "all",
  status: "all",
  speed: "all",
  value: "all",
  dateRange: "month",
};

const now = () => new Date().toISOString();

const createWarehouseCode = (warehouses = []) => {
  const used = new Set(warehouses.map((warehouse) => warehouse.code).filter(Boolean));
  let sequence = warehouses.length + 1;
  let code = "";

  do {
    code = `WH-${String(sequence).padStart(6, "0")}`;
    sequence += 1;
  } while (used.has(code));

  return code;
};

const getProductStock = (product, warehouseId = "all") => {
  const entries = Object.entries(product.stocks || {}).filter(
    ([id]) => warehouseId === "all" || id === warehouseId,
  );

  return entries.reduce(
    (total, [id, stock]) => ({
      warehouseIds: [...total.warehouseIds, id],
      onHand: total.onHand + toNumber(stock.onHand),
      reserved: total.reserved + toNumber(stock.reserved),
      incoming: total.incoming + toNumber(stock.incoming),
      locations: [...total.locations, stock.location].filter(Boolean),
    }),
    { warehouseIds: [], onHand: 0, reserved: 0, incoming: 0, locations: [] },
  );
};

const withProductStock = (product, warehouseId) => {
  const stock = getProductStock(product, warehouseId);
  const available = calculateAvailableStock(stock.onHand, stock.reserved);
  const projected = calculateProjectedStock(available, stock.incoming);
  const reorderPoint = calculateReorderPoint(product);
  const value = calculateInventoryValue(stock.onHand, product.cost);

  return {
    ...product,
    ...stock,
    available,
    projected,
    reorderPoint,
    value,
    status: getStockStatus({
      onHand: stock.onHand,
      reserved: stock.reserved,
      minimum: product.minimum,
    }),
  };
};

const patchProductStock = (product, warehouseId, patcher) => {
  const current = product.stocks?.[warehouseId] || {
    onHand: 0,
    reserved: 0,
    incoming: 0,
    location: "",
  };

  return {
    ...product,
    stocks: {
      ...product.stocks,
      [warehouseId]: {
        ...current,
        ...patcher(current),
      },
    },
  };
};

const useWarehouseController = () => {
  const { state, setState, resetState } = useWarehouseStorage();
  const searchInputRef = useRef(null);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("wh-main");
  const [globalSearch, setGlobalSearch] = useState("");
  const deferredSearch = useDeferredValue(globalSearch);
  const [filters, setFilters] = useState(() =>
    safeStorageRead(warehouseStorageKeys.filters, defaultFilters),
  );
  const [role, setRole] = useState(() =>
    safeStorageRead(warehouseStorageKeys.role, "manager"),
  );
  const [shortcutFeedback, setShortcutFeedback] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [asyncStatus, setAsyncStatus] = useState(null);

  const writeFilters = useCallback((nextFilters) => {
    setFilters(nextFilters);
    safeStorageWrite(warehouseStorageKeys.filters, nextFilters);
  }, []);

  const updateFilter = useCallback(
    (key, value) => writeFilters({ ...filters, [key]: value }),
    [filters, writeFilters],
  );

  const resetFilters = useCallback(() => {
    setGlobalSearch("");
    writeFilters(defaultFilters);
  }, [writeFilters]);

  const updateRole = useCallback((nextRole) => {
    setRole(nextRole);
    safeStorageWrite(warehouseStorageKeys.role, nextRole);
  }, []);

  const addNotification = useCallback((notification) => {
    setState((current) => ({
      ...current,
      notifications: [
        {
          id: generateWarehouseId("notification"),
          read: false,
          createdAt: now(),
          level: "normal",
          ...notification,
        },
        ...current.notifications,
      ],
    }));
  }, [setState]);

  const addAudit = useCallback((audit) => {
    setState((current) => ({
      ...current,
      auditLog: [
        {
          id: generateWarehouseId("audit"),
          time: now(),
          user: "Admin",
          approval: "Not required",
          ip: "192.168.1.42",
          ...audit,
        },
        ...current.auditLog,
      ],
    }));
  }, [setState]);

  const warehousesById = useMemo(
    () =>
      state.warehouses.reduce((map, warehouse) => {
        map[warehouse.id] = warehouse;
        return map;
      }, {}),
    [state.warehouses],
  );

  const productsById = useMemo(
    () =>
      state.products.reduce((map, product) => {
        map[product.id] = product;
        return map;
      }, {}),
    [state.products],
  );

  const stockRows = useMemo(
    () => state.products.map((product) => withProductStock(product, filters.warehouseId)),
    [filters.warehouseId, state.products],
  );

  const filteredStockRows = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return stockRows.filter((row) => {
      const searchText = `${row.name} ${row.sku} ${row.barcode} ${row.category} ${row.brand}`.toLowerCase();
      const matchesQuery = !query || searchText.includes(query);
      const matchesCategory = filters.category === "all" || row.category === filters.category;
      const matchesBrand = filters.brand === "all" || row.brand === filters.brand;
      const matchesStatus = filters.status === "all" || row.status === filters.status;
      const matchesSpeed = filters.speed === "all" || row.movementSpeed === filters.speed;
      const matchesValue =
        filters.value === "all" ||
        (filters.value === "high" && row.value >= 10000000) ||
        (filters.value === "medium" && row.value >= 1000000 && row.value < 10000000) ||
        (filters.value === "low" && row.value < 1000000);

      return (
        matchesQuery &&
        matchesCategory &&
        matchesBrand &&
        matchesStatus &&
        matchesSpeed &&
        matchesValue
      );
    });
  }, [deferredSearch, filters, stockRows]);

  const selectedProduct = selectedProductId ? productsById[selectedProductId] : null;

  const metrics = useMemo(() => {
    const totals = stockRows.reduce(
      (acc, row) => ({
        sku: acc.sku + 1,
        onHand: acc.onHand + row.onHand,
        reserved: acc.reserved + row.reserved,
        incoming: acc.incoming + row.incoming,
        value: acc.value + row.value,
        low: acc.low + (row.status === "low" ? 1 : 0),
        out: acc.out + (row.status === "out" ? 1 : 0),
      }),
      { sku: 0, onHand: 0, reserved: 0, incoming: 0, value: 0, low: 0, out: 0 },
    );

    const expiryWarning = state.batches.filter(
      (batch) => getExpiryStatus(batch.expiryDate, state.settings.expiryWarningDays) !== "valid",
    ).length;

    return {
      ...totals,
      expiryWarning,
      capacity: Math.round(
        (totals.onHand /
          Math.max(
            1,
            state.warehouses.reduce((sum, warehouse) => sum + toNumber(warehouse.capacity), 0),
          )) *
          100,
      ),
    };
  }, [state.batches, state.settings.expiryWarningDays, state.warehouses, stockRows]);

  const purchaseSuggestions = useMemo(
    () =>
      stockRows
        .filter((row) => row.projected <= row.reorderPoint && row.incoming <= row.minimum)
        .map((row) => {
          const suggestedQuantity = Math.max(
            row.minimum,
            Math.min(row.maximum - row.projected, row.reorderPoint * 2 - row.projected),
          );

          return {
            id: `suggest-${row.id}`,
            productId: row.id,
            productName: row.name,
            currentStock: row.available,
            reorderPoint: row.reorderPoint,
            suggestedQuantity,
            supplier: row.brand === "Apple" ? "Apple Distributor" : "Preferred supplier",
            estimatedAmount: suggestedQuantity * row.cost,
            priority: row.abc === "A" ? "critical" : "important",
          };
        }),
    [stockRows],
  );

  const aiInsights = useMemo(() => {
    const deadStock = stockRows.filter((row) => row.movementSpeed === "dead");
    const slowStock = stockRows.filter((row) => row.movementSpeed === "slow");
    const expiryRisk = state.batches.filter(
      (batch) => getExpiryStatus(batch.expiryDate, state.settings.expiryWarningDays) !== "valid",
    );
    const transferCandidate = stockRows.find((row) => row.status === "low");

    return [
      ...purchaseSuggestions.slice(0, 2).map((item) => ({
        id: `ai-reorder-${item.productId}`,
        type: "reorder",
        title: `${item.productName} reorder pointga yetdi`,
        message: `${item.suggestedQuantity} dona buyurtma qilish tavsiya etiladi.`,
        actionLabel: "Incoming yaratish",
        payload: item,
      })),
      ...deadStock.slice(0, 1).map((item) => ({
        id: `ai-dead-${item.id}`,
        type: "dead",
        title: `${item.name} o'lik zaxira`,
        message: "60 kundan ortiq harakat yo'q. Chegirma yoki transfer tavsiya qilinadi.",
        actionLabel: "Chegirma signalini yaratish",
        payload: item,
      })),
      ...expiryRisk.slice(0, 1).map((batch) => ({
        id: `ai-expiry-${batch.id}`,
        type: "expiry",
        title: `${productsById[batch.productId]?.name || "Tovar"} muddati yaqin`,
        message: `${batch.number} partiyasi uchun FEFO va chegirma kerak.`,
        actionLabel: "Warning yaratish",
        payload: batch,
      })),
      ...slowStock.slice(0, 1).map((item) => ({
        id: `ai-slow-${item.id}`,
        type: "slow",
        title: `${item.name} sekin aylanmoqda`,
        message: "Buyurtma miqdorini kamaytirish va joylashuvni o'zgartirish tavsiya etiladi.",
        actionLabel: "Auditga belgilash",
        payload: item,
      })),
      ...(transferCandidate
        ? [
            {
              id: "ai-transfer",
              type: "transfer",
              title: "Omborlar aro balans tavsiyasi",
              message: `${transferCandidate.name} kam qolgan. Markazdan filialga transfer qiling.`,
              actionLabel: "Transfer draft",
              payload: transferCandidate,
            },
          ]
        : []),
      {
        id: "ai-capacity",
        type: "capacity",
        title: "Capacity watch",
        message:
          metrics.capacity > 80
            ? "Ombor sig'imi 80% dan oshdi. Joylashuv optimizatsiyasi kerak."
            : "Capacity sog'lom, lekin dead stock joy band qilmoqda.",
        actionLabel: "Joylashuv audit",
        payload: null,
      },
    ];
  }, [
    metrics.capacity,
    productsById,
    purchaseSuggestions,
    state.batches,
    state.settings.expiryWarningDays,
    stockRows,
  ]);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setSelectedProductId(null);
  }, []);

  const showShortcutFeedback = useCallback((shortcut, label) => {
    setShortcutFeedback({ shortcut, label });
    window.setTimeout(() => setShortcutFeedback(null), 1100);
  }, []);

  useWarehouseKeyboard({
    activeModal,
    onFocusSearch: () => searchInputRef.current?.focus(),
    onOpenReceipt: () => setActiveModal("receipt"),
    onOpenIssue: () => setActiveModal("issue"),
    onOpenTransfer: () => setActiveModal("transfer"),
    onEscape: closeModal,
    onShortcutFeedback: showShortcutFeedback,
  });

  const createOrUpdateWarehouse = useCallback(
    (payload) => {
      const isEdit = Boolean(payload.id);
      const warehouse = {
        id: payload.id || generateWarehouseId("warehouse"),
        code: payload.code || createWarehouseCode(state.warehouses),
        status: payload.status || "active",
        ...payload,
      };

      setState((current) => ({
        ...current,
        warehouses: isEdit
          ? current.warehouses.map((item) => (item.id === warehouse.id ? warehouse : item))
          : [warehouse, ...current.warehouses],
      }));

      addAudit({
        action: isEdit ? "Warehouse updated" : "Warehouse created",
        warehouseId: warehouse.id,
        oldValue: isEdit ? "Previous profile" : "-",
        newValue: warehouse.name,
        reason: "Warehouse management",
      });
      addNotification({
        type: "warehouse",
        level: "normal",
        title: isEdit ? "Ombor yangilandi" : "Yangi ombor yaratildi",
        message: warehouse.name,
      });
      closeModal();
    },
    [addAudit, addNotification, closeModal, setState, state.warehouses],
  );

  const deactivateWarehouse = useCallback(
    (warehouseId) => {
      setState((current) => ({
        ...current,
        warehouses: current.warehouses.map((warehouse) =>
          warehouse.id === warehouseId ? { ...warehouse, status: "inactive" } : warehouse,
        ),
      }));
      addAudit({
        action: "Warehouse deactivated",
        warehouseId,
        oldValue: "active",
        newValue: "inactive",
        reason: "Manual action",
      });
    },
    [addAudit, setState],
  );

  const activateWarehouse = useCallback(
    (warehouseId) => {
      setState((current) => ({
        ...current,
        warehouses: current.warehouses.map((warehouse) =>
          warehouse.id === warehouseId ? { ...warehouse, status: "active" } : warehouse,
        ),
      }));
      addAudit({
        action: "Warehouse activated",
        warehouseId,
        oldValue: "inactive",
        newValue: "active",
        reason: "Manual action",
      });
      addNotification({
        type: "warehouse",
        level: "normal",
        title: "Ombor faollashtirildi",
        message: warehouseId,
      });
    },
    [addAudit, addNotification, setState],
  );

  const applyStockChange = useCallback(
    ({ productId, warehouseId, quantity, type, document, employee = "Admin", reason }) => {
      const numericQuantity = toNumber(quantity);
      const product = productsById[productId];
      const currentStock = product?.stocks?.[warehouseId] || { onHand: 0 };
      const previousStock = toNumber(currentStock.onHand);
      const nextStock = Math.max(0, previousStock + numericQuantity);

      setState((current) => ({
        ...current,
        products: current.products.map((item) =>
          item.id === productId
            ? patchProductStock(item, warehouseId, () => ({ onHand: nextStock }))
            : item,
        ),
        movements: [
          {
            id: generateWarehouseId(type === "receipt" ? "receipt" : "issue"),
            createdAt: now(),
            type,
            productId,
            productName: product?.name || "Tovar",
            quantity: numericQuantity,
            warehouseId,
            previousStock,
            newStock: nextStock,
            document,
            employee,
            reason,
          },
          ...current.movements,
        ],
      }));

      addAudit({
        action: `Stock ${type}`,
        warehouseId,
        productId,
        oldValue: String(previousStock),
        newValue: String(nextStock),
        reason,
      });
    },
    [addAudit, productsById, setState],
  );

  const confirmGoodsReceipt = useCallback(
    (payload) => {
      const document = payload.invoice || generateWarehouseId("receipt");
      const total = payload.items.reduce(
        (sum, item) => sum + toNumber(item.quantity) * toNumber(item.cost),
        0,
      );

      payload.items.forEach((item) => {
        applyStockChange({
          productId: item.productId,
          warehouseId: payload.warehouseId,
          quantity: toNumber(item.quantity),
          type: "receipt",
          document,
          reason: payload.note || "Goods receipt",
        });
      });

      addNotification({
        type: "receipt",
        level: "normal",
        title: "Kirim tasdiqlandi",
        message: `${payload.items.length} qator, jami ${total.toLocaleString("uz-UZ")} UZS.`,
      });
      closeModal();
    },
    [addNotification, applyStockChange, closeModal],
  );

  const confirmGoodsIssue = useCallback(
    (payload) => {
      const document = generateWarehouseId("issue");
      const blockedItem = payload.items.find((item) => {
        const product = productsById[item.productId];
        const stock = getProductStock(product, payload.warehouseId);
        const available = calculateAvailableStock(stock.onHand, stock.reserved);
        return toNumber(item.quantity) > available;
      });

      if (blockedItem) {
        addNotification({
          type: "issue",
          level: "critical",
          title: "Chiqim bloklandi",
          message: "Available qoldiqdan ortiq chiqim qilish mumkin emas.",
        });
        return;
      }

      payload.items.forEach((item) => {
        applyStockChange({
          productId: item.productId,
          warehouseId: payload.warehouseId,
          quantity: -toNumber(item.quantity),
          type: "issue",
          document,
          reason: payload.reason || "Goods issue",
        });
      });
      addNotification({
        type: "issue",
        level: "normal",
        title: "Chiqim tasdiqlandi",
        message: `${payload.receiver || "Receiver"} uchun hujjat yaratildi.`,
      });
      closeModal();
    },
    [addNotification, applyStockChange, closeModal, productsById],
  );

  const createTransfer = useCallback(
    (payload) => {
      const product = productsById[payload.productId];
      const sourceStock = getProductStock(product, payload.sourceWarehouseId);
      const available = calculateAvailableStock(sourceStock.onHand, sourceStock.reserved);
      const quantity = toNumber(payload.quantity);

      if (payload.sourceWarehouseId === payload.destinationWarehouseId) {
        addNotification({
          type: "transfer",
          level: "critical",
          title: "Transfer bloklandi",
          message: "Yuboruvchi va qabul qiluvchi ombor bir xil bo'lmasligi kerak.",
        });
        return;
      }

      if (quantity > available) {
        addNotification({
          type: "transfer",
          level: "critical",
          title: "Transfer bloklandi",
          message: "Source omborda available qoldiq yetarli emas.",
        });
        return;
      }

      applyStockChange({
        productId: payload.productId,
        warehouseId: payload.sourceWarehouseId,
        quantity: -quantity,
        type: "transfer",
        document: generateWarehouseId("transfer"),
        reason: payload.reason || "Stock transfer sent",
      });

      setState((current) => ({
        ...current,
        transfers: [
          {
            id: generateWarehouseId("transfer"),
            sentAmount: quantity,
            receivedAmount: 0,
            status: "in-transit",
            createdAt: now(),
            ...payload,
            quantity,
          },
          ...current.transfers,
        ],
      }));
      addNotification({
        type: "transfer",
        level: "important",
        title: "Transfer yo'lga chiqdi",
        message: `${product?.name || "Tovar"} ${quantity} dona in-transit.`,
      });
      closeModal();
    },
    [addNotification, applyStockChange, closeModal, productsById, setState],
  );

  const receiveTransfer = useCallback(
    (transferId, receivedAmount) => {
      const transfer = state.transfers.find((item) => item.id === transferId);
      if (!transfer) return;

      const received = toNumber(receivedAmount, transfer.sentAmount);

      applyStockChange({
        productId: transfer.productId,
        warehouseId: transfer.destinationWarehouseId,
        quantity: received,
        type: "transfer",
        document: transfer.id,
        reason: "Transfer received",
      });

      setState((current) => ({
        ...current,
        transfers: current.transfers.map((item) =>
          item.id === transferId
            ? {
                ...item,
                receivedAmount: received,
                status:
                  calculateTransferDifference(received, item.sentAmount) === 0
                    ? "received"
                    : "partial",
              }
            : item,
        ),
      }));
      addNotification({
        type: "transfer",
        level: "normal",
        title: "Transfer qabul qilindi",
        message: `Farq: ${calculateTransferDifference(received, transfer.sentAmount)} dona.`,
      });
    },
    [addNotification, applyStockChange, setState, state.transfers],
  );

  const completeInventoryCount = useCallback(
    ({ warehouseId, productId, countedQuantity, mode = "cycle" }) => {
      const product = productsById[productId];
      const systemQuantity = toNumber(product?.stocks?.[warehouseId]?.onHand);
      const counted = toNumber(countedQuantity);
      const difference = calculateStockDifference(counted, systemQuantity);

      setState((current) => ({
        ...current,
        counts: [
          {
            id: generateWarehouseId("count"),
            warehouseId,
            productId,
            mode,
            systemQuantity,
            countedQuantity: counted,
            managerConfirmed: true,
            status: "completed",
            createdAt: now(),
          },
          ...current.counts,
        ],
        products: current.products.map((item) =>
          item.id === productId
            ? patchProductStock(item, warehouseId, () => ({ onHand: counted }))
            : item,
        ),
      }));
      addAudit({
        action: "Inventory count completed",
        warehouseId,
        productId,
        oldValue: String(systemQuantity),
        newValue: String(counted),
        reason: `Difference ${difference}`,
        approval: "Manager confirmed",
      });
      addNotification({
        type: "inventory",
        level: Math.abs(difference) > 3 ? "important" : "normal",
        title: "Inventory count yakunlandi",
        message: `Farq: ${difference} dona.`,
      });
      closeModal();
    },
    [addAudit, addNotification, closeModal, productsById, setState],
  );

  const adjustStock = useCallback(
    ({ warehouseId, productId, newQuantity, reason, note }) => {
      const product = productsById[productId];
      const currentQuantity = toNumber(product?.stocks?.[warehouseId]?.onHand);
      const nextQuantity = toNumber(newQuantity);
      const difference = calculateStockDifference(nextQuantity, currentQuantity);

      setState((current) => ({
        ...current,
        adjustments: [
          {
            id: generateWarehouseId("adjustment"),
            warehouseId,
            productId,
            currentQuantity,
            newQuantity: nextQuantity,
            difference,
            reason,
            note,
            approved: true,
            createdAt: now(),
          },
          ...current.adjustments,
        ],
        products: current.products.map((item) =>
          item.id === productId
            ? patchProductStock(item, warehouseId, () => ({ onHand: nextQuantity }))
            : item,
        ),
      }));
      addAudit({
        action: "Inventory adjustment",
        warehouseId,
        productId,
        oldValue: String(currentQuantity),
        newValue: String(nextQuantity),
        reason,
        approval: "Manager approved",
      });
      addNotification({
        type: "adjustment",
        level: Math.abs(difference) > 10 ? "critical" : "important",
        title: "Stock adjustment saqlandi",
        message: `${difference} dona farq.`,
      });
      closeModal();
    },
    [addAudit, addNotification, closeModal, productsById, setState],
  );

  const writeOffStock = useCallback(
    ({ warehouseId, productId, quantity, reason, evidenceName }) => {
      const product = productsById[productId];
      const currentQuantity = toNumber(product?.stocks?.[warehouseId]?.onHand);
      const amount = Math.min(toNumber(quantity), currentQuantity);

      setState((current) => ({
        ...current,
        writeOffs: [
          {
            id: generateWarehouseId("writeOff"),
            warehouseId,
            productId,
            quantity: amount,
            reason,
            lossValue: amount * toNumber(product?.cost),
            evidenceName,
            approved: true,
            createdAt: now(),
          },
          ...current.writeOffs,
        ],
        products: current.products.map((item) =>
          item.id === productId
            ? patchProductStock(item, warehouseId, () => ({
                onHand: Math.max(0, currentQuantity - amount),
              }))
            : item,
        ),
      }));
      addAudit({
        action: "Write-off approved",
        warehouseId,
        productId,
        oldValue: String(currentQuantity),
        newValue: String(currentQuantity - amount),
        reason,
        approval: "Manager approved",
      });
      addNotification({
        type: "write-off",
        level: "critical",
        title: "Write-off tasdiqlandi",
        message: `${product?.name || "Tovar"} ${amount} dona hisobdan chiqarildi.`,
      });
      closeModal();
    },
    [addAudit, addNotification, closeModal, productsById, setState],
  );

  const reserveStock = useCallback(
    ({ productId, warehouseId, amount, customer, reason }) => {
      const product = productsById[productId];
      const stock = getProductStock(product, warehouseId);
      const quantity = toNumber(amount);

      if (quantity > calculateAvailableStock(stock.onHand, stock.reserved)) {
        addNotification({
          type: "reserved",
          level: "critical",
          title: "Reserve bloklandi",
          message: "Available qoldiq yetarli emas.",
        });
        return;
      }

      setState((current) => ({
        ...current,
        reservedStock: [
          {
            id: generateWarehouseId("reserve"),
            productId,
            warehouseId,
            amount: quantity,
            order: generateWarehouseId("reserve"),
            customer,
            reason,
            startDate: now().slice(0, 10),
            expiration: new Date(Date.now() + 48 * 3600000).toISOString().slice(0, 10),
            status: "active",
          },
          ...current.reservedStock,
        ],
        products: current.products.map((item) =>
          item.id === productId
            ? patchProductStock(item, warehouseId, (currentStock) => ({
                reserved: toNumber(currentStock.reserved) + quantity,
              }))
            : item,
        ),
      }));
      addNotification({
        type: "reserved",
        level: "normal",
        title: "Tovar band qilindi",
        message: `${product?.name || "Tovar"} ${quantity} dona.`,
      });
      closeModal();
    },
    [addNotification, closeModal, productsById, setState],
  );

  const releaseReservation = useCallback(
    (reservationId) => {
      const reservation = state.reservedStock.find((item) => item.id === reservationId);
      if (!reservation) return;

      setState((current) => ({
        ...current,
        reservedStock: current.reservedStock.map((item) =>
          item.id === reservationId ? { ...item, status: "released" } : item,
        ),
        products: current.products.map((product) =>
          product.id === reservation.productId
            ? patchProductStock(product, reservation.warehouseId, (stock) => ({
                reserved: Math.max(0, toNumber(stock.reserved) - reservation.amount),
              }))
            : product,
        ),
      }));
      addNotification({
        type: "reserved",
        title: "Reservation released",
        message: reservation.order,
      });
    },
    [addNotification, setState, state.reservedStock],
  );

  const markNotificationRead = useCallback(
    (notificationId) => {
      setState((current) => ({
        ...current,
        notifications: current.notifications.map((item) =>
          item.id === notificationId ? { ...item, read: true } : item,
        ),
      }));
    },
    [setState],
  );

  const runAiAction = useCallback(
    (insight) => {
      if (insight.type === "reorder") {
        setState((current) => ({
          ...current,
          incomingStock: [
            {
              id: generateWarehouseId("incoming"),
              productId: insight.payload.productId,
              amount: insight.payload.suggestedQuantity,
              supplier: insight.payload.supplier,
              purchaseOrder: generateWarehouseId("incoming"),
              expectedDate: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
              status: "planned",
            },
            ...current.incomingStock,
          ],
        }));
        addNotification({
          type: "ai",
          level: "important",
          title: "AI incoming yaratdi",
          message: `${insight.payload.productName} uchun purchase request simulation.`,
        });
        return;
      }

      if (insight.type === "transfer" && insight.payload) {
        setActiveModal("transfer");
        setSelectedProductId(insight.payload.id);
        return;
      }

      addAudit({
        action: `AI insight accepted: ${insight.type}`,
        warehouseId: selectedWarehouseId,
        productId: insight.payload?.productId || insight.payload?.id || "-",
        oldValue: "-",
        newValue: insight.title,
        reason: insight.message,
      });
      addNotification({
        type: "ai",
        level: "normal",
        title: "AI tavsiya bajarildi",
        message: insight.title,
      });
    },
    [addAudit, addNotification, selectedWarehouseId, setState],
  );

  const exportReport = useCallback(
    async (reportName) => {
      setAsyncStatus({ type: "loading", message: `${reportName} tayyorlanmoqda...` });
      const result = await warehouseMockAdapter.exportReport(reportName);
      setAsyncStatus({ type: "success", message: `${result.fileName} tayyor.` });
      addAudit({
        action: "Report exported",
        warehouseId: filters.warehouseId,
        productId: "-",
        oldValue: "-",
        newValue: result.fileName,
        reason: reportName,
      });
    },
    [addAudit, filters.warehouseId],
  );

  const validateImport = useCallback(async () => {
    setAsyncStatus({ type: "loading", message: "Import fayl tekshirilmoqda..." });
    const preview = await warehouseMockAdapter.validateImport("warehouse-import.csv");
    setImportPreview(preview);
    setAsyncStatus({ type: "success", message: "Import preview tayyor." });
  }, []);

  const confirmImport = useCallback(() => {
    if (!importPreview) return;

    addAudit({
      action: "Import confirmed",
      warehouseId: filters.warehouseId,
      productId: "-",
      oldValue: "0",
      newValue: String(importPreview.validRows),
      reason: importPreview.fileName,
    });
    addNotification({
      type: "import",
      level: "normal",
      title: "Import yakunlandi",
      message: `${importPreview.validRows} qator qabul qilindi, ${importPreview.errorRows.length} xato.`,
    });
    setImportPreview(null);
  }, [addAudit, addNotification, filters.warehouseId, importPreview]);

  const updateSettings = useCallback(
    (patch) => {
      setState((current) => ({
        ...current,
        settings: {
          ...current.settings,
          ...patch,
        },
      }));
      addAudit({
        action: "Warehouse settings changed",
        warehouseId: selectedWarehouseId,
        productId: "-",
        oldValue: "Previous settings",
        newValue: Object.keys(patch).join(", "),
        reason: "Settings",
        approval: "Owner/Admin",
      });
    },
    [addAudit, selectedWarehouseId, setState],
  );

  return {
    refs: { searchInputRef },
    state,
    role,
    filters,
    asyncStatus,
    importPreview,
    activeModal,
    selectedProduct,
    selectedProductId,
    selectedWarehouseId,
    globalSearch,
    shortcutFeedback,
    warehousesById,
    productsById,
    stockRows,
    filteredStockRows,
    metrics,
    purchaseSuggestions,
    aiInsights,
    actions: {
      setActiveModal,
      closeModal,
      setSelectedProductId,
      setSelectedWarehouseId,
      setGlobalSearch,
      updateFilter,
      resetFilters,
      writeFilters,
      updateRole,
      createOrUpdateWarehouse,
      deactivateWarehouse,
      activateWarehouse,
      confirmGoodsReceipt,
      confirmGoodsIssue,
      createTransfer,
      receiveTransfer,
      completeInventoryCount,
      adjustStock,
      writeOffStock,
      reserveStock,
      releaseReservation,
      markNotificationRead,
      runAiAction,
      exportReport,
      validateImport,
      confirmImport,
      updateSettings,
      resetState,
    },
  };
};

export default useWarehouseController;
