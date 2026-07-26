import { Clock3, Play, ShoppingBag, Trash2, UserRound } from "lucide-react";

import { formatMoney } from "../utils/posMoney";

import "./HeldOrderCard.scss";

const formatHeldTime = (createdAt) => {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "Vaqt aniqlanmadi";
  }

  return new Intl.DateTimeFormat("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const HeldOrderCard = ({ order, onResume, onDelete }) => {
  const itemCount = order.items.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );

  return (
    <article className="pos-held-order-card">
      <div className="pos-held-order-card__head">
        <div>
          <span className="pos-held-order-card__number">
            #{order.orderNumber}
          </span>

          <strong>{order.note || "Izohsiz savdo"}</strong>
        </div>

        <span className="pos-held-order-card__time">
          <Clock3 size={13} />
          {formatHeldTime(order.createdAt)}
        </span>
      </div>

      <div className="pos-held-order-card__meta">
        <span>
          <UserRound size={14} />
          {order.customer?.name || "Nomsiz mijoz"}
        </span>

        <span>
          <ShoppingBag size={14} />
          {itemCount} mahsulot
        </span>
      </div>

      <div className="pos-held-order-card__footer">
        <strong>{formatMoney(order.total)}</strong>

        <div>
          <button
            className="pos-held-order-card__delete"
            type="button"
            aria-label="Saqlangan savdoni o‘chirish"
            onClick={() => onDelete?.(order.id)}
          >
            <Trash2 size={15} />
          </button>

          <button
            className="pos-held-order-card__resume"
            type="button"
            onClick={() => onResume?.(order)}
          >
            <Play size={15} />
            Davom ettirish
          </button>
        </div>
      </div>
    </article>
  );
};

export default HeldOrderCard;
