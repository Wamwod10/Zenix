import { BookmarkPlus, LayoutGrid, ListFilter, Rows3, Table2 } from "lucide-react";

const ProductSearch = ({
  filters,
  categories,
  brands,
  savedFilters,
  viewMode,
  onFilter,
  onApplySavedFilter,
  onSaveFilter,
  onRemoveSavedFilter,
  onViewMode,
}) => (
  <section className="products-panel products-filter-panel">
    <div className="products-panel__head">
      <div>
        <span>
          <ListFilter size={13} />
          Kengaytirilgan filtrlar
        </span>
        <h2>Qidiruv, saqlangan filtrlar va ko'rinishlar</h2>
      </div>
      <div className="products-view-toggle" role="tablist" aria-label="Mahsulotlar ko'rinishi">
        {[
          { id: "table", icon: Table2, label: "Jadval" },
          { id: "grid", icon: LayoutGrid, label: "Kataklar" },
          { id: "compact", icon: Rows3, label: "Ixcham" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              type="button"
              key={item.id}
              className={viewMode === item.id ? "is-active" : ""}
              aria-selected={viewMode === item.id}
              onClick={() => onViewMode(item.id)}
            >
              <Icon size={15} />
              <span>{item.label}</span>
            </button>
          );
        })}
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
      <label>
        <span>Tasdiq</span>
        <select value={filters.approvalStatus} onChange={(event) => onFilter("approvalStatus", event.target.value)}>
          <option value="all">Barchasi</option>
          <option value="draft">Qoralama</option>
          <option value="pending">Kutilmoqda</option>
          <option value="active">Faol</option>
          <option value="rejected">Rad etilgan</option>
        </select>
      </label>
      <label>
        <span>Eng kam marja %</span>
        <input type="number" value={filters.marginMin} onChange={(event) => onFilter("marginMin", event.target.value)} />
      </label>
      <label>
        <span>Eng kam narx</span>
        <input type="number" value={filters.priceMin} onChange={(event) => onFilter("priceMin", event.target.value)} />
      </label>
      <label>
        <span>Eng yuqori narx</span>
        <input type="number" value={filters.priceMax} onChange={(event) => onFilter("priceMax", event.target.value)} />
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

    <div className="products-saved-filters">
      <button type="button" className="products-mini-button" onClick={() => onSaveFilter(`Filtr ${savedFilters.length + 1}`)}>
        <BookmarkPlus size={14} />
        Saqlash
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
            x
          </button>
        </span>
      ))}
    </div>
  </section>
);

export default ProductSearch;
