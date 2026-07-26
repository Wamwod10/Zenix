import { useMemo, useState } from "react";

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
  const [filters, setFilters] = useState(initialEmployeeFilters);

  const filteredEmployees = useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    return employees.filter((employee) => {
      const haystack = `${employee.firstName} ${employee.lastName} ${employee.phone} ${employee.email}`.toLowerCase();
      const hasExpiredDoc = employee.documents.some((document) =>
        ["critical", "expired", "warning"].includes(document.status),
      );
      const matchesSalaryMin = !filters.salaryMin || Number(employee.salary) >= Number(filters.salaryMin);
      const matchesSalaryMax = !filters.salaryMax || Number(employee.salary) <= Number(filters.salaryMax);
      const matchesAttendance =
        filters.attendance === "all" ||
        (filters.attendance === "low" && employee.attendanceRate < 85) ||
        (filters.attendance === "high" && employee.attendanceRate >= 90);

      return (
        (!query || haystack.includes(query)) &&
        (filters.department === "all" || employee.departmentId === filters.department) &&
        (filters.position === "all" || employee.positionId === filters.position) &&
        (filters.branch === "all" || employee.branchId === filters.branch) &&
        (filters.status === "all" || employee.status === filters.status) &&
        (filters.probation === "all" || employee.probation?.status === filters.probation) &&
        (filters.document === "all" || (filters.document === "risk" && hasExpiredDoc)) &&
        matchesSalaryMin &&
        matchesSalaryMax &&
        matchesAttendance
      );
    });
  }, [employees, filters]);

  return {
    filters,
    filteredEmployees,
    setFilters,
    updateFilter: (key, value) => setFilters((current) => ({ ...current, [key]: value })),
    resetFilters: () => setFilters(initialEmployeeFilters),
  };
};

export default useEmployeeFilters;
