// Enterprise Damaged Goods & Quality Inspection — qabulda buzuq deb
// belgilangan har bir tovar qatorini tekshirish: shikast turi, jiddiylik,
// fotosuratlar, tekshiruvchi izohi va yakuniy amal (Accept/Reject/Partial
// Accept/Return/Replacement/Dispose/Repair/Quarantine).

import { useEffect, useMemo, useState } from "react";
import { ClipboardCheck } from "lucide-react";

import PurchaseAlert from "../../components/PurchaseAlert/PurchaseAlert";
import PurchaseAttachmentManager from "../../components/PurchaseAttachmentManager/PurchaseAttachmentManager";
import PurchaseDateField from "../../components/PurchaseDateField/PurchaseDateField";
import PurchaseModal from "../../components/PurchaseModal/PurchaseModal";
import PurchaseSelectField from "../../components/PurchaseSelectField/PurchaseSelectField";
import PurchaseStatusBadge from "../../components/PurchaseStatusBadge/PurchaseStatusBadge";
import PurchaseTextField from "../../components/PurchaseTextField/PurchaseTextField";
import PurchaseTextarea from "../../components/PurchaseTextarea/PurchaseTextarea";
import {
  DAMAGE_TYPES,
  INSPECTION_ACTIONS,
  INSPECTION_ACTION_OPTIONS,
  INSPECTION_STATUS_LABELS,
  INSPECTION_STATUS_TONES,
  SEVERITY_LEVELS,
} from "../../constants/qualityInspection";
import {
  computeInspectionStatus,
  computeItemInspectionStatus,
  normalizeInspectionItem,
  validateInspectionItem,
} from "../../utils/qualityInspection";
import { formatQuantity } from "../../utils/purchaseMoney";

import "./QualityInspectionModal.scss";

const damageTypeOptions = DAMAGE_TYPES.map((entry) => ({
  value: entry.id,
  label: entry.label,
}));

const severityOptions = SEVERITY_LEVELS.map((entry) => ({
  value: entry.id,
  label: entry.label,
}));

const actionOptions = INSPECTION_ACTION_OPTIONS.map((entry) => ({
  value: entry.id,
  label: entry.label,
}));

const today = () => new Date().toISOString().slice(0, 10);

// Amal tanlanganda miqdorlar avtomatik taklif qilinadi — foydalanuvchi
// faqat "Qisman qabul"da ikkala maydonni qo'lda kiritadi.
const applyActionDefaults = (line, action, damagedQty) => {
  if (action === INSPECTION_ACTIONS.accept) {
    return { ...line, action, acceptedQty: damagedQty, rejectedQty: 0 };
  }

  if (action === INSPECTION_ACTIONS.partialAccept) {
    return { ...line, action };
  }

  return { ...line, action, acceptedQty: 0, rejectedQty: damagedQty };
};

const buildLines = (inspection, inspectorName) =>
  (inspection?.items || []).map((item) => ({
    ...item,
    inspectorName: item.inspectorName || inspectorName,
    inspectionDate: item.inspectionDate || today(),
    severity: item.severity || "medium",
  }));

