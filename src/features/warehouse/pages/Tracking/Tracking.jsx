import { useState } from "react";

import StatusBadge from "../../components/StatusBadge/StatusBadge";
import WarehouseTable from "../../components/WarehouseTable/WarehouseTable";
import { getExpiryStatus } from "../../utils/warehouseCalculations";
import { formatDate, formatMoney, formatQuantity } from "../../utils/warehouseFormatters";

const trackingTabs = [
  "Batch",
  "Lot",
  "Muddat",
  "Serial",
  "IMEI",
  "Shtrix-kod",
  "QR",
  "Javon / joy",
];

const Tracking = ({ state, productsById }) => {
  const [tab, setTab] = useState("Batch");

  const renderTable = () => {
    if (tab === "Batch") {
      return (
        <WarehouseTable
          rows={state.batches}
          columns={[
            { key: "number", label: "Partiya" },
            { key: "product", label: "Tovar", render: (row) => productsById[row.productId]?.name },
            { key: "receivedDate", label: "Kelgan", render: (row) => formatDate(row.receivedDate) },
            { key: "expiryDate", label: "Muddat", render: (row) => formatDate(row.expiryDate) },
            { key: "quantity", label: "Miqdor", render: (row) => formatQuantity(row.quantity) },
            { key: "supplier", label: "Yetkazib beruvchi" },
            { key: "cost", label: "Tannarx", render: (row) => formatMoney(row.cost) },
          ]}
        />
      );
    }

    if (tab === "Lot") {
      return (
        <WarehouseTable
          rows={state.lots}
          columns={[
            { key: "number", label: "Lot" },
            { key: "product", label: "Tovar", render: (row) => productsById[row.productId]?.name },
            { key: "manufacturedAt", label: "Ishlab chiqarilgan", render: (row) => formatDate(row.manufacturedAt) },
            { key: "qualityStatus", label: "Sifat", render: (row) => <StatusBadge status={row.qualityStatus === "checked" ? "healthy" : "important"} label={row.qualityStatus === "checked" ? "Tekshirilgan" : "Kutilmoqda"} /> },
            { key: "quantity", label: "Miqdor", render: (row) => formatQuantity(row.quantity) },
          ]}
        />
      );
    }

    if (tab === "Muddat") {
      return (
        <WarehouseTable
          rows={state.batches}
          columns={[
            { key: "product", label: "Tovar / partiya", render: (row) => <><strong>{productsById[row.productId]?.name}</strong><small>{row.number}</small></> },
            { key: "expiryDate", label: "Muddat", render: (row) => formatDate(row.expiryDate) },
            { key: "days", label: "Holat", render: (row) => <StatusBadge status={getExpiryStatus(row.expiryDate, state.settings.expiryWarningDays) === "valid" ? "healthy" : "important"} label={getExpiryStatus(row.expiryDate, state.settings.expiryWarningDays)} /> },
            { key: "quantity", label: "Miqdor", render: (row) => formatQuantity(row.quantity) },
            { key: "value", label: "Risk qiymati", render: (row) => formatMoney(row.quantity * row.cost) },
          ]}
        />
      );
    }

    if (tab === "Serial") {
      return (
        <WarehouseTable
          rows={state.serials}
          columns={[
            { key: "number", label: "Seriya" },
            { key: "product", label: "Tovar", render: (row) => productsById[row.productId]?.name },
            { key: "status", label: "Holat", render: (row) => <StatusBadge status={row.status === "warehouse" ? "healthy" : "reserved"} label={row.status === "warehouse" ? "Omborda" : row.status} /> },
            { key: "receivedAt", label: "Kirgan", render: (row) => formatDate(row.receivedAt) },
            { key: "customer", label: "Mijoz" },
            { key: "warrantyUntil", label: "Kafolat", render: (row) => formatDate(row.warrantyUntil) },
          ]}
        />
      );
    }

    if (tab === "IMEI") {
      return (
        <WarehouseTable
          rows={state.imeis}
          columns={[
            { key: "imei1", label: "IMEI 1" },
            { key: "imei2", label: "IMEI 2" },
            { key: "product", label: "Model", render: (row) => productsById[row.productId]?.name },
            { key: "status", label: "Holat", render: (row) => <StatusBadge status="healthy" label={row.status === "warehouse" ? "Omborda" : row.status} /> },
            { key: "warrantyUntil", label: "Kafolat", render: (row) => formatDate(row.warrantyUntil) },
          ]}
        />
      );
    }

    if (tab === "Shtrix-kod" || tab === "QR") {
      return (
        <WarehouseTable
          rows={state.products}
          columns={[
            { key: "name", label: "Tovar", render: (row) => <><strong>{row.name}</strong><small>{row.sku}</small></> },
            { key: "barcode", label: tab === "Shtrix-kod" ? "Shtrix-kod" : "QR ma'lumoti", render: (row) => tab === "Shtrix-kod" ? row.barcode : `zenix://product/${row.id}` },
            { key: "format", label: "Format", render: () => tab === "Shtrix-kod" ? state.settings.barcodeFormat : "Dinamik QR" },
            { key: "action", label: "Amal", render: () => <StatusBadge status="planned" label="Yorliq chopga tayyor" /> },
          ]}
        />
      );
    }

    return (
      <WarehouseTable
        rows={state.locations}
        columns={[
          { key: "code", label: "Joylashuv" },
          { key: "zone", label: "Zona" },
          { key: "aisle", label: "Qator" },
          { key: "rack", label: "Javon" },
          { key: "bin", label: "Polka" },
          { key: "occupancy", label: "Bandlik", render: (row) => `${row.occupancy}%` },
          { key: "status", label: "Holat", render: (row) => <StatusBadge status={row.occupancy > 85 ? "important" : "healthy"} label={row.occupancy > 85 ? "To'liq" : "Sog'lom"} /> },
        ]}
      />
    );
  };

  return (
    <div className="warehouse-view">
      <section className="warehouse-panel">
        <div className="warehouse-panel__head">
          <div>
            <span>Kuzatuv</span>
            <h2>Batch, lot, expiry, serial, IMEI, barcode, QR va shelf/bin</h2>
          </div>
        </div>
        <div className="warehouse-tabs" role="tablist">
          {trackingTabs.map((item) => (
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
        {renderTable()}
      </section>
    </div>
  );
};

export default Tracking;
