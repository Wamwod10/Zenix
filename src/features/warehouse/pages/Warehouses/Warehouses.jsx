import { Edit3, Eye, Plus, Power, RotateCcw } from "lucide-react";

import StatusBadge from "../../components/StatusBadge/StatusBadge";
import WarehouseTable from "../../components/WarehouseTable/WarehouseTable";
import { formatMoney } from "../../utils/warehouseFormatters";

const Warehouses = ({
  warehouses,
  stockRows,
  onCreate,
  onEdit,
  onDeactivate,
  onActivate,
  onOpenDetail,
}) => {
  const rows = warehouses.map((warehouse) => {
    const warehouseStock = stockRows.filter((row) => row.warehouseIds.includes(warehouse.id));
    const onHand = warehouseStock.reduce((sum, row) => {
      const stock = row.stocks?.[warehouse.id];
      return sum + Number(stock?.onHand || 0);
    }, 0);
    const value = warehouseStock.reduce((sum, row) => {
      const stock = row.stocks?.[warehouse.id];
      return sum + Number(stock?.onHand || 0) * Number(row.cost || 0);
    }, 0);

    return {
      ...warehouse,
      skuCount: warehouseStock.length,
      value,
      capacityPercent: warehouse.capacity ? (onHand / warehouse.capacity) * 100 : 0,
    };
  });

  return (
    <div className="warehouse-view">
      <section className="warehouse-panel">
        <div className="warehouse-panel__head">
          <div>
            <span>Multi warehouse</span>
            <h2>Omborlar ro'yxati</h2>
          </div>
          <button type="button" className="warehouse-button" onClick={() => onCreate()}>
            <Plus size={16} />
            Yangi ombor
          </button>
        </div>

        <WarehouseTable
          rows={rows}
          columns={[
            {
              key: "name",
              label: "Ombor",
              render: (row) => (
                <>
                  <strong>{row.name}</strong>
                  <small>{row.code} · {row.address}</small>
                </>
              ),
            },
            { key: "type", label: "Turi" },
            { key: "branch", label: "Filial" },
            { key: "manager", label: "Mas'ul" },
            { key: "skuCount", label: "SKU" },
            { key: "value", label: "Qiymat", render: (row) => formatMoney(row.value) },
            { key: "status", label: "Holat", render: (row) => <StatusBadge status={row.status} /> },
            {
              key: "actions",
              label: "Amallar",
              render: (row) => (
                <div className="warehouse-row-actions">
                  <button type="button" aria-label="Tafsilotni ochish" onClick={(event) => { event.stopPropagation(); onOpenDetail(row.id); }}>
                    <Eye size={15} />
                  </button>
                  <button type="button" aria-label="Omborni tahrirlash" onClick={(event) => { event.stopPropagation(); onEdit(row); }}>
                    <Edit3 size={15} />
                  </button>
                  {row.status === "inactive" ? (
                    <button type="button" aria-label="Omborni faollashtirish" onClick={(event) => { event.stopPropagation(); onActivate(row.id); }}>
                      <RotateCcw size={15} />
                    </button>
                  ) : (
                    <button type="button" aria-label="Omborni nofaollashtirish" onClick={(event) => { event.stopPropagation(); onDeactivate(row.id); }}>
                      <Power size={15} />
                    </button>
                  )}
                </div>
              ),
            },
          ]}
          onRowClick={(row) => onOpenDetail(row.id)}
          emptyText="Hali ombor yo'q. Birinchi omborni yarating."
        />
      </section>
    </div>
  );
};

export default Warehouses;
