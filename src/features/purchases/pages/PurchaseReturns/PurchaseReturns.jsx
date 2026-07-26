// PDF 36-38: Xarid qaytarishlari — ro'yxat, yaratish, tasdiqlash, analitika.

import { useMemo, useState } from "react";
import { Plus, Undo2 } from "lucide-react";

import PageHeader from "../../../../components/layout/PageHeader/PageHeader";
import PurchaseAlert from "../../components/PurchaseAlert/PurchaseAlert";
import PurchaseKpiCard from "../../components/PurchaseKpiCard/PurchaseKpiCard";
import PurchaseModal from "../../components/PurchaseModal/PurchaseModal";
import PurchaseSelectField from "../../components/PurchaseSelectField/PurchaseSelectField";
import ConfirmReasonModal from "../../modals/ConfirmReasonModal/ConfirmReasonModal";
import PurchaseReturnModal from "../../modals/PurchaseReturnModal/PurchaseReturnModal";
import PurchaseReturnsTable from "../../tables/PurchaseReturnsTable/PurchaseReturnsTable";
import {
  RETURN_REASONS,
  RETURN_STATUSES,
  RETURN_STATUS_LABELS,
} from "../../constants/paymentTerms";
import { RETURNABLE_STATUSES } from "../../constants/purchaseStatuses";
import { hasPurchasePermission } from "../../constants/purchasePermissions";
import usePurchasesStore from "../../hooks/usePurchasesStore";
import { formatMoney } from "../../utils/purchaseMoney";

import "./PurchaseReturns.scss";

