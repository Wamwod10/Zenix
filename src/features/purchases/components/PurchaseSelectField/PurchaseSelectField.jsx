import { Dropdown } from "../../../../components/ui/Dropdown/Dropdown";

import "./PurchaseSelectField.scss";

const PurchaseSelectField = ({ hint, error, className = "", ...dropdownProps }) => {
  const classes = [
    "purchase-select-field",
    error ? "purchase-select-field--error" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <Dropdown {...dropdownProps} />

      {/* Task 1: hint qatori bo'sh bo'lsa ham DOIM render qilinadi — balandlik
          qo'shni maydonlar (Input/PurchaseDateField) bilan bir xil bo'lishi uchun. */}
      <p className="purchase-select-field__message">{error || hint || " "}</p>
    </div>
  );
};

export default PurchaseSelectField;
