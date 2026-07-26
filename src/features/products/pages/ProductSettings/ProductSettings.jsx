import { Bell, History, ShieldCheck, SlidersHorizontal } from "lucide-react";

import { formatDate, labelProductStatus } from "../../utils/productCalculations";
import { productRoles } from "../../utils/productPermissions";

const permissionLabels = {
  canViewCost: "Tannarxni ko'rish",
  canEdit: "Tahrirlash",
  canApprovePrice: "Narxni tasdiqlash",
  canBulk: "Ommaviy amal",
  canImport: "Ma'lumot kiritish",
  canSettings: "Sozlamalar",
};

const ProductSettings = ({ state, role, permissions, onMarkNotificationRead }) => (
  <div className="products-view">
    <section className="products-dashboard-grid">
      <section className="products-panel">
        <div className="products-panel__head">
          <div>
            <span><ShieldCheck size={13} /> Ruxsatlar</span>
            <h2>Rolga mos boshqaruv</h2>
          </div>
        </div>
        <div className="products-mini-grid">
          {Object.entries(permissions).map(([key, value]) => (
            <article key={key}>
              <strong>{value ? "Ruxsat bor" : "Cheklangan"}</strong>
              <span>{permissionLabels[key] || key}</span>
            </article>
          ))}
          <article><strong>{productRoles[role]?.label || role}</strong><span>Joriy rol</span></article>
        </div>
      </section>

      <section className="products-panel">
        <div className="products-panel__head">
          <div>
            <span><SlidersHorizontal size={13} /> Sozlamalar</span>
            <h2>Mahsulotlar moduli sozlamalari</h2>
          </div>
        </div>
        <div className="products-mini-grid">
          <article><strong>{state.settings.skuPrefix}</strong><span>Artikul prefiksi</span></article>
          <article><strong>{state.settings.defaultTaxRate}%</strong><span>Standart soliq</span></article>
          <article><strong>{state.settings.autoBarcode ? "Yoqilgan" : "O'chirilgan"}</strong><span>Avtomatik shtrix-kod</span></article>
          <article><strong>{state.settings.approvalRequiredAboveMarginDrop}%</strong><span>Tasdiq chegarasi</span></article>
        </div>
      </section>
    </section>

    <section className="products-dashboard-grid">
      <section className="products-panel">
        <div className="products-panel__head">
          <div>
            <span><Bell size={13} /> Bildirishnomalar</span>
            <h2>Mahsulot bildirishnomalari</h2>
          </div>
        </div>
        <div className="products-list">
          {state.notifications.map((item) => (
            <button type="button" key={item.id} onClick={() => onMarkNotificationRead(item.id)} className={item.read ? "is-read" : ""}>
              <strong>{item.title}</strong>
              <span>{item.message} - {formatDate(item.createdAt)}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="products-panel">
        <div className="products-panel__head">
          <div>
            <span><History size={13} /> Audit jurnali</span>
            <h2>Mahsulotlar harakati tarixi</h2>
          </div>
        </div>
        <div className="products-timeline">
          {state.auditLog.map((item) => (
            <article key={item.id}>
              <History size={15} />
              <div>
                <strong>{item.action}</strong>
                <span>{item.target} - {labelProductStatus(item.oldValue)}dan {labelProductStatus(item.newValue)}ga - {formatDate(item.time)}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  </div>
);

export default ProductSettings;
