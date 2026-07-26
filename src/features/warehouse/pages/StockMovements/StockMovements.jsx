import StatusBadge from "../../components/StatusBadge/StatusBadge";
import WarehouseTable from "../../components/WarehouseTable/WarehouseTable";
import { formatDateTime } from "../../utils/warehouseFormatters";

const movementStatus = {
  receipt: "healthy",
  issue: "low",
  transfer: "reserved",
  adjustment: "important",
  "write-off": "critical",
};

const movementLabel = {
  receipt: "Kirim",
  issue: "Chiqim",
  transfer: "Transfer",
  adjustment: "Tuzatish",
  "write-off": "Hisobdan chiqarish",
};

const StockMovements = ({ movements, warehousesById }) => (
  <div className="warehouse-view">
    <section className="warehouse-panel">
      <div className="warehouse-panel__head">
        <div>
          <span>Ombor harakatlari</span>
          <h2>O'zgartirilmas audit timeline</h2>
        </div>
        <StatusBadge status="healthy" label={`${movements.length} yozuv`} />
      </div>

      <WarehouseTable
        rows={movements}
        columns={[
          { key: "createdAt", label: "Sana / vaqt", render: (row) => formatDateTime(row.createdAt) },
          { key: "type", label: "Tur", render: (row) => <StatusBadge status={movementStatus[row.type]} label={movementLabel[row.type] || row.type} /> },
          {
            key: "product",
            label: "Tovar",
            render: (row) => (
              <>
                <strong>{row.productName}</strong>
                <small>{row.productId}</small>
              </>
            ),
          },
          { key: "quantity", label: "Miqdor", render: (row) => `${row.quantity > 0 ? "+" : ""}${row.quantity}` },
          { key: "warehouse", label: "Ombor", render: (row) => warehousesById[row.warehouseId]?.name || row.warehouseId },
          { key: "stock", label: "Oldingi / yangi", render: (row) => `${row.previousStock} → ${row.newStock}` },
          { key: "document", label: "Hujjat" },
          { key: "employee", label: "Xodim" },
          { key: "reason", label: "Sabab" },
        ]}
        emptyText="Bu davrda harakat yo'q"
      />
    </section>
  </div>
);

export default StockMovements;
