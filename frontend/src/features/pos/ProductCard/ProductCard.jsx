import { PackageCheck, PackageX, Plus } from "lucide-react";
import { formatMoney } from "../utils/posMoney";

import "./ProductCard.scss";

const ProductCard = ({ product, onAddToCart }) => {
  const stock = Number(product.stock) || 0;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 6;
  const stockTone = isOutOfStock ? "empty" : isLowStock ? "low" : "ok";

  return (
    <button
      className={`pos-product-card is-stock-${stockTone} ${isOutOfStock ? "is-disabled" : ""}`}
      type="button"
      disabled={isOutOfStock}
      onClick={() => onAddToCart?.(product)}
    >
      <span className="pos-product-card__body">
        <strong>{product.name}</strong>
        <small>{product.sku}</small>
      </span>

      <span className="pos-product-card__footer">
        <span>
          <small className={`pos-product-card__stock is-${stockTone}`}>
            {isOutOfStock ? (
              <>
                <PackageX size={11} />
                Tugagan
              </>
            ) : (
              <>
                <PackageCheck size={11} />
                {stock} dona
              </>
            )}
          </small>
          <b>{formatMoney(product.price)}</b>
        </span>

        <span className="pos-product-card__quick-add" aria-hidden="true">
          <Plus size={18} />
        </span>
      </span>
    </button>
  );
};

export default ProductCard;
