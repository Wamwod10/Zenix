import { useEffect, useMemo, useState } from "react";

export const initialEmployeeFilters = {
  search: "",
  department: "all",
  position: "all",
  branch: "all",
  status: "all",
  probation: "all",
  document: "all",
  attendance: "all",
  salaryMin: "",
  salaryMax: "",
};

const useEmployeeFilters = (employees) => {
  const [filters, setFilters] = useState(() => {
    try {
      return { ...initialEmployeeFilters, ...JSON.parse(localStorage.getItem("zenix-hr-employee-filters") || "{}") };
    } catch {
      return initialEmployeeFilters;
    }
  });

  useEffect(() => {
    localStorage.setItem("zenix-hr-employee-filters", JSON.stringify(filters));
  }, [filters]);

  const normalizedFilters = useMemo(() => {
    const salaryMin = filters.salaryMin === "" ? "" : Math.max(0, Number(filters.salaryMin));
    const salaryMax = filters.salaryMax === "" ? "" : Math.max(0, Number(filters.salaryMax));
    return {
      ...filters,
      salaryMin,
      salaryMax,
      salaryRangeInvalid: salaryMin !== "" && salaryMax !== "" && salaryMin > salaryMax,
    };
  }, [filters]);

  const filteredEmployees = useMemo(() => {
    const query = normalizedFilters.search.trim().toLowerCase();

    if (normalizedFilters.salaryRangeInvalid) return [];

    return employees.filter((employee) => {
      const haystack = `${employee.firstName} ${employee.lastName} ${employee.phone} ${employee.email}`.toLowerCase();
      const hasExpiredDoc = employee.documents.some((document) =>
        ["critical", "expired", "warning"].includes(document.status),
      );
      const matchesSalaryMin = normalizedFilters.salaryMin === "" || Number(employee.salary) >= Number(normalizedFilters.salaryMin);
      const matchesSalaryMax = normalizedFilters.salaryMax === "" || Number(employee.salary) <= Number(normalizedFilters.salaryMax);
      const matchesAttendance =
        normalizedFilters.attendance === "all" ||
        (normalizedFilters.attendance === "low" && employee.attendanceRate < 85) ||
        (normalizedFilters.attendance === "high" && employee.attendanceRate >= 90);

      return (
        (!query || haystack.includes(query)) &&
        (normalizedFilters.department === "all" || employee.departmentId === normalizedFilters.department) &&
        (normalizedFilters.position === "all" || employee.positionId === normalizedFilters.position) &&
        (normalizedFilters.branch === "all" || employee.branchId === normalizedFilters.branch) &&
        (normalizedFilters.status === "all" || employee.status === normalizedFilters.status) &&
        (normalizedFilters.probation === "all" ||
          employee.probation?.status === normalizedFilters.probation ||
          (normalizedFilters.probation === "ending-soon" && employee.probation?.status === "active")) &&
        (normalizedFilters.document === "all" || (normalizedFilters.document === "risk" && hasExpiredDoc)) &&
        matchesSalaryMin &&
        matchesSalaryMax &&
        matchesAttendance
      );
    });
  }, [employees, normalizedFilters]);

  const activeFilters = useMemo(
    () =>
      Object.entries(filters)
        .filter(([key, value]) => value && value !== "all" && key !== "search")
        .map(([key, value]) => ({ key, value })),
    [filters],
  );

  return {
    filters,
    normalizedFilters,
    activeFilters,
    filteredEmployees,
    setFilters,
    updateFilter: (key, value) =>
      setFilters((current) => ({
        ...current,
        [key]: ["salaryMin", "salaryMax"].includes(key) ? String(value).replace(/[^\d]/g, "") : value,
      })),
    removeFilter: (key) => setFilters((current) => ({ ...current, [key]: initialEmployeeFilters[key] })),
    resetFilters: () => setFilters(initialEmployeeFilters),
  };
};

export default useEmployeeFilters;
