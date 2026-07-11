import { useEffect, useState } from "react";
import { BadgeDollarSign, Clock3, X } from "lucide-react";

import { formatMoney } from "../utils/posMoney";

import "./ShiftModal.scss";

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

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    setAmount("0");
    setReason("");
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  const totalSales = sales.reduce(
    (sum, sale) => sum + Number(sale.summary?.total || 0),
    0,
  );

  const titles = {
    open: "Shift ochish",
    close: "Shift yopish",
    cash: "Cash in / cash out",
    report: "X / Z report",
    status: "Shift status",
  };

  return (
    <div className="pos-shift-modal" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
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
          <div><span>Opening cash</span><strong>{formatMoney(shift?.openingCash)}</strong></div>
          <div><span>Sales</span><strong>{sales.length}</strong></div>
          <div><span>Cash moves</span><strong>{shift?.cashMovements?.length || 0}</strong></div>
        </div>

        {(mode === "open" || mode === "close" || mode === "cash") && (
          <label className="pos-shift-modal__field">
            <span>{mode === "close" ? "Closing cash" : "Amount"}</span>
            <input type="number" min="0" step="1000" value={amount} onChange={(event) => setAmount(event.target.value)} />
          </label>
        )}

        {mode === "cash" && (
          <label className="pos-shift-modal__field">
            <span>Reason</span>
            <input type="text" value={reason} placeholder="Inkassatsiya yoki kassa to'ldirish" onChange={(event) => setReason(event.target.value)} />
          </label>
        )}

        <div className="pos-shift-modal__actions">
          {mode === "open" && <button type="button" onClick={() => onOpenShift?.({ openingCash: Number(amount) || 0 })}>Shift ochish</button>}
          {mode === "close" && <button type="button" onClick={() => onCloseShift?.({ closingCash: Number(amount) || 0 })}>Shift yopish</button>}
          {mode === "cash" && (
            <>
              <button type="button" onClick={() => onCashMovement?.({ type: "cash-in", amount: Number(amount) || 0, reason })}>Cash in</button>
              <button type="button" onClick={() => onCashMovement?.({ type: "cash-out", amount: Number(amount) || 0, reason })}>Cash out</button>
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
