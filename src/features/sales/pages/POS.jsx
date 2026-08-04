import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Cloud,
  MoreHorizontal,
  PauseCircle,
  ReceiptText,
  RotateCcw,
  History,
  UserRound,
  Wifi,
  WifiOff,
} from "lucide-react";

import {
  businessOSActions,
  selectPOSCategories,
  selectPOSCustomers,
  selectPOSProducts,
} from "../../../core/businessOS/businessOSSlice";
import { calculateOrderTotals } from "../utils/posCalculations";
import { createHeldOrderId, createReceiptNumber, createSaleId } from "../utils/posIds";
import { formatMoney } from "../utils/posMoney";
import POSCart from "../components/POSCart";
import PaymentPanel from "../components/PaymentPanel";
import ProductWorkspace from "../components/ProductWorkspace";

import "./POS.scss";

const DRAFT_KEY = "zenix.sales.activeDraft.v2";
const HELD_KEY = "zenix.sales.heldOrders.v2";
const RECENT_KEY = "zenix.sales.recentSales.v2";

const readJSON = (key, fallback) => {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = (key, value) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // POS keeps working in memory if browser storage is unavailable.
  }
};

const makeCartItem = (product) => {
  const variant = product.variants?.[0] || null;
  const unit = product.units?.[0] || { id: "piece", label: "Dona", multiplier: 1 };
  const price = Number(product.price || 0) + Number(variant?.priceDelta || 0);

  return {
    id: `${product.id}-${variant?.id || "default"}-${unit.id}`,
    productId: product.id,
    name: product.name,
    sku: product.sku,
    barcode: product.barcode,
    variant,
    unit,
    weighted: Boolean(product.weighted),
    quantity: product.weighted ? 0.1 : 1,
    price,
    unitCost: Number(product.currentCost ?? product.cost ?? product.lastPurchaseCost ?? 0),
    stock: product.stock,
    discount: null,
  };
};

const getItemLineTotal = (item) => {
  const subtotal = Number(item.price || 0) * Number(item.quantity || 0);

  if (!item.discount) {
    return subtotal;
  }

  const value = Number(item.discount.value || 0);
  const discountAmount =
    item.discount.type === "percentage" ? Math.round((subtotal * value) / 100) : value;

  return Math.max(subtotal - Math.min(discountAmount, subtotal), 0);
};

