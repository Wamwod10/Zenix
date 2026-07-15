import CartItem from "../CartItem/CartItem";
import CustomerCard from "../CustomerCard/CustomerCard";
import OrderSummary from "../OrderSummary/OrderSummary";
import PaymentButton from "../PaymentButton/PaymentButton";
import QuickActions from "../QuickActions/QuickActions";

import "./Cart.scss";

const Cart = ({
  customer,
  items = [],
  summary,
  onClearCart,
  onIncreaseItem,
  onDecreaseItem,
  onRemoveItem,
  onEditItem,
  onQuickAction,
  onPayment,
  onCustomerSelect,
  note = "",
  onNoteChange,
}) => {
  const hasItems = items.length > 0;

  return (
    <aside className="pos-cart">
      <div className="pos-cart__head">
        <div>
          <span>Current cart</span>
          <h2>Savat</h2>
        </div>

        <button type="button" disabled={!hasItems} onClick={onClearCart}>
          Tozalash
        </button>
      </div>

      <CustomerCard customer={customer} onClick={onCustomerSelect} />

      <div className="pos-cart__list">
        {hasItems ? (
          items.map((item) => (
            <CartItem
              item={item}
              key={item.id}
              onIncrease={onIncreaseItem}
              onDecrease={onDecreaseItem}
              onRemove={onRemoveItem}
              onEdit={onEditItem}
            />
          ))
        ) : (
          <div className="pos-cart__empty">
            <strong>Savat bo‘sh</strong>
            <span>Mahsulot tanlang yoki barcode scan qiling.</span>
          </div>
        )}
      </div>

      <label className="pos-cart__note">
        <span>Order note</span>
        <textarea
          rows={2}
          value={note}
          placeholder="Savdo uchun qisqa izoh..."
          onChange={(event) => onNoteChange?.(event.target.value)}
        />
      </label>

      <QuickActions onAction={onQuickAction} />

      <div className="pos-cart__sticky-total">
        <OrderSummary
          subtotal={summary?.subtotal}
          discount={summary?.discount}
          bonus={summary?.bonus}
          serviceFee={summary?.serviceFee}
          tax={summary?.tax}
          total={summary?.total}
        />

        <PaymentButton
          total={summary?.total}
          disabled={!hasItems}
          onClick={onPayment}
        />
      </div>
    </aside>
  );
};

export default Cart;
