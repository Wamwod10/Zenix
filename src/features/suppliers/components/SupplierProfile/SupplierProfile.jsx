// Step 3: Supplier Detail — TO'LIQ profil, barcha ilg'or sozlash shu yerda
// (kategoriya, mahsulot, kredit, yetkazish muddati, holat, izoh, hujjat,
// statistika, samaradorlik, xarid tarixi, invoyslar). Har o'zgarish darhol
// saqlanadi (onUpdateSupplier -> useSuppliers().actions.updateSupplier —
// yagona manba, Step 5). Purchases moduli ma'lumotlari (o'qish uchun,
// faqat ko'rsatish) va umumiy hisob-kitob funksiyalari qayta ishlatiladi —
// mantiq takrorlanmaydi.
//
// Architecture: bu komponent avval 1100+ qatordan iborat edi (barcha 7
// bo'lim — Umumiy/Mahsulot/Tarix/Invoys/Hujjat/Izoh/AI — bitta faylda, har
// birining o'z lokal state'i bilan). Endi u faqat "qobiq" — sarlavha, tab
// navigatsiyasi va umumiy (barcha bo'limlarga tegishli) hisob-kitoblarni
// ushlab turadi; har bir bo'limning JSX'i VA unga XOS state/amallari
// (masalan mahsulot bog'lash modali, holat o'zgartirish so'rovi, izoh
// formasi) `tabs/` papkasidagi mos komponentga ko'chirilgan — bu state
// endi FAQAT o'sha bo'lim faol bo'lganda mavjud/render bo'ladigan
// komponent ichida, boshqa bo'limlarning qayta render bo'lishiga sabab
// bo'lmaydi (Performance) va har bo'lim mustaqil o'qilishi/tekshirilishi
// mumkin (Maintainability).

import { useMemo, useRef, useState } from "react";
import { Archive, Star } from "lucide-react";

import { Card } from "../../../../components/ui/Card/Card";
import AIWorkspace from "../../../purchases/ai/components/AIWorkspace/AIWorkspace";
import { calculateOrderTotals } from "../../../purchases/utils/purchaseCalculations";
import {
  computeSupplierOperationalMetrics,
  computeSupplierScore,
  getSupplierScoreTone,
} from "../../suppliersApi";
import SupplierStatusBadge from "../SupplierStatusBadge/SupplierStatusBadge";
import { SUPPLIER_PROFILE_TABS } from "./supplierProfileTabs";
import SupplierActivityTab from "./tabs/SupplierActivityTab";
import SupplierDocumentsTab from "./tabs/SupplierDocumentsTab";
import SupplierHistoryTab from "./tabs/SupplierHistoryTab";
import SupplierInvoicesTab from "./tabs/SupplierInvoicesTab";
import SupplierNotesTab from "./tabs/SupplierNotesTab";
import SupplierOverviewTab from "./tabs/SupplierOverviewTab";
import SupplierProductsTab from "./tabs/SupplierProductsTab";
import SupplierStatementTab from "./tabs/SupplierStatementTab";

import "./SupplierProfile.scss";

export { SUPPLIER_PROFILE_TABS };

const TABS = SUPPLIER_PROFILE_TABS;

