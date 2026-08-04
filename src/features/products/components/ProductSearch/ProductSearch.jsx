import { BookmarkPlus, ListFilter, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";

import "./ProductSearch.scss";

const ProductSearch = ({
  filters,
  categories,
  brands,
  savedFilters,
  onFilter,
  onApplySavedFilter,
  onSaveFilter,
  onRemoveSavedFilter,
  onResetFilters,
}) => {
  const [filterName, setFilterName] = useState("");
  const activeFilters = useMemo(
    () =>
      Object.entries(filters).filter(
        ([, value]) => value !== "all" && value !== "" && value !== null && value !== undefined,
      ),
    [filters],
  );
  const clearFilter = (key) => {
    const emptyValue = ["priceMin", "priceMax", "marginMin"].includes(key) ? "" : "all";
    onFilter(key, emptyValue);
  };

  const saveFilter = () => {
    if (onSaveFilter(filterName)) {
      setFilterName("");
    }
  };

  return (
    <section className="products-panel products-filter-panel">
      <div className="products-panel__head">
        <div>
          <span>
            <ListFilter size={13} />
            Filtrlar
          </span>
          <h2>Asosiy filterlar va saqlangan ko'rinishlar</h2>
        </div>
      </div>

    <div className="products-filters">
      <label>
        <span>Kategoriya</span>
        <select value={filters.categoryId} onChange={(event) => onFilter("categoryId", event.target.value)}>
          <option value="all">Barchasi</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Brend</span>
        <select value={filters.brandId} onChange={(event) => onFilter("brandId", event.target.value)}>
          <option value="all">Barchasi</option>
          {brands.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Holat</span>
        <select value={filters.status} onChange={(event) => onFilter("status", event.target.value)}>
          <option value="all">Barchasi</option>
          <option value="active">Faol</option>
          <option value="draft">Qoralama</option>
          <option value="pending">Tasdiq kutilmoqda</option>
          <option value="inactive">Nofaol</option>
          <option value="archived">Arxivlangan</option>
        </select>
      </label>
      <label>
        <span>Qoldiq</span>
        <select value={filters.stockStatus} onChange={(event) => onFilter("stockStatus", event.target.value)}>
          <option value="all">Barchasi</option>
          <option value="healthy">Sog'lom</option>
          <option value="watch">Kuzatuvda</option>
          <option value="low">Kam qolgan</option>
          <option value="out">Tugagan</option>
        </select>
      </label>
    </div>

    <details className="products-advanced-filters">
      <summary>
        <SlidersHorizontal size={14} />
        Qo'shimcha filterlar
      </summary>
      <div className="products-filters">
        <label>
          <span>Tasdiq</span>
          <select value={filters.approvalStatus} onChange={(event) => onFilter("approvalStatus", event.target.value)}>
            <option value="all">Barchasi</option>
            <option value="draft">Qoralama</option>
            <option value="pending">Tasdiq kutilmoqda</option>
            <option value="approved">Tasdiqlangan</option>
            <option value="rejected">Rad etilgan</option>
          </select>
        </label>
        <label>
          <span>Eng kam marja %</span>
          <input min="0" max="100" type="number" value={filters.marginMin} onChange={(event) => onFilter("marginMin", event.target.value)} />
        </label>
        <label>
          <span>Eng kam narx</span>
          <input min="0" type="number" value={filters.priceMin} onChange={(event) => onFilter("priceMin", event.target.value)} />
        </label>
        <label>
          <span>Eng yuqori narx</span>
          <input min="0" type="number" value={filters.priceMax} onChange={(event) => onFilter("priceMax", event.target.value)} />
        </label>
        <label>
          <span>Yetishmayotgan ma'lumot</span>
          <select value={filters.missingData} onChange={(event) => onFilter("missingData", event.target.value)}>
            <option value="all">Barchasi</option>
            <option value="yes">Bor</option>
            <option value="no">To'liq</option>
          </select>
        </label>
      </div>
    </details>

    {activeFilters.length > 0 && (
      <div className="products-filter-chips" aria-label="Faol filterlar">
        {activeFilters.map(([key, value]) => (
          <button type="button" key={key} onClick={() => clearFilter(key)}>
            <span>{key}: {value}</span>
            <X size={13} />
          </button>
        ))}
      </div>
    )}

    <div className="products-saved-filters">
      <label className="products-save-filter-field">
        <span>Filtr nomi</span>
        <input
          value={filterName}
          onChange={(event) => setFilterName(event.target.value)}
          placeholder="Masalan: past qoldiq"
        />
      </label>
      <button type="button" className="products-mini-button" onClick={saveFilter}>
        <BookmarkPlus size={14} />
        Saqlash
      </button>
      <button type="button" className="products-mini-button" onClick={onResetFilters}>
        Filtrlarni tozalash
      </button>
      {savedFilters.map((filter) => (
        <span className="products-saved-filter" key={filter.id}>
          <button type="button" onClick={() => onApplySavedFilter(filter.filters)}>
            {filter.name}
          </button>
          <button
            type="button"
            aria-label={`${filter.name} filtrini o'chirish`}
            onClick={() => onRemoveSavedFilter(filter.id)}
          >
            <X size={13} />
          </button>
        </span>
      ))}
    </div>
  </section>
  );
};

export default ProductSearch;
