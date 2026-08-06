import {
  Archive,
  ArrowDown,
  ArrowUp,
  Ban,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Copy,
  Eye,
  MoreHorizontal,
  Package,
  PackagePlus,
  Pencil,
  RotateCcw,
  Send,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  formatDate,
  formatMargin,
  formatMoney,
  formatQuantity,
  labelProductStatus,
} from "../../utils/productCalculations";

import "./ProductTable.scss";

const columnLabels = {
  name: "Mahsulot",
  taxonomy: "Kategoriya / brend",
  price: "Narx",
  margin: "Tannarx / marja",
  stock: "Qoldiq",
  status: "Mahsulot holati",
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
  onActivate,
  onDeactivate,
  onSubmitApproval,
  onArchive,
  onRestore,
}) => {
  const navigate = useNavigate();
  const selectAllRef = useRef(null);
  const menuRef = useRef(null);
  const [openMenuId, setOpenMenuId] = useState("");
  const [pendingAction, setPendingAction] = useState("");
  const visibleIds = products.map((product) => product.id);
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.includes(id)).length;
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectedVisibleCount > 0 && !allVisibleSelected;
    }
  }, [allVisibleSelected, selectedVisibleCount]);

  useEffect(() => {
    const closeMenu = (event) => {
      if (event.type === "keydown" && event.key !== "Escape") return;
      if (event.type === "mousedown" && menuRef.current?.contains(event.target)) return;
      setOpenMenuId("");
    };

    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("keydown", closeMenu);
    return () => {
      document.removeEventListener("mousedown", closeMenu);
      document.removeEventListener("keydown", closeMenu);
    };
  }, []);

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

  const runAction = (key, action) => {
    setPendingAction(key);
    setOpenMenuId("");
    try {
      action();
    } finally {
      setPendingAction("");
    }
  };

  const actionButtons = (product) => (
    <div className="products-row-actions">
      <button type="button" title="Tezkor ko'rish" aria-label="Tezkor ko'rish" disabled={Boolean(pendingAction)} onClick={() => onOpenQuickView(product.id)}>
        <Eye size={15} />
      </button>
      <button type="button" title="Tahrirlash" aria-label="Tahrirlash" disabled={Boolean(pendingAction)} onClick={() => navigate(`/products/${product.id}/edit`)}>
        <Pencil size={15} />
      </button>
      <div className={`products-action-menu ${openMenuId === product.id ? "is-open" : ""}`} ref={openMenuId === product.id ? menuRef : null}>
        <button
          type="button"
          aria-label="Qo'shimcha amallar"
          title="Qo'shimcha amallar"
          aria-expanded={openMenuId === product.id}
          disabled={Boolean(pendingAction)}
          onClick={() => setOpenMenuId((current) => (current === product.id ? "" : product.id))}
        >
          <MoreHorizontal size={15} />
        </button>
        <div>
          <button type="button" onClick={() => runAction(`${product.id}:edit`, () => navigate(`/products/${product.id}/edit`))}>
            <Pencil size={14} />
            Tahrirlash
          </button>
          {product.status !== "active" && product.status !== "archived" && (
            <button type="button" onClick={() => runAction(`${product.id}:activate`, () => onActivate(product.id))}>
              <CheckCircle2 size={14} />
              Faollashtirish
            </button>
          )}
          {product.status === "draft" && (
            <button type="button" onClick={() => runAction(`${product.id}:approval`, () => onSubmitApproval(product.id))}>
              <Send size={14} />
              Tasdiqqa yuborish
            </button>
          )}
          {product.status === "active" && (
            <button type="button" onClick={() => runAction(`${product.id}:deactivate`, () => onDeactivate(product.id))}>
              <Ban size={14} />
              Nofaol qilish
            </button>
          )}
          <button type="button" onClick={() => runAction(`${product.id}:duplicate`, () => onDuplicate(product.id))}>
            <Copy size={14} />
            Nusxalash
          </button>
          {product.status === "archived" ? (
            <button type="button" onClick={() => runAction(`${product.id}:restore`, () => onRestore(product.id))}>
              <RotateCcw size={14} />
              Tiklash
            </button>
          ) : (
            <button type="button" className="is-danger" onClick={() => runAction(`${product.id}:archive`, () => onArchive(product.id))}>
              <Archive size={14} />
              Arxivlash
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (viewMode !== "table") {
    return (
      <>
        <div className={`products-product-grid is-${viewMode}`}>
          {products.map((product) => (
            <article className="product-card" key={product.id}>
              <div className="product-card__visual" aria-hidden="true">
                <Package size={22} />
              </div>
              <div className="product-card__body">
                <div className="product-card__chips">
                  <span>{product.category?.name || "Belgilanmagan"}</span>
                  <span>{product.brand?.name || "Belgilanmagan"}</span>
                </div>
                <h3>{product.name}</h3>
                <p>SKU: {product.sku || "Belgilanmagan"}</p>
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
                  <div className="products-table-product">
                    <span className="products-table-product__icon"><Package size={17} /></span>
                    <div>
                      <button type="button" className="products-link-button" onClick={() => navigate(`/products/${product.id}`)}>
                        {product.name}
                      </button>
                      <small title={product.internalCode}>
                        <span>SKU: {product.sku || "Belgilanmagan"}</span>
                        <span>Shtrix-kod: {product.barcodes?.[0] || "Belgilanmagan"}</span>
                      </small>
                    </div>
                  </div>
                </td>
                <td>
                  <strong className="products-table-meta">{product.category?.name || "Belgilanmagan"}</strong>
                  <small>{product.brand?.name || "Belgilanmagan"}</small>
                </td>
                <td>{formatMoney(product.price)}</td>
                <td>
                  {canViewCost ? (
                    <>
                      <strong className="products-table-meta">{product.currentCost > 0 ? formatMoney(product.currentCost) : "Tannarx belgilanmagan"}</strong>
                      <small>{formatMargin(product.margin)} marja</small>
                    </>
                  ) : "Yashirilgan"}
                </td>
                <td>
                  <StatusPill value={product.stockStatus} />
                  <small>
                    {formatQuantity(product.stock.available, product.unit?.code)} mavjud, {formatQuantity(product.stock.reserved, product.unit?.code)} rezerv
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
