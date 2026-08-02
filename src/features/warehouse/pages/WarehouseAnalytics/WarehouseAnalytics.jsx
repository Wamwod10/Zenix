import StatusBadge from "../../components/StatusBadge/StatusBadge";
import WarehouseKpiCard from "../../components/WarehouseKpiCard/WarehouseKpiCard";
import WarehouseTable from "../../components/WarehouseTable/WarehouseTable";
import { formatMoney, formatQuantity } from "../../utils/warehouseFormatters";
import { BarChart3, Coins, Gauge, PackageSearch } from "lucide-react";

const WarehouseAnalytics = ({
  stockRows,
  purchaseSuggestions,
  onAcceptSuggestion,
  onDismissSuggestion,
  onExport,
}) => {
  const totalValue = stockRows.reduce((sum, row) => sum + row.value, 0);
  const deadValue = stockRows
    .filter((row) => row.movementSpeed === "dead")
    .reduce((sum, row) => sum + row.value, 0);
  const fastMoving = stockRows.filter((row) => row.movementSpeed === "fast");
  const slowMoving = stockRows.filter((row) => row.movementSpeed === "slow");

  return (
    <div className="warehouse-view">
      <section className="warehouse-kpi-grid warehouse-kpi-grid--compact">
        <WarehouseKpiCard icon={Gauge} label="Aylanma tezligi" value="7.8x" hint="Yillik aylanma" />
        <WarehouseKpiCard icon={Coins} label="Inventar qiymati" value={formatMoney(totalValue)} tone="violet" />
        <WarehouseKpiCard icon={PackageSearch} label="O'lik zaxira qiymati" value={formatMoney(deadValue)} tone="red" />
        <WarehouseKpiCard icon={BarChart3} label="Tez / sekin" value={`${fastMoving.length} / ${slowMoving.length}`} tone="green" />
      </section>

      <section className="warehouse-grid">
        <article className="warehouse-panel">
          <div className="warehouse-panel__head">
            <div>
              <span>ABC / XYZ</span>
              <h2>Inventar segmentatsiyasi</h2>
            </div>
          </div>
          <WarehouseTable
            rows={stockRows}
            columns={[
              { key: "name", label: "Tovar", render: (row) => <><strong>{row.name}</strong><small>{row.sku}</small></> },
              { key: "abc", label: "ABC", render: (row) => <StatusBadge status={row.abc === "A" ? "critical" : row.abc === "B" ? "important" : "normal"} label={row.abc} /> },
              { key: "xyz", label: "XYZ", render: (row) => <StatusBadge status={row.xyz === "X" ? "healthy" : row.xyz === "Y" ? "important" : "reserved"} label={row.xyz} /> },
              { key: "speed", label: "Aylanma", render: (row) => row.movementSpeed },
              { key: "daily", label: "Kunlik sotuv", render: (row) => row.averageDailySales },
              { key: "value", label: "Qiymat", render: (row) => formatMoney(row.value) },
            ]}
          />
        </article>

        <article className="warehouse-panel">
          <div className="warehouse-panel__head">
            <div>
              <span>Omborlar solishtiruvi</span>
              <h2>Zaxira yoshi va qiymat guruhlari</h2>
            </div>
          </div>
          <div className="warehouse-analytics-bars">
            {stockRows.slice(0, 6).map((row) => (
              <article key={row.id}>
                <div>
                  <strong>{row.name}</strong>
                  <span>{formatQuantity(row.onHand, row.unit)} · {formatMoney(row.value)}</span>
                </div>
                <meter min="0" max={row.maximum || 1} value={row.onHand} />
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="warehouse-panel">
        <div className="warehouse-panel__head">
          <div>
            <span>Buyurtma tavsiyalari</span>
            <h2>Reorder point asosidagi buyurtma tavsiyalari</h2>
          </div>
          <button type="button" className="warehouse-button" onClick={() => onExport("Buyurtma tavsiyalari")}>
            Eksport
          </button>
        </div>
        <WarehouseTable
          rows={purchaseSuggestions}
          columns={[
            { key: "productName", label: "Tovar", render: (row) => <strong>{row.productName}</strong> },
            { key: "currentStock", label: "Joriy", render: (row) => formatQuantity(row.currentStock) },
            { key: "reorderPoint", label: "ROP" },
            { key: "suggestedQuantity", label: "Tavsiya", render: (row) => formatQuantity(row.suggestedQuantity) },
            { key: "supplier", label: "Yetkazib beruvchi" },
            { key: "estimatedAmount", label: "Taxminiy summa", render: (row) => formatMoney(row.estimatedAmount) },
            { key: "priority", label: "Muhimlik", render: (row) => <StatusBadge status={row.priority} /> },
            {
              key: "actions",
              label: "Amal",
              render: (row) => (
                <div className="warehouse-row-actions warehouse-row-actions--text">
                  <button type="button" onClick={() => onAcceptSuggestion(row)}>
                    Qabul qilish
                  </button>
                  <button type="button" onClick={() => onDismissSuggestion(row)}>
                    Rad etish
                  </button>
                </div>
              ),
            },
          ]}
          emptyText="Hozir buyurtma tavsiyasi yo'q"
        />
      </section>
    </div>
  );
};

export default WarehouseAnalytics;
