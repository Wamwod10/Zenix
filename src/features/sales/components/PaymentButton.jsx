import { WalletCards } from "lucide-react";

import { formatMoney } from "../utils/posMoney";

import "./PaymentButton.scss";

const PaymentButton = ({ total = 0, disabled = false, onClick }) => (
  <button
    type="button"
    className="sales-payment-button"
    disabled={disabled}
    title={disabled ? "To'lov uchun savatga mahsulot qo'shing" : "To'lovni yakunlash"}
    onClick={onClick}
  >
    <WalletCards size={19} />
    <span>
      <strong>To'lovni yakunlash</strong>
      <small>F4 · {formatMoney(total)}</small>
    </span>
  </button>
);

export default PaymentButton;
