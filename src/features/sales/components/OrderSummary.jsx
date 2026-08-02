import { formatMoney } from "../utils/posMoney";

import "./OrderSummary.scss";

const OrderSummary = ({ totals, discount }) => (
  <div className="sales-order-summary">
    <div>
      <span>Subtotal</span>
      <strong>{formatMoney(totals?.subtotal || 0)}</strong>
    </div>
    {Boolean(discount) && (
      <div className="is-discount">
        <span>Chegirma</span>
        <strong>-{formatMoney(totals?.discount || 0)}</strong>
      </div>
    )}
    <div className="sales-order-summary__total">
      <span>Jami</span>
      <strong>{formatMoney(totals?.total || 0)}</strong>
    </div>
  </div>
);

export default OrderSummary;