const POS = () => {
  const dispatch = useDispatch();
  const posProducts = useSelector(selectPOSProducts);
  const posCategories = useSelector(selectPOSCategories);
  const posCustomers = useSelector(selectPOSCustomers);
  const searchInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Barchasi");
  const [cartItems, setCartItems] = useState(() => readJSON(DRAFT_KEY, {}).items || []);
  const [customer, setCustomer] = useState(() => readJSON(DRAFT_KEY, {}).customer || null);
  const [discount, setDiscount] = useState(() => readJSON(DRAFT_KEY, {}).discount || null);
  const [note, setNote] = useState(() => readJSON(DRAFT_KEY, {}).note || "");
  const [heldOrders, setHeldOrders] = useState(() => readJSON(HELD_KEY, []));
  const [recentSales, setRecentSales] = useState(() => readJSON(RECENT_KEY, []));
  const [activeItemId, setActiveItemId] = useState(null);
  const [lastAddedId, setLastAddedId] = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const [toast, setToast] = useState("");
  const [mobileView, setMobileView] = useState("products");
  const [isOnline, setIsOnline] = useState(true);

  const totals = useMemo(
    () =>
      calculateOrderTotals({
        items: cartItems,
        discount,
        taxRate: 0,
      }),
    [cartItems, discount],
  );

  const showToast = useCallback((message) => {
    setToast(message);
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(""), 2600);
  }, []);

  const persistDraft = useCallback(() => {
    writeJSON(DRAFT_KEY, {
      items: cartItems,
      customer,
      discount,
      note,
      updatedAt: new Date().toISOString(),
    });
  }, [cartItems, customer, discount, note]);

  useEffect(() => {
    const timeout = window.setTimeout(persistDraft, 180);
    return () => window.clearTimeout(timeout);
  }, [persistDraft]);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const addProduct = useCallback(
    (product) => {
      if (!product || product.stock <= 0) {
        showToast("Qoldiq yo'q: mahsulot savatga qo'shilmadi");
        return;
      }

      const nextItem = makeCartItem(product);

      setCartItems((items) => {
        const existing = items.find((item) => item.id === nextItem.id);

        if (existing) {
          if (Number(existing.quantity) + Number(nextItem.quantity) > Number(existing.stock)) {
            showToast("Qoldiqdan ortiq qo'shib bo'lmaydi");
            return items;
          }

          return items.map((item) =>
            item.id === nextItem.id
              ? { ...item, quantity: Number(item.quantity) + Number(nextItem.quantity) }
              : item,
          );
        }

        return [nextItem, ...items];
      });

      setActiveItemId(nextItem.id);
      setLastAddedId(nextItem.id);
      setMobileView("cart");
      window.setTimeout(() => setLastAddedId(null), 620);
    },
    [showToast],
  );

  const handleBarcodeSubmit = useCallback(
    (value) => {
      const normalizedValue = value.trim().toLowerCase();
      const match = posProducts.find(
        (product) =>
          product.barcode?.toLowerCase() === normalizedValue ||
          product.sku?.toLowerCase() === normalizedValue,
      );

      if (match) {
        addProduct(match);
        setSearchQuery("");
        showToast(`${match.name} savatga qo'shildi`);
        return;
      }

      showToast("Barcode yoki SKU topilmadi. Nom bo'yicha qidiring.");
    },
    [addProduct, posProducts, showToast],
  );

  const updateQuantity = useCallback(
    (itemId, nextQuantity) => {
      setCartItems((items) =>
        items.map((item) => {
          if (item.id !== itemId) {
            return item;
          }

          const minQuantity = item.weighted ? 0.01 : 1;
          const quantity = Math.max(Number(nextQuantity) || 0, minQuantity);

          if (quantity > Number(item.stock)) {
            showToast("Mavjud qoldiqdan ortiq miqdor kiritildi");
            return item;
          }

          return { ...item, quantity };
        }),
      );
    },
    [showToast],
  );

  const increaseItem = (itemId) => {
    const item = cartItems.find((cartItem) => cartItem.id === itemId);
    if (!item) return;
    updateQuantity(itemId, Number(item.quantity) + (item.weighted ? 0.1 : 1));
  };

  const decreaseItem = (itemId) => {
    const item = cartItems.find((cartItem) => cartItem.id === itemId);
    if (!item) return;
    updateQuantity(itemId, Number(item.quantity) - (item.weighted ? 0.1 : 1));
  };

  const removeItem = (itemId) => {
    setCartItems((items) => items.filter((item) => item.id !== itemId));
    if (activeItemId === itemId) {
      setActiveItemId(null);
    }
  };

  const startNewSale = useCallback(() => {
    setCartItems([]);
    setCustomer(null);
    setDiscount(null);
    setNote("");
    setActiveItemId(null);
    setActivePanel(null);
    setMobileView("products");
    writeJSON(DRAFT_KEY, {});
    window.setTimeout(() => searchInputRef.current?.focus(), 60);
  }, []);

  const holdSale = useCallback(() => {
    if (!cartItems.length) {
      showToast("Saqlash uchun savatda mahsulot yo'q");
      return;
    }

    const order = {
      id: createHeldOrderId(),
      customer,
      items: cartItems,
      discount,
      note,
      total: totals.total,
      createdAt: new Date().toISOString(),
    };
    const nextOrders = [order, ...heldOrders].slice(0, 20);

    setHeldOrders(nextOrders);
    writeJSON(HELD_KEY, nextOrders);
    showToast("Savdo vaqtincha saqlandi");
    startNewSale();
  }, [cartItems, customer, discount, heldOrders, note, showToast, startNewSale, totals.total]);

  const resumeHeldOrder = (order) => {
    setCartItems(order.items);
    setCustomer(order.customer);
    setDiscount(order.discount);
    setNote(order.note || "");
    const nextOrders = heldOrders.filter((heldOrder) => heldOrder.id !== order.id);
    setHeldOrders(nextOrders);
    writeJSON(HELD_KEY, nextOrders);
    setActivePanel(null);
    setMobileView("cart");
  };

  const applyDiscount = (type, value) => {
    const amount = Math.max(Number(value) || 0, 0);
    if (!amount) {
      setDiscount(null);
    } else {
      setDiscount({ type, value: amount });
    }
    setActivePanel(null);
  };

  const completePayment = async (payment) => {
    const sale = {
      id: createSaleId(),
      receiptNumber: createReceiptNumber(recentSales.length),
      status: "completed",
      items: cartItems,
      customer,
      customerId: customer?.id || null,
      cashierId: "system",
      discount,
      note,
      totals,
      payment,
      paymentStatus: payment?.method === "debt" ? "receivable" : "paid",
      createdAt: new Date().toISOString(),
    };
    const nextSales = [sale, ...recentSales].slice(0, 30);

    setRecentSales(nextSales);
    writeJSON(RECENT_KEY, nextSales);
    dispatch(businessOSActions.saleCompleted({ sale, userId: "system" }));
    showToast(`Chek tayyor: ${sale.receiptNumber}`);
    startNewSale();
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      const isEditable =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if (event.key === "Escape" && activePanel) {
        event.preventDefault();
        setActivePanel(null);
        return;
      }

      if (isEditable) {
        return;
      }

      if (event.key === "/" || event.key === "F3") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }

      if (event.key === "F2") {
        event.preventDefault();
        startNewSale();
      }

      if (event.key === "F4") {
        event.preventDefault();
        if (cartItems.length) setActivePanel("payment");
      }

      if (event.key === "F6") {
        event.preventDefault();
        holdSale();
      }

      if (event.key === "F7") {
        event.preventDefault();
        setActivePanel("customer");
      }

      if (event.key === "F9") {
        event.preventDefault();
        if (cartItems.length) setActivePanel("discount");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePanel, cartItems.length, holdSale, startNewSale]);

  return (
    <main className="sales-pos">
      <header className="sales-pos__header">
        <div className="sales-pos__context">
          <span>Savdo paneli</span>
          <strong>Kassir workspace</strong>
        </div>

        <div className="sales-pos__status" aria-label="Kassa holati">
          <button type="button" className="sales-pos__history-button" onClick={() => setActivePanel("history")}>
            <History size={16} />
            <span>Savdolar tarixi</span>
          </button>
          <span className="sales-pos__pill sales-pos__pill--success">Smena ochiq</span>
          <span className="sales-pos__pill">Kassir: Dilshod</span>
          <button
            type="button"
            className="sales-pos__status-button"
            aria-label={isOnline ? "Online rejim" : "Offline rejim"}
            onClick={() => setIsOnline((value) => !value)}
          >
            {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span>{isOnline ? "Online" : "Offline · 2"}</span>
          </button>
          <button type="button" className="sales-pos__status-button" onClick={() => setActivePanel("held")}>
            <PauseCircle size={16} />
            <span>Saqlangan · {heldOrders.length}</span>
          </button>
        </div>
      </header>

      <div className="sales-pos__mobile-tabs" role="tablist" aria-label="POS bo'limlari">
        <button
          type="button"
          className={mobileView === "products" ? "is-active" : ""}
          onClick={() => setMobileView("products")}
        >
          Mahsulotlar
        </button>
        <button
          type="button"
          className={mobileView === "cart" ? "is-active" : ""}
          onClick={() => setMobileView("cart")}
        >
          Savat · {cartItems.length}
        </button>
      </div>

      <section className={`sales-pos__workspace sales-pos__workspace--${mobileView}`}>
        <ProductWorkspace
          searchInputRef={searchInputRef}
          categories={posCategories}
          products={posProducts}
          query={searchQuery}
          activeCategory={activeCategory}
          lastAddedId={lastAddedId}
          onQueryChange={setSearchQuery}
          onCategoryChange={setActiveCategory}
          onBarcodeSubmit={handleBarcodeSubmit}
          onProductSelect={addProduct}
        />

        <POSCart
          customer={customer}
          customerLabel={customer ? customer.name : "Mijoz biriktirilmagan"}
          items={cartItems}
          totals={totals}
          discount={discount}
          note={note}
          activeItemId={activeItemId}
          getLineTotal={(item) => Math.max(getItemLineTotal(item), 0)}
          onActiveItemChange={setActiveItemId}
          onCustomerClick={() => setActivePanel("customer")}
          onNoteChange={setNote}
          onIncrease={increaseItem}
          onDecrease={decreaseItem}
          onQuantityChange={updateQuantity}
          onRemove={removeItem}
          onClear={startNewSale}
          onHold={holdSale}
          onDiscount={() => setActivePanel("discount")}
          onPayment={() => setActivePanel("payment")}
        />
      </section>

      <div className="sales-pos__bottom-total">
        <span>{formatMoney(totals.total)}</span>
        <button type="button" disabled={!cartItems.length} onClick={() => setActivePanel("payment")}>
          To'lov F4
        </button>
      </div>

      <PaymentPanel
        open={activePanel === "payment"}
        total={totals.total}
        isOnline={isOnline}
        customer={customer}
        onClose={() => setActivePanel(null)}
        onComplete={completePayment}
      />

      {activePanel === "customer" && (
        <div className="sales-pos__overlay" role="presentation" onMouseDown={() => setActivePanel(null)}>
          <section
            className="sales-pos__drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sales-customer-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="sales-pos__drawer-head">
              <div>
                <span>Mijoz</span>
                <h2 id="sales-customer-title">Mijoz tanlash</h2>
              </div>
              <button type="button" aria-label="Yopish" onClick={() => setActivePanel(null)}>
                <MoreHorizontal size={18} />
              </button>
            </div>

            <div className="sales-pos__drawer-list">
              <button
                type="button"
                className="sales-pos__customer-option"
                onClick={() => {
                  setCustomer(null);
                  setActivePanel(null);
                }}
              >
                <UserRound size={18} />
                <span>Mijoz biriktirilmagan</span>
              </button>

              {posCustomers.map((item) => (
                <button
                  type="button"
                  className="sales-pos__customer-option"
                  key={item.id}
                  onClick={() => {
                    setCustomer(item);
                    setActivePanel(null);
                  }}
                >
                  <UserRound size={18} />
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.phone} · bonus {formatMoney(item.bonus)}</small>
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {activePanel === "held" && (
        <div className="sales-pos__overlay" role="presentation" onMouseDown={() => setActivePanel(null)}>
          <section
            className="sales-pos__drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sales-held-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="sales-pos__drawer-head">
              <div>
                <span>Hold</span>
                <h2 id="sales-held-title">Saqlangan savdolar</h2>
              </div>
              <button type="button" aria-label="Yopish" onClick={() => setActivePanel(null)}>
                <MoreHorizontal size={18} />
              </button>
            </div>

            <div className="sales-pos__drawer-list">
              {heldOrders.length ? (
                heldOrders.map((order) => (
                  <button
                    type="button"
                    className="sales-pos__held-order"
                    key={order.id}
                    onClick={() => resumeHeldOrder(order)}
                  >
                    <span>
                      <strong>{order.customer?.name || "Mijozsiz savdo"}</strong>
                      <small>{order.items.length} mahsulot · {new Date(order.createdAt).toLocaleTimeString("uz-UZ")}</small>
                    </span>
                    <b>{formatMoney(order.total)}</b>
                  </button>
                ))
              ) : (
                <div className="sales-pos__empty-drawer">
                  <Cloud size={24} />
                  <span>Saqlangan savdolar yo'q</span>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {activePanel === "discount" && (
        <div className="sales-pos__overlay" role="presentation" onMouseDown={() => setActivePanel(null)}>
          <section
            className="sales-pos__discount"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sales-discount-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="sales-pos__drawer-head">
              <div>
                <span>Chegirma</span>
                <h2 id="sales-discount-title">Savdo chegirmasi</h2>
              </div>
              <button type="button" aria-label="Yopish" onClick={() => setActivePanel(null)}>
                <MoreHorizontal size={18} />
              </button>
            </div>

            <DiscountForm discount={discount} total={totals.subtotal} onApply={applyDiscount} />
          </section>
        </div>
      )}

      {activePanel === "history" && (
        <div className="sales-pos__overlay sales-pos__overlay--center" role="presentation" onMouseDown={() => setActivePanel(null)}>
          <section
            className="sales-pos__history"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sales-history-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="sales-pos__drawer-head">
              <div>
                <span>Tarix</span>
                <h2 id="sales-history-title">Savdolar tarixi</h2>
              </div>
              <button type="button" aria-label="Yopish" onClick={() => setActivePanel(null)}>
                <MoreHorizontal size={18} />
              </button>
            </div>

            <div className="sales-pos__history-list">
              {recentSales.length ? (
                recentSales.map((sale) => (
                  <article className="sales-pos__history-item" key={sale.id}>
                    <div>
                      <strong>{sale.receiptNumber}</strong>
                      <span>
                        {sale.customer?.name || "Mijozsiz savdo"} · {new Date(sale.createdAt).toLocaleString("uz-UZ")}
                      </span>
                    </div>
                    <div>
                      <b>{formatMoney(sale.totals?.total || 0)}</b>
                      <small>{sale.items?.length || 0} mahsulot · {sale.payment?.method || "payment"}</small>
                    </div>
                  </article>
                ))
              ) : (
                <div className="sales-pos__empty-drawer">
                  <ReceiptText size={24} />
                  <span>Hali savdolar tarixi yo'q</span>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {recentSales[0] && (
        <button className="sales-pos__receipt" type="button" aria-label="Oxirgi chek">
          <ReceiptText size={16} />
          <span>{recentSales[0].receiptNumber}</span>
        </button>
      )}

      <div className="sales-pos__live" role="status" aria-live="polite">
        {toast}
      </div>
    </main>
  );
};

const DiscountForm = ({ discount, total, onApply }) => {
  const [type, setType] = useState(discount?.type || "fixed");
  const [value, setValue] = useState(discount?.value || "");

  return (
    <form
      className="sales-pos__discount-form"
      onSubmit={(event) => {
        event.preventDefault();
        onApply(type, value);
      }}
    >
      <div className="sales-pos__segments">
        <button type="button" className={type === "fixed" ? "is-active" : ""} onClick={() => setType("fixed")}>
          Summa
        </button>
        <button
          type="button"
          className={type === "percentage" ? "is-active" : ""}
          onClick={() => setType("percentage")}
        >
          Foiz
        </button>
      </div>
      <label>
        <span>Qiymat</span>
        <input
          type="number"
          min="0"
          max={type === "percentage" ? 100 : total}
          value={value}
          autoFocus
          onChange={(event) => setValue(event.target.value)}
        />
      </label>
      <div className="sales-pos__discount-actions">
        <button type="button" onClick={() => onApply("fixed", 0)}>
          <RotateCcw size={16} />
          Olib tashlash
        </button>
        <button type="submit">Qo'llash</button>
      </div>
    </form>
  );
};

export default POS;
