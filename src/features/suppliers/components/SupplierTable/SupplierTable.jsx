import { useEffect, useRef } from "react";
import {
  Archive,
  ArchiveRestore,
  ArrowDown,
  ArrowUp,
  Eye,
  PencilLine,
  Truck,
  Users,
} from "lucide-react";

import { Button } from "../../../../components/ui/Button/Button";
import { EmptyState } from "../../../../components/ui/EmptyState/EmptyState";
import {
  CREDIT_STATUSES,
  getSupplierCreditStatus,
  getSupplierScoreTone,
} from "../../suppliersApi";
import SupplierCategoryBadges from "../SupplierCategoryBadges/SupplierCategoryBadges";
import SupplierStatusBadge from "../SupplierStatusBadge/SupplierStatusBadge";

import "./SupplierTable.scss";

const SORTABLE_COLUMNS = [
  { key: "name", label: "Nom / Kategoriya" },
  { key: "score", label: "Reyting" },
  { key: "leadTimeDays", label: "Yetkazish" },
  { key: "debt", label: "Qarz" },
  { key: "status", label: "Holat" },
];

const SupplierCheckbox = ({ checked, indeterminate, label, onChange }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate;
  }, [indeterminate]);

  return (
    <label className="supplier-table__checkbox">
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        aria-label={label}
        onChange={(event) => onChange?.(event.target.checked)}
      />
      <span aria-hidden="true" />
    </label>
  );
};

const SortButton = ({ column, sortBy, sortDirection, onSort }) => {
  const active = sortBy === column.key;
  const Icon = sortDirection === "desc" ? ArrowDown : ArrowUp;

  return (
    <button
      type="button"
      className={active ? "supplier-table__sort supplier-table__sort--active" : "supplier-table__sort"}
      aria-sort={active ? (sortDirection === "desc" ? "descending" : "ascending") : "none"}
      onClick={() => onSort?.(column.key)}
    >
      {column.label}
      {active && <Icon size={13} />}
    </button>
  );
};

