import { Calendar } from "lucide-react";
import { forwardRef } from "react";

import "./PurchaseDateField.scss";

const PurchaseDateField = forwardRef(
  ({ label, hint, error, className = "", id, ...props }, ref) => {
    const fieldId = id || props.name;

    const classes = [
      "purchase-date-field",
      error ? "purchase-date-field--error" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={classes}>
        {label && (
          <label className="purchase-date-field__label" htmlFor={fieldId}>
            {label}
          </label>
        )}

        <div className="purchase-date-field__control">
          <Calendar size={16} className="purchase-date-field__icon" />
          <input
            id={fieldId}
            type="date"
            className="purchase-date-field__field"
            ref={ref}
            {...props}
          />
        </div>

        {/* Task 1: hint qatori bo'sh bo'lsa ham DOIM render qilinadi — aks
            holda hint'siz maydon hint'li qo'shni maydondan pastroq bo'lib
            qoladi (balandlik nomuvofiqligi). */}
        <p className="purchase-date-field__message">{error || hint || " "}</p>
      </div>
    );
  },
);

PurchaseDateField.displayName = "PurchaseDateField";

export default PurchaseDateField;
