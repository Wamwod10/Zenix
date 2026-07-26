// Task 1: Purchases-local matni maydoni — shared ui/Input bilan bir xil ko'rinish,
// lekin PurchaseDateField/PurchaseSelectField bilan PIKSEL darajasida bir xil
// balandlikda (46px control, doim band qilingan hint qatori). Shared Input
// komponentiga tegilmaydi (u boshqa modullarda ham ishlatiladi) — shu sababli
// Purchases uchun alohida o'ram yaratiladi.

import "./PurchaseTextField.scss";

const PurchaseTextField = ({
  label,
  hint,
  error,
  leftIcon,
  rightIcon,
  className = "",
  id,
  ...props
}) => {
  const fieldId = id || props.name;

  const classes = [
    "purchase-text-field",
    error ? "purchase-text-field--error" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {label && (
        <label className="purchase-text-field__label" htmlFor={fieldId}>
          {label}
        </label>
      )}

      <div className="purchase-text-field__control">
        {leftIcon && <span className="purchase-text-field__icon">{leftIcon}</span>}

        <input id={fieldId} className="purchase-text-field__field" {...props} />

        {rightIcon && <span className="purchase-text-field__icon">{rightIcon}</span>}
      </div>

      <p className="purchase-text-field__message">{error || hint || " "}</p>
    </div>
  );
};

export default PurchaseTextField;
