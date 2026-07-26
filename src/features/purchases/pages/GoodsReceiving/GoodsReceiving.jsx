// PDF 21-26, 40: Tovar qabul qilish — kutilayotgan PO lar + qabul tarixi.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PackageCheck, PackageSearch } from "lucide-react";

import { Badge } from "../../../../components/ui/Badge/Badge";
import { EmptyState } from "../../../../components/ui/EmptyState/EmptyState";
import PageHeader from "../../../../components/layout/PageHeader/PageHeader";
import PurchaseSelectField from "../../components/PurchaseSelectField/PurchaseSelectField";
import PurchaseStatusBadge from "../../components/PurchaseStatusBadge/PurchaseStatusBadge";
import ReceiveGoodsModal from "../../modals/ReceiveGoodsModal/ReceiveGoodsModal";
import QualityInspectionModal from "../../modals/QualityInspectionModal/QualityInspectionModal";
import GoodsReceiptsTable from "../../tables/GoodsReceiptsTable/GoodsReceiptsTable";
import { RECEIVABLE_STATUSES } from "../../constants/purchaseStatuses";
import usePurchasesStore from "../../hooks/usePurchasesStore";
import { formatPurchaseDate } from "../../utils/purchaseMoney";

import "./GoodsReceiving.scss";

const GoodsReceiving = () => {
  const navigate = useNavigate();
  const {
    orders,
    receipts,
    warehouses,
    inspections,
    getSupplier,
    currentUser,
    actions,
  } = usePurchasesStore();

  const [receivingOrder, setReceivingOrder] = useState(null);
  const [inspecting, setInspecting] = useState(null);
  const [supplierFilter, setSupplierFilter] = useState("all");

  const pendingOrders = orders.filter((order) =>
    RECEIVABLE_STATUSES.includes(order.status),
  );

  const visibleReceipts =
    supplierFilter === "all"
      ? receipts
      : receipts.filter((receipt) => receipt.supplierId === supplierFilter);

  const supplierIds = [...new Set(receipts.map((entry) => entry.supplierId))];

  return (
    <div className="goods-receiving">
      <PageHeader
        eyebrow="Xaridlar"
        title="Tovar qabul qilish"
        description="Kelgan tovarlarni qabul qiling — ombor qoldig'i avtomatik oshadi."
      />

      <section className="goods-receiving__pending">
        <h3>
          Qabul kutilayotgan buyurtmalar
          <Badge tone="neutral" size="sm">
            {pendingOrders.length}
          </Badge>
        </h3>

        {pendingOrders.length === 0 && (
          <EmptyState
            icon={PackageSearch}
            title="Qabul kutilayotgan PO yo'q"
            description="Hozircha yetkazib berilishi kutilayotgan buyurtma mavjud emas."
          />
        )}

        <div className="goods-receiving__cards">
          {pendingOrders.map((order) => {
            const isLate =
              order.expectedDate < new Date().toISOString().slice(0, 10);

            return (
              <article className="goods-receiving__card" key={order.id}>
                <div
                  className="goods-receiving__card-main"
                  onClick={() => navigate(`/purchases/orders/${order.id}`)}
                >
                  <strong>{order.number}</strong>
                  <small>{getSupplier(order.supplierId)?.name}</small>
                  <div className="goods-receiving__card-meta">
                    <PurchaseStatusBadge status={order.status} />
                    <PurchaseStatusBadge
                      status={isLate ? "late" : "due"}
                      tone={isLate ? "danger" : "warning"}
                      label={
                        isLate
                          ? "Kechikdi!"
                          : `Kutilmoqda: ${formatPurchaseDate(order.expectedDate)}`
                      }
                    />
                  </div>
                </div>

                <button
                  className="purchase-btn purchase-btn--success"
                  type="button"
                  onClick={() => setReceivingOrder(order)}
                >
                  <PackageCheck size={15} />
                  Qabul qilish
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="goods-receiving__history">
        <div className="goods-receiving__history-head">
          <h3>Qabul tarixi</h3>

          <PurchaseSelectField
            className="goods-receiving__supplier-filter"
            value={supplierFilter}
            placeholder="Barcha yetkazib beruvchilar"
            options={[
              { value: "all", label: "Barcha yetkazib beruvchilar" },
              ...supplierIds.map((id) => ({
                value: id,
                label: getSupplier(id)?.name || id,
              })),
            ]}
            onChange={setSupplierFilter}
          />
        </div>

        <GoodsReceiptsTable
          receipts={visibleReceipts}
          getSupplier={getSupplier}
          warehouses={warehouses}
          inspections={inspections}
          onInspect={setInspecting}
        />
      </section>

      {/* Bug fix: modal endi natijani KUTADI va faqat muvaffaqiyatli
          saqlangandan keyin o'zi yopiladi (onClose) — shu sabab bu yerda
          natija tekshirilmasdan turib avvaldan yopilmaydi. */}
      <ReceiveGoodsModal
        open={!!receivingOrder}
        order={receivingOrder}
        warehouses={warehouses}
        onClose={() => setReceivingOrder(null)}
        onConfirm={(payload) => actions.receiveOrder(payload, currentUser)}
      />

      <QualityInspectionModal
        open={!!inspecting}
        inspection={inspecting}
        currentUser={currentUser}
        onClose={() => setInspecting(null)}
        onConfirm={(payload) => actions.submitInspection(payload, currentUser)}
      />
    </div>
  );
};

export default GoodsReceiving;
