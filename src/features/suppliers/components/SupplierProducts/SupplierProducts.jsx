import {
  Archive,
  Edit3,
  History,
  PackageSearch,
  RotateCcw,
  Star,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { EmptyState } from "../../../../components/ui/EmptyState/EmptyState";
import {
  formatCurrencyMoney,
  formatPurchaseDate,
} from "../../../purchases/utils/purchaseMoney";

import "./SupplierProducts.scss";

const buildLastPurchaseMap = (orders, supplierId) => {
  const map = {};

  orders
    .filter((order) => order.supplierId === supplierId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .forEach((order) => {
      (order.items || []).forEach((item) => {
        if (!item.productId) return;

        map[item.productId] = {
          price: item.price / (item.unitFactor || 1),
          currency: order.currency || "UZS",
          exchangeRate: order.exchangeRate || 1,
          date: order.createdAt,
        };
      });
    });

  return map;
};

const stockStatusOf = (product) => {
  if (product.stock <= 0) return { label: "Yo'q", tone: "danger" };
  if (product.stock <= product.reorderPoint) return { label: "Kam", tone: "warning" };
  return { label: "Faol", tone: "success" };
};

const relationOf = (supplier, productId) =>
  (supplier.supplierProducts || []).find((entry) => entry.productId === productId) ||
  supplier.productOverrides?.[productId] ||
  {};

const SupplierProducts = ({
  supplier,
  products = [],
  orders = [],
  onUnlink,
  onEdit,
  onPreferred,
  onArchive,
  onRestore,
  onPriceHistory,
}) => {
  const linkedIds = new Set(supplier.productIds || []);
  const supplierProducts = products.filter((product) => linkedIds.has(product.id));

  if (!supplierProducts.length) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="Mahsulot bog'lanmagan"
        description="Product katalogidan mavjud mahsulotni tanlab, supplier shartlarini kiriting."
      />
    );
  }

  const lastPurchaseMap = buildLastPurchaseMap(orders, supplier.id);

  return (
    <div className="supplier-products">
      <div className="supplier-products__row supplier-products__row--head" role="row">
        <span>Mahsulot</span>
        <span>Product kodlari</span>
        <span>Supplier kodlari</span>
        <span>Xarid narxi</span>
        <span>Disc / VAT</span>
        <span>MOQ / Lead</span>
        <span>Oxirgi xarid</span>
        <span>Farq</span>
        <span>Preferred</span>
        <span>Status</span>
        <span>Amallar</span>
      </div>

      {supplierProducts.map((product) => {
        const relation = relationOf(supplier, product.id);
        const lastPurchase = lastPurchaseMap[product.id];
        const currentPrice =
          relation.purchasePrice ?? relation.price ?? product.currentCost ?? product.standardCost ?? 0;
        const currentCurrency = relation.currency || "UZS";
        const lastPurchasePrice = relation.lastPurchasePrice || lastPurchase?.price || 0;
        const lastPurchaseCurrency = lastPurchase?.currency || currentCurrency;
        const lastPurchaseDate = relation.lastPurchaseDate || lastPurchase?.date || "";
        const lastPriceInBase = lastPurchase
          ? Math.round(lastPurchase.price * lastPurchase.exchangeRate)
          : null;
        const diff = lastPriceInBase !== null ? currentPrice - lastPriceInBase : 0;
        const diffPercent = lastPriceInBase ? Math.round((diff / lastPriceInBase) * 100) : 0;
        const stockStatus = stockStatusOf(product);
        const relationStatus = relation.status || "active";
        const isActive = relationStatus === "active";

        return (
          <div className="supplier-products__row" role="row" key={product.id}>
            <span className="supplier-products__primary">
              <strong>{product.name}</strong>
              <small>{product.category || product.categoryName || "-"}</small>
            </span>

            <span className="supplier-products__codes">
              <strong>{product.sku || "-"}</strong>
              <small>{product.barcode || product.barcodes?.[0] || "-"}</small>
            </span>

            <span className="supplier-products__codes">
              <strong>{relation.supplierSku || relation.sku || "-"}</strong>
              <small>{relation.supplierBarcode || "-"}</small>
            </span>

            <span className="supplier-products__money">
              {formatCurrencyMoney(currentPrice, currentCurrency)}
            </span>

            <span className="supplier-products__codes">
              <strong>{relation.discount || 0}%</strong>
              <small>{relation.vat || 0}% VAT</small>
            </span>

            <span className="supplier-products__codes">
              <strong>{relation.minimumOrderQty || relation.moq || 1}</strong>
              <small>{relation.leadTime ?? relation.leadTimeDays ?? "-"} kun</small>
            </span>

            <span className="supplier-products__codes">
              <strong>
                {lastPurchasePrice
                  ? formatCurrencyMoney(lastPurchasePrice, lastPurchaseCurrency)
                  : "-"}
              </strong>
              <small>{lastPurchaseDate ? formatPurchaseDate(lastPurchaseDate) : "-"}</small>
            </span>

            <span
              className={`supplier-products__diff supplier-products__diff--${
                diff > 0 ? "up" : diff < 0 ? "down" : "flat"
              }`}
            >
              {diff !== 0 &&
                lastPriceInBase !== null &&
                (diff > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />)}
              {diff === 0 || lastPriceInBase === null
                ? "-"
                : `${diff > 0 ? "+" : ""}${diffPercent}%`}
            </span>

            <span
              className={`supplier-products__badge supplier-products__badge--${
                relation.isPreferredSupplier ? "success" : "neutral"
              }`}
            >
              {relation.isPreferredSupplier ? "Ha" : "Yo'q"}
            </span>

            <span
              className={`supplier-products__badge supplier-products__badge--${
                isActive ? stockStatus.tone : "neutral"
              }`}
            >
              {isActive ? stockStatus.label : "Arxiv"}
            </span>

            <span className="supplier-products__actions">
              <button type="button" title="Shartlarni tahrirlash" onClick={() => onEdit?.(product.id)}>
                <Edit3 size={14} />
              </button>
              <button type="button" title="Preferred qilish" onClick={() => onPreferred?.(product.id)}>
                <Star size={14} />
              </button>
              <button type="button" title="Narx tarixi" onClick={() => onPriceHistory?.(product.id)}>
                <History size={14} />
              </button>
              {isActive ? (
                <button type="button" title="Arxivlash" onClick={() => onArchive?.(product.id)}>
                  <Archive size={14} />
                </button>
              ) : (
                <button type="button" title="Qayta faollashtirish" onClick={() => onRestore?.(product.id)}>
                  <RotateCcw size={14} />
                </button>
              )}
              <button
                type="button"
                className="supplier-products__unlink"
                title="Bog'lanishni bekor qilish"
                onClick={() => onUnlink?.(product.id)}
              >
                <Trash2 size={14} />
              </button>
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default SupplierProducts;
