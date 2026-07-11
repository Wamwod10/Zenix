import { PackageCheck, PackageX, Star } from "lucide-react";
import { formatMoney } from "../utils/posMoney";

import "./ProductCard.scss";

const ProductCard = ({ product, onAddToCart }) => {
  const isOutOfStock = product.stock <= 0;

  return (
    <button
      className={`pos-product-card ${isOutOfStock ? "is-disabled" : ""}`}
      type="button"
      disabled={isOutOfStock}
      onClick={() => onAddToCart?.(product)}
    >
      <span className="pos-product-card__top">
        <span className="pos-product-card__badge">
          {product.favorite ? <Star size={11} /> : <PackageCheck size={11} />}
          {product.favorite ? "Favorite" : "Product"}
        </span>

        <small className={isOutOfStock ? "is-empty" : ""}>
          {isOutOfStock ? (
            <>
              <PackageX size={11} />
              Tugagan
            </>
          ) : (
            <>
              <PackageCheck size={11} />
              {product.stock} dona
            </>
          )}
        </small>
      </span>

      <span className="pos-product-card__body">
        <strong>{product.name}</strong>
        <small>{product.sku}</small>
      </span>

      <span className="pos-product-card__price">
        {formatMoney(product.price)}
      </span>
    </button>
  );
};

export default ProductCard;
