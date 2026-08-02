import { useMemo } from "react";

import { calculateLeaveBalance } from "../utils/hrCalculations";

const useLeave = (leaves = [], employees = []) => {
  const pendingLeaves = useMemo(() => leaves.filter((leave) => leave.status === "Pending"), [leaves]);
  const balancesByEmployee = useMemo(
    () =>
      Object.fromEntries(
        employees.map((employee) => [employee.id, calculateLeaveBalance(leaves, employee.id)]),
      ),
    [employees, leaves],
  );

  return { pendingLeaves, balancesByEmployee };
};

export { calculateLeaveBalance };
export default useLeave;
