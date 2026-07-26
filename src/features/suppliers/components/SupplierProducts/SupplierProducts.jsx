// Task 2/3: Supplier tomonidan yetkaziladigan mahsulotlar. Bog'lanish
// (linking) ENDI faqat aniq, foydalanuvchi tomonidan tanlangan holatda
// mavjud (SupplierProductLinkModal orqali `supplier.productIds`ga
// qo'shiladi) — hech qanday avtomatik/mock bog'lanish yo'q (bug fix:
// ilgari Product katalogidagi `product.supplierIds` orqali suppliers'ga
// "avtomatik" bog'langan mahsulotlar ham ko'rsatilardi).

import { PackageSearch, Trash2, TrendingDown, TrendingUp } from "lucide-react";

import { EmptyState } from "../../../../components/ui/EmptyState/EmptyState";
import {
  formatCurrencyMoney,
  formatMoney,
  formatPurchaseDate,
} from "../../../purchases/utils/purchaseMoney";

import "./SupplierProducts.scss";

// Shu supplierdan har mahsulot bo'yicha ENG SO'NGGI xarid narxi/sanasi —
// mavjud PO qatorlaridan (item.price) hisoblanadi, yangi maydon
// qo'shilmaydi (Task 3: mavjud xarid tarixini qayta ishlatish).
// item.price PO birligi bo'yicha (masalan "Qop 25kg") saqlanadi, product.lastPrice
// esa har doim BAZAVIY birlikda (dona/kg) — solishtirish uchun item.price
// item.unitFactor'ga bo'linib bazaviy birlikka o'tkaziladi, aks holda narx
// farqi (masalan qopdagi 25 barobar) noto'g'ri ko'rinadi.
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

const availabilityOf = (product) => {
  if (product.stock <= 0) return { label: "Yo'q", tone: "danger" };
  if (product.stock <= product.reorderPoint) {
    return { label: "Kam qoldi", tone: "warning" };
  }

  return { label: "Yetarli", tone: "success" };
};

const SupplierProducts = ({ supplier, products = [], orders = [], onUnlink }) => {
  // Bug fix: bog'lanish YAGONA manbasi endi `supplier.productIds` — Product
  // katalogidagi `product.supplierIds` (mock/avtomatik "xarid tarixidan
  // taxminiy" bog'lanish) ENDI bu yerda ishlatilmaydi. Shu bilan
  // PurchaseOrderWizard bilan bir xil, YAGONA "kim kimga bog'langan"
  // qoidasi qo'llaniladi (Task 5).
  const linkedIds = new Set(supplier.productIds || []);
  const supplierProducts = products.filter((product) => linkedIds.has(product.id));

  if (!supplierProducts.length) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="Mahsulot bog'lanmagan"
        description="Hali hech qanday mahsulot bog'lanmagan — “Mahsulot qo'shish” tugmasi orqali Product katalogidan mahsulot bog'lang."
      />
    );
  }

  const lastPurchaseMap = buildLastPurchaseMap(orders, supplier.id);
  const overrides = supplier.productOverrides || {};

  return (
    <div className="supplier-products">
      <div
        className="supplier-products__row supplier-products__row--head"
        role="row"
      >
        <span>Mahsulot</span>
        <span>SKU</span>
        <span>Oxirgi xarid narxi</span>
        <span>Oxirgi xarid sanasi</span>
        <span>Joriy xarid narxi</span>
        <span>Farq</span>
        <span>Mavjudligi</span>
        <span>Amallar</span>
      </div>

      {supplierProducts.map((product) => {
        const lastPurchase = lastPurchaseMap[product.id];
        const lastPriceInBase = lastPurchase
          ? Math.round(lastPurchase.price * lastPurchase.exchangeRate)
          : null;

        // "Joriy xarid narxi" — shu supplier bilan BOG'LASHDA kelishilgan
        // narx (SupplierProductLinkModal'da kiritilgan), agar bog'lanishda
        // ko'rsatilmagan bo'lsa katalogdagi standart narxga tushadi.
        const override = overrides[product.id];
        const currentPrice = override?.price ?? product.lastPrice;
        const currentCurrency = override?.currency || "UZS";

        const diff =
          lastPriceInBase !== null ? currentPrice - lastPriceInBase : 0;
        const diffPercent =
          lastPriceInBase ? Math.round((diff / lastPriceInBase) * 100) : 0;
        const availability = availabilityOf(product);

        return (
          <div className="supplier-products__row" role="row" key={product.id}>
            <span className="supplier-products__primary">
              <strong>{product.name}</strong>
              <small>{product.category}</small>
            </span>

            <span className="supplier-products__sku">
              {override?.sku || product.sku}
            </span>

            <span className="supplier-products__money">
              {lastPurchase
                ? formatCurrencyMoney(lastPurchase.price, lastPurchase.currency)
                : "—"}
            </span>

            <span className="supplier-products__date">
              {lastPurchase ? formatPurchaseDate(lastPurchase.date) : "—"}
            </span>

            <span className="supplier-products__money">
              {formatCurrencyMoney(currentPrice, currentCurrency)}
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
                ? "—"
                : `${diff > 0 ? "+" : ""}${diffPercent}%`}
            </span>

            <span
              className={`supplier-products__badge supplier-products__badge--${availability.tone}`}
            >
              {availability.label}
            </span>

            <span className="supplier-products__actions">
              <button
                type="button"
                className="supplier-products__unlink"
                title="Bog'lanishni bekor qilish"
                aria-label="Bog'lanishni bekor qilish"
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
