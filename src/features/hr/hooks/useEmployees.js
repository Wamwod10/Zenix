import { useMemo } from "react";

import { calculateDocumentExpiry } from "../utils/hrCalculations";
import useEmployeeFilters from "./useEmployeeFilters";

const useEmployees = (employees = []) => {
  const employeeFilters = useEmployeeFilters(employees);
  const riskByEmployee = useMemo(
    () =>
      Object.fromEntries(
        employees.map((employee) => [
          employee.id,
          {
            documentRisk: employee.documents.some((document) =>
              ["critical", "expired", "warning"].includes(calculateDocumentExpiry(document).status),
            ),
            probationRisk: ["active", "ending-soon", "decision-pending"].includes(employee.probation?.status),
            attendanceRisk: Number(employee.attendanceRate || 0) < 85,
          },
        ]),
      ),
    [employees],
  );

  return { ...employeeFilters, riskByEmployee };
};

export default useEmployees;
