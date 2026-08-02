import { useState } from "react";
import { BadgePercent, FileText, PauseCircle, UserRound, WalletCards, XCircle } from "lucide-react";

import CartItem from "./CartItem";
import OrderSummary from "./OrderSummary";
import PaymentButton from "./PaymentButton";

import "./POSCart.scss";

const POSCart = ({
  customer,
  customerLabel,
  items = [],
  totals,
  discount,
  note = "",
  activeItemId,
  getLineTotal,
  onActiveItemChange,
  onCustomerClick,
  onNoteChange,
  onIncrease,
  onDecrease,
  onQuantityChange,
  onRemove,
  onClear,
  onHold,
  onDiscount,
  onPayment,
}) => {
  const hasItems = items.length > 0;
  const [noteOpen, setNoteOpen] = useState(Boolean(note));

  return (
    <aside className="pos-cart-panel" aria-label="Savat">
      <div className="pos-cart-panel__head">
        <div>
          <span>Savat</span>
          <h2>{items.length} mahsulot</h2>
        </div>
        <button
          type="button"
          disabled={!hasItems}
          title={hasItems ? "Savatni tozalash" : "Savat bo'sh"}
          onClick={() => {
            if (window.confirm("Savat tozalansinmi?")) {
              onClear?.();
            }
          }}
        >
          <XCircle size={16} />
          <span>Tozalash</span>
        </button>
      </div>

      <button type="button" className="pos-cart-panel__customer" onClick={onCustomerClick}>
        <UserRound size={17} />
        <span>
          <strong>{customerLabel}</strong>
          <small>{customer ? `${customer.phone} · ${customer.level}` : "F7 orqali mijoz tanlash"}</small>
        </span>
      </button>

      <div className="pos-cart-panel__items">
        {hasItems ? (
          items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              active={activeItemId === item.id}
              lineTotal={getLineTotal?.(item)}
              onActive={onActiveItemChange}
              onIncrease={onIncrease}
              onDecrease={onDecrease}
              onQuantityChange={onQuantityChange}
              onRemove={onRemove}
            />
          ))
        ) : (
          <div className="pos-cart-panel__empty">
            <WalletCards size={24} />
            <strong>Savat bo'sh</strong>
            <span>Mahsulotni skanerlang yoki katalogdan tanlang.</span>
          </div>
        )}
      </div>

      <div className={["pos-cart-panel__note", noteOpen || note ? "is-open" : ""].filter(Boolean).join(" ")}>
        {noteOpen || note ? (
          <label>
            <span>Izoh</span>
            <input
              type="text"
              value={note}
              placeholder="Qisqa izoh"
              onChange={(event) => onNoteChange?.(event.target.value)}
            />
          </label>
        ) : (
          <button type="button" onClick={() => setNoteOpen(true)}>
            <FileText size={15} />
            <span>Izoh qo'shish</span>
          </button>
        )}
      </div>

      <div className="pos-cart-panel__actions">
        <button
          type="button"
          disabled={!hasItems}
          title={hasItems ? "Savdoni vaqtincha saqlash" : "Hold uchun savatda mahsulot bo'lishi kerak"}
          onClick={onHold}
        >
          <PauseCircle size={16} />
          <span>Hold</span>
          <kbd>F6</kbd>
        </button>
        <button
          type="button"
          disabled={!hasItems}
          title={hasItems ? "Chegirma qo'llash" : "Chegirma uchun savatda mahsulot bo'lishi kerak"}
          onClick={onDiscount}
        >
          <BadgePercent size={16} />
          <span>Chegirma</span>
          <kbd>F9</kbd>
        </button>
      </div>

      <div className="pos-cart-panel__footer">
        <OrderSummary totals={totals} discount={discount} />
        <PaymentButton total={totals?.total || 0} disabled={!hasItems} onClick={onPayment} />
      </div>
    </aside>
  );
};

export default POSCart;
