import { forwardRef, useEffect, useState } from "react";
import { Barcode, CheckCircle2, SearchX } from "lucide-react";

import "./BarcodeInput.scss";

const BarcodeInput = forwardRef(
  ({ value = "", status = null, onChange, onSubmit }, ref) => {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    const handleSubmit = (event) => {
      event.preventDefault();

      const barcode = localValue.trim();

      if (barcode) {
        onSubmit?.(barcode);
      }
    };

    return (
      <form
        className={`pos-barcode-input ${status?.type ? `is-${status.type}` : ""}`}
        onSubmit={handleSubmit}
      >
        <label className="pos-barcode-input__field">
          <Barcode size={17} />
          <input
            ref={ref}
            type="text"
            inputMode="numeric"
            value={localValue}
            placeholder="Shtrix-kodni qo'lda kiriting..."
            aria-label="Shtrix-kod kiritish"
            onChange={(event) => {
              setLocalValue(event.target.value);
              onChange?.(event.target.value);
            }}
          />
        </label>

        <button type="submit">
          Qidirish
        </button>

        {status?.message && (
          <span
            className={`pos-barcode-input__status is-${status.type || "info"}`}
            role="status"
          >
            {status.type === "success" ? (
              <CheckCircle2 size={14} />
            ) : (
              <SearchX size={14} />
            )}
            {status.message}
          </span>
        )}
      </form>
    );
  },
);

BarcodeInput.displayName = "BarcodeInput";

export default BarcodeInput;
