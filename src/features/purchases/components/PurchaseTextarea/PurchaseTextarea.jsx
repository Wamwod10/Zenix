import { forwardRef } from "react";

import "./PurchaseTextarea.scss";

const PurchaseTextarea = forwardRef(
  ({ label, hint, error, className = "", id, rows = 3, ...props }, ref) => {
    const fieldId = id || props.name;

    const classes = [
      "purchase-textarea",
      error ? "purchase-textarea--error" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={classes}>
        {label && (
          <label className="purchase-textarea__label" htmlFor={fieldId}>
            {label}
          </label>
        )}

        <textarea
          id={fieldId}
          className="purchase-textarea__field"
          rows={rows}
          ref={ref}
          {...props}
        />

        {(hint || error) && (
          <p className="purchase-textarea__message">{error || hint}</p>
        )}
      </div>
    );
  },
);

PurchaseTextarea.displayName = "PurchaseTextarea";

export default PurchaseTextarea;
