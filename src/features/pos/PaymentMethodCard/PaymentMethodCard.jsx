import { Check } from "lucide-react";

import "./PaymentMethodCard.scss";

const PaymentMethodCard = ({
  method,
  active = false,
  disabled = false,
  onSelect,
}) => {
  const Icon = method.icon;

  return (
    <button
      className={`pos-payment-method ${active ? "is-active" : ""}`}
      type="button"
      disabled={disabled}
      aria-pressed={active}
      onClick={() => onSelect?.(method.id)}
    >
      <span className="pos-payment-method__icon">
        <Icon size={20} />
      </span>

      <span className="pos-payment-method__content">
        <strong>{method.label}</strong>
        <small>{method.description}</small>
      </span>

      <span className="pos-payment-method__state">
        {active && <Check size={14} />}
      </span>
    </button>
  );
};

export default PaymentMethodCard;
