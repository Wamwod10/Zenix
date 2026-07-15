import { BadgePercent, Minus, Plus, Trash2 } from "lucide-react";
import { calculateItemDiscountAmount } from "../utils/posCalculations";
import { calculateLineTotal, formatMoney } from "../utils/posMoney";

import "./CartItem.scss";

const CartItem = ({ item, onDecrease, onIncrease, onRemove, onEdit }) => {
  const isMaxQuantity = Number(item.quantity) >= Number(item.stock);
  const itemDiscount = calculateItemDiscountAmount(item);
  const lineTotal = calculateLineTotal(item.price, item.quantity) - itemDiscount;
  const meta = [
    item.variant?.label,
    item.unit?.label,
    item.serial,
    item.weight ? `${item.weight} kg` : null,
  ].filter(Boolean);

  return (
    <article className="pos-cart-item">
      <div className="pos-cart-item__info">
        <strong>{item.name}</strong>
        <span>{item.sku} · {formatMoney(item.price)}</span>
        {meta.length > 0 && <small>{meta.join(" · ")}</small>}
        {itemDiscount > 0 && (
          <small>Item discount: -{formatMoney(itemDiscount)}</small>
        )}
      </div>

      <div className="pos-cart-item__footer">
        <div className="pos-cart-item__controls">
          <button
            type="button"
            aria-label={`${item.name} miqdorini kamaytirish`}
            onClick={() => onDecrease?.(item.id)}
          >
            <Minus size={13} />
          </button>

          <b>{item.quantity}</b>

          <button
            type="button"
            aria-label={`${item.name} miqdorini oshirish`}
            disabled={isMaxQuantity}
            onClick={() => onIncrease?.(item.id)}
          >
            <Plus size={13} />
          </button>
        </div>

        <div className="pos-cart-item__price">
          <span>Subtotal</span>
          <strong>{formatMoney(lineTotal)}</strong>
        </div>

        <div className="pos-cart-item__actions">
          <button
            type="button"
            aria-label={`${item.name} chegirmasini tahrirlash`}
            onClick={() => onEdit?.(item)}
          >
            <BadgePercent size={13} />
          </button>
          <button
            type="button"
            aria-label={`${item.name}ni savatdan o'chirish`}
            onClick={() => onRemove?.(item.id)}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </article>
  );
};

export default CartItem;
