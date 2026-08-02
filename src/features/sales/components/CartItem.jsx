import { Minus, Plus, Trash2 } from "lucide-react";

import { formatMoney } from "../utils/posMoney";

import "./CartItem.scss";

const CartItem = ({
  item,
  active,
  lineTotal,
  onActive,
  onIncrease,
  onDecrease,
  onQuantityChange,
  onRemove,
}) => (
  <div className={["sales-cart-item", active ? "is-active" : ""].filter(Boolean).join(" ")} onClick={() => onActive?.(item.id)}>
    <div className="sales-cart-item__main">
      <strong title={item.name}>{item.name}</strong>
      <small>
        {item.variant?.label || item.unit?.label || "Dona"} · {formatMoney(item.price)}
      </small>
    </div>

    <div className="sales-cart-item__qty" aria-label={`${item.name} miqdori`}>
      <button type="button" aria-label="Kamaytirish" title="Kamaytirish" onClick={() => onDecrease?.(item.id)}>
        <Minus size={14} />
      </button>
      <input
        min={item.weighted ? "0.01" : "1"}
        step={item.weighted ? "0.01" : "1"}
        max={item.stock}
        value={item.quantity}
        aria-label="Miqdor"
        onChange={(event) => onQuantityChange?.(item.id, event.target.value)}
      />
      <button type="button" aria-label="Oshirish" title="Oshirish" onClick={() => onIncrease?.(item.id)}>
        <Plus size={14} />
      </button>
    </div>

    <div className="sales-cart-item__total">
      <strong>{formatMoney(lineTotal ?? item.price * item.quantity)}</strong>
      <small>Qoldiq: {item.stock}</small>
    </div>

    <button
      type="button"
      className="sales-cart-item__remove"
      aria-label="Savatdan olib tashlash"
      title="Olib tashlash"
      onClick={(event) => {
        event.stopPropagation();
        onRemove?.(item.id);
      }}
    >
      <Trash2 size={15} />
    </button>
  </div>
);

export default CartItem;
