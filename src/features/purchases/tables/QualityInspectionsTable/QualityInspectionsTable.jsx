// Enterprise Damaged Goods & Quality Inspection — tekshiruv hujjatlari
// ro'yxati: holat, shikast/amal xulosasi va ochiladigan tafsilot.

import { useState } from "react";
import { ChevronDown, ClipboardCheck } from "lucide-react";

import PurchaseStatusBadge from "../../components/PurchaseStatusBadge/PurchaseStatusBadge";
import {
  INSPECTION_STATUSES,
  INSPECTION_STATUS_LABELS,
  INSPECTION_STATUS_TONES,
  SEVERITY_TONES,
  getDamageTypeLabel,
  getInspectionActionLabel,
  getSeverityLabel,
} from "../../constants/qualityInspection";
import { formatPurchaseDate, formatQuantity } from "../../utils/purchaseMoney";

import "../purchaseTable.scss";
import "./QualityInspectionsTable.scss";

const QualityInspectionsTable = ({
  inspections = [],
  getSupplier,
  onInspect,
}) => {
  const [expandedId, setExpandedId] = useState(null);

  if (!inspections.length) {
    return (
      <div className="purchase-table">
        <p className="purchase-table__empty">Sifat tekshiruvlari hali yo'q.</p>
      </div>
    );
  }

  return (
    <div className="purchase-table quality-inspections-table">
      <div
        className="purchase-table__row purchase-table__row--head quality-inspections-table__row"
        role="row"
      >
        <span>Hujjat / Qabul</span>
        <span>Yetkazib beruvchi</span>
        <span>Buzuq miqdor</span>
        <span>Holat</span>
        <span>Sana</span>
        <span aria-hidden="true" />
      </div>

      {inspections.map((entry) => {
        const expanded = expandedId === entry.id;
        const totalDamaged = entry.items.reduce(
          (sum, item) => sum + (item.damagedQty || 0),
          0,
        );

        return (
          <div className="quality-inspections-table__group" key={entry.id}>
            <div
              className="purchase-table__row purchase-table__row--clickable quality-inspections-table__row"
              role="row"
              onClick={() => setExpandedId(expanded ? null : entry.id)}
            >
              <span className="purchase-table__primary">
                <strong>{entry.number}</strong>
                <small>
                  {entry.receiptNumber} · {entry.orderNumber}
                </small>
              </span>

              <span>{getSupplier?.(entry.supplierId)?.name || "—"}</span>

              <span className="purchase-table__money">
                {formatQuantity(totalDamaged)} dona
              </span>

              <span>
                <PurchaseStatusBadge
                  status={entry.status}
                  label={INSPECTION_STATUS_LABELS[entry.status]}
                  tone={INSPECTION_STATUS_TONES[entry.status]}
                />
              </span>

              <span>{formatPurchaseDate(entry.inspectedAt || entry.createdAt)}</span>

              <span
                className="purchase-table__actions"
                onClick={(event) => event.stopPropagation()}
              >
                {entry.status === INSPECTION_STATUSES.pending && (
                  <button
                    type="button"
                    title="Tekshiruvni boshlash"
                    onClick={() => onInspect?.(entry)}
                  >
                    <ClipboardCheck size={15} />
                  </button>
                )}

                <button
                  type="button"
                  title={expanded ? "Yopish" : "Tafsilot"}
                  className={
                    expanded ? "quality-inspections-table__chevron--open" : ""
                  }
                  onClick={() => setExpandedId(expanded ? null : entry.id)}
                >
                  <ChevronDown size={15} />
                </button>
              </span>
            </div>

            {expanded && (
              <div className="quality-inspections-table__detail">
                {entry.items.map((item) => (
                  <div className="quality-inspections-table__item" key={item.itemId}>
                    <div className="quality-inspections-table__item-head">
                      <strong>{item.name}</strong>
                      <PurchaseStatusBadge
                        status={item.status}
                        label={INSPECTION_STATUS_LABELS[item.status]}
                        tone={INSPECTION_STATUS_TONES[item.status]}
                      />
                    </div>

                    <div className="quality-inspections-table__item-meta">
                      <span>Buzuq: {formatQuantity(item.damagedQty)}</span>
                      <span>Qabul: {formatQuantity(item.acceptedQty)}</span>
                      <span>Rad: {formatQuantity(item.rejectedQty)}</span>
                      {item.damageType && (
                        <span>Shikast: {getDamageTypeLabel(item.damageType)}</span>
                      )}
                      {item.severity && (
                        <span
                          className={`quality-inspections-table__severity quality-inspections-table__severity--${
                            SEVERITY_TONES[item.severity] || "neutral"
                          }`}
                        >
                          Jiddiylik: {getSeverityLabel(item.severity)}
                        </span>
                      )}
                      {item.action && (
                        <span>Amal: {getInspectionActionLabel(item.action)}</span>
                      )}
                    </div>

                    {item.notes && (
                      <p className="quality-inspections-table__note">{item.notes}</p>
                    )}

                    {item.photos?.length > 0 && (
                      <div className="quality-inspections-table__photos">
                        {item.photos.map((photo) => (
                          <a
                            key={photo.id}
                            href={photo.downloadUrl || photo.previewUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {photo.previewUrl ? (
                              <img src={photo.previewUrl} alt={photo.name} />
                            ) : (
                              photo.name
                            )}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default QualityInspectionsTable;
