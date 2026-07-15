import { Check, Crown, Phone, ShoppingBag, Star } from "lucide-react";

import { formatMoney } from "../utils/posMoney";

import "./CustomerListItem.scss";

const loyaltyIcons = {
  VIP: Crown,
  Gold: Star,
  Standard: ShoppingBag,
};

const CustomerListItem = ({ customer, selected = false, onSelect }) => {
  const LoyaltyIcon = loyaltyIcons[customer.level] || ShoppingBag;

  return (
    <button
      className={`pos-customer-list-item ${selected ? "is-selected" : ""}`}
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect?.(customer)}
    >
      <span className="pos-customer-list-item__avatar">
        {customer.name
          .split(" ")
          .slice(0, 2)
          .map((word) => word[0])
          .join("")
          .toUpperCase()}
      </span>

      <span className="pos-customer-list-item__content">
        <span className="pos-customer-list-item__identity">
          <strong>{customer.name}</strong>

          <span>
            <LoyaltyIcon size={12} />
            {customer.level}
          </span>
        </span>

        <span className="pos-customer-list-item__phone">
          <Phone size={12} />
          {customer.phone}
        </span>

        <span className="pos-customer-list-item__stats">
          <span>
            <ShoppingBag size={12} />
            {customer.ordersCount} ta xarid
          </span>

          <span>{formatMoney(customer.totalSpent)}</span>
        </span>
      </span>

      <span className="pos-customer-list-item__check">
        {selected && <Check size={14} />}
      </span>
    </button>
  );
};

export default CustomerListItem;
