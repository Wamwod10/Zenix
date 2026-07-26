import { useState } from "react";

import StatusBadge from "../../components/StatusBadge/StatusBadge";
import WarehouseTable from "../../components/WarehouseTable/WarehouseTable";
import { formatMoney, formatQuantity } from "../../utils/warehouseFormatters";

const tabs = ["Umumiy", "Mahsulotlar", "Harakatlar", "Joylashuvlar", "Tahlil", "Sozlamalar"];

const WarehouseDetail = ({
  warehouse,
  stockRows,
  movements,
  locations,
  onOpenReceipt,
  onOpenIssue,
  onOpenTransfer,
  onOpenCount,
  onExport,
}) => {
  const [tab, setTab] = useState("Overview");
  const rows = stockRows.filter((row) => row.warehouseIds.includes(warehouse.id));
  const warehouseValue = rows.reduce((sum, row) => sum + Number(row.stocks?.[warehouse.id]?.onHand || 0) * Number(row.cost || 0), 0);
  const warehouseQuantity = rows.reduce((sum, row) => sum + Number(row.stocks?.[warehouse.id]?.onHand || 0), 0);
  const warehouseMovements = movements.filter((item) => item.warehouseId === warehouse.id);

  return (
    <div className="warehouse-view">
      <section className="warehouse-panel">
        <div className="warehouse-panel__head">
          <div>
            <span>Ombor tafsiloti</span>
            <h2>{warehouse.name}</h2>
          </div>
          <div className="warehouse-row-actions warehouse-row-actions--text">
            <button type="button" onClick={onOpenReceipt}>Kirim</button>
            <button type="button" onClick={onOpenIssue}>Chiqim</button>
            <button type="button" onClick={onOpenTransfer}>Transfer</button>
            <button type="button" onClick={onOpenCount}>Inventory</button>
            <button type="button" onClick={() => onExport(`${warehouse.name} eksport`)}>Eksport</button>
          </div>
        </div>

        <div className="warehouse-tabs" role="tablist">
          {tabs.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={tab === item}
              className={tab === item ? "is-active" : ""}
              onClick={() => setTab(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {tab === "Umumiy" && (
          <div className="warehouse-card-grid">
            <article className="warehouse-mini-card"><strong>{rows.length}</strong><span>Tovar turi</span></article>
            <article className="warehouse-mini-card"><strong>{formatQuantity(warehouseQuantity)}</strong><span>Jami zaxira</span></article>
            <article className="warehouse-mini-card"><strong>{formatMoney(warehouseValue)}</strong><span>Inventar qiymati</span></article>
            <article className="warehouse-mini-card"><strong>{warehouse.capacity ? Math.round((warehouseQuantity / warehouse.capacity) * 100) : 0}%</strong><span>To'lganligi</span></article>
            <article className="warehouse-mini-card"><strong>{rows.filter((row) => row.status === "low").length}</strong><span>Kam qolgan</span></article>
            <article className="warehouse-mini-card"><strong>{warehouseMovements.length}</strong><span>Bu oy harakat</span></article>
          </div>
        )}

        {tab === "Mahsulotlar" && (
          <WarehouseTable
            rows={rows}
            columns={[
              { key: "name", label: "Tovar", render: (row) => <><strong>{row.name}</strong><small>{row.sku}</small></> },
              { key: "onHand", label: "Qoldiq", render: (row) => formatQuantity(row.stocks?.[warehouse.id]?.onHand, row.unit) },
              { key: "reserved", label: "Band qilingan", render: (row) => formatQuantity(row.stocks?.[warehouse.id]?.reserved, row.unit) },
              { key: "available", label: "Mavjud", render: (row) => formatQuantity(Math.max(0, Number(row.stocks?.[warehouse.id]?.onHand || 0) - Number(row.stocks?.[warehouse.id]?.reserved || 0)), row.unit) },
              { key: "location", label: "Joylashuv", render: (row) => row.stocks?.[warehouse.id]?.location },
              { key: "value", label: "Qiymat", render: (row) => formatMoney(Number(row.stocks?.[warehouse.id]?.onHand || 0) * Number(row.cost || 0)) },
            ]}
            emptyText="Bu omborda hali tovar yo'q"
          />
        )}

        {tab === "Harakatlar" && (
          <WarehouseTable
            rows={warehouseMovements}
            columns={[
              { key: "createdAt", label: "Vaqt" },
              { key: "type", label: "Tur", render: (row) => <StatusBadge status={row.type === "receipt" ? "healthy" : "important"} label={row.type === "receipt" ? "Kirim" : row.type === "issue" ? "Chiqim" : row.type} /> },
              { key: "productName", label: "Mahsulot" },
              { key: "quantity", label: "Qty" },
              { key: "stock", label: "Old / new", render: (row) => `${row.previousStock} → ${row.newStock}` },
              { key: "document", label: "Hujjat" },
            ]}
          />
        )}

        {tab === "Joylashuvlar" && (
          <WarehouseTable
            rows={locations}
            columns={[
              { key: "code", label: "Bin" },
              { key: "zone", label: "Zone" },
              { key: "aisle", label: "Aisle" },
              { key: "rack", label: "Rack" },
              { key: "bin", label: "Shelf" },
              { key: "occupancy", label: "Bandlik", render: (row) => `${row.occupancy}%` },
            ]}
          />
        )}

        {tab === "Tahlil" && (
          <div className="warehouse-analytics-bars">
            {rows.map((row) => (
              <article key={row.id}>
                <div><strong>{row.name}</strong><span>{row.movementSpeed} · {row.abc}{row.xyz}</span></div>
                <meter min="0" max={row.maximum} value={row.stocks?.[warehouse.id]?.onHand || 0} />
              </article>
            ))}
          </div>
        )}

        {tab === "Sozlamalar" && (
          <div className="warehouse-card-grid">
            <article className="warehouse-mini-card"><strong>{warehouse.type}</strong><span>Ombor turi</span></article>
            <article className="warehouse-mini-card"><strong>{warehouse.manager}</strong><span>Mas'ul</span></article>
            <article className="warehouse-mini-card"><strong>{warehouse.address}</strong><span>Manzil</span></article>
            <article className="warehouse-mini-card"><strong>{warehouse.capacity}</strong><span>Sig'im</span></article>
          </div>
        )}
      </section>
    </div>
  );
};

export default WarehouseDetail;
