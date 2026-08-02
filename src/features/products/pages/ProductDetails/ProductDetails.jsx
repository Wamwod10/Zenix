import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Archive, ArrowLeft, Copy, History, Pencil, RotateCcw } from "lucide-react";

import {
  calculateProjectedStock,
  formatDate,
  formatMoney,
  formatQuantity,
  labelProductStatus,
} from "../../utils/productCalculations";

const detailTabs = [
  { id: "overview", label: "Xulosa" },
  { id: "pricing", label: "Narxlar" },
  { id: "stock", label: "Qoldiq" },
  { id: "variants", label: "Variantlar" },
  { id: "media", label: "Rasm va fayl" },
  { id: "relations", label: "Bog'lanishlar" },
  { id: "audit", label: "Audit" },
];

const ProductDetails = ({ product, productsById, canViewCost, onDuplicate, onArchive, onRestore }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = useMemo(() => {
    const requestedTab = searchParams.get("tab");
    return detailTabs.some((item) => item.id === requestedTab) ? requestedTab : "overview";
  }, [searchParams]);
  const setTab = (nextTab) => setSearchParams(nextTab === "overview" ? {} : { tab: nextTab });

  if (!product) {
    return (
      <section className="products-empty-state">
        <strong>Mahsulot topilmadi</strong>
        <button type="button" className="products-mini-button" onClick={() => navigate("/products/list")}>Ro'yxatga qaytish</button>
      </section>
    );
  }

  return (
    <div className="products-view">
      <button type="button" className="products-mini-button" onClick={() => navigate("/products/list")}>
        <ArrowLeft size={15} />
        Mahsulotlarga qaytish
      </button>

      <section className="products-panel products-detail-hero">
        <div className="products-detail-hero__visual">{product.name.slice(0, 2).toUpperCase()}</div>
        <div>
          <span className="products-eyebrow">360 daraja mahsulot profili</span>
          <h2>{product.name}</h2>
          <p>{product.description}</p>
          <div className="products-detail-hero__meta">
            <span>{product.sku}</span>
            <span>{product.barcodes?.[0] || "Shtrix-kod yo'q"}</span>
            <span>{product.category?.name}</span>
            <span>{product.brand?.name}</span>
          </div>
        </div>
        <div className="products-row-actions products-row-actions--text">
          <button type="button" onClick={() => navigate(`/products/${product.id}/edit`)}><Pencil size={15} /> Tahrirlash</button>
          <button type="button" onClick={() => onDuplicate(product.id)}><Copy size={15} /> Nusxalash</button>
          {product.status === "archived" ? (
            <button type="button" onClick={() => onRestore(product.id)}><RotateCcw size={15} /> Tiklash</button>
          ) : (
            <button type="button" onClick={() => onArchive(product.id)}><Archive size={15} /> Arxivlash</button>
          )}
        </div>
      </section>

      <div className="products-tabs" role="tablist" aria-label="Mahsulot tafsilotlari bo'limlari">
        {detailTabs.map((item) => (
          <button
            type="button"
            key={item.id}
            className={tab === item.id ? "is-active" : ""}
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="products-panel">
        {tab === "overview" && (
          <div className="products-mini-grid">
            <article><strong>{formatMoney(product.price)}</strong><span>Sotuv narxi</span></article>
            {canViewCost && <article><strong>{formatMoney(product.cost)}</strong><span>Tannarx</span></article>}
            <article><strong>{Math.round(product.margin)}%</strong><span>Marja</span></article>
            <article><strong>{labelProductStatus(product.status)}</strong><span>Holat</span></article>
            <article><strong>{labelProductStatus(product.approvalStatus)}</strong><span>Tasdiq</span></article>
            <article><strong>{product.tags?.join(", ") || "-"}</strong><span>Belgilar</span></article>
          </div>
        )}
        {tab === "pricing" && (
          <div className="products-timeline">
            {product.priceHistory?.map((item) => (
              <article key={item.id}>
                <History size={15} />
                <div>
                  <strong>{formatMoney(item.price)} · {labelProductStatus(item.status)}</strong>
                  <span>{item.requestedBy} → {item.approvedBy || "Kutilmoqda"} · {formatDate(item.date)}</span>
                </div>
              </article>
            ))}
          </div>
        )}
        {tab === "stock" && (
          <div className="products-stock-list">
            {product.stockSummary?.map((row) => {
              const available = row.onHand - row.reserved;
              return (
                <article key={row.warehouseId}>
                  <strong>{row.warehouse}</strong>
                  <span>{row.branch}</span>
                  <b>{formatQuantity(available, product.unit?.code)} mavjud</b>
                  <small>Jami {row.onHand} · Band {row.reserved} · Kutilayotgan bilan {calculateProjectedStock(available, row.incoming)}</small>
                </article>
              );
            })}
          </div>
        )}
        {tab === "variants" && <Matrix rows={product.variants || []} />}
        {tab === "media" && (
          <div className="products-card-grid">
            {[...(product.media || []), ...(product.documents || [])].map((file) => (
              <article className="products-mini-card" key={file.id}>
                <strong>{file.name}</strong><span>{file.type}</span><span>{Math.round(file.size / 1024)} KB</span>
              </article>
            ))}
          </div>
        )}
        {tab === "relations" && (
          <div className="products-list">
            {(product.relations || []).map((id) => (
              <button type="button" key={id} onClick={() => navigate(`/products/${id}`)}>
                <strong>{productsById[id]?.name || id}</strong>
                <span>Qo'shimcha savdo, o'rnini bosuvchi yoki to'plam bog'lanishi</span>
              </button>
            ))}
          </div>
        )}
        {tab === "audit" && (
          <div className="products-mini-grid">
            <article><strong>{formatDate(product.createdAt)}</strong><span>Yaratilgan</span></article>
            <article><strong>{formatDate(product.updatedAt)}</strong><span>Yangilangan</span></article>
            <article><strong>{product.integrations?.pos ? "Tayyor" : "Yashirilgan"}</strong><span>Savdo nuqtasi</span></article>
            <article><strong>{product.integrations?.warehouse ? "Moslangan" : "Yashirilgan"}</strong><span>Ombor ulanishi</span></article>
          </div>
        )}
      </section>
    </div>
  );
};

const Matrix = ({ rows }) => (
  <div className="products-variant-matrix">
    {rows.length ? rows.map((variant) => (
      <article key={variant.id}>
        <span>{variant.combination}</span>
        <span>{variant.sku}</span>
        <span>{variant.barcode || "-"}</span>
        <span>{formatMoney(variant.price)}</span>
        <span>{variant.stock}</span>
      </article>
    )) : (
      <article>
        <strong>Variant yo'q</strong>
        <span>Variant qo'shish uchun mahsulotni tahrirlash oynasini oching.</span>
      </article>
    )}
  </div>
);

export default ProductDetails;
