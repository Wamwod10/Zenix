import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  Clock3,
  Flame,
  PackageCheck,
  ReceiptText,
  ShoppingBasket,
  Sparkles,
  Wallet,
} from "lucide-react";

import { formatMoney } from "../utils/posMoney";

import "./POSInsightsPanel.scss";

const formatTimer = (openedAt) => {
  const opened = new Date(openedAt).getTime();

  if (Number.isNaN(opened)) {
    return "00:00";
  }

  const elapsedSeconds = Math.max(Math.floor((Date.now() - opened) / 1000), 0);
  const hours = String(Math.floor(elapsedSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, "0");

  return `${hours}:${minutes}`;
};

const getSaleTime = (createdAt) => {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return new Intl.DateTimeFormat("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const POSInsightsPanel = ({
  products = [],
  cartItems = [],
  recentSales = [],
  shift,
  recommendation,
  onApplyRecommendation,
  onOpenRecentSales,
}) => {
  const [timerLabel, setTimerLabel] = useState(() => formatTimer(shift?.openedAt));

  useEffect(() => {
    setTimerLabel(formatTimer(shift?.openedAt));

    const intervalId = window.setInterval(() => {
      setTimerLabel(formatTimer(shift?.openedAt));
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [shift?.openedAt]);

  const todaySales = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10);

    return recentSales.filter((sale) => sale.createdAt?.slice(0, 10) === todayKey);
  }, [recentSales]);

  const todaySalesTotal = todaySales.reduce(
    (sum, sale) => sum + Number(sale.summary?.total || 0),
    0,
  );
  const cashSalesTotal = todaySales.reduce((sum, sale) => {
    const method = String(sale.payment?.method || "").toLowerCase();

    return method.includes("naqd") || method.includes("cash")
      ? sum + Number(sale.payment?.paidAmount || sale.summary?.total || 0)
      : sum;
  }, 0);
  const cashMoves = (shift?.cashMovements || []).reduce(
    (sum, movement) =>
      movement.type === "cash-out"
        ? sum - Number(movement.amount || 0)
        : sum + Number(movement.amount || 0),
    0,
  );
  const averageCheck = todaySales.length ? todaySalesTotal / todaySales.length : 0;
  const cashInDrawer = Number(shift?.openingCash || 0) + cashSalesTotal + cashMoves;
  const hotProducts = products
    .filter((product) => Number(product.stock) > 0)
    .sort((a, b) => Number(b.favorite) - Number(a.favorite) || Number(a.stock) - Number(b.stock))
    .slice(0, 4);
  const lowStockCount = products.filter(
    (product) => Number(product.stock) > 0 && Number(product.stock) <= 6,
  ).length;
  const bundleLabel = cartItems.length
    ? `${cartItems[0].category || "POS"} bundle`
    : "Bundle kutmoqda";

  return (
    <section className="pos-insights-panel" aria-label="POS intelligence">
      <div className="pos-insights-panel__shift">
        <article>
          <span>Today's Sales</span>
          <strong>{formatMoney(todaySalesTotal)}</strong>
        </article>
        <article>
          <span>Cash in Drawer</span>
          <strong>{formatMoney(cashInDrawer)}</strong>
        </article>
        <article>
          <span>Orders Count</span>
          <strong>{todaySales.length}</strong>
        </article>
        <article>
          <span>Average Check</span>
          <strong>{formatMoney(averageCheck)}</strong>
        </article>
        <article>
          <span>Shift Timer</span>
          <strong>{shift?.status === "open" ? timerLabel : "Closed"}</strong>
        </article>
      </div>

      <div className="pos-insights-panel__body">
        <div className="pos-insights-panel__ai">
          <div className="pos-insights-panel__head">
            <span>
              <Bot size={15} />
              POS AI
            </span>
            <small>{lowStockCount} low-stock alert</small>
          </div>

          <div className="pos-insights-panel__cards">
            <article>
              <ShoppingBasket size={16} />
              <span>Bundle</span>
              <strong>{bundleLabel}</strong>
            </article>
            <article>
              <Sparkles size={16} />
              <span>Cross Sell</span>
              <strong>{recommendation?.title || "AI Recommendation"}</strong>
            </article>
            <article>
              <PackageCheck size={16} />
              <span>Low Stock</span>
              <strong>{lowStockCount ? `${lowStockCount} mahsulot` : "Barqaror"}</strong>
            </article>
          </div>

          <p>{recommendation?.message}</p>
          <button
            type="button"
            disabled={recommendation?.disabled}
            onClick={onApplyRecommendation}
          >
            <Sparkles size={15} />
            {recommendation?.actionLabel || "Tavsiya qo'llash"}
          </button>
        </div>

        <div className="pos-insights-panel__hot">
          <div className="pos-insights-panel__head">
            <span>
              <Flame size={15} />
              Hot Products
            </span>
          </div>

          <div className="pos-insights-panel__hot-list">
            {hotProducts.map((product) => (
              <article key={product.id}>
                <span>{product.name}</span>
                <strong>{formatMoney(product.price)}</strong>
                <small>{product.stock} dona</small>
              </article>
            ))}
          </div>
        </div>

        <div className="pos-insights-panel__recent">
          <div className="pos-insights-panel__head">
            <span>
              <ReceiptText size={15} />
              Recent Sales
            </span>
            <button type="button" onClick={onOpenRecentSales}>Open</button>
          </div>

          <div className="pos-insights-panel__recent-list">
            {recentSales.slice(0, 3).map((sale) => (
              <article key={sale.id}>
                <Clock3 size={14} />
                <span>{getSaleTime(sale.createdAt)}</span>
                <strong>{sale.receiptNumber}</strong>
                <b>{formatMoney(sale.summary?.total)}</b>
              </article>
            ))}

            {!recentSales.length && (
              <div>
                <Wallet size={18} />
                <span>Yakunlangan savdolar shu yerda chiqadi.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default POSInsightsPanel;
