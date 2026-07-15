import { useCallback, useDeferredValue, useMemo, useRef, useState } from "react";

import { posCategories } from "../data/posCategories";
import { posCustomers } from "../data/posCustomers";
import { posProducts } from "../data/posProducts";
import {
  usePosCategoriesQuery,
  usePosCustomersQuery,
  usePosProductsQuery,
} from "../posApi";
import { paymentAdapter } from "../utils/posAdapters";
import { formatMoney } from "../utils/posMoney";
import { needsManagerApproval } from "../utils/posPermissions";
import useBarcodeScanner from "./useBarcodeScanner";
import useHeldOrders from "./useHeldOrders";
import usePOSCart from "./usePOSCart";
import usePOSKeyboard from "./usePOSKeyboard";
import usePOSNotifications from "./usePOSNotifications";
import usePOSOffline from "./usePOSOffline";
import usePOSPermissions from "./usePOSPermissions";
import usePOSSettings from "./usePOSSettings";
import usePOSShift from "./usePOSShift";
import useRecentSales from "./useRecentSales";

const paymentLabels = {
  cash: "Naqd",
  card: "Bank kartasi",
  digital: "Click / Payme",
  split: "Split payment",
  debt: "Debt payment",
  advance: "Advance payment",
};

const adaptProduct = (product) => ({
  id: product.id,
  name: product.name,
  sku: product.sku,
  barcode: product.barcode || "",
  category: product.category?.name || "Boshqa",
  categoryId: product.categoryId,
  price: Number(product.price || 0),
  stock: Number(product.stock || 0),
  favorite: Boolean(product.favorite),
  visual: product.visual || "spark",
  units: (product.units?.length ? product.units : [{ code: "piece", label: "Dona", multiplier: 1 }]).map((unit) => ({
    id: unit.code || unit.id,
    code: unit.code || unit.id,
    label: unit.label,
    multiplier: Number(unit.multiplier || 1),
  })),
  variants: (product.variants || []).map((variant) => ({
    id: variant.code || variant.id,
    code: variant.code || variant.id,
    label: variant.label,
    priceDelta: Number(variant.priceDelta || 0),
  })),
});

const adaptCustomer = (customer) => ({
  id: customer.id,
  name: customer.name,
  phone: customer.phone || "",
  level: customer.level || "STANDARD",
  orders: Number(customer.ordersCount || 0),
  spent: Number(customer.totalSpent || 0),
  bonus: Number(customer.bonus || 0),
});

const playSuccessBeep = () => {
  if (typeof window === "undefined") {
    return;
  }

  const AudioContext = window.AudioContext || window.webkitAudioContext;

  if (!AudioContext) {
    return;
  }

  try {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, context.currentTime);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.13);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.14);
  } catch {
    // Audio can be blocked by the browser until user interaction.
  }
};

const productNeedsOptions = (product) =>
  Boolean(
    product?.variants?.length ||
      product?.units?.length > 1 ||
      product?.serialRequired ||
      product?.weighted,
  );

const buildRecommendation = ({ items, products, customer }) => {
  if (!items.length) {
    return {
      title: "AI Recommendation",
      message:
        "Savatga mahsulot qo'shilganda AI mos cross-sell va loyalty tavsiyasini ko'rsatadi.",
      actionLabel: "Tavsiya kutmoqda",
      disabled: true,
      product: null,
    };
  }

  const hasCoffee = items.some((item) =>
    `${item.name} ${item.category}`.toLowerCase().includes("coffee"),
  );
  const hasDrink = items.some((item) => item.category === "Ichimlik");
  const lowStockItem = items.find((item) => Number(item.stock) <= 5);
  const findAvailable = (predicate) =>
    products.find(
      (product) =>
        Number(product.stock) > 0 &&
        !items.some((item) => item.productId === product.id) &&
        predicate(product),
    );

  const product =
    (customer?.level === "VIP" &&
      findAvailable((item) => item.category === "Chegirma")) ||
    (hasCoffee && findAvailable((item) => item.category === "Shirinlik")) ||
    (hasDrink && findAvailable((item) => item.category === "Oziq-ovqat")) ||
    findAvailable((item) => item.favorite);

  if (product) {
    return {
      title: customer?.level === "VIP" ? "VIP loyalty insight" : "Cross-sell",
      message: `${product.name} savatdagi mahsulotlarga mos keladi. Stock: ${product.stock} dona.`,
      actionLabel: `${product.name} qo'shish`,
      disabled: false,
      product,
    };
  }

  return {
    title: lowStockItem ? "Low stock warning" : "AI Recommendation",
    message: lowStockItem
      ? `${lowStockItem.name} zaxirasi kamaygan. Keyingi savdolarda alternativani tavsiya qiling.`
      : "Hozircha qo'shimcha tavsiya yo'q.",
    actionLabel: "Tavsiya yo'q",
    disabled: true,
    product: null,
  };
};

