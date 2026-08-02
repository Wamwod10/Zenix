import {
  Bell,
  Download,
  PackagePlus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { productRoles } from "../../utils/productPermissions";

import "./ProductsHeader.scss";

const ProductsHeader = ({
  searchRef,
  search,
  onSearch,
  products = [],
  role,
  onRoleChange,
  unreadCount,
  onImport,
  onExport,
  onReset,
}) => {
  const navigate = useNavigate();
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const suggestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query.length < 2) return [];

    return products
      .filter((product) =>
        [product.name, product.sku, product.internalCode, product.qrCode, ...(product.barcodes || [])]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
      .slice(0, 5);
  }, [products, search]);
  const roleLabel = productRoles[role]?.label || role;

  const openSuggestion = (productId) => {
    onSearch("");
    setActiveSuggestion(0);
    navigate(`/products/${productId}`);
  };

  const handleSearchKeyDown = (event) => {
    if (!suggestions.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSuggestion((current) => (current + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestion((current) => (current - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      openSuggestion(suggestions[activeSuggestion].id);
    } else if (event.key === "Escape") {
      onSearch("");
    }
  };

  return (
    <section className="products-header">
      <div className="products-header__content">
        <span className="products-eyebrow">
          <Sparkles size={14} />
          ZENIX sun'iy idrok mahsulotlar tizimi
        </span>
        <h1>Mahsulotlar katalogi</h1>
        <p>
          Asosiy ma'lumot, artikul, shtrix-kod, narx, variant, rasm va mahsulot
          hayot siklini boshqarish savdo, ombor, mijozlar va moliya bo'limlariga tayyor.
        </p>
      </div>

      <div className="products-header__tools">
        <div className="products-search products-header__search" role="search">
          <Search size={16} />
          <input
            ref={searchRef}
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Nomi, artikul, shtrix-kod, QR yoki ichki kod"
            aria-label="Mahsulot qidirish"
            aria-controls="products-header-suggestions"
            aria-expanded={suggestions.length > 0}
          />
          {suggestions.length > 0 && (
            <div className="products-search-suggestions" id="products-header-suggestions">
              {suggestions.map((product, index) => (
                <button
                  type="button"
                  key={product.id}
                  className={index === activeSuggestion ? "is-active" : ""}
                  onMouseEnter={() => setActiveSuggestion(index)}
                  onClick={() => openSuggestion(product.id)}
                >
                  <strong>{product.name}</strong>
                  <span>{product.sku}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {import.meta.env.DEV ? (
          <label className="products-select">
            <ShieldCheck size={15} />
            <select
              value={role}
              onChange={(event) => onRoleChange(event.target.value)}
              aria-label="Mahsulotlar roli"
            >
              {Object.entries(productRoles).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <span className="products-role-pill">
            <ShieldCheck size={15} />
            {roleLabel}
          </span>
        )}

        <button type="button" className="products-icon-button" onClick={onImport} aria-label="Ma'lumot kiritish">
          <Upload size={16} />
        </button>
        <button type="button" className="products-icon-button" onClick={onExport} aria-label="Ma'lumot chiqarish">
          <Download size={16} />
        </button>
        <button type="button" className="products-icon-button" onClick={onReset} aria-label="Namuna ma'lumotlarni tiklash">
          <RefreshCw size={16} />
        </button>
        <button type="button" className="products-button" onClick={() => navigate("/products/settings")}>
          <Bell size={16} />
          {unreadCount}
        </button>
        <button type="button" className="products-button is-primary" onClick={() => navigate("/products/new")}>
          <PackagePlus size={16} />
          Yangi mahsulot
        </button>
      </div>
    </section>
  );
};

export default ProductsHeader;
