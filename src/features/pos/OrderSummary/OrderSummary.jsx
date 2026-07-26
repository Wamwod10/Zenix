import "./OrderSummary.scss";
import { formatMoney } from "../utils/posMoney";

const OrderSummary = ({
  subtotal = 0,
  discount = 0,
  bonus = 0,
  serviceFee = 0,
  tax = 0,
  total = 0,
}) => {
  return (
    <div className="pos-order-summary">
      <div>
        <span>Oraliq summa</span>
        <strong>{formatMoney(subtotal)}</strong>
      </div>

      <div>
        <span>Chegirma</span>
        <strong>-{formatMoney(discount)}</strong>
      </div>

      <div>
        <span>Bonus</span>
        <strong>-{formatMoney(bonus)}</strong>
      </div>

      <div>
        <span>Xizmat haqi</span>
        <strong>{formatMoney(serviceFee)}</strong>
      </div>

      <div>
        <span>Soliq</span>
        <strong>{formatMoney(tax)}</strong>
      </div>

      <div className="pos-order-summary__total">
        <span>Jami</span>
        <strong>{formatMoney(total)}</strong>
      </div>
    </div>
  );
};

export default OrderSummary;
