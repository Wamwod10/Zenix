import { useEffect, useMemo, useState } from "react";
import { PackageCheck, Scale, X } from "lucide-react";

import { formatMoney, normalizeMoney } from "../utils/posMoney";

import "./ProductOptionsModal.scss";

const ProductOptionsModal = ({ open = false, product = null, onClose, onConfirm }) => {
  const [variantId, setVariantId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [serial, setSerial] = useState("");
  const [weight, setWeight] = useState("1");
  const [manualPrice, setManualPrice] = useState("");

  useEffect(() => {
    if (!open || !product) {
      return undefined;
    }

    setVariantId(product.variants?.[0]?.id || "");
    setUnitId(product.units?.[0]?.id || "piece");
    setSerial(product.serials?.[0] || "");
    setWeight(product.weighted ? "0.25" : "1");
    setManualPrice("");

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
  }, [onClose, open, product]);

  const selectedVariant = useMemo(
    () => product?.variants?.find((variant) => variant.id === variantId) || null,
    [product, variantId],
  );
  const selectedUnit = useMemo(
    () => product?.units?.find((unit) => unit.id === unitId) || null,
    [product, unitId],
  );

  const calculatedPrice = useMemo(() => {
    const catalogPrice =
      normalizeMoney(product?.price) + normalizeMoney(selectedVariant?.priceDelta);
    const unitMultiplier = normalizeMoney(selectedUnit?.multiplier || 1);
    const overridePrice = normalizeMoney(manualPrice);

    return overridePrice > 0 ? overridePrice : catalogPrice * unitMultiplier;
  }, [manualPrice, product, selectedUnit, selectedVariant]);

  if (!open || !product) {
    return null;
  }

  const quantity = product.weighted ? Math.max(normalizeMoney(weight), 0.001) : 1;
  const canConfirm = !product.serialRequired || Boolean(serial);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div className="pos-product-options" role="presentation" onMouseDown={handleBackdropClick}>
      <section
        className="pos-product-options__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-options-title"
      >
        <div className="pos-product-options__header">
          <div>
            <span className="pos-product-options__eyebrow">
              <PackageCheck size={14} />
              Product options
            </span>
            <h2 id="product-options-title">{product.name}</h2>
            <p>{product.sku} · {formatMoney(product.price)}</p>
          </div>
          <button type="button" aria-label="Product options oynasini yopish" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {product.variants?.length > 0 && (
          <div className="pos-product-options__group">
            <span>Variant</span>
            <div>
              {product.variants.map((variant) => (
                <button
                  type="button"
                  key={variant.id}
                  className={variantId === variant.id ? "is-active" : ""}
                  aria-pressed={variantId === variant.id}
                  onClick={() => setVariantId(variant.id)}
                >
                  {variant.label}
                  {variant.priceDelta ? ` +${formatMoney(variant.priceDelta)}` : ""}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.units?.length > 0 && (
          <div className="pos-product-options__group">
            <span>Unit</span>
            <div>
              {product.units.map((unit) => (
                <button
                  type="button"
                  key={unit.id}
                  className={unitId === unit.id ? "is-active" : ""}
                  aria-pressed={unitId === unit.id}
                  onClick={() => setUnitId(unit.id)}
                >
                  {unit.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.serialRequired && (
          <label className="pos-product-options__field">
            <span>IMEI / Serial</span>
            <select value={serial} onChange={(event) => setSerial(event.target.value)}>
              {product.serials.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        )}

        {product.weighted && (
          <label className="pos-product-options__field">
            <span>
              <Scale size={14} />
              Weight ({product.weightUnit})
            </span>
            <input
              type="number"
              min="0.001"
              step="0.001"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </label>
        )}

        <label className="pos-product-options__field">
          <span>Manual price</span>
          <input
            type="number"
            min="0"
            step="1000"
            value={manualPrice}
            placeholder={formatMoney(calculatedPrice)}
            onChange={(event) => setManualPrice(event.target.value)}
          />
        </label>

        <div className="pos-product-options__summary">
          <span>Cart price</span>
          <strong>{formatMoney(calculatedPrice * quantity)}</strong>
        </div>

        <div className="pos-product-options__footer">
          <button type="button" onClick={onClose}>
            Bekor qilish
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={() =>
              onConfirm?.(product, {
                variant: selectedVariant,
                unit: selectedUnit,
                serial,
                weight: product.weighted ? quantity : null,
                quantity,
                price: calculatedPrice,
                manualPrice: normalizeMoney(manualPrice) > 0,
              })
            }
          >
            Savatga qo'shish
          </button>
        </div>
      </section>
    </div>
  );
};

export default ProductOptionsModal;
