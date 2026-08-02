import { useMemo } from "react";
import { Barcode, Search } from "lucide-react";

import CategoryRail from "./CategoryRail";
import ProductGrid from "./ProductGrid";

import "./ProductWorkspace.scss";

const quickFilters = ["Sevimli", "Yaqinda"];
const recentProductIds = ["prd-coke-15", "prd-water-05", "prd-lays-classic", "prd-coffee-pack"];

const ProductWorkspace = ({
  searchInputRef,
  categories = [],
  products = [],
  query = "",
  activeCategory = "Barchasi",
  lastAddedId,
  onQueryChange,
  onCategoryChange,
  onBarcodeSubmit,
  onProductSelect,
}) => {
  const categoryRail = useMemo(() => [...categories.filter(Boolean), ...quickFilters], [categories]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        [product.name, product.sku, product.barcode]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedQuery));

      const matchesCategory =
        activeCategory === "Barchasi" ||
        (activeCategory === "Sevimli" && product.favorite) ||
        (activeCategory === "Yaqinda" && recentProductIds.includes(product.id)) ||
        product.category === activeCategory;

      return matchesQuery && matchesCategory;
    });
  }, [activeCategory, products, query]);

  const canCheckBarcode = query.trim().length > 0;

  return (
    <section className="product-workspace" aria-label="Mahsulotlar">
      <div className="product-workspace__search">
        <Search size={18} aria-hidden="true" />
        <input
          ref={searchInputRef}
          type="search"
          value={query}
          placeholder="Mahsulot nomi, SKU yoki barcode"
          aria-label="Mahsulot qidirish yoki barcode skanerlash"
          onChange={(event) => onQueryChange?.(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && event.currentTarget.value.trim()) {
              onBarcodeSubmit?.(event.currentTarget.value);
            }
          }}
        />
        <button
          type="button"
          aria-label="SKU yoki barcode tekshirish"
          title={canCheckBarcode ? "SKU yoki barcode tekshirish" : "Qidiruvga SKU yoki barcode kiriting"}
          disabled={!canCheckBarcode}
          onClick={() => onBarcodeSubmit?.(query)}
        >
          <Barcode size={17} />
        </button>
        <kbd>F3</kbd>
      </div>

      <CategoryRail categories={categoryRail} activeCategory={activeCategory} onCategoryChange={onCategoryChange} />

      <ProductGrid products={filteredProducts} lastAddedId={lastAddedId} onProductSelect={onProductSelect} />
    </section>
  );
};

export default ProductWorkspace;
