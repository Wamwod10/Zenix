import { useEffect, useMemo, useState } from "react";
import { ArchiveRestore, Search, X } from "lucide-react";

import HeldOrderCard from "../HeldOrderCard/HeldOrderCard";

import "./HeldOrders.scss";

const HeldOrders = ({
  open = false,
  orders = [],
  onClose,
  onResume,
  onDelete,
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

  const filteredOrders = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return orders;
    }

    return orders.filter((order) => {
      const customerName = order.customer?.name || "Nomsiz mijoz";

      return (
        order.orderNumber.toLowerCase().includes(normalized) ||
        customerName.toLowerCase().includes(normalized) ||
        order.note?.toLowerCase().includes(normalized)
      );
    });
  }, [orders, query]);

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
      className="pos-held-orders"
      role="presentation"
      onMouseDown={handleBackdropClick}
    >
      <section
        className="pos-held-orders__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="held-orders-title"
      >
        <div className="pos-held-orders__header">
          <div>
            <span className="pos-held-orders__eyebrow">
              <ArchiveRestore size={14} />
              To'xtatilgan savdolar
            </span>

            <h2 id="held-orders-title">Saqlangan savdolar</h2>

            <p>Vaqtincha to‘xtatilgan savdoni tanlab davom ettiring.</p>
          </div>

          <button
            className="pos-held-orders__close"
            type="button"
            aria-label="Saqlangan savdolar oynasini yopish"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <label className="pos-held-orders__search">
          <Search size={17} />
          <input
            type="search"
            value={query}
            placeholder="Buyurtma, mijoz yoki izoh..."
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <div className="pos-held-orders__list">
          {filteredOrders.length ? (
            filteredOrders.map((order) => (
              <HeldOrderCard
                order={order}
                key={order.id}
                onResume={onResume}
                onDelete={onDelete}
              />
            ))
          ) : (
            <div className="pos-held-orders__empty">
              <ArchiveRestore size={28} />
              <strong>Saqlangan savdo yo‘q</strong>
              <span>Hold qilingan savdolar shu yerda ko‘rinadi.</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HeldOrders;
