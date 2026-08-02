import { SearchX } from "lucide-react";

import ProductCard from "./ProductCard";

import "./ProductGrid.scss";

const ProductGrid = ({ products = [], lastAddedId, onProductSelect }) => {
  if (!products.length) {
    return (
      <div className="sales-product-grid__empty">
        <SearchX size={26} />
        <strong>Mahsulot topilmadi</strong>
        <span>Qidiruv yoki kategoriya filtrini o'zgartiring.</span>
      </div>
    );
  }

  return (
    <div className="sales-product-grid" aria-live="polite">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          added={lastAddedId?.startsWith(product.id)}
          onProductSelect={onProductSelect}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
