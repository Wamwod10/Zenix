import { PackageCheck } from "lucide-react";

import { formatMoney } from "../utils/posMoney";

import "./ProductCard.scss";

const ProductCard = ({ product, added = false, onProductSelect }) => {
  const disabled = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 8;

  return (
    <button
      type="button"
      className={["sales-product-card", disabled ? "is-disabled" : "", added ? "is-added" : ""].filter(Boolean).join(" ")}
      disabled={disabled}
      title={`${product.name} · ${product.sku}`}
      onClick={() => onProductSelect?.(product)}
    >
      <span className={`sales-product-card__visual sales-product-card__visual--${product.visual || "item"}`}>
        <PackageCheck size={18} />
      </span>

      <strong>{product.name}</strong>
      <small>{formatMoney(product.price)}</small>

      <span className="sales-product-card__stock">
        <i className={lowStock ? "is-low" : ""} />
        {disabled ? "Qoldiq yo'q" : `${product.stock} dona`}
      </span>
    </button>
  );
};

export default ProductCard;
