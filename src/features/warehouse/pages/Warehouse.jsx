import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Boxes,
  ClipboardCheck,
  FileText,
  Layers3,
  MapPinned,
  PackageSearch,
  Settings,
  Warehouse as WarehouseIcon,
} from "lucide-react";

import { Modal } from "../../../components/ui/Modal";
import WarehouseHeader from "../components/WarehouseHeader/WarehouseHeader";
import WarehouseNavigation from "../components/WarehouseNavigation/WarehouseNavigation";
import StatusBadge from "../components/StatusBadge/StatusBadge";
import WarehouseDashboard from "./WarehouseDashboard/WarehouseDashboard";
import Warehouses from "./Warehouses/Warehouses";
import WarehouseDetail from "./WarehouseDetail/WarehouseDetail";
import StockOverview from "./StockOverview/StockOverview";
import StockMovements from "./StockMovements/StockMovements";
import WarehouseOperations from "./WarehouseOperations/WarehouseOperations";
import Tracking from "./Tracking/Tracking";
import WarehouseAnalytics from "./WarehouseAnalytics/WarehouseAnalytics";
import WarehouseAdmin from "./WarehouseAdmin/WarehouseAdmin";
import useWarehouseController from "../hooks/useWarehouseController";
import {
  canWarehouse,
  needsWarehouseApproval,
} from "../utils/warehousePermissions";
import { formatMoney, formatQuantity } from "../utils/warehouseFormatters";

import "./Warehouse.scss";

const navigationGroups = [
  {
    id: "management",
    title: "Boshqaruv",
    items: [{ id: "dashboard", label: "Boshqaruv paneli", icon: WarehouseIcon }],
  },
  {
    id: "warehouses",
    title: "Omborlar",
    items: [
      { id: "warehouses", label: "Omborlar", icon: Boxes },
      { id: "detail", label: "Ombor tafsiloti", icon: Layers3 },
    ],
  },
  {
    id: "stock",
    title: "Zaxira",
    items: [
      { id: "stock", label: "Zaxira", icon: PackageSearch },
      { id: "movements", label: "Harakatlar", icon: FileText },
      { id: "operations", label: "Operatsiyalar", icon: ClipboardCheck },
    ],
  },
  {
    id: "insight",
    title: "Kuzatuv va tahlil",
    items: [
      { id: "tracking", label: "Kuzatuv", icon: MapPinned },
      { id: "analytics", label: "Tahlil", icon: BarChart3 },
      { id: "admin", label: "Hisobot va sozlama", icon: Settings },
    ],
  },
];

const segmentToView = {
  "": "dashboard",
  warehouses: "warehouses",
  detail: "detail",
  stock: "stock",
  movements: "movements",
  receipts: "operations",
  issues: "operations",
  transfers: "operations",
  inventory: "operations",
  tracking: "tracking",
  analytics: "analytics",
  reports: "admin",
  "import-export": "admin",
  settings: "admin",
  notifications: "admin",
  permissions: "admin",
  audit: "admin",
};

const viewToPath = {
  dashboard: "",
  warehouses: "warehouses",
  detail: "detail",
  stock: "stock",
  movements: "movements",
  operations: "receipts",
  tracking: "tracking",
  analytics: "analytics",
  admin: "reports",
};

const firstProductItem = (products, productId) => {
  const product = products.find((item) => item.id === productId) || products[0];

  return {
    productId: product?.id || "",
    quantity: 1,
    cost: product?.cost || 0,
    batch: "",
    expiry: "",
    serial: "",
    imei: "",
    location: "A-01-01-01",
  };
};

