import { FileDown, Mail, Printer, ReceiptText, RotateCcw, Send, X } from "lucide-react";
import { useEffect } from "react";

import { calculateLineTotal, formatMoney } from "../utils/posMoney";

import "./ReceiptPreview.scss";

const ReceiptPreview = ({ open = false, sale = null, onClose, onNewSale, onPrint }) => {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

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

  if (!open || !sale) {
    return null;
  }

  const createdAt = new Date(sale.createdAt);
  const dateLabel = Number.isNaN(createdAt.getTime())
    ? "Sana aniqlanmadi"
    : new Intl.DateTimeFormat("uz-UZ", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(createdAt);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div
      className="pos-receipt-preview"
      role="presentation"
      onMouseDown={handleBackdropClick}
    >
      <section
        className="pos-receipt-preview__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-preview-title"
      >
        <div className="pos-receipt-preview__header">
          <div>
            <span className="pos-receipt-preview__eyebrow">
              <ReceiptText size={14} />
              Receipt
            </span>
            <h2 id="receipt-preview-title">Chek preview</h2>
            <p>{sale.receiptNumber} · {dateLabel}</p>
          </div>
          <button
            className="pos-receipt-preview__close"
            type="button"
            aria-label="Chek oynasini yopish"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="pos-receipt-preview__paper">
          <div className="pos-receipt-preview__brand">
            <strong>ZENIX POS</strong>
            <span>Sale ID: {sale.id}</span>
            <span>Kassir: {sale.cashier || "Admin"}</span>
            <span>Mijoz: {sale.customer?.name || "Walk-in customer"}</span>
          </div>

          <div className="pos-receipt-preview__items">
            {sale.items.map((item) => (
              <div className="pos-receipt-preview__item" key={item.id}>
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.quantity} x {formatMoney(item.price)}</small>
                </span>
                <b>{formatMoney(calculateLineTotal(item.price, item.quantity))}</b>
              </div>
            ))}
          </div>

          <div className="pos-receipt-preview__totals">
            <div><span>Subtotal</span><strong>{formatMoney(sale.summary.subtotal)}</strong></div>
            <div><span>Chegirma</span><strong>-{formatMoney(sale.summary.discount)}</strong></div>
            <div><span>Soliq</span><strong>{formatMoney(sale.summary.tax)}</strong></div>
            <div className="is-total"><span>Jami</span><strong>{formatMoney(sale.summary.total)}</strong></div>
            <div><span>Payment</span><strong>{sale.payment.method}</strong></div>
            <div><span>Qabul qilindi</span><strong>{formatMoney(sale.payment.paidAmount)}</strong></div>
            <div><span>Qaytim</span><strong>{formatMoney(sale.payment.change)}</strong></div>
          </div>
        </div>

        <div className="pos-receipt-preview__footer">
          <button type="button" onClick={() => onPrint?.(sale)}>
            <Printer size={17} />
            Print
          </button>
          <button type="button" onClick={() => onPrint?.(sale)}>
            <FileDown size={17} />
            PDF
          </button>
          <button type="button">
            <Send size={17} />
            Telegram
          </button>
          <button type="button">
            <Mail size={17} />
            Email
          </button>
          <button type="button" onClick={onNewSale}>
            <RotateCcw size={17} />
            New sale
          </button>
          <button type="button" onClick={onClose}>Close</button>
        </div>
      </section>
    </div>
  );
};

export default ReceiptPreview;
