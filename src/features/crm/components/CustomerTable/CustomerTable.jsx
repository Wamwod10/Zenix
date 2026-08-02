import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronRight,
  Minus,
  MoreHorizontal,
  Pencil,
  ReceiptText,
  ShoppingBag,
  Trash2,
  WalletCards,
} from "lucide-react";

import BulkActionBar from "../BulkActionBar/BulkActionBar";
import CustomerAvatar from "../CustomerAvatar/CustomerAvatar";
import CustomerStatusBadge from "../CustomerStatusBadge/CustomerStatusBadge";
import CustomerTags from "../CustomerTags/CustomerTags";
import {
  getCustomerDetailsPath,
  getCustomerEditPath,
} from "../../config/crmNavigation";
import {
  formatCurrency,
  formatLoyaltyLevel,
  formatPhoneNumber,
  formatRelativeDate,
} from "../../utils/crmFormatters";

import "./CustomerTable.scss";

const SORT_DIRECTIONS = {
  ascending: "ascending",
  descending: "descending",
  none: "none",
};

const escapeCSVValue = (value) => {
  const normalizedValue =
    value === null || value === undefined ? "" : String(value);

  return `"${normalizedValue.replaceAll('"', '""')}"`;
};

const downloadCustomersCSV = (customers) => {
  if (customers.length === 0) {
    return;
  }

  const columns = [
    ["F.I.Sh.", "fullName"],
    ["Telefon", "phone"],
    ["Email", "email"],
    ["Kompaniya", "company"],
    ["Holat", "status"],
    ["Guruh", "group"],
    ["Sodiqlik darajasi", "loyaltyLevel"],
    ["Jami xarid", "totalSpent"],
    ["Buyurtmalar soni", "orderCount"],
    ["O‘rtacha chek", "averageCheck"],
    ["Qarzdorlik", "debt"],
    ["Qarz limiti", "debtLimit"],
    ["Yo‘qotish xavfi", "churnRisk"],
    ["Mas’ul menejer", "assignedManager"],
    ["Manba", "source"],
    ["Yaratilgan sana", "createdAt"],
  ];

  const header = columns.map(([label]) => escapeCSVValue(label)).join(",");

  const rows = customers.map((customer) =>
    columns
      .map(([, field]) => {
        const value = customer[field];

        if (field === "assignedManager" && value && typeof value === "object") {
          return escapeCSVValue(
            value.fullName ?? value.name ?? value.label ?? "",
          );
        }

        return escapeCSVValue(value);
      })
      .join(","),
  );

  const csvContent = `\uFEFF${[header, ...rows].join("\n")}`;
  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8",
  });

  const objectURL = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");

  downloadLink.href = objectURL;
  downloadLink.download = `zenix-tanlangan-mijozlar-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();

  URL.revokeObjectURL(objectURL);
};

const getRiskMeta = (risk = 0) => {
  if (risk >= 70) {
    return {
      label: "Yuqori xavf",
      tone: "high",
    };
  }

  if (risk >= 40) {
    return {
      label: "O‘rta xavf",
      tone: "medium",
    };
  }

  return {
    label: "Past xavf",
    tone: "low",
  };
};

const getSortState = (column, sortBy, sortDirection) => {
  if (column !== sortBy) {
    return SORT_DIRECTIONS.none;
  }

  return sortDirection === "asc"
    ? SORT_DIRECTIONS.ascending
    : SORT_DIRECTIONS.descending;
};

const SortIcon = ({ column, sortBy, sortDirection }) => {
  if (column !== sortBy) {
    return <ArrowUpDown aria-hidden="true" />;
  }

  return sortDirection === "asc" ? (
    <ArrowUp aria-hidden="true" />
  ) : (
    <ArrowDown aria-hidden="true" />
  );
};

const SortButton = ({ column, label, sortBy, sortDirection, onSort }) => (
  <button
    className="crm-customer-table__sort"
    type="button"
    onClick={() => onSort(column)}
  >
    <span>{label}</span>

    <SortIcon column={column} sortBy={sortBy} sortDirection={sortDirection} />
  </button>
);

const SelectionCheckbox = ({ checked, mixed = false, label, onChange }) => (
  <label className="crm-customer-table__checkbox">
    <input
      type="checkbox"
      checked={checked}
      aria-checked={mixed ? "mixed" : checked}
      aria-label={label}
      onChange={onChange}
    />

    <span aria-hidden="true">{mixed ? <Minus /> : <Check />}</span>
  </label>
);

const CustomerIdentity = ({ customer }) => (
  <div className="crm-customer-table__identity">
    <CustomerAvatar
      customer={customer}
      name={customer.fullName}
      src={customer.avatar}
      image={customer.avatar}
      avatar={customer.avatar}
      alt={`${customer.fullName} profil rasmi`}
      size="md"
    />

    <div className="crm-customer-table__identity-content">
      <Link
        className="crm-customer-table__name"
        to={getCustomerDetailsPath(customer.id)}
      >
        {customer.fullName}
      </Link>

      <span className="crm-customer-table__phone">
        {formatPhoneNumber(customer.phone)}
      </span>

      <span className="crm-customer-table__company">
        {customer.company || "Jismoniy mijoz"}
      </span>

      <CustomerTags tags={customer.tags} maxVisible={1} size="sm" />
    </div>
  </div>
);

const CustomerRisk = ({ value = 0 }) => {
  const normalizedValue = Math.min(100, Math.max(0, value));
  const risk = getRiskMeta(normalizedValue);

  return (
    <div
      className={`crm-customer-table__risk crm-customer-table__risk--${risk.tone}`}
      aria-label={`${risk.label}: ${normalizedValue}%`}
    >
      <div className="crm-customer-table__risk-header">
        <span aria-hidden="true" />
        <em>{risk.label}</em>
        <strong>{normalizedValue}%</strong>
      </div>
    </div>
  );
};

const CustomerTableRow = ({
  customer,
  selected,
  onToggleSelection,
  onDeleteCustomer,
}) => {
  const hasDebt = customer.debt > 0;
  const handleDelete = () => {
    onDeleteCustomer?.(customer.id);
  };

  return (
    <tr className={selected ? "crm-customer-table__row--selected" : undefined}>
      <td className="crm-customer-table__selection-cell">
        <SelectionCheckbox
          checked={selected}
          label={`${customer.fullName}ni tanlash`}
          onChange={() => onToggleSelection(customer.id)}
        />
      </td>

      <td>
        <CustomerIdentity customer={customer} />
      </td>

      <td>
        <div className="crm-customer-table__classification">
          <CustomerStatusBadge status={customer.status} />

          <span className="crm-customer-table__group">
            {customer.group || "Guruhsiz"}
          </span>

          <span className="crm-customer-table__loyalty">
            {formatLoyaltyLevel(customer.loyaltyLevel)}
          </span>
        </div>
      </td>

      <td>
        <div className="crm-customer-table__money">
          <strong>{formatCurrency(customer.totalSpent)}</strong>
          <span>{customer.orderCount} ta buyurtma</span>
          <small>{formatCurrency(customer.averageCheck)} o'rtacha chek</small>
        </div>
      </td>

      <td>
        <div
          className={`crm-customer-table__debt ${
            hasDebt ? "crm-customer-table__debt--active" : ""
          }`}
        >
          <strong>
            {hasDebt ? formatCurrency(customer.debt) : "Qarzi yo'q"}
          </strong>

          {hasDebt && customer.debtLimit > 0 ? (
            <span>Limit: {formatCurrency(customer.debtLimit)}</span>
          ) : (
            <span>Hisob holati barqaror</span>
          )}
        </div>
      </td>

      <td>
        <div className="crm-customer-table__date">
          <strong>
            {customer.lastPurchase
              ? formatRelativeDate(customer.lastPurchase)
              : "Xarid qilmagan"}
          </strong>

          <span>Oxirgi xarid</span>
        </div>
      </td>

      <td>
        <CustomerRisk value={customer.churnRisk} />
      </td>

      <td>
        <div className="crm-customer-table__actions">
          <Link
            className="crm-customer-table__action crm-customer-table__action--open"
            to={getCustomerDetailsPath(customer.id)}
            aria-label={`${customer.fullName} profilini ochish`}
            title="Profilni ochish"
          >
            <ChevronRight aria-hidden="true" />
          </Link>

          <details className="crm-customer-table__more">
            <summary aria-label={`${customer.fullName} uchun qo'shimcha amallar`}>
              <MoreHorizontal aria-hidden="true" />
            </summary>

            <div className="crm-customer-table__menu">
              <Link to={getCustomerEditPath(customer.id)}>
                <Pencil aria-hidden="true" />
                <span>Tahrirlash</span>
              </Link>

              <button type="button" className="is-danger" onClick={handleDelete}>
                <Trash2 aria-hidden="true" />
                <span>O'chirish</span>
              </button>
            </div>
          </details>
        </div>
      </td>
    </tr>
  );
};
const CustomerCard = ({
  customer,
  selected,
  onToggleSelection,
  onDeleteCustomer,
}) => {
  const hasDebt = customer.debt > 0;
  const handleDelete = () => {
    onDeleteCustomer?.(customer.id);
  };

  return (
    <article
      className={`crm-customer-table__card ${
        selected ? "crm-customer-table__card--selected" : ""
      }`}
    >
      <div className="crm-customer-table__card-selection">
        <SelectionCheckbox
          checked={selected}
          label={`${customer.fullName}ni tanlash`}
          onChange={() => onToggleSelection(customer.id)}
        />
      </div>

      <div className="crm-customer-table__card-header">
        <CustomerIdentity customer={customer} />

        <Link
          className="crm-customer-table__card-open"
          to={getCustomerDetailsPath(customer.id)}
          aria-label={`${customer.fullName} profilini ochish`}
        >
          <ChevronRight aria-hidden="true" />
        </Link>
      </div>

      <div className="crm-customer-table__card-status">
        <CustomerStatusBadge status={customer.status} />

        <span className="crm-customer-table__group">
          {customer.group || "Guruhsiz"}
        </span>

        <span className="crm-customer-table__loyalty">
          {formatLoyaltyLevel(customer.loyaltyLevel)}
        </span>
      </div>

      <div className="crm-customer-table__card-metrics">
        <div className="crm-customer-table__card-metric">
          <span className="crm-customer-table__card-metric-icon">
            <ShoppingBag aria-hidden="true" />
          </span>

          <div>
            <span>Jami xarid</span>
            <strong>{formatCurrency(customer.totalSpent)}</strong>
            <small>{customer.orderCount} ta buyurtma</small>
          </div>
        </div>

        <div className="crm-customer-table__card-metric">
          <span className="crm-customer-table__card-metric-icon">
            <ReceiptText aria-hidden="true" />
          </span>

          <div>
            <span>O'rtacha chek</span>
            <strong>{formatCurrency(customer.averageCheck)}</strong>
            <small>
              {customer.lastPurchase
                ? formatRelativeDate(customer.lastPurchase)
                : "Xarid qilmagan"}
            </small>
          </div>
        </div>

        <div
          className={`crm-customer-table__card-metric ${
            hasDebt ? "crm-customer-table__card-metric--danger" : ""
          }`}
        >
          <span className="crm-customer-table__card-metric-icon">
            <WalletCards aria-hidden="true" />
          </span>

          <div>
            <span>Qarzdorlik</span>
            <strong>
              {hasDebt ? formatCurrency(customer.debt) : "Qarzi yo'q"}
            </strong>

            <small>
              {hasDebt && customer.debtLimit > 0
                ? `Limit: ${formatCurrency(customer.debtLimit)}`
                : "Hisob holati yaxshi"}
            </small>
          </div>
        </div>
      </div>

      <div className="crm-customer-table__card-footer">
        <CustomerRisk value={customer.churnRisk} />

        <div className="crm-customer-table__card-actions">
          <Link
            className="crm-customer-table__card-edit"
            to={getCustomerEditPath(customer.id)}
          >
            <Pencil aria-hidden="true" />
            <span>Tahrirlash</span>
          </Link>

          <Link
            className="crm-customer-table__card-details"
            to={getCustomerDetailsPath(customer.id)}
          >
            <span>Profilni ochish</span>
            <ChevronRight aria-hidden="true" />
          </Link>

          <button type="button" className="crm-customer-table__card-delete" onClick={handleDelete}>
            <Trash2 aria-hidden="true" />
            <span>O'chirish</span>
          </button>
        </div>
      </div>
    </article>
  );
};
const CustomerTable = ({
  customers = [],
  view = "table",
  sortBy = "lastPurchase",
  sortDirection = "desc",
  selectedCustomerIds,
  groupOptions = [],
  statusOptions = [],
  bulkActionLoading = false,
  onSort,
  onSelectionChange,
  onBulkGroupChange,
  onBulkStatusChange,
  onBulkExport,
  onDeleteCustomer,
}) => {
  const [internalSelection, setInternalSelection] = useState([]);

  const controlledSelection = Array.isArray(selectedCustomerIds);

  const activeSelection = controlledSelection
    ? selectedCustomerIds
    : internalSelection;

  const selectedIdSet = useMemo(
    () => new Set(activeSelection),
    [activeSelection],
  );

  const visibleCustomerIds = useMemo(
    () => customers.map((customer) => customer.id),
    [customers],
  );

  const selectedVisibleCustomers = useMemo(
    () => customers.filter((customer) => selectedIdSet.has(customer.id)),
    [customers, selectedIdSet],
  );

  const allVisibleSelected =
    visibleCustomerIds.length > 0 &&
    visibleCustomerIds.every((id) => selectedIdSet.has(id));

  const someVisibleSelected =
    !allVisibleSelected &&
    visibleCustomerIds.some((id) => selectedIdSet.has(id));

  const updateSelection = (nextSelection) => {
    if (!controlledSelection) {
      setInternalSelection(nextSelection);
    }

    if (typeof onSelectionChange === "function") {
      onSelectionChange(nextSelection);
    }
  };

  const handleToggleSelection = (customerId) => {
    if (selectedIdSet.has(customerId)) {
      updateSelection(activeSelection.filter((id) => id !== customerId));
      return;
    }

    updateSelection([...activeSelection, customerId]);
  };

  const handleToggleVisibleSelection = () => {
    if (allVisibleSelected) {
      updateSelection(
        activeSelection.filter((id) => !visibleCustomerIds.includes(id)),
      );
      return;
    }

    updateSelection([...new Set([...activeSelection, ...visibleCustomerIds])]);
  };

  const handleClearSelection = () => {
    updateSelection([]);
  };

  const handleExport = () => {
    if (typeof onBulkExport === "function") {
      onBulkExport(activeSelection, selectedVisibleCustomers);
      return;
    }

    downloadCustomersCSV(selectedVisibleCustomers);
  };

  const handleGroupChange = (group) => {
    if (typeof onBulkGroupChange !== "function") {
      return;
    }

    onBulkGroupChange(activeSelection, group);
  };

  const handleStatusChange = (status) => {
    if (typeof onBulkStatusChange !== "function") {
      return;
    }

    onBulkStatusChange(activeSelection, status);
  };

  const handleSort = typeof onSort === "function" ? onSort : () => {};

  const selectionBar = (
    <BulkActionBar
      selectedCount={activeSelection.length}
      groupOptions={groupOptions}
      statusOptions={statusOptions}
      loading={bulkActionLoading}
      onClear={handleClearSelection}
      onExport={handleExport}
      onGroupChange={
        typeof onBulkGroupChange === "function" ? handleGroupChange : undefined
      }
      onStatusChange={
        typeof onBulkStatusChange === "function"
          ? handleStatusChange
          : undefined
      }
    />
  );

  if (view === "cards") {
    return (
      <div
        className="crm-customer-table crm-customer-table--cards"
        aria-label="Mijozlar kartochkalari"
      >
        {selectionBar}

        <div className="crm-customer-table__cards">
          {customers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              selected={selectedIdSet.has(customer.id)}
              onToggleSelection={handleToggleSelection}
              onDeleteCustomer={onDeleteCustomer}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="crm-customer-table crm-customer-table--table"
      aria-label="Mijozlar jadvali"
    >
      {selectionBar}

      <div className="crm-customer-table__scroll">
        <table>
          <thead>
            <tr>
              <th className="crm-customer-table__selection-heading" scope="col">
                <SelectionCheckbox
                  checked={allVisibleSelected}
                  mixed={someVisibleSelected}
                  label={
                    allVisibleSelected
                      ? "Joriy sahifadagi tanlovni bekor qilish"
                      : "Joriy sahifadagi barcha mijozlarni tanlash"
                  }
                  onChange={handleToggleVisibleSelection}
                />
              </th>

              <th
                scope="col"
                aria-sort={getSortState("fullName", sortBy, sortDirection)}
              >
                <SortButton
                  column="fullName"
                  label="Mijoz"
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
              </th>

              <th scope="col">Holati va guruh</th>

              <th
                scope="col"
                aria-sort={getSortState("totalSpent", sortBy, sortDirection)}
              >
                <SortButton
                  column="totalSpent"
                  label="Jami xarid"
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
              </th>

              <th
                scope="col"
                aria-sort={getSortState("debt", sortBy, sortDirection)}
              >
                <SortButton
                  column="debt"
                  label="Qarzdorlik"
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
              </th>

              <th
                scope="col"
                aria-sort={getSortState("lastPurchase", sortBy, sortDirection)}
              >
                <SortButton
                  column="lastPurchase"
                  label="So‘nggi xarid"
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
              </th>

              <th
                scope="col"
                aria-sort={getSortState("churnRisk", sortBy, sortDirection)}
              >
                <SortButton
                  column="churnRisk"
                  label="Yo‘qotish xavfi"
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
              </th>

              <th className="crm-customer-table__actions-heading" scope="col">
                <span className="crm-customer-table__visually-hidden">
                  Amallar
                </span>
              </th>
            </tr>
          </thead>

          <tbody>
            {customers.map((customer) => (
              <CustomerTableRow
                key={customer.id}
                customer={customer}
                selected={selectedIdSet.has(customer.id)}
                onToggleSelection={handleToggleSelection}
                onDeleteCustomer={onDeleteCustomer}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerTable;