const WarehouseFormModal = ({ open, mode, warehouse, onClose, onSubmit }) => {
  const [form, setForm] = useState(() => ({
    id: warehouse?.id || "",
    name: warehouse?.name || "",
    type: warehouse?.type || "Filial ombori",
    branch: warehouse?.branch || "",
    address: warehouse?.address || "",
    manager: warehouse?.manager || "",
    status: warehouse?.status || "active",
  }));

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <Modal
      open={open}
      title={mode === "edit" ? "Omborni tahrirlash" : "Yangi ombor"}
      description="Kod avtomatik yaratiladi. Sig'im maydoni ishlatilmaydi."
      onClose={onClose}
      footer={
        <>
          <button type="button" className="warehouse-mini-button" onClick={onClose}>
            Bekor qilish
          </button>
          <button
            type="button"
            className="warehouse-mini-button is-primary"
            disabled={!form.name || !form.branch}
            onClick={() => onSubmit(form)}
          >
            Saqlash
          </button>
        </>
      }
    >
      <div className="warehouse-form-grid">
        <label>
          <span>Ombor nomi</span>
          <input value={form.name} onChange={(event) => update("name", event.target.value)} />
        </label>
        <label>
          <span>Filial</span>
          <input value={form.branch} onChange={(event) => update("branch", event.target.value)} />
        </label>
        <label>
          <span>Ombor turi</span>
          <select value={form.type} onChange={(event) => update("type", event.target.value)}>
            <option>Asosiy ombor</option>
            <option>Filial ombori</option>
            <option>Tranzit ombor</option>
            <option>Nuqsonli ombor</option>
            <option>Virtual ombor</option>
          </select>
        </label>
        <label>
          <span>Mas'ul xodim</span>
          <input value={form.manager} onChange={(event) => update("manager", event.target.value)} />
        </label>
        <label className="warehouse-form-grid__wide">
          <span>Manzil (ixtiyoriy)</span>
          <input value={form.address} onChange={(event) => update("address", event.target.value)} />
        </label>
      </div>
    </Modal>
  );
};

