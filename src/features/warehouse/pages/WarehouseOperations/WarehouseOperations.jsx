import { AlertTriangle, ClipboardCheck, PackageMinus, PackagePlus, Repeat2, Trash2 } from "lucide-react";

import StatusBadge from "../../components/StatusBadge/StatusBadge";
import WarehouseTable from "../../components/WarehouseTable/WarehouseTable";
import { formatDate, formatMoney, formatQuantity } from "../../utils/warehouseFormatters";
import { calculateStockDifference, calculateTransferDifference } from "../../utils/warehouseCalculations";

const WarehouseOperations = ({
  transfers,
  counts,
  writeOffs,
  damagedGoods,
  reservedStock,
  incomingStock,
  productsById,
  warehousesById,
  onOpenReceipt,
  onOpenIssue,
  onOpenTransfer,
  onOpenCount,
  onOpenAdjustment,
  onOpenWriteOff,
  onReceiveTransfer,
  onReleaseReservation,
}) => (
  <div className="warehouse-view">
    <section className="warehouse-actions-grid">
      <button type="button" onClick={onOpenReceipt}>
        <PackagePlus size={18} />
        <strong>Tovar kirimi</strong>
        <span>Invoice, batch, expiry, serial, IMEI, shelf/bin</span>
      </button>
      <button type="button" onClick={onOpenIssue}>
        <PackageMinus size={18} />
        <strong>Tovar chiqimi</strong>
        <span>Available validation va receiver flow</span>
      </button>
      <button type="button" onClick={onOpenTransfer}>
        <Repeat2 size={18} />
        <strong>Omborlar aro transfer</strong>
        <span>Send → in-transit → partial receive</span>
      </button>
      <button type="button" onClick={onOpenCount}>
        <ClipboardCheck size={18} />
        <strong>Inventarizatsiya sanog'i</strong>
        <span>Full, cycle, spot count va farq</span>
      </button>
      <button type="button" onClick={onOpenAdjustment}>
        <AlertTriangle size={18} />
        <strong>Zaxirani tuzatish</strong>
        <span>Menejer tasdig'i va audit</span>
      </button>
      <button type="button" onClick={onOpenWriteOff}>
        <Trash2 size={18} />
        <strong>Hisobdan chiqarish</strong>
        <span>Loss value, evidence preview, confirmation</span>
      </button>
    </section>

    <section className="warehouse-grid">
      <article className="warehouse-panel">
        <div className="warehouse-panel__head">
          <div>
            <span>Transferlar</span>
            <h2>3 bosqichli transferlar</h2>
          </div>
        </div>
        <WarehouseTable
          rows={transfers}
          columns={[
            { key: "id", label: "Transfer" },
            { key: "source", label: "Yuboruvchi", render: (row) => warehousesById[row.sourceWarehouseId]?.name },
            { key: "destination", label: "Qabul qiluvchi", render: (row) => warehousesById[row.destinationWarehouseId]?.name },
            { key: "product", label: "Tovar", render: (row) => productsById[row.productId]?.name },
            { key: "sent", label: "Yuborilgan", render: (row) => formatQuantity(row.sentAmount) },
            { key: "received", label: "Qabul qilingan", render: (row) => formatQuantity(row.receivedAmount) },
            { key: "difference", label: "Farq", render: (row) => calculateTransferDifference(row.receivedAmount, row.sentAmount) },
            { key: "status", label: "Holat", render: (row) => <StatusBadge status={row.status} /> },
            {
              key: "action",
              label: "Amal",
              render: (row) => (
                <button type="button" className="warehouse-mini-button" onClick={() => onReceiveTransfer(row.id, row.sentAmount)}>
                  Qabul
                </button>
              ),
            },
          ]}
          emptyText="Transferlar yo'q"
        />
      </article>

      <article className="warehouse-panel">
        <div className="warehouse-panel__head">
          <div>
            <span>Inventarizatsiya sanog'i</span>
            <h2>Sanoq va farqlar</h2>
          </div>
        </div>
        <WarehouseTable
          rows={counts}
          columns={[
            { key: "id", label: "Count" },
            { key: "warehouse", label: "Ombor", render: (row) => warehousesById[row.warehouseId]?.name },
            { key: "product", label: "Tovar", render: (row) => productsById[row.productId]?.name },
            { key: "mode", label: "Mode" },
            { key: "systemQuantity", label: "Tizimdagi" },
            { key: "countedQuantity", label: "Sanalgan" },
            { key: "difference", label: "Farq", render: (row) => calculateStockDifference(row.countedQuantity, row.systemQuantity) },
            { key: "status", label: "Holat", render: (row) => <StatusBadge status={row.status === "completed" ? "healthy" : "important"} label={row.status === "completed" ? "Yakunlangan" : "Qoralama"} /> },
          ]}
          emptyText="Sanoq yo'q"
        />
      </article>
    </section>

    <section className="warehouse-grid">
      <article className="warehouse-panel">
        <div className="warehouse-panel__head">
          <div>
            <span>Band qilingan zaxira</span>
            <h2>Band qilingan tovarlar</h2>
          </div>
        </div>
        <WarehouseTable
          rows={reservedStock}
          columns={[
            { key: "product", label: "Tovar", render: (row) => productsById[row.productId]?.name },
            { key: "amount", label: "Miqdor", render: (row) => formatQuantity(row.amount) },
            { key: "customer", label: "Order / customer", render: (row) => `${row.order} · ${row.customer}` },
            { key: "expiration", label: "Expiration", render: (row) => formatDate(row.expiration) },
            { key: "status", label: "Holat", render: (row) => <StatusBadge status={row.status === "active" ? "reserved" : "inactive"} label={row.status === "active" ? "Faol" : "Bo'shatilgan"} /> },
            {
              key: "action",
              label: "Amal",
              render: (row) => (
                <button type="button" className="warehouse-mini-button" onClick={() => onReleaseReservation(row.id)}>
                  Bo'shatish
                </button>
              ),
            },
          ]}
          emptyText="Band qilingan zaxira yo'q"
        />
      </article>

      <article className="warehouse-panel">
        <div className="warehouse-panel__head">
          <div>
            <span>Kutilayotgan kirim</span>
            <h2>Kelayotgan tovarlar</h2>
          </div>
        </div>
        <WarehouseTable
          rows={incomingStock}
          columns={[
            { key: "product", label: "Tovar", render: (row) => productsById[row.productId]?.name },
            { key: "amount", label: "Miqdor", render: (row) => formatQuantity(row.amount) },
            { key: "supplier", label: "Yetkazib beruvchi" },
            { key: "purchaseOrder", label: "PO" },
            { key: "expectedDate", label: "Expected", render: (row) => formatDate(row.expectedDate) },
            { key: "status", label: "Holat", render: (row) => <StatusBadge status={row.status} /> },
          ]}
          emptyText="Kutilayotgan kirim yo'q"
        />
      </article>
    </section>

    <section className="warehouse-grid">
      <article className="warehouse-panel">
        <div className="warehouse-panel__head">
          <div>
            <span>Write-off</span>
            <h2>Zarar hisobi</h2>
          </div>
        </div>
        <WarehouseTable
          rows={writeOffs}
          columns={[
            { key: "product", label: "Tovar", render: (row) => productsById[row.productId]?.name },
            { key: "quantity", label: "Miqdor", render: (row) => formatQuantity(row.quantity) },
            { key: "reason", label: "Sabab" },
            { key: "lossValue", label: "Loss", render: (row) => formatMoney(row.lossValue) },
            { key: "evidenceName", label: "Evidence" },
          ]}
          emptyText="Write-off yo'q"
        />
      </article>

      <article className="warehouse-panel">
        <div className="warehouse-panel__head">
          <div>
            <span>Damaged goods</span>
            <h2>Nuqsonli tovar qarorlari</h2>
          </div>
        </div>
        <WarehouseTable
          rows={damagedGoods}
          columns={[
            { key: "product", label: "Tovar", render: (row) => productsById[row.productId]?.name },
            { key: "quantity", label: "Miqdor", render: (row) => formatQuantity(row.quantity) },
            { key: "defectType", label: "Defect" },
            { key: "state", label: "Holat", render: (row) => <StatusBadge status="important" label={row.state} /> },
            { key: "responsible", label: "Responsible" },
            { key: "nextDecision", label: "Next decision" },
          ]}
          emptyText="Nuqsonli tovar yo'q"
        />
      </article>
    </section>
  </div>
);

export default WarehouseOperations;