const SupplierProfile = ({
  supplier,
  debt,
  orders = [],
  invoices = [],
  receipts = [],
  returns = [],
  products = [],
  activeTab: activeTabProp,
  onTabChange,
  onAddNote,
  onUpdateClaimStatus,
  onAddDocument,
  onRemoveDocument,
  onSetDocumentExpiry,
  onUpdateSupplier,
  onChangeStatus,
  onCreateProduct,
  permissions = {},
}) => {
  // Deep Linking (Task 5): agar ota komponent (SupplierDetails) `activeTab`/
  // `onTabChange` bersa, tab holati URL bilan sinxron bo'ladi; aks holda
  // (masalan boshqa kontekstda ishlatilsa) ichki state fallback sifatida
  // ishlaydi — mavjud API buzilmaydi.
  const [internalTab, setInternalTab] = useState(activeTabProp || TABS[0].id);
  const activeTab = activeTabProp ?? internalTab;
  const setActiveTab = (tabId) => {
    if (onTabChange) onTabChange(tabId);
    else setInternalTab(tabId);
  };
  const tabButtonRefs = useRef([]);

  // Task 4: statistika (xarid summasi) — mavjud xarid tarixidan hisoblanadi,
  // yangi holat saqlanmaydi (Task 3). Samaradorlik (o'z vaqtida yetkazish
  // va h.k.) esa endi Supplier Score bilan BIR XIL, YAGONA
  // computeSupplierOperationalMetrics funksiyasidan olinadi — bu yerda
  // alohida useMemo ichida takror yozilmaydi (Consistency: "Duplicate
  // logic bo'lmasin").
  const operationalMetrics = useMemo(
    () =>
      computeSupplierOperationalMetrics(
        { orders, receipts, returns, invoices },
        supplier?.id,
      ),
    [orders, receipts, returns, invoices, supplier?.id],
  );

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalSpend = orders.reduce(
      (sum, order) =>
        sum + calculateOrderTotals(order).total * (order.exchangeRate || 1),
      0,
    );
    const avgOrderValue = totalOrders ? Math.round(totalSpend / totalOrders) : 0;

    return {
      totalOrders,
      totalSpend,
      avgOrderValue,
      deliveredCount: operationalMetrics.deliveredCount,
      onTimePercent: operationalMetrics.onTimePercent,
    };
  }, [orders, operationalMetrics]);

  // Supplier Score (Enterprise): avtomatik hisoblanadigan composite ball —
  // supplier kartochkasida saqlanadigan statik `score` o'rniga har render'da
  // qayta hisoblanadi (audit: "Supplier Score deyarli statik").
  const supplierScore = useMemo(
    () => (supplier ? computeSupplierScore(supplier, operationalMetrics) : 0),
    [supplier, operationalMetrics],
  );

  if (!supplier) return null;

  const handleTabKeyDown = (event, index) => {
    const lastIndex = TABS.length - 1;
    let nextIndex = null;

    if (event.key === "ArrowRight") nextIndex = index === lastIndex ? 0 : index + 1;
    else if (event.key === "ArrowLeft") nextIndex = index === 0 ? lastIndex : index - 1;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = lastIndex;

    if (nextIndex === null) return;

    event.preventDefault();
    setActiveTab(TABS[nextIndex].id);
    tabButtonRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="supplier-profile">
      {supplier.archived && (
        <div className="supplier-profile__archived-banner">
          <Archive size={16} />
          Bu yetkazib beruvchi arxivlangan
          {supplier.archivedReason ? ` — sabab: ${supplier.archivedReason}` : ""}. U yangi xarid
          buyurtmalarida tanlanmaydi. Qayta ishlatish uchun tiklang (Restore).
        </div>
      )}

      <Card className="supplier-profile__head">
        <div className="supplier-profile__head-main">
          <div className="supplier-profile__avatar">
            {supplier.name.slice(0, 2).toUpperCase()}
          </div>

          <div>
            <h2>{supplier.name}</h2>
          </div>
        </div>

        <div className="supplier-profile__head-side">
          <span
            className={`supplier-profile__score supplier-profile__score--${getSupplierScoreTone(
              supplierScore,
            )}`}
          >
            <Star size={14} />
            {supplierScore}/100
          </span>
          <SupplierStatusBadge status={supplier.status} />
        </div>
      </Card>

      <nav
        className="supplier-profile__tabs"
        role="tablist"
        aria-label="Yetkazib beruvchi bo'limlari"
      >
        {TABS.map((tab, index) => {
          const Icon = tab.icon;
          const selected = activeTab === tab.id;

          return (
            <button
              type="button"
              role="tab"
              id={`supplier-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`supplier-tabpanel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              ref={(node) => {
                tabButtonRefs.current[index] = node;
              }}
              key={tab.id}
              className={
                selected
                  ? "supplier-profile__tab supplier-profile__tab--active"
                  : "supplier-profile__tab"
              }
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {activeTab === "overview" && (
        <SupplierOverviewTab
          supplier={supplier}
          debt={debt}
          stats={stats}
          onUpdateSupplier={onUpdateSupplier}
          onChangeStatus={onChangeStatus}
          canEdit={permissions.canEdit}
          canChangeStatus={permissions.canStatusChange}
        />
      )}

      {activeTab === "products" && (
        <SupplierProductsTab
          supplier={supplier}
          products={products}
          orders={orders}
          onUpdateSupplier={onUpdateSupplier}
          onCreateProduct={onCreateProduct}
        />
      )}

      {activeTab === "history" && <SupplierHistoryTab orders={orders} />}

      {activeTab === "invoices" && <SupplierInvoicesTab invoices={invoices} />}

      {activeTab === "statement" && (
        <SupplierStatementTab supplier={supplier} invoices={invoices} />
      )}

      {activeTab === "documents" && (
        <SupplierDocumentsTab
          supplier={supplier}
          onAddDocument={onAddDocument}
          onRemoveDocument={onRemoveDocument}
          onSetDocumentExpiry={onSetDocumentExpiry}
        />
      )}

      {activeTab === "notes" && (
        <SupplierNotesTab
          supplier={supplier}
          onAddNote={onAddNote}
          onUpdateClaimStatus={onUpdateClaimStatus}
          canManageClaims={permissions.canClaimManage}
        />
      )}

      {activeTab === "activity" && <SupplierActivityTab supplier={supplier} />}

      {activeTab === "ai" && (
        <div role="tabpanel" id="supplier-tabpanel-ai" aria-labelledby="supplier-tab-ai">
          <AIWorkspace
            title={`AI tahlil — ${supplier.name}`}
            description="Shu yetkazib beruvchiga tegishli AI tavsiya, xavf va imkoniyatlar."
            scopeFilter={(insight) => insight.relatedSupplierIds?.includes(supplier.id)}
            emptyText="Bu yetkazib beruvchi uchun hozircha AI tavsiyalari yo'q."
          />
        </div>
      )}
    </div>
  );
};

export default SupplierProfile;
