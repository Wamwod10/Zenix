import { ReceiptText } from "lucide-react";
import { formatMoney } from "../utils/posMoney";

import "./PaymentButton.scss";

const PaymentButton = ({ total = 0, disabled = false, onClick }) => {
  return (
    <button
      className="pos-payment-button"
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      <ReceiptText size={19} />

      <span>
        <strong>To'lovni yakunlash</strong>
        <small>{formatMoney(total)} · F4</small>
      </span>
    </button>
  );
};

export default PaymentButton;
