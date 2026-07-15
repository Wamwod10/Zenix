import { forwardRef } from "react";
import { Barcode, Search, X } from "lucide-react";
import "./ProductSearch.scss";

const ProductSearch = forwardRef(
  ({ value = "", onChange, onBarcodeFocus }, ref) => {
  return (
    <div className="pos-product-search">
      <label className="pos-product-search__field">
        <Search size={18} />
        <input
          ref={ref}
          type="search"
          value={value}
          placeholder="Mahsulot nomi, SKU yoki barcode..."
          aria-label="Mahsulot qidirish"
          onChange={(event) => onChange?.(event.target.value)}
        />
        {value ? (
          <button
            className="pos-product-search__clear"
            type="button"
            aria-label="Qidiruvni tozalash"
            onClick={() => onChange?.("")}
          >
            <X size={14} />
          </button>
        ) : (
          <kbd>/</kbd>
        )}
      </label>

      <button
        className="pos-product-search__barcode"
        type="button"
        onClick={onBarcodeFocus}
      >
        <Barcode size={18} />
        Barcode scan
      </button>
    </div>
  );
});

ProductSearch.displayName = "ProductSearch";

export default ProductSearch;
