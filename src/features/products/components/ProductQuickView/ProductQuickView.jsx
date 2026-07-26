import { Modal } from "../../../../components/ui/Modal";
import {
  calculateProjectedStock,
  formatMoney,
  formatQuantity,
} from "../../utils/productCalculations";

const ProductQuickView = ({ product, canViewCost, onClose, onEdit, onSubmitApproval }) => {
  if (!product) return null;

  return (
    <Modal
      open
      title={product.name}
      description={`${product.sku} · ${product.barcodes?.[0] || "Shtrix-kod yo'q"}`}
      onClose={onClose}
      className="products-modal-panel"
    >
      <div className="product-quick-view">
        <section>
          <span className="products-eyebrow">360 daraja profil</span>
          <h3>{product.category?.name} / {product.brand?.name}</h3>
          <p>{product.description}</p>
          <div className="products-mini-grid">
            <article><strong>{formatMoney(product.price)}</strong><span>Sotuv narxi</span></article>
            {canViewCost && <article><strong>{formatMoney(product.cost)}</strong><span>Tannarx</span></article>}
            <article><strong>{Math.round(product.margin)}%</strong><span>Marja</span></article>
            <article><strong>{Math.round(product.markup)}%</strong><span>Ustama</span></article>
          </div>
        </section>
        <section className="products-stock-list">
          <span className="products-eyebrow">Faqat qoldiq xulosasi</span>
          {product.stockSummary?.map((row) => {
            const available = row.onHand - row.reserved;
            return (
              <article key={row.warehouseId}>
                <strong>{row.warehouse}</strong>
                <span>{row.branch}</span>
                <b>{formatQuantity(available, product.unit?.code)} mavjud</b>
                <small>Kutilayotgan bilan: {formatQuantity(calculateProjectedStock(available, row.incoming), product.unit?.code)}</small>
              </article>
            );
          })}
        </section>
        <footer>
          <button type="button" className="products-mini-button" onClick={onEdit}>Tahrirlash</button>
          <button
            type="button"
            className="products-mini-button is-primary"
            onClick={() => onSubmitApproval(product.id, product.price, product.cost)}
          >
            Narxni tasdiqlash
          </button>
        </footer>
      </div>
    </Modal>
  );
};

export default ProductQuickView;