const PurchaseReturns = () => {
  const { orders, returns, getSupplier, currentUser, actions } =
    usePurchasesStore();

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [rejecting, setRejecting] = useState(null);
  // Yagona filtr manbasi (single source of truth): status dropdown VA KPI
  // quick-filter kartalari SHU bitta state'ni o'qiydi/yozadi. Haqiqiy status
  // qiymatlaridan tashqari ikkita maxsus "sentinel" qiymat qo'shildi —
  // "loss" (qaytarish zarariga hissa qo'shadigan — rad etilmagan qaytarishlar)
  // va "top-reason" (eng ko'p uchraydigan sabab bo'yicha) — bular dropdown
  // variantlari bilan hech qachon to'qnashmaydi.
  const [statusFilter, setStatusFilter] = useState("all");

  // KPI kartalari uchun: bosilganda shu qiymatga o'rnatiladi, qayta bosilsa
  // "all"ga qaytadi (faqat bitta karta aktiv bo'la oladi — bitta state).
  const toggleQuickFilter = (value) =>
    setStatusFilter((current) => (current === value ? "all" : value));

  const returnableOrders = orders.filter(
    (order) =>
      RETURNABLE_STATUSES.includes(order.status) &&
      order.items.some(
        (item) => item.receivedQty - (item.returnedQty || 0) > 0,
      ),
  );

  const selectedOrder = returnableOrders.find(
    (order) => order.id === selectedOrderId,
  );

  const canApprove = hasPurchasePermission(currentUser.role, "return.approve");

  // PDF 38: Return Analytics — sabab va zarar
const analytics = useMemo(() => {
  const active = returns.filter(
    (entry) => entry.status !== RETURN_STATUSES.rejected,
  );

  const totalLoss = active.reduce((sum, entry) => sum + entry.total, 0);

  const reasonCounts = active.reduce((map, entry) => {
    map[entry.reason] = (map[entry.reason] || 0) + 1;
    return map;
  }, {});

  const topReason = Object.entries(reasonCounts).sort(
    (a, b) => b[1] - a[1],
  )[0];

  const damagedCount = active.filter(
    (entry) => entry.reason === "damaged"
  ).length;

  return {
    count: active.length,
    totalLoss,
    pendingCount: returns.filter(
      (entry) => entry.status === RETURN_STATUSES.pendingApproval,
    ).length,
    damagedCount,
    topReasonId: topReason ? topReason[0] : null,
    topReason: topReason
      ? RETURN_REASONS.find((reason) => reason.id === topReason[0])?.label
      : "—",
  };
}, [returns]);

  // Yagona filtrlash funksiyasi — status dropdown va KPI quick-filter
  // kartalari BIR XIL shu hisoblashdan foydalanadi (mantiq ikki joyda
  // yozilmaydi). "loss"/"top-reason" — kartalar uchun maxsus qiymatlar,
  // qolgani haqiqiy RETURN_STATUSES qiymatlari (dropdown bilan bir xil).
  const visibleReturns = useMemo(() => {
    if (statusFilter === "all") return returns;

    if (statusFilter === "loss") {
      return returns.filter((entry) => entry.status !== RETURN_STATUSES.rejected);
    }

    if (statusFilter === "top-reason") {
      return analytics.topReasonId
        ? returns.filter((entry) => entry.reason === analytics.topReasonId)
        : returns;
    }

    return returns.filter((entry) => entry.status === statusFilter);
  }, [returns, statusFilter, analytics.topReasonId]);

  return (
    <div className="purchase-returns-page">
      <PageHeader
        eyebrow="Xaridlar"
        title="Xarid qaytarishlari"
        description="Buzuq, noto'g'ri yoki ortiqcha tovarlarni yetkazib beruvchiga qaytaring — tasdiq bilan."
        actions={
          <button
            className="purchase-btn purchase-btn--primary"
            type="button"
            onClick={() => {
              setSelectedOrderId(returnableOrders[0]?.id || "");
              setCreateOpen(true);
            }}
          >
            <Plus size={16} />
            Yangi qaytarish
          </button>
        }
      />

      {/* Quick-filter: har bir karta statusFilter'ni (yagona manba)
          o'rnatadi — pastdagi jadval xuddi shu state orqali filtrlanadi.
          Faqat bitta karta aktiv bo'lishi mumkin (bitta state qiymati). */}
      <section className="purchase-returns-page__kpi">
        <PurchaseKpiCard
          icon={Undo2}
          label="Jami qaytarishlar"
          value={`${analytics.count} ta`}
          active={statusFilter === "all"}
          onClick={() => toggleQuickFilter("all")}
        />
        <PurchaseKpiCard
          icon={Undo2}
          label="Tasdiq kutilmoqda"
          value={`${analytics.pendingCount} ta`}
          tone="warning"
          active={statusFilter === RETURN_STATUSES.pendingApproval}
          onClick={() => toggleQuickFilter(RETURN_STATUSES.pendingApproval)}
        />
        <PurchaseKpiCard
          icon={Undo2}
          label="Qaytarish zarari"
          value={formatMoney(analytics.totalLoss)}
          tone="danger"
          active={statusFilter === "loss"}
          onClick={() => toggleQuickFilter("loss")}
        />
        <PurchaseKpiCard
          icon={Undo2}
          label="Buzuq / nuqsonli"
          value={`${analytics.damagedCount} ta`}
          active={statusFilter === "top-reason"}
          onClick={
            analytics.topReasonId ? () => toggleQuickFilter("top-reason") : undefined
          }
        />
      </section>

      <div className="purchase-returns-page__filters">
        <PurchaseSelectField
          value={statusFilter}
          placeholder="Barcha holatlar"
          options={[
            { value: "all", label: "Barcha holatlar" },
            ...Object.values(RETURN_STATUSES).map((status) => ({
              value: status,
              label: RETURN_STATUS_LABELS[status],
            })),
          ]}
          onChange={setStatusFilter}
        />
      </div>

      <PurchaseReturnsTable
        returns={visibleReturns}
        getSupplier={getSupplier}
        canApprove={canApprove}
        onApprove={(entry) => actions.approveReturn(entry.id, currentUser)}
        onReject={setRejecting}
      />

      {/* Qaytarish yaratish: avval PO tanlanadi — keyingi modal bilan bitta uzluksiz oqim */}
      <PurchaseModal
        open={createOpen && !selectedOrder}
        size="sm"
        eyebrow={
          <>
            <Undo2 size={14} />
            Xarid qaytarish
          </>
        }
        title="Qaysi buyurtmadan qaytariladi?"
        description="Faqat qabul qilingan tovarli buyurtmalar ko'rsatiladi."
        onClose={() => setCreateOpen(false)}
      >
        {returnableOrders.length === 0 ? (
          <PurchaseAlert tone="info">
            Qaytarish uchun qabul qilingan tovarli PO yo'q.
          </PurchaseAlert>
        ) : (
          <PurchaseSelectField
            label="Buyurtma"
            value={selectedOrderId}
            options={returnableOrders.map((order) => ({
              value: order.id,
              label: `${order.number} — ${getSupplier(order.supplierId)?.name}`,
            }))}
            onChange={setSelectedOrderId}
          />
        )}
      </PurchaseModal>

      <PurchaseReturnModal
        open={createOpen && !!selectedOrder}
        order={selectedOrder}
        onClose={() => {
          setCreateOpen(false);
          setSelectedOrderId("");
        }}
        onConfirm={(payload) => {
          actions.createReturn(payload, currentUser);
          setCreateOpen(false);
          setSelectedOrderId("");
        }}
      />

      <ConfirmReasonModal
        open={!!rejecting}
        title={`${rejecting?.number || ""} — rad etish`}
        description="Asossiz qaytarish rad etiladi, sabab audit uchun saqlanadi."
        confirmLabel="Rad etish"
        onClose={() => setRejecting(null)}
        onConfirm={(reason) => {
          actions.rejectReturn(rejecting.id, reason, currentUser);
          setRejecting(null);
        }}
      />
    </div>
  );
};

export default PurchaseReturns;
