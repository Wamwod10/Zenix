import { ReceiptText, RotateCcw, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { formatMoney } from "../utils/posMoney";

import "./RecentSales.scss";

const getTime = (createdAt) => {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return new Intl.DateTimeFormat("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const RecentSales = ({
  open = false,
  sales = [],
  mode = "recent",
  onClose,
  onReopenReceipt,
  onReturnSale,
}) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    setQuery("");

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

  const filteredSales = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return sales;
    }

    return sales.filter((sale) => {
      const customerName = sale.customer?.name || "Walk-in customer";

      return (
        sale.receiptNumber.toLowerCase().includes(normalized) ||
        customerName.toLowerCase().includes(normalized)
      );
    });
  }, [query, sales]);

  if (!open) {
    return null;
  }

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div
      className="pos-recent-sales"
      role="presentation"
      onMouseDown={handleBackdropClick}
    >
      <section
        className="pos-recent-sales__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recent-sales-title"
      >
        <div className="pos-recent-sales__header">
          <div>
            <span className="pos-recent-sales__eyebrow">
              <ReceiptText size={14} />
              {mode === "return" ? "Return flow" : "Recent sales"}
            </span>
            <h2 id="recent-sales-title">
              {mode === "return" ? "Qaytarma uchun savdo tanlash" : "Yaqindagi savdolar"}
            </h2>
            <p>Chekni qayta ochish yoki return flow uchun savdoni tanlang.</p>
          </div>
          <button
            className="pos-recent-sales__close"
            type="button"
            aria-label="Yaqindagi savdolar oynasini yopish"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <label className="pos-recent-sales__search">
          <Search size={17} />
          <input
            type="search"
            value={query}
            placeholder="Receipt yoki mijoz..."
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <div className="pos-recent-sales__list">
          {filteredSales.length ? (
            filteredSales.map((sale) => {
              const itemCount = sale.items.reduce(
                (sum, item) => sum + Number(item.quantity || 0),
                0,
              );

              return (
                <article className="pos-recent-sales__card" key={sale.id}>
                  <div>
                    <span>{getTime(sale.createdAt)}</span>
                    <strong>{sale.receiptNumber}</strong>
                    <small>{sale.customer?.name || "Walk-in customer"} · {itemCount} mahsulot</small>
                  </div>
                  <b>{formatMoney(sale.summary.total)}</b>
                  <button type="button" onClick={() => onReopenReceipt?.(sale)}>
                    <ReceiptText size={15} />
                    Receipt
                  </button>
                  <button type="button" onClick={() => onReturnSale?.(sale)}>
                    <RotateCcw size={15} />
                    Return
                  </button>
                </article>
              );
            })
          ) : (
            <div className="pos-recent-sales__empty">
              <ReceiptText size={28} />
              <strong>Savdo topilmadi</strong>
              <span>Yakunlangan savdolar shu yerda chiqadi.</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default RecentSales;
