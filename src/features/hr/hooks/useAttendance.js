import { useMemo } from "react";

import { calculateAttendanceRate, getTodayISO } from "../utils/hrCalculations";

const useAttendance = (attendance = [], employees = [], currentDate = getTodayISO()) => {
  const todayRows = useMemo(() => attendance.filter((row) => row.date === currentDate), [attendance, currentDate]);
  const ratesByEmployee = useMemo(
    () =>
      Object.fromEntries(
        employees.map((employee) => [employee.id, calculateAttendanceRate(attendance, employee.id)]),
      ),
    [attendance, employees],
  );

  return { todayRows, ratesByEmployee, currentDate };
};

export { calculateAttendanceRate };
export default useAttendance;
