import {
  AlertTriangle,
  Boxes,
  Clock3,
  Coins,
  Layers3,
  PackageX,
  ShieldCheck,
  Truck,
} from "lucide-react";

import AIInventoryAssistant from "../../components/AIInventoryAssistant/AIInventoryAssistant";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import WarehouseKpiCard from "../../components/WarehouseKpiCard/WarehouseKpiCard";
import WarehouseTable from "../../components/WarehouseTable/WarehouseTable";
import { formatMoney, formatQuantity } from "../../utils/warehouseFormatters";

const dailyDynamics = [
  { day: "Dush", receipt: 128, issue: 74 },
  { day: "Sesh", receipt: 96, issue: 82 },
  { day: "Chor", receipt: 144, issue: 91 },
  { day: "Pay", receipt: 118, issue: 112 },
  { day: "Jum", receipt: 176, issue: 120 },
  { day: "Shan", receipt: 88, issue: 64 },
  { day: "Yak", receipt: 54, issue: 39 },
];

const movementLabel = {
  receipt: "Kirim",
  issue: "Chiqim",
  transfer: "Transfer",
  adjustment: "Tuzatish",
  "write-off": "Hisobdan chiqarish",
};

const WarehouseDashboard = ({
  metrics,
  stockRows,
  movements,
  aiInsights,
  onNavigate,
  onOpenProduct,
  onRunAiAction,
}) => {
  const lowStock = stockRows.filter((row) => ["low", "out"].includes(row.status)).slice(0, 6);
  const topMoving = [...stockRows]
    .sort((a, b) => b.averageDailySales - a.averageDailySales)
    .slice(0, 5);

  return (
    <div className="warehouse-view">
      <section className="warehouse-kpi-grid">
        <WarehouseKpiCard
          icon={Layers3}
          label="Jami SKU"
          value={metrics.sku}
          hint="Zaxira holati"
          onClick={() => onNavigate("stock")}
        />
        <WarehouseKpiCard
          icon={Boxes}
          label="Jami zaxira"
          value={formatQuantity(metrics.onHand)}
          tone="green"
          onClick={() => onNavigate("stock")}
        />
        <WarehouseKpiCard
          icon={Coins}
          label="Inventar qiymati"
          value={formatMoney(metrics.value)}
          tone="violet"
          onClick={() => onNavigate("analytics")}
        />
        <WarehouseKpiCard
          icon={AlertTriangle}
          label="Kam qolgan"
          value={metrics.low}
          tone="amber"
          onClick={() => onNavigate("stock")}
        />
        <WarehouseKpiCard
          icon={PackageX}
          label="Tugagan"
          value={metrics.out}
          tone="red"
          onClick={() => onNavigate("stock")}
        />
        <WarehouseKpiCard
          icon={ShieldCheck}
          label="Band qilingan"
          value={formatQuantity(metrics.reserved)}
          tone="neutral"
          onClick={() => onNavigate("stock")}
        />
        <WarehouseKpiCard
          icon={Truck}
          label="Kutilayotgan kirim"
          value={formatQuantity(metrics.incoming)}
          tone="teal"
          onClick={() => onNavigate("stock")}
        />
        <WarehouseKpiCard
          icon={Clock3}
          label="Muddati yaqin"
          value={metrics.expiryWarning}
          tone="amber"
          onClick={() => onNavigate("tracking")}
        />
      </section>

      <section className="warehouse-grid warehouse-grid--wide">
        <article className="warehouse-panel warehouse-panel--highlight">
          <div className="warehouse-panel__head">
            <div>
              <span>Kirim / chiqim dinamikasi</span>
              <h2>7 kunlik ombor dinamikasi</h2>
            </div>
            <StatusBadge
              status={metrics.capacity > 80 ? "critical" : "healthy"}
              label={`${metrics.capacity}% sig'im`}
            />
          </div>
          <div className="warehouse-dynamics" aria-label="7 kunlik kirim va chiqim dinamikasi">
            {dailyDynamics.map((item) => {
              const net = item.receipt - item.issue;

              return (
                <article key={item.day}>
                  <strong>{item.day}</strong>
                  <span className="is-receipt">+{item.receipt} kirim</span>
                  <span className="is-issue">-{item.issue} chiqim</span>
                  <b>{net > 0 ? "+" : ""}{net} sof</b>
                  <i style={{ "--net": `${Math.min(100, Math.max(18, net + 28))}%` }} />
                </article>
              );
            })}
          </div>
        </article>

        <article className="warehouse-panel">
          <div className="warehouse-panel__head">
            <div>
              <span>Eng tez aylanayotgan mahsulotlar</span>
              <h2>Tez aylanayotgan SKU</h2>
            </div>
          </div>
          <div className="warehouse-list">
            {topMoving.map((row) => (
              <button type="button" key={row.id} onClick={() => onOpenProduct(row.id)}>
                <strong>{row.name}</strong>
                <span>{row.averageDailySales}/kun / {row.abc}{row.xyz}</span>
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className="warehouse-grid">
        <article className="warehouse-panel">
          <div className="warehouse-panel__head">
            <div>
              <span>Kam qoldiq</span>
              <h2>Tezkor e'tibor talab qiladi</h2>
            </div>
          </div>
          <WarehouseTable
            rows={lowStock}
            getRowKey={(row) => row.id}
            onRowClick={(row) => onOpenProduct(row.id)}
            columns={[
              {
                key: "product",
                label: "Tovar",
                render: (row) => (
                  <>
                    <strong>{row.name}</strong>
                    <small>{row.sku}</small>
                  </>
                ),
              },
              { key: "available", label: "Mavjud", render: (row) => formatQuantity(row.available, row.unit) },
              { key: "minimum", label: "Minimum", render: (row) => formatQuantity(row.minimum, row.unit) },
              { key: "status", label: "Holat", render: (row) => <StatusBadge status={row.status} /> },
            ]}
            emptyText="Kam qoldiq yo'q"
          />
        </article>

        <article className="warehouse-panel">
          <div className="warehouse-panel__head">
            <div>
              <span>So'nggi operatsiyalar</span>
              <h2>O'zgarmas harakat jurnali</h2>
            </div>
          </div>
          <div className="warehouse-timeline">
            {movements.slice(0, 5).map((item) => (
              <article key={item.id}>
                <StatusBadge
                  status={item.type === "receipt" ? "healthy" : item.type === "issue" ? "low" : "reserved"}
                  label={movementLabel[item.type] || item.type}
                />
                <div>
                  <strong>{item.productName}</strong>
                  <span>{item.document} / {item.employee} / {item.quantity > 0 ? "+" : ""}{item.quantity}</span>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>

      <AIInventoryAssistant insights={aiInsights} onRunAction={onRunAiAction} />
    </div>
  );
};

export default WarehouseDashboard;
