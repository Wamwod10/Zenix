import { ChevronRight, UserRound } from "lucide-react";

import "./CustomerCard.scss";

const CustomerCard = ({ customer, onClick }) => {
  const hasCustomer = Boolean(customer?.name);

  return (
    <button className="pos-customer-card" type="button" onClick={onClick}>
      <span className="pos-customer-card__icon">
        <UserRound size={18} />
      </span>

      <span className="pos-customer-card__content">
        <strong>{hasCustomer ? customer.name : "Walk-in customer"}</strong>

        <small>
          {hasCustomer
            ? `${customer.phone} · ${customer.level}`
            : "Mijoz tanlanmagan"}
        </small>
      </span>

      <ChevronRight size={17} />
    </button>
  );
};

export default CustomerCard;
