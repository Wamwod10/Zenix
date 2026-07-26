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
import { useNavigate } from "react-router-dom";

import { productRoles } from "../../utils/productPermissions";

const ProductsHeader = ({
  searchRef,
  search,
  onSearch,
  role,
  onRoleChange,
  unreadCount,
  onImport,
  onExport,
  onReset,
}) => {
  const navigate = useNavigate();

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
        <label className="products-search products-header__search">
          <Search size={16} />
          <input
            ref={searchRef}
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Nomi, artikul, shtrix-kod, QR yoki ichki kod"
            aria-label="Mahsulot qidirish"
          />
        </label>

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
