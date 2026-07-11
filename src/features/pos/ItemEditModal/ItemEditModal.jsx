import { useEffect, useMemo, useState } from "react";
import { BadgePercent, PencilLine, X } from "lucide-react";

import { calculateDiscountAmount } from "../utils/posCalculations";
import { calculateLineTotal, formatMoney, normalizeMoney } from "../utils/posMoney";

import "./ItemEditModal.scss";

const ItemEditModal = ({ open = false, item = null, onClose, onSave }) => {
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("0");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");

  useEffect(() => {
    if (!open || !item) {
      return undefined;
    }

    setQuantity(String(item.quantity || 1));
    setPrice(String(item.price || 0));
    setDiscountType(item.discount?.type || "percentage");
    setDiscountValue(item.discount?.value ? String(item.discount.value) : "");

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [item, onClose, open]);

  const lineSubtotal = useMemo(
    () => calculateLineTotal(price, quantity),
    [price, quantity],
  );
  const discountAmount = useMemo(
    () =>
      calculateDiscountAmount({
        subtotal: lineSubtotal,
        discount: {
          type: discountType,
          value: normalizeMoney(discountValue),
        },
      }),
    [discountType, discountValue, lineSubtotal],
  );

  if (!open || !item) {
    return null;
  }

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div className="pos-item-edit" role="presentation" onMouseDown={handleBackdropClick}>
      <section
        className="pos-item-edit__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="item-edit-title"
      >
        <div className="pos-item-edit__header">
          <div>
            <span className="pos-item-edit__eyebrow">
              <PencilLine size={14} />
              Cart line
            </span>
            <h2 id="item-edit-title">{item.name}</h2>
            <p>{item.sku}</p>
          </div>
          <button type="button" aria-label="Cart line oynasini yopish" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="pos-item-edit__fields">
          <label>
            <span>Quantity</span>
            <input
              type="number"
              min="0.001"
              max={item.stock}
              step={item.weight ? "0.001" : "1"}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </label>
          <label>
            <span>Manual price</span>
            <input
              type="number"
              min="0"
              step="1000"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </label>
        </div>

        <div className="pos-item-edit__discount">
          <span>
            <BadgePercent size={14} />
            Item discount
          </span>
          <div>
            <button
              type="button"
              className={discountType === "percentage" ? "is-active" : ""}
              aria-pressed={discountType === "percentage"}
              onClick={() => setDiscountType("percentage")}
            >
              Foiz
            </button>
            <button
              type="button"
              className={discountType === "fixed" ? "is-active" : ""}
              aria-pressed={discountType === "fixed"}
              onClick={() => setDiscountType("fixed")}
            >
              Summa
            </button>
            <input
              type="number"
              min="0"
              value={discountValue}
              placeholder="0"
              onChange={(event) => setDiscountValue(event.target.value)}
            />
          </div>
        </div>

        <div className="pos-item-edit__summary">
          <span>Line subtotal: {formatMoney(lineSubtotal)}</span>
          <strong>Discount: {formatMoney(discountAmount)}</strong>
        </div>

        <div className="pos-item-edit__footer">
          <button type="button" onClick={onClose}>
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={() =>
              onSave?.(item.id, {
                quantity: normalizeMoney(quantity),
                price: normalizeMoney(price),
                manualPrice: normalizeMoney(price) !== normalizeMoney(item.basePrice),
                discount:
                  normalizeMoney(discountValue) > 0
                    ? {
                        type: discountType,
                        value: normalizeMoney(discountValue),
                      }
                    : null,
              })
            }
          >
            Saqlash
          </button>
        </div>
      </section>
    </div>
  );
};

export default ItemEditModal;