const usePOSController = () => {
  const { data: apiProducts = [] } = usePosProductsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: apiCategories = [] } = usePosCategoriesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: apiCustomers = [] } = usePosCustomersQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const searchInputRef = useRef(null);
  const barcodeInputRef = useRef(null);

  const { settings, updateSettings, resetSettings } = usePOSSettings();
  const permissions = usePOSPermissions();
  const notifications = usePOSNotifications();
  const offline = usePOSOffline();
  const shift = usePOSShift();

  const [activeCategory, setActiveCategory] = useState(posCategories[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [barcodeValue, setBarcodeValue] = useState("");
  const [barcodeStatus, setBarcodeStatus] = useState(null);
  const [receiptSale, setReceiptSale] = useState(null);
  const [recentMode, setRecentMode] = useState("recent");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [returnSale, setReturnSale] = useState(null);
  const [shiftMode, setShiftMode] = useState("status");
  const [approvalRequest, setApprovalRequest] = useState(null);
  const [shortcutFeedback, setShortcutFeedback] = useState(null);
  const shortcutTimeoutRef = useRef(null);

  const liveProducts = useMemo(
    () => (apiProducts.length ? apiProducts.map(adaptProduct) : posProducts),
    [apiProducts],
  );
  const liveCategories = useMemo(() => {
    if (!apiCategories.length) {
      return posCategories;
    }

    return ["Barchasi", ...apiCategories.map((category) => category.name)];
  }, [apiCategories]);
  const liveCustomers = useMemo(
    () => (apiCustomers.length ? apiCustomers.map(adaptCustomer) : posCustomers),
    [apiCustomers],
  );

  const cart = usePOSCart({
    taxRate: settings.taxRate,
  });
  const heldOrders = useHeldOrders();
  const recentSales = useRecentSales();

  const filteredProducts = useMemo(() => {
    const normalizedQuery = deferredSearchQuery.trim().toLowerCase();

    return liveProducts.filter((product) => {
      const matchesCategory =
        activeCategory === "Barchasi" || product.category === activeCategory;
      const searchText = `${product.name} ${product.sku} ${product.barcode}`.toLowerCase();

      return matchesCategory && (!normalizedQuery || searchText.includes(normalizedQuery));
    });
  }, [activeCategory, deferredSearchQuery, liveProducts]);

  const todaySalesTotal = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10);

    return recentSales.sales.reduce((total, sale) => {
      if (sale.createdAt?.slice(0, 10) !== todayKey) {
        return total;
      }

      return total + Number(sale.summary?.total || 0);
    }, 0);
  }, [recentSales.sales]);

  const recommendation = useMemo(
    () =>
      buildRecommendation({
        items: cart.items,
        products: liveProducts,
        customer: selectedCustomer,
      }),
    [cart.items, liveProducts, selectedCustomer],
  );

  const posMetrics = useMemo(
    () => [
      {
        label: "Bugungi savdo",
        value: formatMoney(todaySalesTotal),
        tone: "blue",
      },
      {
        label: "Faol savat",
        value: `${cart.summary.itemCount} mahsulot`,
        tone: "green",
      },
      {
        label: "Shift",
        value: shift.shift.status === "open" ? "Ochiq" : "Yopiq",
        tone: "violet",
      },
    ],
    [cart.summary.itemCount, shift.shift.status, todaySalesTotal],
  );

  const closeActiveModal = useCallback(() => {
    setActiveModal(null);
    setSelectedProduct(null);
    setEditingItem(null);
    setReturnSale(null);
    setApprovalRequest(null);
  }, []);

  const openProductOptions = useCallback((product) => {
    setSelectedProduct(product);
    setActiveModal("product-options");
  }, []);

  const handleProductSelect = useCallback(
    (product) => {
      if (productNeedsOptions(product)) {
        openProductOptions(product);
        return;
      }

      cart.addItem(product);
      notifications.notify(`${product.name} savatga qo'shildi`, "success");
    },
    [cart, notifications, openProductOptions],
  );

  const addConfiguredProduct = useCallback(
    (product, options) => {
      cart.addItem(product, options);
      notifications.notify(`${product.name} savatga qo'shildi`, "success");
      closeActiveModal();
    },
    [cart, closeActiveModal, notifications],
  );

  const handleBarcodeLookup = useCallback(
    (barcode) => {
      const normalizedBarcode = barcode.trim();
      const product = liveProducts.find(
        (item) =>
          item.barcode === normalizedBarcode ||
          item.sku.toLowerCase() === normalizedBarcode.toLowerCase(),
      );

      if (!product) {
        setBarcodeStatus({ type: "error", message: `${normalizedBarcode} topilmadi` });
        notifications.notify("Barcode topilmadi", "error");
        return;
      }

      if (Number(product.stock) <= 0) {
        setBarcodeStatus({ type: "error", message: `${product.name} stockda yo'q` });
        notifications.notify("Mahsulot stockda yo'q", "error");
        return;
      }

      handleProductSelect(product);
      setBarcodeValue("");
      setBarcodeStatus({ type: "success", message: `${product.name} topildi` });
      playSuccessBeep();
      window.setTimeout(() => {
        searchInputRef.current?.focus();
      }, 80);
    },
    [handleProductSelect, liveProducts, notifications],
  );

  useBarcodeScanner({
    enabled: !activeModal,
    products: liveProducts,
    onScan: (barcode) => handleBarcodeLookup(barcode),
    onMiss: (barcode) => {
      setBarcodeStatus({ type: "error", message: `${barcode} topilmadi` });
      notifications.notify("Scanner barcode topa olmadi", "error");
    },
  });

  const openPayment = useCallback(() => {
    if (!cart.items.length) {
      notifications.notify("Savat bo'sh", "error");
      return;
    }

    setActiveModal("payment");
  }, [cart.items.length, notifications]);

  const openHoldSale = useCallback(() => {
    if (!cart.items.length) {
      notifications.notify("Hold uchun savat bo'sh", "error");
      return;
    }

    setActiveModal("hold");
  }, [cart.items.length, notifications]);

  const openDiscount = useCallback(() => {
    if (!cart.items.length) {
      notifications.notify("Chegirma uchun savat bo'sh", "error");
      return;
    }

    setActiveModal("discount");
  }, [cart.items.length, notifications]);

  const openRecentSales = useCallback((mode = "recent") => {
    setRecentMode(mode);
    setActiveModal("recent");
  }, []);

  const startNewSale = useCallback(() => {
    cart.clearCart();
    setSelectedCustomer(null);
    setReceiptSale(null);
    notifications.notify("Yangi savdo boshlandi", "success");
    searchInputRef.current?.focus();
  }, [cart, notifications]);

  const requestApproval = useCallback((request) => {
    setApprovalRequest(request);
    setActiveModal("approval");
  }, []);

  const handleVoid = useCallback(() => {
    if (!cart.items.length) {
      return;
    }

    if (needsManagerApproval({ action: "void", settings })) {
      requestApproval({
        title: "Void cart",
        message: "Savatni bekor qilish uchun manager tasdig'i kerak.",
        onApprove: () => {
          cart.clearCart();
          notifications.notify("Savat void qilindi", "success");
        },
      });
      return;
    }

    cart.clearCart();
  }, [cart, notifications, requestApproval, settings]);

  const handleQuickAction = useCallback(
    (action) => {
      const handlers = {
        "new-sale": startNewSale,
        search: () => searchInputRef.current?.focus(),
        hold: openHoldSale,
        return: () => openRecentSales("return"),
        payment: openPayment,
        discount: openDiscount,
        note: () => cart.setNote(cart.note ? cart.note : "Kassir izohi: "),
        void: handleVoid,
        settings: () => setActiveModal("settings"),
      };

      handlers[action]?.();
    },
    [cart, handleVoid, openDiscount, openHoldSale, openPayment, openRecentSales, startNewSale],
  );

  const showShortcutFeedback = useCallback((shortcut, label) => {
    if (shortcutTimeoutRef.current) {
      window.clearTimeout(shortcutTimeoutRef.current);
    }

    setShortcutFeedback({ shortcut, label });
    shortcutTimeoutRef.current = window.setTimeout(() => {
      setShortcutFeedback(null);
    }, 1100);
  }, []);

  usePOSKeyboard({
    activeModal,
    onFocusSearch: () => searchInputRef.current?.focus(),
    onNewSale: startNewSale,
    onHoldSale: openHoldSale,
    onPayment: openPayment,
    onDiscount: openDiscount,
    onCustomer: () => setActiveModal("customer"),
    onVoid: handleVoid,
    onPriceCheck: () => barcodeInputRef.current?.focus(),
    onReturn: () => openRecentSales("return"),
    onEscape: closeActiveModal,
    onShortcutFeedback: showShortcutFeedback,
  });

  const handleHoldSale = useCallback(
    (payload) => {
      heldOrders.addHeldOrder({
        ...payload,
        discount: cart.discount,
        bonus: cart.bonus,
        note: payload.note || cart.note,
        summary: cart.summary,
      });

      closeActiveModal();
      cart.clearCart();
      setSelectedCustomer(null);
      notifications.notify("Savdo hold qilindi", "success");
    },
    [cart, closeActiveModal, heldOrders, notifications],
  );

  const handleResumeOrder = useCallback(
    (order) => {
      const resumedOrder = heldOrders.resumeHeldOrder(order.id);

      if (!resumedOrder) {
        return;
      }

      cart.replaceCart({
        items: resumedOrder.items,
        discount: resumedOrder.discount,
        bonus: resumedOrder.bonus,
        note: resumedOrder.note,
      });
      setSelectedCustomer(resumedOrder.customer || null);
      closeActiveModal();
      notifications.notify("Hold order tiklandi", "success");
    },
    [cart, closeActiveModal, heldOrders, notifications],
  );

  const handleCustomerSelect = useCallback(
    (customer) => {
      setSelectedCustomer(customer);

      if (customer?.bonus) {
        const bonusAmount = Math.min(Number(customer.bonus), Math.round(cart.summary.subtotal * 0.02));
        cart.applyBonus(bonusAmount);
        notifications.notify(`${formatMoney(bonusAmount)} bonus qo'llandi`, "success");
      } else {
        cart.removeBonus();
      }

      closeActiveModal();
    },
    [cart, closeActiveModal, notifications],
  );

  const handleDiscountApply = useCallback(
    (nextDiscount) => {
      if (
        needsManagerApproval({
          action: "discount",
          discountPercent:
            nextDiscount.type === "percentage" ? nextDiscount.value : 0,
          settings,
        })
      ) {
        requestApproval({
          title: "Discount approval",
          message: `${nextDiscount.value}% chegirma manager tasdig'ini talab qiladi.`,
          onApprove: () => {
            cart.applyDiscount(nextDiscount);
            notifications.notify("Chegirma tasdiqlandi", "success");
          },
        });
        return;
      }

      cart.applyDiscount(nextDiscount);
      closeActiveModal();
    },
    [cart, closeActiveModal, notifications, requestApproval, settings],
  );

  const handlePaymentComplete = useCallback(
    async (payment) => {
      const paymentResult = await paymentAdapter.charge(payment);
      const sale = recentSales.addSale({
        cashier: "Admin",
        customer: selectedCustomer,
        items: cart.items,
        summary: cart.summary,
        discount: cart.discount,
        bonus: cart.bonus,
        note: cart.note,
        status: offline.isOnline ? "completed" : "queued",
        payment: {
          ...payment,
          method: paymentLabels[payment.method] || payment.method,
          providerReference: paymentResult.providerReference,
        },
      });

      if (!offline.isOnline && settings.offlineQueueEnabled) {
        offline.enqueueSale(sale);
      }

      setReceiptSale(sale);
      cart.clearCart();
      setSelectedCustomer(null);
      setActiveModal("receipt");
      notifications.notify("To'lov yakunlandi", "success");
    },
    [cart, notifications, offline, recentSales, selectedCustomer, settings.offlineQueueEnabled],
  );

  const handleReturnConfirm = useCallback(
    (payload) => {
      const createdReturn = recentSales.addReturn(payload);
      closeActiveModal();
      notifications.notify(`${formatMoney(createdReturn.refundTotal)} refund yaratildi`, "success");
    },
    [closeActiveModal, notifications, recentSales],
  );

  const openShiftModal = useCallback((mode) => {
    setShiftMode(mode);
    setActiveModal("shift");
  }, []);

  const handleShiftClose = useCallback(
    ({ closingCash }) => {
      if (needsManagerApproval({ action: "shift-close", settings })) {
        requestApproval({
          title: "Shift close approval",
          message: "Shift yopish uchun manager tasdig'i kerak.",
          onApprove: () => {
            shift.closeShift({ closingCash, sales: recentSales.sales });
            notifications.notify("Shift yopildi", "success");
          },
        });
        return;
      }

      shift.closeShift({ closingCash, sales: recentSales.sales });
      closeActiveModal();
    },
    [closeActiveModal, notifications, recentSales.sales, requestApproval, settings, shift],
  );

  return {
    refs: {
      searchInputRef,
      barcodeInputRef,
    },
    data: {
      categories: liveCategories,
      customers: liveCustomers,
      products: filteredProducts,
      allProducts: liveProducts,
    },
    state: {
      activeCategory,
      searchQuery,
      activeModal,
      selectedCustomer,
      barcodeValue,
      barcodeStatus,
      receiptSale,
      recentMode,
      selectedProduct,
      editingItem,
      returnSale,
      shiftMode,
      approvalRequest,
      shortcutFeedback,
      recommendation,
      posMetrics,
    },
    cart,
    heldOrders,
    recentSales,
    settings,
    permissions,
    notifications,
    offline,
    shift,
    actions: {
      setActiveCategory,
      setSearchQuery,
      setBarcodeValue,
      setActiveModal,
      closeActiveModal,
      handleBarcodeLookup,
      handleProductSelect,
      addConfiguredProduct,
      setEditingItem,
      handleQuickAction,
      openPayment,
      openHoldSale,
      openDiscount,
      openRecentSales,
      startNewSale,
      handleHoldSale,
      handleResumeOrder,
      handleCustomerSelect,
      handleDiscountApply,
      handlePaymentComplete,
      handleReturnConfirm,
      setReturnSale,
      setReceiptSale,
      openShiftModal,
      updateSettings,
      resetSettings,
      handleShiftClose,
      approveRequest: () => {
        approvalRequest?.onApprove?.();
        closeActiveModal();
      },
      syncOfflineQueue: async () => {
        const synced = await offline.syncQueue();
        if (synced.length) {
          notifications.notify(`${synced.length} offline sale sync qilindi`, "success");
        }
      },
    },
  };
};

export default usePOSController;