const QualityInspectionModal = ({ open, inspection, currentUser, onClose, onConfirm }) => {
  const [lines, setLines] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (!open || !inspection) return;

    setLines(buildLines(inspection, currentUser?.name || ""));
    setSubmitting(false);
    setSubmitError(null);
  }, [open, inspection, currentUser]);

  const updateLine = (itemId, field, value) => {
    setLines((current) =>
      current.map((line) => (line.itemId === itemId ? { ...line, [field]: value } : line)),
    );
  };

  const updateQuantity = (itemId, field, rawValue, damagedQty) => {
    const value = Math.max(Math.min(Number(rawValue) || 0, damagedQty), 0);

    updateLine(itemId, field, value);
  };

  const setAction = (itemId, action) => {
    setLines((current) =>
      current.map((line) =>
        line.itemId === itemId ? applyActionDefaults(line, action, line.damagedQty) : line,
      ),
    );
  };

  const resolvedLines = useMemo(
    () =>
      lines.map((line) => {
        const normalized = normalizeInspectionItem(line, line.damagedQty);
        const status = computeItemInspectionStatus(normalized, line.damagedQty);

        return { ...normalized, status };
      }),
    [lines],
  );

  const lineErrors = useMemo(
    () =>
      resolvedLines.reduce((map, line) => {
        map[line.itemId] = validateInspectionItem(line, line.damagedQty);
        return map;
      }, {}),
    [resolvedLines],
  );

  const allErrors = useMemo(
    () => Object.values(lineErrors).flat(),
    [lineErrors],
  );

  const overallStatus = useMemo(
    () => computeInspectionStatus(resolvedLines.map((line) => line.status)),
    [resolvedLines],
  );

  const canConfirm = !!inspection && allErrors.length === 0 && !submitting;

  const handleConfirm = async () => {
    if (!canConfirm) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const result = await Promise.resolve(
        onConfirm?.({
          inspectionId: inspection.id,
          items: lines,
        }),
      );

      if (!result) {
        setSubmitError(
          "Tekshiruvni saqlab bo'lmadi — miqdor va tanlovlarni tekshirib qayta urinib ko'ring.",
        );
        return;
      }

      onClose?.();
    } catch (error) {
      setSubmitError(error?.message || "Kutilmagan xatolik yuz berdi — qayta urinib ko'ring.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PurchaseModal
      open={open}
      size="lg"
      eyebrow={
        <>
          <ClipboardCheck size={14} />
          Sifat tekshiruvi
        </>
      }
      title={inspection ? `${inspection.number} — tekshiruv` : "Tekshiruv"}
      description="Har bir buzuq tovar qatori uchun shikast turi, jiddiylik va yakuniy amalni belgilang."
      onClose={onClose}
      footer={
        <>
          <button
            className="purchase-btn purchase-btn--ghost"
            type="button"
            disabled={submitting}
            onClick={onClose}
          >
            Bekor qilish
          </button>
          <button
            className="purchase-btn purchase-btn--success"
            type="button"
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            <ClipboardCheck size={16} />
            {submitting ? "Saqlanmoqda..." : "Tekshiruvni yakunlash"}
          </button>
        </>
      }
    >
      <div className="quality-inspection__head">
        <span>Umumiy natija (avtomatik hisoblanadi)</span>
        <PurchaseStatusBadge
          status={overallStatus}
          label={INSPECTION_STATUS_LABELS[overallStatus]}
          tone={INSPECTION_STATUS_TONES[overallStatus]}
        />
      </div>

      <div className="quality-inspection__lines">
        {resolvedLines.map((line) => (
          <article className="quality-inspection__card" key={line.itemId}>
            <header className="quality-inspection__card-head">
              <div>
                <strong>{line.name}</strong>
                <small>
                  {line.sku ? `${line.sku} · ` : ""}
                  Buzuq miqdor: {formatQuantity(line.damagedQty)}
                </small>
              </div>
              <PurchaseStatusBadge
                status={line.status}
                label={INSPECTION_STATUS_LABELS[line.status]}
                tone={INSPECTION_STATUS_TONES[line.status]}
              />
            </header>

            <div className="quality-inspection__grid">
              <PurchaseSelectField
                label="Shikast turi"
                value={line.damageType}
                placeholder="Tanlang..."
                options={damageTypeOptions}
                onChange={(value) => updateLine(line.itemId, "damageType", value)}
              />

              <PurchaseSelectField
                label="Jiddiylik"
                value={line.severity}
                options={severityOptions}
                onChange={(value) => updateLine(line.itemId, "severity", value)}
              />

              <PurchaseSelectField
                label="Amal"
                value={line.action}
                placeholder="Tanlang..."
                options={actionOptions}
                onChange={(value) => setAction(line.itemId, value)}
              />
            </div>

            <div className="quality-inspection__grid quality-inspection__grid--qty">
              <label className="quality-inspection__qty">
                <span>Qabul qilinadi</span>
                <input
                  type="number"
                  min="0"
                  max={line.damagedQty}
                  value={line.acceptedQty}
                  onChange={(event) =>
                    updateQuantity(line.itemId, "acceptedQty", event.target.value, line.damagedQty)
                  }
                />
              </label>

              <label className="quality-inspection__qty">
                <span>Rad etiladi</span>
                <input
                  type="number"
                  min="0"
                  max={line.damagedQty}
                  value={line.rejectedQty}
                  onChange={(event) =>
                    updateQuantity(line.itemId, "rejectedQty", event.target.value, line.damagedQty)
                  }
                />
              </label>

              <PurchaseTextField
                label="Tekshiruvchi"
                value={line.inspectorName}
                placeholder="F.I.Sh."
                onChange={(event) =>
                  updateLine(line.itemId, "inspectorName", event.target.value)
                }
              />

              <PurchaseDateField
                label="Tekshiruv sanasi"
                value={line.inspectionDate}
                onChange={(event) =>
                  updateLine(line.itemId, "inspectionDate", event.target.value)
                }
              />
            </div>

            <PurchaseTextarea
              label="Tekshiruvchi izohi"
              rows={2}
              value={line.notes}
              placeholder="Nuqson tavsifi, o'lchamlar, qo'shimcha ma'lumot..."
              onChange={(event) => updateLine(line.itemId, "notes", event.target.value)}
            />

            <PurchaseAttachmentManager
              compact
              title="Fotosuratlar — dalil"
              emptyTitle="Foto biriktirilmagan"
              emptyText="Shikastlangan tovarning fotosuratlarini biriktiring (bir nechta bo'lishi mumkin)."
              buttonLabel="Foto biriktirish"
              attachments={line.photos || []}
              onAdd={(files) =>
                updateLine(line.itemId, "photos", [...(line.photos || []), ...files])
              }
              onRemove={(file) =>
                updateLine(
                  line.itemId,
                  "photos",
                  (line.photos || []).filter((entry) => entry.id !== file.id),
                )
              }
            />

            {lineErrors[line.itemId]?.length > 0 && (
              <PurchaseAlert tone="danger">
                {lineErrors[line.itemId].join(" ")}
              </PurchaseAlert>
            )}
          </article>
        ))}
      </div>

      {submitError && <PurchaseAlert tone="danger">{submitError}</PurchaseAlert>}
    </PurchaseModal>
  );
};

export default QualityInspectionModal;
