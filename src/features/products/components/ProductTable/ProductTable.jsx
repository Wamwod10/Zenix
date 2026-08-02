import {
  Archive,
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  MoreHorizontal,
  PackagePlus,
  Pencil,
  RotateCcw,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  formatDate,
  formatMoney,
  formatQuantity,
  labelProductStatus,
} from "../../utils/productCalculations";

import "./ProductTable.scss";

const columnLabels = {
  name: "Mahsulot",
  taxonomy: "Kategoriya / brend",
  price: "Narx",
  margin: "Marja",
  stock: "Qoldiq",
  status: "Holat",
  updatedAt: "Yangilangan",
};

const tableColumns = ["name", "taxonomy", "price", "margin", "stock", "status", "updatedAt"];

const StatusPill = ({ value }) => (
  <span className={`products-pill is-${value}`}>{labelProductStatus(value)}</span>
);

const ProductTable = ({
  products,
  totalCount = products.length,
  viewMode,
  selectedIds,
  canViewCost,
  sort,
  page,
  pageCount,
  pageSize,
  onSort,
  onPage,
  onToggleSelected,
  onToggleAll,
  onSelectAllFiltered,
  onResetFilters,
  onOpenQuickView,
  onDuplicate,
  onArchive,
  onRestore,
}) => {
  const navigate = useNavigate();
  const selectAllRef = useRef(null);
  const visibleIds = products.map((product) => product.id);
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.includes(id)).length;
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectedVisibleCount > 0 && !allVisibleSelected;
    }
  }, [allVisibleSelected, selectedVisibleCount]);

  if (!products.length) {
    return (
      <section className="products-empty-state">
        <strong>Mahsulot topilmadi</strong>
        <span>Qidiruv yoki filtrlarni yumshating, yoki yangi mahsulot yarating.</span>
        <div>
          <button type="button" className="products-mini-button" onClick={onResetFilters}>
            Filtrlarni tozalash
          </button>
          <button type="button" className="products-mini-button is-primary" onClick={() => navigate("/products/new")}>
            <PackagePlus size={15} />
            Yangi mahsulot
          </button>
        </div>
      </section>
    );
  }

  const actionButtons = (product) => (
    <div className="products-row-actions">
      <button type="button" title="Tezkor ko'rish" aria-label="Tezkor ko'rish" onClick={() => onOpenQuickView(product.id)}>
        <Eye size={15} />
      </button>
      <button type="button" title="Tahrirlash" aria-label="Tahrirlash" onClick={() => navigate(`/products/${product.id}/edit`)}>
        <Pencil size={15} />
      </button>
      <details className="products-action-menu">
        <summary aria-label="Qo'shimcha amallar" title="Qo'shimcha amallar">
          <MoreHorizontal size={15} />
        </summary>
        <div>
          <button type="button" onClick={() => onDuplicate(product.id)}>
            <Copy size={14} />
            Nusxalash
          </button>
          {product.status === "archived" ? (
            <button type="button" onClick={() => onRestore(product.id)}>
              <RotateCcw size={14} />
              Tiklash
            </button>
          ) : (
            <button type="button" className="is-danger" onClick={() => onArchive(product.id)}>
              <Archive size={14} />
              Arxivlash
            </button>
          )}
        </div>
      </details>
    </div>
  );

  if (viewMode !== "table") {
    return (
      <>
        <div className={`products-product-grid is-${viewMode}`}>
          {products.map((product) => (
            <article className="product-card" key={product.id}>
              <div className="product-card__visual" aria-hidden="true">
                <span>{product.name.slice(0, 2).toUpperCase()}</span>
              </div>
              <div className="product-card__body">
                <div className="product-card__chips">
                  <span>{product.category?.name || "Kategoriya yo'q"}</span>
                  <span>{product.brand?.name || "Brend yo'q"}</span>
                </div>
                <h3>{product.name}</h3>
                <p>{product.sku}</p>
              </div>
              <div className="product-card__metrics">
                <strong>{formatMoney(product.price)}</strong>
                <span>{formatQuantity(product.stock.available, product.unit?.code)}</span>
                <StatusPill value={product.status} />
              </div>
              <div className="product-card__footer">{actionButtons(product)}</div>
            </article>
          ))}
        </div>
        <Pagination page={page} pageCount={pageCount} pageSize={pageSize} totalCount={totalCount} onPage={onPage} />
      </>
    );
  }

  const sortIcon = (key) => {
    if (sort.key !== key) return null;
    return sort.direction === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />;
  };

  const ariaSort = (key) => {
    if (sort.key !== key) return "none";
    return sort.direction === "asc" ? "ascending" : "descending";
  };

  return (
    <section className="products-panel products-table-panel">
      {selectedVisibleCount > 0 && selectedVisibleCount < totalCount && (
        <div className="products-selection-note">
          <span>{selectedVisibleCount} ta joriy sahifa mahsuloti tanlandi.</span>
          <button type="button" onClick={onSelectAllFiltered}>
            Barcha natijalarni tanlash ({totalCount})
          </button>
        </div>
      )}
      <div className="products-table-wrap">
        <table className="products-table">
          <thead>
            <tr>
              <th aria-label="Tanlash">
                <input
                  ref={selectAllRef}
                  className="products-checkbox"
                  type="checkbox"
                  checked={allVisibleSelected}
                  aria-label="Joriy sahifani tanlash"
                  onChange={(event) => onToggleAll?.(visibleIds, event.target.checked)}
                />
              </th>
              {tableColumns.map((key) => (
                <th key={key} aria-sort={ariaSort(key)}>
                  <button type="button" disabled={key === "taxonomy"} onClick={() => onSort(key)}>
                    {columnLabels[key]} {sortIcon(key)}
                  </button>
                </th>
              ))}
              <th aria-label="Amallar" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <input
                    className="products-checkbox"
                    type="checkbox"
                    checked={selectedIds.includes(product.id)}
                    onChange={() => onToggleSelected(product.id)}
                    aria-label={`${product.name} tanlash`}
                  />
                </td>
                <td>
                  <button type="button" className="products-link-button" onClick={() => navigate(`/products/${product.id}`)}>
                    {product.name}
                  </button>
                  <small title={product.internalCode}>
                    {product.sku} · {product.barcodes?.[0] || "Shtrix-kod yo'q"}
                  </small>
                </td>
                <td>
                  <strong className="products-table-meta">{product.category?.name || "-"}</strong>
                  <small>{product.brand?.name || "-"}</small>
                </td>
                <td>{formatMoney(product.price)}</td>
                <td>{canViewCost ? `${Math.round(product.margin)}%` : "-"}</td>
                <td>
                  <StatusPill value={product.stockStatus} />
                  <small>
                    {formatQuantity(product.stock.available, product.unit?.code)} mavjud · {formatQuantity(product.stock.reserved, product.unit?.code)} band
                  </small>
                </td>
                <td><StatusPill value={product.status} /></td>
                <td>{formatDate(product.updatedAt)}</td>
                <td>{actionButtons(product)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pageCount={pageCount} pageSize={pageSize} totalCount={totalCount} onPage={onPage} />
    </section>
  );
};

const Pagination = ({ page, pageCount, pageSize, totalCount, onPage }) => {
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1).filter(
    (item) => item === 1 || item === pageCount || Math.abs(item - page) <= 1,
  );
  const start = totalCount ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(page * pageSize, totalCount);

  return (
    <div className="products-pagination">
      <span>{start}-{end} / {totalCount}</span>
      <button type="button" aria-label="Oldingi sahifa" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        <ChevronLeft size={15} />
      </button>
      {pages.map((item, index) => (
        <button
          type="button"
          key={`${item}-${index}`}
          className={item === page ? "is-active" : ""}
          onClick={() => onPage(item)}
        >
          {item}
        </button>
      ))}
      <button type="button" aria-label="Keyingi sahifa" disabled={page >= pageCount} onClick={() => onPage(page + 1)}>
        <ChevronRight size={15} />
      </button>
    </div>
  );
};

export default ProductTable;
