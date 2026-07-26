// PDF 4: Yangi buyurtma yaratish sahifasi — 5 qadamli wizard.
// PDF 3: ?draft=<id> bilan mavjud qoralamani davom ettirish.

import { useNavigate, useSearchParams } from "react-router-dom";

import PageHeader from "../../../../components/layout/PageHeader/PageHeader";
import PurchaseOrderWizard from "../../forms/PurchaseOrderWizard/PurchaseOrderWizard";
import { PURCHASE_STATUSES } from "../../constants/purchaseStatuses";
import usePurchasesStore from "../../hooks/usePurchasesStore";

const PurchaseOrderCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    suppliers,
    products,
    warehouses,
    invoices,
    orders,
    budgets,
    getOrderById,
    actions,
  } = usePurchasesStore();

  const draftId = searchParams.get("draft");
  const draftOrder = draftId ? getOrderById(draftId) : null;
  const editingDraft =
    draftOrder && draftOrder.status === PURCHASE_STATUSES.draft
      ? draftOrder
      : null;

  const handleSaveDraft = (payload) => {
    if (editingDraft) {
      actions.updateDraft(editingDraft.id, payload);
      navigate(`/purchases/orders/${editingDraft.id}`);

      return;
    }

    const order = actions.createOrder(payload, { submit: false });

    navigate(order ? `/purchases/orders/${order.id}` : "/purchases/orders");
  };

  const handleSubmit = (payload) => {
    if (editingDraft) {
      actions.updateDraft(editingDraft.id, payload);
      actions.submitOrder(editingDraft.id);
      navigate(`/purchases/orders/${editingDraft.id}`);

      return;
    }

    const order = actions.createOrder(payload, { submit: true });

    navigate(order ? `/purchases/orders/${order.id}` : "/purchases/orders");
  };

  return (
    <div>
      <PageHeader
        eyebrow="Xaridlar"
        title={
          editingDraft
            ? `Qoralamani tahrirlash — ${editingDraft.number}`
            : "Yangi xarid buyurtmasi"
        }
        description="Yetkazib beruvchi tanlang, tovarlarni qo'shing, shartlarni belgilang — qoralama avtomatik saqlanadi."
      />

      <PurchaseOrderWizard
        key={editingDraft?.id || "new"}
        suppliers={suppliers}
        products={products}
        warehouses={warehouses}
        invoices={invoices}
        orders={orders}
        budgets={budgets}
        initialOrder={editingDraft}
        onSaveDraft={handleSaveDraft}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/purchases/orders")}
      />
    </div>
  );
};

export default PurchaseOrderCreate;

