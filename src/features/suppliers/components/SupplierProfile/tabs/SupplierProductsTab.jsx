import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";

import { Button } from "../../../../../components/ui/Button/Button";
import { Modal } from "../../../../../components/ui/Modal/Modal";
import { useNotification } from "../../../../../components/ui/Notification/NotificationContext";
import SupplierConfirmDialog from "../../SupplierConfirmDialog/SupplierConfirmDialog";
import SupplierProductLinkModal from "../../SupplierProductLinkModal/SupplierProductLinkModal";
import SupplierProducts from "../../SupplierProducts/SupplierProducts";

const relationOf = (supplier, productId) =>
  (supplier.supplierProducts || []).find((entry) => entry.productId === productId) ||
  supplier.productOverrides?.[productId] ||
  null;

const SupplierProductsTab = ({ supplier, products, orders, onUpdateSupplier }) => {
  const notify = useNotification();
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [unlinkRequest, setUnlinkRequest] = useState(null);
  const [priceHistoryProductId, setPriceHistoryProductId] = useState(null);

  const updateRelation = (productId, patch) => {
    const currentIds = supplier.productIds || [];
    const existing = relationOf(supplier, productId) || {};

    onUpdateSupplier?.({
      productIds: currentIds.includes(productId) ? currentIds : [...currentIds, productId],
      productOverrides: {
        ...(supplier.productOverrides || {}),
        [productId]: {
          ...existing,
          ...patch,
          productId,
        },
      },
    });
  };

  const closeLinkModal = () => {
    setLinkModalOpen(false);
    setEditProductId(null);
  };

  const handleLinkProduct = ({ productId, ...terms }) => {
    const isLinked = (supplier.productIds || []).includes(productId);

    if (isLinked && editProductId !== productId) {
      setEditProductId(productId);
      notify.info("Bu mahsulot allaqachon bog'langan. Mavjud shartlar ochildi.");
      return;
    }

    updateRelation(productId, terms);
    notify.success(editProductId ? "Supplier shartlari yangilandi." : "Mahsulot bog'landi.");
    closeLinkModal();
  };

  const requestUnlinkProduct = (productId) => setUnlinkRequest(productId);

  const confirmUnlinkProduct = () => {
    if (!unlinkRequest) return;

    const productName =
      products.find((product) => product.id === unlinkRequest)?.name || "Mahsulot";
    const nextIds = (supplier.productIds || []).filter((id) => id !== unlinkRequest);
    const nextOverrides = { ...(supplier.productOverrides || {}) };

    delete nextOverrides[unlinkRequest];
    onUpdateSupplier?.({ productIds: nextIds, productOverrides: nextOverrides });
    notify.success(`"${productName}" bog'lanishi bekor qilindi.`);
    setUnlinkRequest(null);
  };

  const priceHistory = relationOf(supplier, priceHistoryProductId)?.priceHistory || [];

  return (
    <div
      className="supplier-profile__products-tab"
      role="tabpanel"
      id="supplier-tabpanel-products"
      aria-labelledby="supplier-tab-products"
    >
      <div className="supplier-profile__products-head">
        <div>
          <h3>Bog'langan mahsulotlar</h3>
          <p className="supplier-profile__field-hint">
            Product identity katalogdan olinadi; bu yerda faqat supplier shartlari boshqariladi.
          </p>
        </div>

        <div className="supplier-profile__products-actions">
          <Button
            variant="secondary"
            leftIcon={<Search size={15} />}
            onClick={() => setLinkModalOpen(true)}
          >
            Mahsulot bog'lash
          </Button>
          <Link className="ui-button ui-button--primary ui-button--md" to={`/products/new?supplierId=${supplier.id}`}>
            <span className="ui-button__icon"><Plus size={15} /></span>
            <span className="ui-button__label">Product yaratish</span>
          </Link>
        </div>
      </div>

      <SupplierProducts
        supplier={supplier}
        products={products}
        orders={orders}
        onUnlink={requestUnlinkProduct}
        onEdit={(productId) => {
          setEditProductId(productId);
          setLinkModalOpen(true);
        }}
        onPreferred={(productId) => {
          if (supplier.blocked || supplier.archived || supplier.status === "blocked" || supplier.status === "archived") {
            notify.error("Blocked yoki arxivlangan supplier preferred bo'la olmaydi.");
            return;
          }
          updateRelation(productId, { isPreferredSupplier: true, status: "active" });
          notify.success("Preferred supplier belgilandi.");
        }}
        onArchive={(productId) => {
          updateRelation(productId, { status: "archived" });
          notify.success("SupplierProduct arxivlandi.");
        }}
        onRestore={(productId) => {
          updateRelation(productId, { status: "active" });
          notify.success("SupplierProduct qayta faollashtirildi.");
        }}
        onPriceHistory={setPriceHistoryProductId}
      />

      <SupplierProductLinkModal
        open={linkModalOpen}
        products={products}
        linkedProductIds={supplier.productIds || []}
        initialTerms={
          editProductId
            ? { ...(relationOf(supplier, editProductId) || {}), productId: editProductId }
            : null
        }
        onClose={closeLinkModal}
        onLink={handleLinkProduct}
      />

      <Modal
        open={!!priceHistoryProductId}
        title="Narx tarixi"
        description={products.find((product) => product.id === priceHistoryProductId)?.name || ""}
        onClose={() => setPriceHistoryProductId(null)}
      >
        <div className="supplier-profile__history-list">
          {priceHistory.map((entry) => (
            <article key={entry.id || `${entry.changedAt}-${entry.purchasePrice}`}>
              <strong>
                {entry.oldPrice ?? 0}
                {" -> "}
                {entry.newPrice ?? entry.purchasePrice} {entry.currency || "UZS"}
              </strong>
              <span>
                Farq: {(entry.newPrice ?? entry.purchasePrice) - (entry.oldPrice ?? 0)}
                {entry.oldPrice ? ` (${Math.round((((entry.newPrice ?? entry.purchasePrice) - entry.oldPrice) / entry.oldPrice) * 100)}%)` : ""}
              </span>
              <small>
                {entry.changedAt || entry.at || "-"} · {entry.changedBy || "system"} · {entry.reason || entry.source || "manual"}
              </small>
            </article>
          ))}
          {!priceHistory.length && (
            <p className="supplier-profile__field-hint">Narx tarixi hali mavjud emas.</p>
          )}
        </div>
      </Modal>

      <SupplierConfirmDialog
        open={!!unlinkRequest}
        tone="warning"
        title="Bog'lanishni bekor qilish"
        description={`"${
          products.find((product) => product.id === unlinkRequest)?.name || "Mahsulot"
        }" mahsulotining ushbu yetkazib beruvchi bilan bog'lanishi bekor qilinadi.`}
        confirmLabel="Ha, bekor qilish"
        onConfirm={confirmUnlinkProduct}
        onClose={() => setUnlinkRequest(null)}
      />
    </div>
  );
};

export default SupplierProductsTab;
