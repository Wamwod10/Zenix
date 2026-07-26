import { Archive, Copy, Eye, Pencil, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  formatDate,
  formatMoney,
  formatQuantity,
  labelProductStatus,
} from "../../utils/productCalculations";

const columnLabels = {
  name: "nomi",
  sku: "artikul",
  category: "kategoriya",
  brand: "brend",
  price: "narx",
  margin: "marja",
  stock: "qoldiq",
  status: "holat",
  updatedAt: "yangilangan",
};

const StatusPill = ({ value }) => (
  <span className={`products-pill is-${value}`}>{labelProductStatus(value)}</span>
);

const ProductTable = ({
  products,
  viewMode,
  selectedIds,
  canViewCost,
  sort,
  page,
  pageCount,
  onSort,
  onPage,
  onToggleSelected,
  onOpenQuickView,
  onDuplicate,
  onArchive,
  onRestore,
}) => {
  const navigate = useNavigate();

  if (!products.length) {
    return (
      <section className="products-empty-state">
        <strong>Mahsulot topilmadi</strong>
        <span>Qidiruv yoki filtrlarni yumshating, yoki yangi mahsulot yarating.</span>
      </section>
    );
  }

  const actionButtons = (product) => (
    <div className="products-row-actions">
      <button type="button" aria-label="Tezkor ko'rish" onClick={() => onOpenQuickView(product.id)}><Eye size={15} /></button>
      <button type="button" aria-label="Tahrirlash" onClick={() => navigate(`/products/${product.id}/edit`)}><Pencil size={15} /></button>
      <button type="button" aria-label="Nusxalash" onClick={() => onDuplicate(product.id)}><Copy size={15} /></button>
      {product.status === "archived" ? (
        <button type="button" aria-label="Tiklash" onClick={() => onRestore(product.id)}><RotateCcw size={15} /></button>
      ) : (
        <button type="button" aria-label="Arxivlash" onClick={() => onArchive(product.id)}><Archive size={15} /></button>
      )}
    </div>
  );

  if (viewMode !== "table") {
    return (
      <>
        <div className={`products-product-grid is-${viewMode}`}>
          {products.map((product) => (
            <article className="product-card" key={product.id}>
              <div className="product-card__visual" aria-hidden="true">
                {product.media?.length ? product.media[0].name.slice(0, 2).toUpperCase() : product.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="product-card__body">
                <span>{product.category?.name || "Kategoriya yo'q"} / {product.brand?.name || "Brend yo'q"}</span>
                <h3>{product.name}</h3>
                <p>{product.sku}</p>
              </div>
              <div className="product-card__metrics">
                <strong>{formatMoney(product.price)}</strong>
                <span>{Math.round(product.margin)}% marja</span>
                <span>{formatQuantity(product.stock.available, product.unit?.code)}</span>
              </div>
              <div className="product-card__footer">
                <StatusPill value={product.status} />
                {actionButtons(product)}
              </div>
            </article>
          ))}
        </div>
        <Pagination page={page} pageCount={pageCount} onPage={onPage} />
      </>
    );
  }

  const sortLabel = (key) => (sort.key === key ? (sort.direction === "asc" ? "yuqoriga" : "pastga") : "");

  return (
    <section className="products-panel products-table-panel">
      <div className="products-table-wrap">
        <table className="products-table">
          <thead>
            <tr>
              <th aria-label="Tanlash"></th>
              {["name", "sku", "category", "brand", "price", "margin", "stock", "status", "updatedAt"].map((key) => (
                <th key={key}>
                  <button type="button" onClick={() => onSort(key)}>
                    {columnLabels[key]} {sortLabel(key)}
                  </button>
                </th>
              ))}
              {canViewCost && <th>tannarx</th>}
              <th>shtrix-kod</th>
              <th>band</th>
              <th>mavjud</th>
              <th>variantlar</th>
              <th>tasdiq</th>
              <th aria-label="Amallar"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <input
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
                  <small>{product.internalCode}</small>
                </td>
                <td>{product.sku}</td>
                <td>{product.category?.name || "-"}</td>
                <td>{product.brand?.name || "-"}</td>
                <td>{formatMoney(product.price)}</td>
                <td>{Math.round(product.margin)}%</td>
                <td><StatusPill value={product.stockStatus} /></td>
                <td><StatusPill value={product.status} /></td>
                <td>{formatDate(product.updatedAt)}</td>
                {canViewCost && <td>{formatMoney(product.cost)}</td>}
                <td>{product.barcodes?.[0] || "-"}</td>
                <td>{formatQuantity(product.stock.reserved, product.unit?.code)}</td>
                <td>{formatQuantity(product.stock.available, product.unit?.code)}</td>
                <td>{product.variants?.length || 0}</td>
                <td><StatusPill value={product.approvalStatus} /></td>
                <td>{actionButtons(product)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pageCount={pageCount} onPage={onPage} />
    </section>
  );
};

const Pagination = ({ page, pageCount, onPage }) => (
  <div className="products-pagination">
    <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)}>Oldingi</button>
    <span>{page} / {pageCount}</span>
    <button type="button" disabled={page >= pageCount} onClick={() => onPage(page + 1)}>Keyingi</button>
  </div>
);

export default ProductTable;
