import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Archive, ArrowLeft, Copy, History, Pencil, RotateCcw } from "lucide-react";

import {
  calculateProjectedStock,
  formatDate,
  formatMargin,
  formatMoney,
  formatQuantity,
  labelProductStatus,
} from "../../utils/productCalculations";

const detailTabs = [
  { id: "overview", label: "Xulosa" },
  { id: "pricing", label: "Narxlar" },
  { id: "suppliers", label: "Supplierlar" },
  { id: "purchases", label: "Xaridlar tarixi" },
  { id: "stock", label: "Qoldiq va harakat" },
  { id: "variants", label: "Variantlar" },
  { id: "media", label: "Rasm va fayl" },
  { id: "relations", label: "Bog'lanishlar" },
  { id: "audit", label: "Audit" },
];

const formatPriceWithCurrency = (amount, currency = "UZS") =>
  `${formatMoney(amount)} ${currency}`;

const ProductDetails = ({
  product,
  productsById,
  canViewCost,
  purchaseHistoryRows = [],
  supplierSummary = {},
  onDuplicate,
  onArchive,
  onRestore,
}) => {
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
        <button type="button" className="products-mini-button" onClick={() => navigate("/products/list")}>
          Ro'yxatga qaytish
        </button>
      </section>
    );
  }

  const supplierComparison = supplierSummary.comparison || [];
  const preferredSupplier = supplierSummary.preferredSupplier || null;
  const supplierPriceHistory = supplierSummary.priceHistory || [];
  const stockMovementRows = product.stockMovements || product.costHistory || [];
  const currentStock = product.stock?.available ?? 0;

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
            <span>SKU: {product.sku || "-"}</span>
            <span>Barcode: {product.barcode || product.barcodes?.[0] || "-"}</span>
            <span>QR: {product.qrCode || "-"}</span>
            <span>{product.category?.name || product.categoryName || "-"}</span>
            <span>{product.brand?.name || product.brandName || "-"}</span>
            <span>{product.unit?.code || product.unit?.name || product.unitId || "-"}</span>
          </div>
        </div>
        <div className="products-row-actions products-row-actions--text">
          <button type="button" onClick={() => navigate(`/products/${product.id}/edit`)}>
            <Pencil size={15} /> Tahrirlash
          </button>
          <button type="button" onClick={() => onDuplicate(product.id)}>
            <Copy size={15} /> Nusxalash
          </button>
          {product.status === "archived" ? (
            <button type="button" onClick={() => onRestore(product.id)}>
              <RotateCcw size={15} /> Tiklash
            </button>
          ) : (
            <button type="button" onClick={() => onArchive(product.id)}>
              <Archive size={15} /> Arxivlash
            </button>
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
            <article><strong>{product.sku || "-"}</strong><span>SKU</span></article>
            <article><strong>{product.barcode || product.barcodes?.[0] || "-"}</strong><span>Barcode</span></article>
            <article><strong>{product.qrCode || "-"}</strong><span>QR Code</span></article>
            <article><strong>{product.category?.name || product.categoryName || "-"}</strong><span>Category</span></article>
            <article><strong>{product.brand?.name || product.brandName || "-"}</strong><span>Brand</span></article>
            <article><strong>{product.unit?.name || product.unitId || "-"}</strong><span>Unit</span></article>
            <article><strong>{labelProductStatus(product.status)}</strong><span>Status</span></article>
            <article><strong>{formatMoney(product.sellingPrice ?? product.price)}</strong><span>Selling Price</span></article>
            <article><strong>{formatMoney(product.retailPrice ?? product.price)}</strong><span>Retail Price</span></article>
            <article><strong>{formatMoney(product.wholesalePrice)}</strong><span>Wholesale Price</span></article>
            <article><strong>{formatMoney(product.vipPrice)}</strong><span>VIP Price</span></article>
            {canViewCost && <article><strong>{formatMoney(product.currentCost ?? product.cost)}</strong><span>Current Cost</span></article>}
            {canViewCost && <article><strong>{formatMoney(product.standardCost)}</strong><span>Standard Cost</span></article>}
            <article><strong>{formatMargin(product.margin)}</strong><span>Margin %</span></article>
            <article><strong>{Math.round(product.markup)}%</strong><span>Markup %</span></article>
            <article><strong>{formatQuantity(currentStock, product.unit?.code)}</strong><span>Current Stock</span></article>
            <article><strong>{supplierSummary.supplierCount ?? supplierComparison.length}</strong><span>Supplier Count</span></article>
            <article><strong>{preferredSupplier?.supplierName || "-"}</strong><span>Preferred Supplier</span></article>
            <article><strong>{formatMoney(supplierSummary.lastPurchasePrice)}</strong><span>Last Purchase Price</span></article>
            <article><strong>{formatDate(supplierSummary.lastPurchaseDate)}</strong><span>Last Purchase Date</span></article>
          </div>
        )}

        {tab === "pricing" && (
          <div className="products-detail-stack">
            <div className="products-mini-grid">
              <article><strong>{formatMoney(product.sellingPrice ?? product.price)}</strong><span>Selling price</span></article>
              <article><strong>{formatMoney(product.retailPrice ?? product.price)}</strong><span>Retail price</span></article>
              <article><strong>{formatMoney(product.wholesalePrice)}</strong><span>Wholesale price</span></article>
              <article><strong>{formatMoney(product.vipPrice)}</strong><span>VIP price</span></article>
            </div>
            <div className="products-timeline">
              {(product.priceHistory || []).map((item) => (
                <article key={item.id}>
                  <History size={15} />
                  <div>
                    <strong>{formatMoney(item.price)} - {labelProductStatus(item.status)}</strong>
                    <span>{item.requestedBy} - {item.approvedBy || "Kutilmoqda"} - {formatDate(item.date)}</span>
                  </div>
                </article>
              ))}
              {!product.priceHistory?.length && (
                <article>
                  <strong>Selling price history yo'q</strong>
                  <span>Narx tasdiqlari yoki price list o'zgarishlari hali saqlanmagan.</span>
                </article>
              )}
            </div>
            <div className="products-stock-list">
              {supplierPriceHistory.map((entry) => (
                <article key={entry.id || `${entry.supplierProductId}-${entry.changedAt}`}>
                  <strong>{entry.supplierName}</strong>
                  <span>{formatMoney(entry.oldPrice)} {" -> "} {formatMoney(entry.newPrice)} {entry.currency || "UZS"}</span>
                  <small>{formatDate(entry.changedAt)} - {entry.changedBy || "system"} - {entry.reason || entry.source || "manual"}</small>
                </article>
              ))}
              {!supplierPriceHistory.length && (
                <article>
                  <strong>Supplier price history yo'q</strong>
                  <span>SupplierProduct purchase price o'zgarishlari hali mavjud emas.</span>
                </article>
              )}
            </div>
          </div>
        )}

        {tab === "suppliers" && (
          <div className="products-table-wrap">
            <table className="products-table products-table--supplier-comparison">
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Purchase Price</th>
                  <th>Base Price</th>
                  <th>Discount</th>
                  <th>VAT</th>
                  <th>Lead Time</th>
                  <th>MOQ</th>
                  <th>Last Purchase</th>
                  <th>Performance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {supplierComparison.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong className="products-table-meta">{row.supplierName}</strong>
                      <small>{row.isPreferredSupplier ? "Preferred supplier" : row.supplierSku || "-"}</small>
                    </td>
                    <td>{formatPriceWithCurrency(row.purchasePrice, row.currency)}</td>
                    <td>{formatMoney(row.convertedBasePrice)} UZS<small>Rate {row.exchangeRate}</small></td>
                    <td>{row.discountType || "percentage"} {row.discountValue ?? row.discount ?? 0}</td>
                    <td>{row.vatRate ?? row.vat ?? 0}%<small>{row.taxInclusive ? "inclusive" : "exclusive"}</small></td>
                    <td>{row.leadTime ?? "-"} kun</td>
                    <td>{row.minimumOrderQty ?? "-"}</td>
                    <td>{formatMoney(row.lastPurchasePrice)}<small>{formatDate(row.lastPurchaseDate)}</small></td>
                    <td>{row.deliveryPerformance || "-"}<small>{row.purchaseCount} purchase</small></td>
                    <td>{row.status}</td>
                  </tr>
                ))}
                {!supplierComparison.length && (
                  <tr>
                    <td colSpan={10}>
                      <strong className="products-table-meta">Supplier topilmadi</strong>
                      <small>Bu Product hali hech bir SupplierProduct relation bilan bog'lanmagan.</small>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === "purchases" && (
          <div className="products-stock-list">
            {purchaseHistoryRows.map((row) => (
              <article key={`${row.purchaseOrderId}-${row.purchaseReceiptId}-${row.id}`}>
                <strong>{row.supplierName}</strong>
                <span>{row.purchaseOrderNumber} {row.purchaseReceiptNumber ? `- ${row.purchaseReceiptNumber}` : ""}</span>
                <b>{formatPriceWithCurrency(row.purchasePrice, row.currency)} - {formatQuantity(row.quantity, product.unit?.code)}</b>
                <small>
                  Chegirma {row.discount}% - VAT {row.vat}% - {formatDate(row.createdAt)}
                  {row.warehouseId ? ` - ${row.warehouseId}` : ""}
                  {row.responsibleEmployee ? ` - ${row.responsibleEmployee}` : ""}
                </small>
              </article>
            ))}
            {!purchaseHistoryRows.length && (
              <article>
                <strong>Xarid tarixi yo'q</strong>
                <span>Bu mahsulot bo'yicha hali PurchaseItem snapshot mavjud emas.</span>
              </article>
            )}
          </div>
        )}

        {tab === "stock" && (
          <div className="products-detail-stack">
            <div className="products-stock-list">
              {product.stockSummary?.map((row) => {
                const available = row.onHand - row.reserved;
                return (
                  <article key={row.warehouseId}>
                    <strong>{row.warehouse || row.warehouseName || row.warehouseId}</strong>
                    <span>{row.branch || row.location || "-"}</span>
                    <b>{formatQuantity(available, product.unit?.code)} mavjud</b>
                    <small>Jami {row.onHand} - Band {row.reserved} - Kutilayotgan bilan {calculateProjectedStock(available, row.incoming)}</small>
                  </article>
                );
              })}
              {!product.stockSummary?.length && (
                <article>
                  <strong>Stock mavjud emas</strong>
                  <span>Bu Product bo'yicha warehouse balance hali yaratilmagan.</span>
                </article>
              )}
            </div>
            <div className="products-stock-list">
              {stockMovementRows.map((row) => (
                <article key={row.id}>
                  <strong>{row.source || row.type || "stock_movement"}</strong>
                  <span>{row.warehouseId || row.warehouse || "-"} - {formatQuantity(row.quantity || row.receivedQuantity, product.unit?.code)}</span>
                  <small>{formatDate(row.at || row.createdAt)} - cost {formatMoney(row.currentCost ?? row.unitCost ?? 0)}</small>
                </article>
              ))}
              {!stockMovementRows.length && (
                <article>
                  <strong>Stock movement yo'q</strong>
                  <span>Receipt, adjustment yoki cost movement hali saqlanmagan.</span>
                </article>
              )}
            </div>
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
            {!product.relations?.length && (
              <article>
                <strong>Bog'lanish yo'q</strong>
                <span>Cross-sell, replacement yoki bundle relationlari hali qo'shilmagan.</span>
              </article>
            )}
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
