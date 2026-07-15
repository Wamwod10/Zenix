import ProductCard from "../ProductCard/ProductCard";

import "./ProductGrid.scss";

const ProductGrid = ({ products = [], loading = false, onAddToCart }) => {
  if (loading) {
    return (
      <div className="pos-product-grid__empty" role="status">
        <strong>Mahsulotlar yuklanmoqda</strong>
        <span>Catalog ma'lumotlari tayyorlanmoqda.</span>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="pos-product-grid__empty">
        <strong>Mahsulot topilmadi</strong>
        <span>Qidiruv yoki kategoriya filtrini o'zgartirib ko'ring.</span>
      </div>
    );
  }

  return (
    <div className="pos-product-grid" aria-live="polite">
      {products.map((product) => (
        <ProductCard
          product={product}
          key={product.id}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
};

export default ProductGrid;