const SupplierTable = ({
  suppliers = [],
  totalFiltered = 0,
  getDebt,
  getScore,
  formatMoney,
  onView,
  onEdit,
  selectable = false,
  selectedIds = [],
  sortBy = "name",
  sortDirection = "asc",
  onSort,
  onToggleSelect,
  onToggleSelectAll,
  canArchive = false,
  canRestore = false,
  onArchive,
  onRestore,
  onClearFilters,
  onCreate,
}) => {
  if (!suppliers.length) {
    return (
      <EmptyState
        icon={Users}
        title="Yetkazib beruvchi topilmadi"
        description="Filtrlarni o'zgartiring yoki yangi yetkazib beruvchi qo'shing."
        action={
          <>
            <Button variant="secondary" onClick={onClearFilters}>
              Filtrlarni tozalash
            </Button>
            {onCreate && (
              <Button variant="primary" onClick={onCreate}>
                Yangi yetkazib beruvchi
              </Button>
            )}
          </>
        }
      />
    );
  }

  const selectedOnPage = suppliers.filter((supplier) => selectedIds.includes(supplier.id)).length;
  const allSelected = suppliers.length > 0 && selectedOnPage === suppliers.length;
  const partlySelected = selectedOnPage > 0 && selectedOnPage < suppliers.length;
  const colSpan = selectable ? 8 : 7;

  const handleRowKeyDown = (event, supplier) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onView?.(supplier);
  };

  return (
    <div className="supplier-table" role="region" aria-label="Yetkazib beruvchilar jadvali">
      <table>
        <thead>
          <tr>
            {selectable && (
              <th scope="col" className="supplier-table__select">
                <SupplierCheckbox
                  checked={allSelected}
                  indeterminate={partlySelected}
                  label="Joriy sahifani tanlash"
                  onChange={onToggleSelectAll}
                />
              </th>
            )}
            <th scope="col">
              <SortButton
                column={SORTABLE_COLUMNS[0]}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={onSort}
              />
            </th>
            <th scope="col">Kontakt</th>
            {SORTABLE_COLUMNS.slice(1).map((column) => (
              <th scope="col" key={column.key}>
                <SortButton
                  column={column}
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  onSort={onSort}
                />
              </th>
            ))}
            <th scope="col" aria-label="Amallar" />
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => {
            const score = getScore ? getScore(supplier.id) : supplier.score;
            const debt = getDebt(supplier.id);
            const creditStatus = getSupplierCreditStatus(supplier.creditLimit, debt);
            const checked = selectedIds.includes(supplier.id);

            return (
              <tr
                key={supplier.id}
                className={supplier.archived ? "supplier-table__row--archived" : ""}
                tabIndex={0}
                onClick={() => onView?.(supplier)}
                onKeyDown={(event) => handleRowKeyDown(event, supplier)}
              >
                {selectable && (
                  <td className="supplier-table__select" onClick={(event) => event.stopPropagation()}>
                    <SupplierCheckbox
                      checked={checked}
                      label={`${supplier.name} - tanlash`}
                      onChange={() => onToggleSelect?.(supplier.id)}
                    />
                  </td>
                )}

                <td data-label="Nom / Kategoriya">
                  <span className="supplier-table__primary">
                    <strong>{supplier.name}</strong>
                    <SupplierCategoryBadges categoryIds={supplier.categories} max={2} />
                    {supplier.archived && (
                      <span className="supplier-table__archived-tag">Arxivlangan</span>
                    )}
                  </span>
                </td>

                <td data-label="Kontakt">
                  <span className="supplier-table__contact">
                    <small>{supplier.phone || "Telefon kiritilmagan"}</small>
                    {supplier.contactPerson && <small>{supplier.contactPerson}</small>}
                    {supplier.blocked && supplier.archivedReason && (
                      <small title={supplier.archivedReason}>Sabab: {supplier.archivedReason}</small>
                    )}
                  </span>
                </td>

                <td data-label="Reyting">
                  <span className={`supplier-table__score supplier-table__score--${getSupplierScoreTone(score)}`}>
                    {score}
                    <small>/100</small>
                  </span>
                </td>

                <td data-label="Yetkazish">
                  <span className="supplier-table__leadtime">
                    <Truck size={13} />
                    {supplier.leadTimeDays} kun
                  </span>
                </td>

                <td data-label="Qarz">
                  <span
                    className={[
                      "supplier-table__money",
                      creditStatus.status === CREDIT_STATUSES.exceeded ? "supplier-table__money--danger" : "",
                      creditStatus.status === CREDIT_STATUSES.warning ? "supplier-table__money--warning" : "",
                      debt === 0 ? "supplier-table__money--zero" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    title={
                      creditStatus.status === CREDIT_STATUSES.none
                        ? "Kredit limiti berilmagan"
                        : `Limitdan foydalanish: ${creditStatus.usedPercent}%`
                    }
                  >
                    {formatMoney(debt)}
                  </span>
                </td>

                <td data-label="Holat">
                  <SupplierStatusBadge status={supplier.status} />
                </td>

                <td className="supplier-table__actions" onClick={(event) => event.stopPropagation()}>
                  <button
                    type="button"
                    title="Ko'rish"
                    aria-label={`${supplier.name} profilini ko'rish`}
                    onClick={() => onView?.(supplier)}
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    type="button"
                    title="Tahrirlash"
                    aria-label={`${supplier.name} ma'lumotlarini tahrirlash`}
                    disabled={supplier.archived}
                    onClick={() => onEdit?.(supplier)}
                  >
                    <PencilLine size={15} />
                  </button>
                  {supplier.archived
                    ? canRestore && (
                        <button
                          type="button"
                          title="Arxivdan tiklash"
                          aria-label={`${supplier.name}ni arxivdan tiklash`}
                          onClick={() => onRestore?.(supplier)}
                        >
                          <ArchiveRestore size={15} />
                        </button>
                      )
                    : canArchive && (
                        <button
                          type="button"
                          title="Arxivlash"
                          aria-label={`${supplier.name}ni arxivlash`}
                          onClick={() => onArchive?.(supplier)}
                        >
                          <Archive size={15} />
                        </button>
                      )}
                </td>
              </tr>
            );
          })}
          <tr className="supplier-table__footer">
            <td colSpan={colSpan}>Joriy sahifada {suppliers.length} ta, filtr bo'yicha {totalFiltered} ta yozuv</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default SupplierTable;
