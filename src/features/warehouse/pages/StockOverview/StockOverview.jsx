import { Download, PackagePlus, Repeat2, SlidersHorizontal } from "lucide-react";

import StatusBadge from "../../components/StatusBadge/StatusBadge";
import WarehouseTable from "../../components/WarehouseTable/WarehouseTable";
import { formatMoney, formatQuantity } from "../../utils/warehouseFormatters";

const unique = (items) => ["all", ...Array.from(new Set(items.filter(Boolean)))];

const StockOverview = ({
  rows,
  warehouses,
  filters,
  onFilter,
  onOpenProduct,
  onOpenReceipt,
  onOpenTransfer,
  onOpenAdjustment,
  onExport,
  onResetFilters,
}) => {
  const categories = unique(rows.map((row) => row.category));
  const brands = unique(rows.map((row) => row.brand));

  return (
    <div className="warehouse-view">
      <section className="warehouse-panel warehouse-panel--sticky">
        <div className="warehouse-panel__head">
          <div>
            <span>Zaxira holati</span>
            <h2>Available, reserved, incoming va projected</h2>
          </div>
          <div className="warehouse-row-actions warehouse-row-actions--text">
            <button type="button" onClick={onOpenReceipt}>
              <PackagePlus size={15} />
              Kirim
            </button>
            <button type="button" onClick={onOpenTransfer}>
              <Repeat2 size={15} />
              Transfer
            </button>
            <button type="button" onClick={onExport}>
              <Download size={15} />
              Eksport
            </button>
          </div>
        </div>

        <div className="warehouse-filters" aria-label="Ombor zaxira filtrlari">
          <label>
            Ombor
            <select value={filters.warehouseId} onChange={(event) => onFilter("warehouseId", event.target.value)}>
              <option value="all">Barcha omborlar</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Kategoriya
            <select value={filters.category} onChange={(event) => onFilter("category", event.target.value)}>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "Barchasi" : category}
                </option>
              ))}
            </select>
          </label>
          <label>
            Brend
            <select value={filters.brand} onChange={(event) => onFilter("brand", event.target.value)}>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand === "all" ? "Barchasi" : brand}
                </option>
              ))}
            </select>
          </label>
          <label>
            Holat
            <select value={filters.status} onChange={(event) => onFilter("status", event.target.value)}>
              <option value="all">Barchasi</option>
              <option value="healthy">Bor</option>
              <option value="low">Kam</option>
              <option value="out">Tugagan</option>
              <option value="reserved">Band qilingan bor</option>
            </select>
          </label>
          <label>
            Harakat
            <select value={filters.speed} onChange={(event) => onFilter("speed", event.target.value)}>
              <option value="all">Barchasi</option>
              <option value="fast">Tez aylanadigan</option>
              <option value="medium">O'rtacha aylanadigan</option>
              <option value="slow">Sekin aylanadigan</option>
              <option value="dead">O'lik zaxira</option>
            </select>
          </label>
          <label>
            Qiymat
            <select value={filters.value} onChange={(event) => onFilter("value", event.target.value)}>
              <option value="all">Barchasi</option>
              <option value="high">Yuqori qiymat</option>
              <option value="medium">O'rtacha qiymat</option>
              <option value="low">Past qiymat</option>
            </select>
          </label>
          <button type="button" className="warehouse-mini-button" onClick={onResetFilters}>
            Filtrlarni tozalash
          </button>
        </div>
      </section>

      <section className="warehouse-panel">
        <WarehouseTable
          rows={rows}
          onRowClick={(row) => onOpenProduct(row.id)}
          columns={[
            {
              key: "product",
              label: "Mahsulot",
              render: (row) => (
                <>
                  <strong>{row.name}</strong>
                  <small>{row.sku} · {row.barcode}</small>
                </>
              ),
            },
            { key: "category", label: "Kategoriya" },
            { key: "onHand", label: "Jami", render: (row) => formatQuantity(row.onHand, row.unit) },
            { key: "reserved", label: "Band qilingan", render: (row) => formatQuantity(row.reserved, row.unit) },
            { key: "available", label: "Mavjud", render: (row) => formatQuantity(row.available, row.unit) },
            { key: "incoming", label: "Kutilayotgan", render: (row) => formatQuantity(row.incoming, row.unit) },
            { key: "projected", label: "Prognoz", render: (row) => formatQuantity(row.projected, row.unit) },
            { key: "minmax", label: "Min / Max", render: (row) => `${row.minimum} / ${row.maximum}` },
            { key: "reorder", label: "ROP", render: (row) => row.reorderPoint },
            { key: "value", label: "Qiymat", render: (row) => formatMoney(row.value) },
            { key: "status", label: "Holat", render: (row) => <StatusBadge status={row.status} /> },
            {
              key: "quick",
              label: "Tezkor amal",
              render: (row) => (
                <button
                  className="warehouse-icon-button"
                  type="button"
                  aria-label={`${row.name} zaxirasini tuzatish`}
                  title="Zaxirani tuzatish"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpenAdjustment(row.id);
                  }}
                >
                  <SlidersHorizontal size={15} />
                </button>
              ),
            },
          ]}
          emptyText="Zaxira topilmadi. Filtrlarni o'zgartiring."
          emptyAction={
            <div className="warehouse-row-actions warehouse-row-actions--text">
              <button type="button" onClick={onResetFilters}>Filtrlarni tozalash</button>
              <button type="button" onClick={onOpenReceipt}>Yangi kirim</button>
            </div>
          }
        />
      </section>
    </div>
  );
};

export default StockOverview;
