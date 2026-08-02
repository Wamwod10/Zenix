import { useCallback, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Plus,
  SearchX,
  ShieldAlert,
  UserCheck,
  Users,
  WalletCards,
  X,
} from "lucide-react";

import CRMPageHeader from "../../components/CRMPageHeader/CRMPageHeader";
import CRMStateView from "../../components/CRMStateView/CRMStateView";
import CustomerFilters from "../../components/CustomerFilters/CustomerFilters";
import CustomerTable from "../../components/CustomerTable/CustomerTable";
import useCustomerFilters from "../../hooks/useCustomerFilters";
import useCustomerSelection from "../../hooks/useCustomerSelection";
import * as crmCustomerData from "../../data/crmCustomers";
import { CRM_PATHS } from "../../config/crmNavigation";
import { formatCurrency, formatNumber } from "../../utils/crmFormatters";

import "./Customers.scss";

const customerGroups =
  crmCustomerData.crmCustomerGroups ?? crmCustomerData.customerGroups ?? [];

const customerStatuses =
  crmCustomerData.crmCustomerStatuses ?? crmCustomerData.customerStatuses ?? [];

const customerTags =
  crmCustomerData.crmCustomerTags ?? crmCustomerData.customerTags ?? [];

const customerManagers =
  crmCustomerData.crmManagers ?? crmCustomerData.customerManagers ?? [];

const createCustomerPath =
  CRM_PATHS?.createCustomer ??
  CRM_PATHS?.newCustomer ??
  CRM_PATHS?.customerCreate ??
  "/crm/customers/new";

const normalizeBulkOptions = (options = [], type) =>
  options.map((option) => {
    if (typeof option === "string") {
      return {
        value: option,
        label: option,
      };
    }

    if (type === "group") {
      const label =
        option.label ??
        option.name ??
        option.title ??
        option.value ??
        option.id;

      return {
        value: label,
        label,
      };
    }

    return {
      value: option.value ?? option.status ?? option.id ?? option.name ?? "",
      label: option.label ?? option.title ?? option.name ?? option.value ?? "",
    };
  });

const createPageNumbers = (currentPage, totalPages) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);

  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  return Array.from(
    {
      length: endPage - startPage + 1,
    },
    (_, index) => startPage + index,
  );
};

