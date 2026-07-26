// Task 1: Suppliers ro'yxati jadvali — nom, kategoriya, telefon, reyting,
// yetkazish muddati, qarz, holat. Bo'sh holat uchun shared EmptyState.

import { Archive, ArchiveRestore, Eye, PencilLine, Truck, Users } from "lucide-react";

import { EmptyState } from "../../../../components/ui/EmptyState/EmptyState";
import { getSupplierScoreTone } from "../../suppliersApi";
import SupplierCategoryBadges from "../SupplierCategoryBadges/SupplierCategoryBadges";
import SupplierStatusBadge from "../SupplierStatusBadge/SupplierStatusBadge";

import "./SupplierTable.scss";

const SupplierTable = ({
  suppliers = [],
  getDebt,
  getScore,
  formatMoney,
  onView,
  onEdit,
  // Bulk actions (Enterprise): faqat `selectable` true bo'lganda ishlaydi —
  // boshqa (kelajakdagi) ishlatilish joylarida checkbox ustuni ko'rinmaydi,
  // mavjud chaqiruvlar (props berilmasa) o'zgarishsiz ishlaydi.
  selectable = false,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  // Archive / Restore — permission-gated (RBAC): ruxsat bo'lmasa tugma
  // ko'rsatilmaydi.
  canArchive = false,
  canRestore = false,
  onArchive,
  onRestore,
}) => {
  if (!suppliers.length) {
    return (
      <EmptyState
        icon={Users}
        title="Yetkazib beruvchi topilmadi"
        description="Filtrlarni o'zgartiring yoki yangi yetkazib beruvchi qo'shing."
      />
    );
  }

  const allSelected = suppliers.length > 0 && suppliers.every((s) => selectedIds.includes(s.id));

  return (
    <div className="supplier-table">
      <div
        className={
          selectable
            ? "supplier-table__row supplier-table__row--head supplier-table__row--selectable"
            : "supplier-table__row supplier-table__row--head"
        }
        role="row"
      >
        {selectable && (
          <span className="supplier-table__select">
            <input
              type="checkbox"
              aria-label="Barchasini tanlash"
              checked={allSelected}
              onChange={(event) => onToggleSelectAll?.(event.target.checked)}
            />
          </span>
        )}
        <span>Nom / Kategoriya</span>
        <span>Kontakt</span>
        <span>Reyting</span>
        <span>Yetkazish</span>
        <span>Qarz</span>
        <span>Holat</span>
        <span aria-hidden="true" />
      </div>

      {suppliers.map((supplier) => {
        const score = getScore ? getScore(supplier.id) : supplier.score;
        const checked = selectedIds.includes(supplier.id);

        return (
          <div
            className={[
              "supplier-table__row",
              "supplier-table__row--clickable",
              selectable ? "supplier-table__row--selectable" : "",
              supplier.archived ? "supplier-table__row--archived" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            role="row"
            key={supplier.id}
            onClick={() => onView?.(supplier)}
          >
            {selectable && (
              <span
                className="supplier-table__select"
                onClick={(event) => event.stopPropagation()}
              >
                <input
                  type="checkbox"
                  aria-label={`${supplier.name} — tanlash`}
                  checked={checked}
                  onChange={() => onToggleSelect?.(supplier.id)}
                />
              </span>
            )}

            <span className="supplier-table__primary">
              <strong>{supplier.name}</strong>
              <SupplierCategoryBadges categoryIds={supplier.categories} max={2} />
            </span>

            <span className="supplier-table__contact">
              <small>{supplier.phone || "Telefon kiritilmagan"}</small>
              {supplier.contactPerson && <small>{supplier.contactPerson}</small>}
            </span>

            <span
              className={`supplier-table__score supplier-table__score--${getSupplierScoreTone(
                score,
              )}`}
            >
              {score}
              <small>/100</small>
            </span>

            <span className="supplier-table__leadtime">
              <Truck size={13} />
              {supplier.leadTimeDays} kun
            </span>

            <span className="supplier-table__money">
              {formatMoney(getDebt(supplier.id))}
            </span>

            <span>
              <SupplierStatusBadge status={supplier.status} />
              {supplier.archived && (
                <span className="supplier-table__archived-tag">Arxivlangan</span>
              )}
            </span>

            <span
              className="supplier-table__actions"
              onClick={(event) => event.stopPropagation()}
            >
              <button type="button" title="Ko'rish" onClick={() => onView?.(supplier)}>
                <Eye size={15} />
              </button>
              <button type="button" title="Tahrirlash" onClick={() => onEdit?.(supplier)}>
                <PencilLine size={15} />
              </button>
              {supplier.archived
                ? canRestore && (
                    <button
                      type="button"
                      title="Arxivdan tiklash"
                      onClick={() => onRestore?.(supplier)}
                    >
                      <ArchiveRestore size={15} />
                    </button>
                  )
                : canArchive && (
                    <button
                      type="button"
                      title="Arxivlash"
                      onClick={() => onArchive?.(supplier)}
                    >
                      <Archive size={15} />
                    </button>
                  )}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default SupplierTable;