const OperationModal = ({
  open,
  type,
  products,
  warehouses,
  selectedProductId,
  selectedWarehouseId,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState(() => ({
    warehouseId: selectedWarehouseId,
    sourceWarehouseId: selectedWarehouseId,
    destinationWarehouseId:
      warehouses.find((item) => item.id !== selectedWarehouseId)?.id || selectedWarehouseId,
    invoice: "",
    receiver: "Retail / branch",
    reason: "Operational flow",
    transport: "Labo 01A777BB",
    note: "",
    countedQuantity: 1,
    newQuantity: 1,
    evidenceName: "evidence-preview.jpg",
    item: firstProductItem(products, selectedProductId),
  }));

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const updateItem = (key, value) =>
    setForm((current) => ({ ...current, item: { ...current.item, [key]: value } }));
  const selectedProduct = products.find((item) => item.id === form.item.productId);

  const submit = () => {
    const baseItem = {
      ...form.item,
      quantity: Number(form.item.quantity || 0),
      cost: Number(form.item.cost || selectedProduct?.cost || 0),
    };

    if (type === "receipt" || type === "issue") {
      onSubmit({ ...form, items: [baseItem] });
      return;
    }

    if (type === "transfer") {
      onSubmit({
        sourceWarehouseId: form.sourceWarehouseId,
        destinationWarehouseId: form.destinationWarehouseId,
        productId: baseItem.productId,
        quantity: baseItem.quantity,
        transport: form.transport,
        reason: form.reason,
      });
      return;
    }

    if (type === "count") {
      onSubmit({
        warehouseId: form.warehouseId,
        productId: baseItem.productId,
        countedQuantity: Number(form.countedQuantity),
        mode: form.reason,
      });
      return;
    }

    if (type === "adjustment") {
      onSubmit({
        warehouseId: form.warehouseId,
        productId: baseItem.productId,
        newQuantity: Number(form.newQuantity),
        reason: form.reason,
        note: form.note,
      });
      return;
    }

    onSubmit({
      warehouseId: form.warehouseId,
      productId: baseItem.productId,
      quantity: baseItem.quantity,
      reason: form.reason,
      evidenceName: form.evidenceName,
    });
  };

  const titles = {
    receipt: "Tovar kirimi",
    issue: "Tovar chiqimi",
    transfer: "Omborlar aro transfer",
    count: "Inventarizatsiya sanog'i",
    adjustment: "Zaxirani tuzatish",
    writeOff: "Hisobdan chiqarish",
  };

  return (
    <Modal
      open={open}
      title={titles[type]}
      description="Skaner rejimi, tekshiruv, audit va muvaffaqiyat holati simulyatsiyasi."
      onClose={onClose}
    >
      <div className="warehouse-form-grid">
        {type === "transfer" ? (
          <>
            <label>
              <span>Yuboruvchi ombor</span>
              <select
                value={form.sourceWarehouseId}
                onChange={(event) => update("sourceWarehouseId", event.target.value)}
              >
                {warehouses.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Qabul qiluvchi ombor</span>
              <select
                value={form.destinationWarehouseId}
                onChange={(event) => update("destinationWarehouseId", event.target.value)}
              >
                {warehouses.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </label>
          </>
        ) : (
          <label>
            <span>Ombor</span>
            <select value={form.warehouseId} onChange={(event) => update("warehouseId", event.target.value)}>
              {warehouses.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
        )}

        <label>
          <span>Mahsulot</span>
          <select value={form.item.productId} onChange={(event) => updateItem("productId", event.target.value)}>
            {products.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </label>

        {["receipt", "issue", "transfer", "writeOff"].includes(type) && (
          <label>
            <span>Miqdor</span>
            <input
              type="number"
              min="1"
              value={form.item.quantity}
              onChange={(event) => updateItem("quantity", Number(event.target.value))}
            />
          </label>
        )}
        {type === "receipt" && (
          <>
            <label><span>Tannarx</span><input type="number" value={form.item.cost} onChange={(event) => updateItem("cost", Number(event.target.value))} /></label>
            <label><span>Partiya</span><input value={form.item.batch} onChange={(event) => updateItem("batch", event.target.value)} /></label>
            <label><span>Muddat</span><input type="date" value={form.item.expiry} onChange={(event) => updateItem("expiry", event.target.value)} /></label>
            <label><span>Serial / IMEI</span><input value={form.item.serial || form.item.imei} onChange={(event) => { updateItem("serial", event.target.value); updateItem("imei", event.target.value); }} /></label>
            <label><span>Javon / joy</span><input value={form.item.location} onChange={(event) => updateItem("location", event.target.value)} /></label>
            <label><span>Invoice</span><input value={form.invoice} onChange={(event) => update("invoice", event.target.value)} /></label>
          </>
        )}
        {type === "issue" && <label><span>Qabul qiluvchi</span><input value={form.receiver} onChange={(event) => update("receiver", event.target.value)} /></label>}
        {type === "transfer" && <label><span>Transport</span><input value={form.transport} onChange={(event) => update("transport", event.target.value)} /></label>}
        {type === "count" && <label><span>Sanalgan miqdor</span><input type="number" value={form.countedQuantity} onChange={(event) => update("countedQuantity", Number(event.target.value))} /></label>}
        {type === "adjustment" && <label><span>Yangi miqdor</span><input type="number" value={form.newQuantity} onChange={(event) => update("newQuantity", Number(event.target.value))} /></label>}
        {type === "writeOff" && <label><span>Dalil fayli</span><input value={form.evidenceName} onChange={(event) => update("evidenceName", event.target.value)} /></label>}
        <label className="warehouse-form-grid__wide">
          <span>Sabab / izoh</span>
          <textarea value={form.reason} onChange={(event) => update("reason", event.target.value)} />
        </label>
      </div>
      <div className="warehouse-modal-summary">
        <StatusBadge
          status={needsWarehouseApproval("employee", type === "writeOff" ? "writeOff" : "adjustment") ? "important" : "healthy"}
          label="Menejer tasdig'iga tayyor"
        />
        <strong>{formatMoney(Number(form.item.quantity || 0) * Number(form.item.cost || selectedProduct?.cost || 0))}</strong>
        <button type="button" className="warehouse-mini-button is-primary" onClick={submit}>
          Saqlash / tasdiqlash
        </button>
      </div>
    </Modal>
  );
};

const ProductDetailModal = ({ product, warehousesById = {}, onClose }) => {
  if (!product) return null;

  const stockEntries = Object.entries(product.stocks || {});

  return (
    <Modal open title={product.name} description={`${product.sku} · ${product.barcode}`} onClose={onClose}>
      <div className="warehouse-card-grid">
        {stockEntries.map(([warehouseId, stock]) => (
          <article className="warehouse-mini-card" key={warehouseId}>
            <strong>{warehousesById[warehouseId]?.name || "Ombor aniqlanmadi"}</strong>
            <span>Jami: {formatQuantity(stock.onHand, product.unit)}</span>
            <span>Band qilingan: {formatQuantity(stock.reserved, product.unit)}</span>
            <span>Kutilayotgan: {formatQuantity(stock.incoming, product.unit)}</span>
            <span>Joylashuv: {stock.location}</span>
          </article>
        ))}
        <article className="warehouse-mini-card">
          <strong>{formatMoney(product.cost)}</strong>
          <span>Tannarx</span>
          <span>ABC/XYZ: {product.abc}{product.xyz}</span>
          <span>Min/Max: {product.minimum} / {product.maximum}</span>
        </article>
      </div>
    </Modal>
  );
};

const Warehouse = () => {
  const controller = useWarehouseController();
  const location = useLocation();
  const navigate = useNavigate();
  const [editingWarehouse, setEditingWarehouse] = useState(null);

  const segment = location.pathname.replace(/^\/warehouse\/?/, "").split("/")[0] || "";
  const activeView = segmentToView[segment] || "dashboard";
  const selectedWarehouse =
    controller.state.warehouses.find((item) => item.id === controller.selectedWarehouseId) ||
    controller.state.warehouses[0];

  const navigateView = (view) => {
    navigate(`/warehouse/${viewToPath[view]}`.replace(/\/$/, ""));
  };

  const openProduct = (productId) => {
    controller.actions.setSelectedProductId(productId);
    controller.actions.setActiveModal("product");
  };

  const modalProductId = controller.selectedProductId || controller.filteredStockRows[0]?.id;
  const modalWarehouseId = controller.selectedWarehouseId || controller.state.warehouses[0]?.id;

  const renderView = () => {
    if (activeView === "warehouses") {
      return (
        <Warehouses
          warehouses={controller.state.warehouses}
          stockRows={controller.stockRows}
          onCreate={() => {
            setEditingWarehouse(null);
            controller.actions.setActiveModal("warehouse");
          }}
          onEdit={(warehouse) => {
            setEditingWarehouse(warehouse);
            controller.actions.setActiveModal("warehouse-edit");
          }}
          onDeactivate={(warehouseId) => window.confirm("Omborni nofaollashtirishni tasdiqlaysizmi?") && controller.actions.deactivateWarehouse(warehouseId)}
          onActivate={(warehouseId) => controller.actions.activateWarehouse(warehouseId)}
          onOpenDetail={(warehouseId) => {
            controller.actions.setSelectedWarehouseId(warehouseId);
            navigateView("detail");
          }}
        />
      );
    }

    if (activeView === "detail" && selectedWarehouse) {
      return (
        <WarehouseDetail
          warehouse={selectedWarehouse}
          stockRows={controller.stockRows}
          movements={controller.state.movements}
          locations={controller.state.locations}
          onOpenReceipt={() => controller.actions.setActiveModal("receipt")}
          onOpenIssue={() => controller.actions.setActiveModal("issue")}
          onOpenTransfer={() => controller.actions.setActiveModal("transfer")}
          onOpenCount={() => controller.actions.setActiveModal("count")}
          onExport={controller.actions.exportReport}
        />
      );
    }

    if (activeView === "stock") {
      return (
        <StockOverview
          rows={controller.filteredStockRows}
          warehouses={controller.state.warehouses}
          filters={controller.filters}
          onFilter={controller.actions.updateFilter}
          onResetFilters={controller.actions.resetFilters}
          onOpenProduct={openProduct}
          onOpenReceipt={() => controller.actions.setActiveModal("receipt")}
          onOpenTransfer={() => controller.actions.setActiveModal("transfer")}
          onOpenAdjustment={(productId) => {
            controller.actions.setSelectedProductId(productId);
            controller.actions.setActiveModal("adjustment");
          }}
          onExport={() => controller.actions.exportReport("Stock overview")}
        />
      );
    }

    if (activeView === "movements") {
      return (
        <StockMovements
          movements={controller.state.movements}
          warehousesById={controller.warehousesById}
        />
      );
    }

    if (activeView === "operations") {
      return (
        <WarehouseOperations
          transfers={controller.state.transfers}
          counts={controller.state.counts}
          writeOffs={controller.state.writeOffs}
          damagedGoods={controller.state.damagedGoods}
          reservedStock={controller.state.reservedStock}
          incomingStock={controller.state.incomingStock}
          productsById={controller.productsById}
          warehousesById={controller.warehousesById}
          onOpenReceipt={() => controller.actions.setActiveModal("receipt")}
          onOpenIssue={() => controller.actions.setActiveModal("issue")}
          onOpenTransfer={() => controller.actions.setActiveModal("transfer")}
          onOpenCount={() => controller.actions.setActiveModal("count")}
          onOpenAdjustment={() => controller.actions.setActiveModal("adjustment")}
          onOpenWriteOff={() => controller.actions.setActiveModal("writeOff")}
          onReceiveTransfer={controller.actions.receiveTransfer}
          onReleaseReservation={controller.actions.releaseReservation}
        />
      );
    }

    if (activeView === "tracking") {
      return <Tracking state={controller.state} productsById={controller.productsById} />;
    }

    if (activeView === "analytics") {
      return (
        <WarehouseAnalytics
          stockRows={controller.stockRows}
          purchaseSuggestions={controller.purchaseSuggestions}
          onAcceptSuggestion={(suggestion) =>
            controller.actions.runAiAction({
              id: suggestion.id,
              type: "reorder",
              title: `${suggestion.productName} accepted`,
              message: "Purchase request simulation",
              payload: suggestion,
            })
          }
          onDismissSuggestion={(suggestion) =>
            controller.actions.runAiAction({
              id: `${suggestion.id}-dismiss`,
              type: "dismiss",
              title: `${suggestion.productName} dismissed`,
              message: "Tavsiya rad etildi",
              payload: suggestion,
            })
          }
          onExport={controller.actions.exportReport}
        />
      );
    }

    if (activeView === "admin") {
      return (
        <WarehouseAdmin
          state={controller.state}
          productsById={controller.productsById}
          warehousesById={controller.warehousesById}
          importPreview={controller.importPreview}
          asyncStatus={controller.asyncStatus}
          activeSection={segment || "reports"}
          onNavigateAdmin={(nextSegment) => navigate(`/warehouse/${nextSegment}`)}
          onExport={controller.actions.exportReport}
          onValidateImport={controller.actions.validateImport}
          onConfirmImport={controller.actions.confirmImport}
          onUpdateSettings={controller.actions.updateSettings}
          onMarkNotificationRead={controller.actions.markNotificationRead}
        />
      );
    }

    return (
      <WarehouseDashboard
        metrics={controller.metrics}
        stockRows={controller.stockRows}
        movements={controller.state.movements}
        aiInsights={controller.aiInsights}
        onNavigate={navigateView}
        onOpenProduct={openProduct}
        onRunAiAction={controller.actions.runAiAction}
      />
    );
  };

  return (
    <main className="zenix-warehouse">
      <WarehouseHeader
        searchRef={controller.refs.searchInputRef}
        search={controller.globalSearch}
        onSearch={controller.actions.setGlobalSearch}
        role={controller.role}
        onRoleChange={controller.actions.updateRole}
        onOpenReceipt={() => controller.actions.setActiveModal("receipt")}
        onOpenImport={() => navigate("/warehouse/import-export")}
        onExport={() => controller.actions.exportReport("Warehouse dashboard")}
        unreadCount={controller.state.notifications.filter((item) => !item.read).length}
      />

      <WarehouseNavigation
        groups={navigationGroups}
        activeView={activeView}
        onNavigate={navigateView}
      />

      {!canWarehouse(controller.role, "value") && (
        <section className="warehouse-permission-note">
          <StatusBadge status="important" label="Ruxsatga bog'liq" />
          Bu rolda tannarx va inventar qiymati hidden yoki disabled bo'lishi mumkin.
        </section>
      )}

      {renderView()}

      {controller.shortcutFeedback && (
        <div className="zenix-warehouse__shortcut-feedback" role="status">
          <kbd>{controller.shortcutFeedback.shortcut}</kbd>
          <span>{controller.shortcutFeedback.label}</span>
        </div>
      )}

      {controller.activeModal === "warehouse" && (
        <WarehouseFormModal
          open
          mode="create"
          onClose={controller.actions.closeModal}
          onSubmit={controller.actions.createOrUpdateWarehouse}
        />
      )}

      {controller.activeModal === "warehouse-edit" && (
        <WarehouseFormModal
          key={editingWarehouse?.id || "warehouse-edit"}
          open
          mode="edit"
          warehouse={editingWarehouse}
          onClose={controller.actions.closeModal}
          onSubmit={controller.actions.createOrUpdateWarehouse}
        />
      )}

      {["receipt", "issue", "transfer", "count", "adjustment", "writeOff"].includes(controller.activeModal) && (
        <OperationModal
          open
          type={controller.activeModal}
          products={controller.state.products}
          warehouses={controller.state.warehouses}
          selectedProductId={modalProductId}
          selectedWarehouseId={modalWarehouseId}
          onClose={controller.actions.closeModal}
          onSubmit={
            {
              receipt: controller.actions.confirmGoodsReceipt,
              issue: controller.actions.confirmGoodsIssue,
              transfer: controller.actions.createTransfer,
              count: controller.actions.completeInventoryCount,
              adjustment: controller.actions.adjustStock,
              writeOff: controller.actions.writeOffStock,
            }[controller.activeModal]
          }
        />
      )}

      {controller.activeModal === "product" && (
        <ProductDetailModal product={controller.selectedProduct} warehousesById={controller.warehousesById} onClose={controller.actions.closeModal} />
      )}
    </main>
  );
};

export default Warehouse;
