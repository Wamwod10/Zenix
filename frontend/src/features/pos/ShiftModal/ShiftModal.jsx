import { useEffect, useMemo, useState } from "react";
import { BadgeDollarSign, Clock3, X } from "lucide-react";

import { formatMoney } from "../utils/posMoney";

import "./ShiftModal.scss";

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

const ShiftModal = ({
  open = false,
  mode = "status",
  shift,
  sales = [],
  onClose,
  onOpenShift,
  onCloseShift,
  onCashMovement,
  onReport,
}) => {
  const [amount, setAmount] = useState("0");
  const [reason, setReason] = useState("");
  const [timerLabel, setTimerLabel] = useState(() => formatTimer(shift?.openedAt));

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    setAmount("0");
    setReason("");
    setTimerLabel(formatTimer(shift?.openedAt));

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };
    const intervalId = window.setInterval(() => {
      setTimerLabel(formatTimer(shift?.openedAt));
    }, 30000);

    window.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleEscape);
      window.clearInterval(intervalId);
      document.body.style.overflow = "";
    };
  }, [onClose, open, shift?.openedAt]);

  const todaySales = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10);

    return sales.filter((sale) => sale.createdAt?.slice(0, 10) === todayKey);
  }, [sales]);
  const totalSales = todaySales.reduce(
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
  const cashInDrawer = Number(shift?.openingCash || 0) + cashSalesTotal + cashMoves;
  const averageCheck = todaySales.length ? totalSales / todaySales.length : 0;

  if (!open) {
    return null;
  }

  const titles = {
    open: "Shift ochish",
    close: "Shift yopish",
    cash: "Cash in / cash out",
    report: "X / Z report",
    status: "Shift status",
  };

  return (
    <div
      className="pos-shift-modal"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}
    >
      <section
        className="pos-shift-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shift-modal-title"
      >
        <div className="pos-shift-modal__header">
          <div>
            <span>
              <Clock3 size={14} />
              POS shift
            </span>
            <h2 id="shift-modal-title">{titles[mode]}</h2>
            <p>{shift?.status === "open" ? "Shift faol" : "Shift yopilgan"} · {formatMoney(totalSales)}</p>
          </div>
          <button type="button" aria-label="Shift oynasini yopish" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="pos-shift-modal__stats">
          <div><span>Today's Sales</span><strong>{formatMoney(totalSales)}</strong></div>
          <div><span>Cash in Drawer</span><strong>{formatMoney(cashInDrawer)}</strong></div>
          <div><span>Orders Count</span><strong>{todaySales.length}</strong></div>
          <div><span>Average Check</span><strong>{formatMoney(averageCheck)}</strong></div>
          <div><span>Shift Timer</span><strong>{shift?.status === "open" ? timerLabel : "Closed"}</strong></div>
        </div>

        {(mode === "open" || mode === "close" || mode === "cash") && (
          <label className="pos-shift-modal__field">
            <span>{mode === "close" ? "Closing cash" : "Amount"}</span>
            <input
              type="number"
              min="0"
              step="1000"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </label>
        )}

        {mode === "cash" && (
          <label className="pos-shift-modal__field">
            <span>Reason</span>
            <input
              type="text"
              value={reason}
              placeholder="Inkassatsiya yoki kassa to'ldirish"
              onChange={(event) => setReason(event.target.value)}
            />
          </label>
        )}

        <div className="pos-shift-modal__actions">
          {mode === "open" && (
            <button type="button" onClick={() => onOpenShift?.({ openingCash: Number(amount) || 0 })}>
              Shift ochish
            </button>
          )}
          {mode === "close" && (
            <button type="button" onClick={() => onCloseShift?.({ closingCash: Number(amount) || 0 })}>
              Shift yopish
            </button>
          )}
          {mode === "cash" && (
            <>
              <button
                type="button"
                onClick={() => onCashMovement?.({ type: "cash-in", amount: Number(amount) || 0, reason })}
              >
                Cash in
              </button>
              <button
                type="button"
                onClick={() => onCashMovement?.({ type: "cash-out", amount: Number(amount) || 0, reason })}
              >
                Cash out
              </button>
            </>
          )}
          {mode === "report" && (
            <>
              <button type="button" onClick={() => onReport?.("X-report")}>X-report</button>
              <button type="button" onClick={() => onReport?.("Z-report")}>
                <BadgeDollarSign size={16} />
                Z-report
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default ShiftModal;
