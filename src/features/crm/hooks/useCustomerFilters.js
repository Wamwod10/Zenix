import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

const allowedPageSizes = [10, 20, 50];

const defaultFilters = {
  query: "",
  status: "all",
  group: "all",
  loyalty: "all",
  source: "all",
  debt: "all",
  churn: "all",
  tag: "all",
  sortBy: "lastPurchase",
  sortDirection: "desc",
  page: 1,
  pageSize: 10,
  view: "table",
};

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLocaleLowerCase("uz-UZ");

const normalizePhone = (value) => String(value || "").replace(/\D/g, "");

const getComparableValue = (customer, sortBy) => {
  if (
    ["totalSpent", "debt", "orderCount", "ltv", "churnRisk"].includes(sortBy)
  ) {
    return Number(customer[sortBy]) || 0;
  }

  if (["lastPurchase", "createdAt"].includes(sortBy)) {
    const date = new Date(customer[sortBy] || 0);

    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  }

  return normalizeText(
    sortBy === "name" ? customer.fullName : customer[sortBy],
  );
};

const useCustomerFilters = (customers = []) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    const requestedPageSize = Number(searchParams.get("pageSize"));

    return {
      query: searchParams.get("query") || defaultFilters.query,
      status: searchParams.get("status") || defaultFilters.status,
      group: searchParams.get("group") || defaultFilters.group,
      loyalty: searchParams.get("loyalty") || defaultFilters.loyalty,
      source: searchParams.get("source") || defaultFilters.source,
      debt: searchParams.get("debt") || defaultFilters.debt,
      churn: searchParams.get("churn") || defaultFilters.churn,
      tag: searchParams.get("tag") || defaultFilters.tag,
      sortBy: searchParams.get("sortBy") || defaultFilters.sortBy,
      sortDirection:
        searchParams.get("direction") === "asc"
          ? "asc"
          : defaultFilters.sortDirection,
      page: Math.max(
        Number(searchParams.get("page")) || defaultFilters.page,
        1,
      ),
      pageSize: allowedPageSizes.includes(requestedPageSize)
        ? requestedPageSize
        : defaultFilters.pageSize,
      view:
        searchParams.get("view") === "cards" ? "cards" : defaultFilters.view,
    };
  }, [searchParams]);

  const updateSearchParams = useCallback(
    (updates, { resetPage = false } = {}) => {
      setSearchParams(
        (currentParams) => {
          const nextParams = new URLSearchParams(currentParams);

          Object.entries(updates).forEach(([key, value]) => {
            const defaultValue =
              key === "direction"
                ? defaultFilters.sortDirection
                : defaultFilters[key];

            if (
              value === undefined ||
              value === null ||
              value === "" ||
              value === "all" ||
              value === defaultValue
            ) {
              nextParams.delete(key);
            } else {
              nextParams.set(key, String(value));
            }
          });

          if (resetPage) {
            nextParams.delete("page");
          }

          return nextParams;
        },
        {
          replace: true,
        },
      );
    },
    [setSearchParams],
  );

  const filteredCustomers = useMemo(() => {
    const query = normalizeText(filters.query);
    const queryPhone = normalizePhone(filters.query);

    const result = customers.filter((customer) => {
      if (query) {
        const searchableText = normalizeText(
          [
            customer.fullName,
            customer.phone,
            customer.email,
            customer.company,
            customer.id,
            customer.assignedManager,
            customer.city,
            customer.region,
            ...(customer.tags || []),
          ].join(" "),
        );

        const customerPhone = normalizePhone(customer.phone);

        const matchesText = searchableText.includes(query);
        const matchesPhone =
          queryPhone.length >= 3 && customerPhone.includes(queryPhone);

        if (!matchesText && !matchesPhone) {
          return false;
        }
      }

      if (filters.status !== "all" && customer.status !== filters.status) {
        return false;
      }

      if (filters.group !== "all" && customer.group !== filters.group) {
        return false;
      }

      if (
        filters.loyalty !== "all" &&
        customer.loyaltyLevel !== filters.loyalty
      ) {
        return false;
      }

      if (filters.source !== "all" && customer.source !== filters.source) {
        return false;
      }

      if (filters.tag !== "all" && !customer.tags?.includes(filters.tag)) {
        return false;
      }

      if (filters.debt === "with-debt" && customer.debt <= 0) {
        return false;
      }

      if (filters.debt === "no-debt" && customer.debt > 0) {
        return false;
      }

      if (
        filters.debt === "over-limit" &&
        customer.debt <= customer.debtLimit
      ) {
        return false;
      }

      if (filters.churn === "high" && customer.churnRisk < 70) {
        return false;
      }

      if (
        filters.churn === "medium" &&
        (customer.churnRisk < 40 || customer.churnRisk >= 70)
      ) {
        return false;
      }

      if (filters.churn === "low" && customer.churnRisk >= 40) {
        return false;
      }

      return true;
    });

    return [...result].sort((firstCustomer, secondCustomer) => {
      const firstValue = getComparableValue(firstCustomer, filters.sortBy);

      const secondValue = getComparableValue(secondCustomer, filters.sortBy);

      let comparison = 0;

      if (typeof firstValue === "string" && typeof secondValue === "string") {
        comparison = firstValue.localeCompare(secondValue, "uz-UZ");
      } else {
        comparison = firstValue - secondValue;
      }

      return filters.sortDirection === "asc" ? comparison : comparison * -1;
    });
  }, [customers, filters]);

  const totalCustomers = filteredCustomers.length;
  const totalPages = Math.max(Math.ceil(totalCustomers / filters.pageSize), 1);

  const currentPage = Math.min(filters.page, totalPages);
  const startIndex = (currentPage - 1) * filters.pageSize;
  const endIndex = Math.min(startIndex + filters.pageSize, totalCustomers);

  const paginatedCustomers = useMemo(
    () => filteredCustomers.slice(startIndex, startIndex + filters.pageSize),
    [filteredCustomers, filters.pageSize, startIndex],
  );

  useEffect(() => {
    if (filters.page > totalPages) {
      updateSearchParams({
        page: totalPages,
      });
    }
  }, [filters.page, totalPages, updateSearchParams]);

  const setFilter = useCallback(
    (key, value) => {
      updateSearchParams(
        {
          [key]: value,
        },
        {
          resetPage: true,
        },
      );
    },
    [updateSearchParams],
  );

  const setSearchQuery = useCallback(
    (query) => {
      updateSearchParams(
        {
          query,
        },
        {
          resetPage: true,
        },
      );
    },
    [updateSearchParams],
  );

  const setPage = useCallback(
    (page) => {
      const safePage = Math.min(Math.max(Number(page) || 1, 1), totalPages);

      updateSearchParams({
        page: safePage,
      });
    },
    [totalPages, updateSearchParams],
  );

  const setPageSize = useCallback(
    (pageSize) => {
      const safePageSize = allowedPageSizes.includes(Number(pageSize))
        ? Number(pageSize)
        : defaultFilters.pageSize;

      updateSearchParams(
        {
          pageSize: safePageSize,
        },
        {
          resetPage: true,
        },
      );
    },
    [updateSearchParams],
  );

  const setSort = useCallback(
    (sortBy, direction = filters.sortDirection) => {
      updateSearchParams(
        {
          sortBy,
          direction,
        },
        {
          resetPage: true,
        },
      );
    },
    [filters.sortDirection, updateSearchParams],
  );

  const toggleSort = useCallback(
    (sortBy) => {
      const nextDirection =
        filters.sortBy === sortBy && filters.sortDirection === "desc"
          ? "asc"
          : "desc";

      setSort(sortBy, nextDirection);
    },
    [filters.sortBy, filters.sortDirection, setSort],
  );

  const setView = useCallback(
    (view) => {
      updateSearchParams({
        view: view === "cards" ? "cards" : "table",
      });
    },
    [updateSearchParams],
  );

  const clearFilters = useCallback(() => {
    setSearchParams(
      (currentParams) => {
        const nextParams = new URLSearchParams(currentParams);

        [
          "query",
          "status",
          "group",
          "loyalty",
          "source",
          "debt",
          "churn",
          "tag",
          "page",
        ].forEach((key) => {
          nextParams.delete(key);
        });

        return nextParams;
      },
      {
        replace: true,
      },
    );
  }, [setSearchParams]);

  const activeFilters = useMemo(() => {
    const items = [];

    if (filters.query) {
      items.push({
        id: "query",
        label: "Qidiruv",
        value: filters.query,
      });
    }

    if (filters.status !== "all") {
      items.push({
        id: "status",
        label: "Holat",
        value: filters.status,
      });
    }

    if (filters.group !== "all") {
      items.push({
        id: "group",
        label: "Guruh",
        value: filters.group,
      });
    }

    if (filters.loyalty !== "all") {
      items.push({
        id: "loyalty",
        label: "Sodiqlik",
        value: filters.loyalty,
      });
    }

    if (filters.source !== "all") {
      items.push({
        id: "source",
        label: "Manba",
        value: filters.source,
      });
    }

    if (filters.debt !== "all") {
      items.push({
        id: "debt",
        label: "Qarz",
        value: filters.debt,
      });
    }

    if (filters.churn !== "all") {
      items.push({
        id: "churn",
        label: "Churn",
        value: filters.churn,
      });
    }

    if (filters.tag !== "all") {
      items.push({
        id: "tag",
        label: "Teg",
        value: filters.tag,
      });
    }

    return items;
  }, [filters]);

  const removeFilter = useCallback(
    (filterId) => {
      setFilter(filterId, defaultFilters[filterId] || "all");
    },
    [setFilter],
  );

  const summary = useMemo(
    () => ({
      total: totalCustomers,
      active: filteredCustomers.filter(
        (customer) => customer.status === "active",
      ).length,
      debtors: filteredCustomers.filter((customer) => customer.debt > 0).length,
      totalDebt: filteredCustomers.reduce(
        (total, customer) => total + customer.debt,
        0,
      ),
      highRisk: filteredCustomers.filter((customer) => customer.churnRisk >= 70)
        .length,
    }),
    [filteredCustomers, totalCustomers],
  );

  return {
    filters,
    filteredCustomers,
    paginatedCustomers,
    totalCustomers,
    totalPages,
    currentPage,
    startIndex,
    endIndex,
    activeFilters,
    hasActiveFilters: activeFilters.length > 0,
    summary,

    actions: {
      setFilter,
      setSearchQuery,
      setPage,
      setPageSize,
      setSort,
      toggleSort,
      setView,
      removeFilter,
      clearFilters,
    },
  };
};

export default useCustomerFilters;
