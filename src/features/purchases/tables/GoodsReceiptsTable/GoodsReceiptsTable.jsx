// PDF 40: Receiving History — barcha goods receipt hujjatlari.

import { ClipboardCheck } from "lucide-react";

import PurchaseStatusBadge from "../../components/PurchaseStatusBadge/PurchaseStatusBadge";
import {
  INSPECTION_STATUSES,
  INSPECTION_STATUS_LABELS,
  INSPECTION_STATUS_TONES,
} from "../../constants/qualityInspection";
import { getLandedCostAllocationMethodLabel } from "../../constants/landedCosts";
import { formatMoney, formatPurchaseDate, formatQuantity } from "../../utils/purchaseMoney";

import "../purchaseTable.scss";
import "./GoodsReceiptsTable.scss";

const GoodsReceiptsTable = ({
  receipts = [],
  getSupplier,
  warehouses = [],
  inspections = [],
  onInspect,
}) => {
  if (!receipts.length) {
    return (
      <div className="purchase-table">
        <p className="purchase-table__empty">Qabul hujjatlari hali yo'q.</p>
      </div>
    );
  }

  const warehouseName = (id) =>
    warehouses.find((warehouse) => warehouse.id === id)?.name || "—";

  return (
    <div className="purchase-table goods-receipts-table">
      <div
        className="purchase-table__row purchase-table__row--head goods-receipts-table__row"
        role="row"
      >
        <span>Hujjat / PO</span>
        <span>Yetkazib beruvchi</span>
        <span>Ombor</span>
        <span>Qabul</span>
        <span>Buzuq / Yetishmagan</span>
        <span>Sana / Kim</span>
      </div>

      {receipts.map((receipt) => {
        const totalReceived = receipt.items.reduce(
          (sum, item) => sum + item.received,
          0,
        );
        const totalDamaged = receipt.items.reduce(
          (sum, item) => sum + (item.damaged || 0),
          0,
        );
        const totalMissing = receipt.items.reduce(
          (sum, item) => sum + (item.missing || 0),
          0,
        );
        // Enterprise Damaged Goods & Quality Inspection: shu qabul uchun
        // avtomatik yaratilgan tekshiruv hujjati (bo'lsa) — holat va
        // "Tekshirish" tugmasi shu yerdan ko'rinadi.
        const inspection = inspections.find(
          (entry) => entry.receiptId === receipt.id,
        );

        return (
          <div
            className="purchase-table__row goods-receipts-table__row"
            role="row"
            key={receipt.id}
          >
            <span className="purchase-table__primary">
              <strong>{receipt.number}</strong>
              <small>
                {receipt.orderNumber} ·{" "}
                {receipt.type === "full" ? "To'liq qabul" : "Qisman qabul"}
                {receipt.landedCostTotal > 0
                  ? ` · landed cost: ${formatMoney(receipt.landedCostTotal)} (${getLandedCostAllocationMethodLabel(receipt.landedCostMethod)})`
                  : ""}
              </small>
            </span>

            <span>{getSupplier?.(receipt.supplierId)?.name || "—"}</span>

            <span>{warehouseName(receipt.warehouseId)}</span>

            <span className="purchase-table__money">
              {formatQuantity(totalReceived)} dona
            </span>

            <span
              className={
                totalDamaged || totalMissing
                  ? "goods-receipts-table__issues"
                  : ""
              }
            >
              {totalDamaged || totalMissing ? (
                <span className="goods-receipts-table__issues-content">
                  {`${totalDamaged} buzuq · ${totalMissing} kam`}

                  {inspection && (
                    <PurchaseStatusBadge
                      status={inspection.status}
                      label={INSPECTION_STATUS_LABELS[inspection.status]}
                      tone={INSPECTION_STATUS_TONES[inspection.status]}
                    />
                  )}

                  {inspection?.status === INSPECTION_STATUSES.pending && (
                    <button
                      type="button"
                      className="goods-receipts-table__inspect"
                      onClick={() => onInspect?.(inspection)}
                    >
                      <ClipboardCheck size={13} />
                      Tekshirish
                    </button>
                  )}
                </span>
              ) : (
                "—"
              )}
            </span>

            <span className="purchase-table__primary">
              <strong>
                {formatPurchaseDate(receipt.receivedAt, { withTime: true })}
              </strong>
              <small>{receipt.receivedBy}</small>
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default GoodsReceiptsTable;