const Customers = () => {
  const {
    customers,
    selectedCustomerIds,
    bulkActionLoading,
    feedback,
    actions: selectionActions,
  } = useCustomerSelection();

  const filterState = useCustomerFilters(customers);

  const filters = filterState.filters ?? {};
  const filterActions = filterState.actions ?? {};

  const filteredCustomers = Array.isArray(filterState.filteredCustomers)
    ? filterState.filteredCustomers
    : customers;

  const pageSize = Number(filters.pageSize) || 10;
  const currentPage = Number(filters.page) || 1;

  const fallbackPaginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;

    return filteredCustomers.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredCustomers, pageSize]);

  const paginatedCustomers = Array.isArray(filterState.paginatedCustomers)
    ? filterState.paginatedCustomers
    : fallbackPaginatedCustomers;

  const totalPages =
    filterState.totalPages ??
    Math.max(1, Math.ceil(filteredCustomers.length / pageSize));

  const activeFilterCount =
    filterState.activeFilterCount ?? filterState.activeFiltersCount ?? 0;
  const noop = useCallback(() => {}, []);

  const setPage =
    useMemo(
      () => filterActions.setPage ?? filterActions.changePage ?? noop,
      [filterActions.changePage, filterActions.setPage, noop],
    );

  const setPageSize =
    useMemo(
      () => filterActions.setPageSize ?? filterActions.changePageSize ?? noop,
      [filterActions.changePageSize, filterActions.setPageSize, noop],
    );

  const setView = filterActions.setView ?? filterActions.changeView;

  useEffect(() => {
    if (currentPage > totalPages) {
      setPage(totalPages);
    }
  }, [currentPage, setPage, totalPages]);

  const summary = useMemo(() => {
    const activeCustomers = customers.filter(
      (customer) => customer.status === "active" || customer.status === "faol",
    ).length;

    const debtors = customers.filter((customer) => Number(customer.debt) > 0);

    const highRiskCustomers = customers.filter(
      (customer) => Number(customer.churnRisk) >= 70,
    ).length;

    return {
      total: customers.length,
      active: activeCustomers,
      debtors: debtors.length,
      totalDebt: debtors.reduce(
        (sum, customer) => sum + Number(customer.debt || 0),
        0,
      ),
      highRisk: highRiskCustomers,
    };
  }, [customers]);

  const bulkGroupOptions = useMemo(
    () => normalizeBulkOptions(customerGroups, "group"),
    [],
  );

  const bulkStatusOptions = useMemo(
    () => normalizeBulkOptions(customerStatuses, "status"),
    [],
  );

  const pageNumbers = useMemo(
    () => createPageNumbers(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const headerAction = (
    <Link className="crm-customers__create-button" to={createCustomerPath}>
      <Plus aria-hidden="true" />
      <span>Yangi mijoz</span>
    </Link>
  );

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
  };

  const firstVisibleResult =
    filteredCustomers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;

  const lastVisibleResult = Math.min(
    currentPage * pageSize,
    filteredCustomers.length,
  );

  return (
    <main className="crm-customers">
      <CRMPageHeader
        eyebrow="CRM · Mijozlar"
        title="Mijozlar bazasi"
        description="Mijoz profillari, xarid faolligi va qarzdorlikni bitta ish maydonida boshqaring."
        action={headerAction}
        actions={headerAction}
      />

      {feedback ? (
        <div
          className={`crm-customers__feedback crm-customers__feedback--${feedback.type}`}
          role={feedback.type === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          <span className="crm-customers__feedback-icon">
            {feedback.type === "error" ? (
              <AlertTriangle aria-hidden="true" />
            ) : (
              <UserCheck aria-hidden="true" />
            )}
          </span>

          <div className="crm-customers__feedback-copy">
            <strong>{feedback.title}</strong>
            <span>{feedback.message}</span>
          </div>

          <button
            type="button"
            aria-label="Xabarni yopish"
            onClick={selectionActions.dismissFeedback}
          >
            <X aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <section
        className="crm-customers__summary"
        aria-label="Mijozlar bo‘yicha qisqa ko‘rsatkichlar"
      >
        <article className="crm-customers__summary-card">
          <span className="crm-customers__summary-icon">
            <Users aria-hidden="true" />
          </span>

          <div className="crm-customers__summary-content">
            <span>Jami mijozlar</span>
            <strong>{formatNumber(summary.total)}</strong>
            <small>Markaziy mijozlar bazasi</small>
          </div>
        </article>

        <article className="crm-customers__summary-card crm-customers__summary-card--success">
          <span className="crm-customers__summary-icon">
            <UserCheck aria-hidden="true" />
          </span>

          <div className="crm-customers__summary-content">
            <span>Faol mijozlar</span>
            <strong>{formatNumber(summary.active)}</strong>
            <small>Faol munosabatdagi mijozlar</small>
          </div>
        </article>

        <article className="crm-customers__summary-card crm-customers__summary-card--warning">
          <span className="crm-customers__summary-icon">
            <WalletCards aria-hidden="true" />
          </span>

          <div className="crm-customers__summary-content">
            <span>Qarzdor mijozlar</span>
            <strong>{formatNumber(summary.debtors)}</strong>
            <small>Umumiy qarz: {formatCurrency(summary.totalDebt)}</small>
          </div>
        </article>

        <article className="crm-customers__summary-card crm-customers__summary-card--danger">
          <span className="crm-customers__summary-icon">
            <ShieldAlert aria-hidden="true" />
          </span>

          <div className="crm-customers__summary-content">
            <span>Yo'qotish xavfi yuqori</span>
            <strong>{formatNumber(summary.highRisk)}</strong>
            <small>Tezkor aloqa talab qilinadi</small>
          </div>
        </article>
      </section>

      <CustomerFilters
        filters={filters}
        actions={filterActions}
        groups={customerGroups}
        statuses={customerStatuses}
        tags={customerTags}
        managers={customerManagers}
        activeFilterCount={activeFilterCount}
        activeFiltersCount={activeFilterCount}
        activeFilters={filterState.activeFilters}
        resultCount={filteredCustomers.length}
        resultsCount={filteredCustomers.length}
        totalResults={filteredCustomers.length}
        onSearchChange={filterActions.setSearch}
        onFilterChange={filterActions.setFilter}
        onReset={filterActions.resetFilters}
        onResetFilters={filterActions.resetFilters}
        onClearFilters={filterActions.resetFilters}
        onViewChange={setView}
      />

      <section
        className="crm-customers__results"
        aria-label="Mijozlar natijalari"
      >
        {filteredCustomers.length > 0 ? (
          <>
            <CustomerTable
              customers={paginatedCustomers}
              view={filters.view}
              sortBy={filters.sortBy}
              sortDirection={filters.sortDirection}
              selectedCustomerIds={selectedCustomerIds}
              groupOptions={bulkGroupOptions}
              statusOptions={bulkStatusOptions}
              bulkActionLoading={bulkActionLoading}
              onSort={filterActions.toggleSort}
              onSelectionChange={selectionActions.handleSelectionChange}
              onBulkGroupChange={selectionActions.changeSelectedGroup}
              onBulkStatusChange={selectionActions.changeSelectedStatus}
              onDeleteCustomer={selectionActions.deleteCustomer}
            />

            <div
              className="crm-customers__pagination"
              aria-label="Mijozlar sahifalari"
            >
              <p>
                <strong>{formatNumber(filteredCustomers.length)}</strong> ta
                natijadan{" "}
                <strong>
                  {formatNumber(firstVisibleResult)}–
                  {formatNumber(lastVisibleResult)}
                </strong>{" "}
                tasi ko‘rsatilmoqda
              </p>

              <div className="crm-customers__pagination-controls">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  aria-label="Oldingi sahifa"
                  onClick={() => setPage(currentPage - 1)}
                >
                  <ChevronLeft aria-hidden="true" />
                  <span>Oldingi</span>
                </button>

                <div className="crm-customers__pagination-pages">
                  {pageNumbers.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      aria-label={`${pageNumber}-sahifaga o‘tish`}
                      aria-current={
                        pageNumber === currentPage ? "page" : undefined
                      }
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  aria-label="Keyingi sahifa"
                  onClick={() => setPage(currentPage + 1)}
                >
                  <span>Keyingi</span>
                  <ChevronRight aria-hidden="true" />
                </button>
              </div>

              <div className="crm-customers__pagination-size">
                <label htmlFor="crm-customers-page-size">Har sahifada</label>

                <select
                  id="crm-customers-page-size"
                  value={pageSize}
                  onChange={handlePageSizeChange}
                >
                  <option value={10}>10 ta</option>
                  <option value={20}>20 ta</option>
                  <option value={50}>50 ta</option>
                </select>
              </div>
            </div>
          </>
        ) : (
          <CRMStateView
            variant="empty"
            icon={SearchX}
            title="Mos mijoz topilmadi"
            description="Qidiruv matnini o‘zgartiring yoki faol filtrlarni tozalab, qayta urinib ko‘ring."
            action={
              <button
                className="crm-customers__empty-action"
                type="button"
                onClick={filterActions.resetFilters}
              >
                Filtrlarni tozalash
              </button>
            }
          />
        )}
      </section>
    </main>
  );
};

export default Customers;
