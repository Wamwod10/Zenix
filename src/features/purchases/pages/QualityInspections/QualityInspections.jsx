// Enterprise Damaged Goods & Quality Inspection — barcha tekshiruv
// hujjatlari, holat bo'yicha filtr va yig'ma hisobot (Inspection/Damage
// summary, Accepted/Rejected/Replacement/Return miqdorlari).

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ClipboardCheck,
  PackageX,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

import PageHeader from "../../../../components/layout/PageHeader/PageHeader";
import PurchaseKpiCard from "../../components/PurchaseKpiCard/PurchaseKpiCard";
import PurchaseSelectField from "../../components/PurchaseSelectField/PurchaseSelectField";
import QualityInspectionModal from "../../modals/QualityInspectionModal/QualityInspectionModal";
import QualityInspectionsTable from "../../tables/QualityInspectionsTable/QualityInspectionsTable";
import {
  INSPECTION_STATUSES,
  INSPECTION_STATUS_LABELS,
} from "../../constants/qualityInspection";
import { summarizeInspectionItems } from "../../utils/qualityInspection";
import usePurchasesStore from "../../hooks/usePurchasesStore";
import { formatQuantity } from "../../utils/purchaseMoney";

import "./QualityInspections.scss";

const QualityInspections = () => {
  const { inspections, getSupplier, currentUser, actions } = usePurchasesStore();

  const [statusFilter, setStatusFilter] = useState("all");
  const [inspecting, setInspecting] = useState(null);

  const toggleQuickFilter = (value) =>
    setStatusFilter((current) => (current === value ? "all" : value));

  // Reporting: Inspection summary + Damage summary — barcha hujjatlar
  // qatorlaridan yig'ma miqdorlar.
  const summary = useMemo(
    () => summarizeInspectionItems(inspections.flatMap((entry) => entry.items)),
    [inspections],
  );

  const statusCounts = useMemo(
    () =>
      inspections.reduce((map, entry) => {
        map[entry.status] = (map[entry.status] || 0) + 1;
        return map;
      }, {}),
    [inspections],
  );

  const visibleInspections = useMemo(
    () =>
      statusFilter === "all"
        ? inspections
        : inspections.filter((entry) => entry.status === statusFilter),
    [inspections, statusFilter],
  );

  return (
    <div className="quality-inspections-page">
      <PageHeader
        eyebrow="Xaridlar"
        title="Sifat tekshiruvi"
        description="Qabulda buzuq deb belgilangan tovarlarni tekshiring — shikast turi, jiddiylik va yakuniy amalni belgilang."
      />

      <section className="quality-inspections-page__kpi">
        <PurchaseKpiCard
          icon={ClipboardCheck}
          label="Tekshiruv kutilmoqda"
          value={`${statusCounts[INSPECTION_STATUSES.pending] || 0} ta`}
          tone="warning"
          active={statusFilter === INSPECTION_STATUSES.pending}
          onClick={() => toggleQuickFilter(INSPECTION_STATUSES.pending)}
        />
        <PurchaseKpiCard
          icon={ShieldCheck}
          label="O'tdi"
          value={`${statusCounts[INSPECTION_STATUSES.passed] || 0} ta`}
          tone="success"
          active={statusFilter === INSPECTION_STATUSES.passed}
          onClick={() => toggleQuickFilter(INSPECTION_STATUSES.passed)}
        />
        <PurchaseKpiCard
          icon={AlertTriangle}
          label="Qisman o'tdi"
          value={`${statusCounts[INSPECTION_STATUSES.partial] || 0} ta`}
          active={statusFilter === INSPECTION_STATUSES.partial}
          onClick={() => toggleQuickFilter(INSPECTION_STATUSES.partial)}
        />
        <PurchaseKpiCard
          icon={PackageX}
          label="O'tmadi / rad etildi"
          value={`${
            (statusCounts[INSPECTION_STATUSES.failed] || 0) +
            (statusCounts[INSPECTION_STATUSES.rejected] || 0)
          } ta`}
          tone="danger"
          active={statusFilter === INSPECTION_STATUSES.failed}
          onClick={() => toggleQuickFilter(INSPECTION_STATUSES.failed)}
        />
      </section>

      <section className="quality-inspections-page__kpi">
        <PurchaseKpiCard
          icon={ShieldCheck}
          label="Qabul qilingan"
          value={`${formatQuantity(summary.acceptedQty)} dona`}
          tone="success"
        />
        <PurchaseKpiCard
          icon={PackageX}
          label="Rad etilgan"
          value={`${formatQuantity(summary.rejectedQty)} dona`}
          tone="danger"
        />
        <PurchaseKpiCard
          icon={RotateCcw}
          label="Almashtirish / qaytarish"
          value={`${formatQuantity(summary.replacementQty + summary.returnQty)} dona`}
          hint={`Almashtirish: ${formatQuantity(summary.replacementQty)} · Qaytarish: ${formatQuantity(summary.returnQty)}`}
        />
        <PurchaseKpiCard
          icon={AlertTriangle}
          label="Jami buzuq miqdor"
          value={`${formatQuantity(summary.damagedQty)} dona`}
        />
      </section>

      <div className="quality-inspections-page__filters">
        <PurchaseSelectField
          value={statusFilter}
          placeholder="Barcha holatlar"
          options={[
            { value: "all", label: "Barcha holatlar" },
            ...Object.values(INSPECTION_STATUSES).map((status) => ({
              value: status,
              label: INSPECTION_STATUS_LABELS[status],
            })),
          ]}
          onChange={setStatusFilter}
        />
      </div>

      <QualityInspectionsTable
        inspections={visibleInspections}
        getSupplier={getSupplier}
        onInspect={setInspecting}
      />

      <QualityInspectionModal
        open={!!inspecting}
        inspection={inspecting}
        currentUser={currentUser}
        onClose={() => setInspecting(null)}
        onConfirm={(payload) => actions.submitInspection(payload, currentUser)}
      />
    </div>
  );
};

export default QualityInspections;
