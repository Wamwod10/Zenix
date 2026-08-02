import { useMemo } from "react";

export const useShifts = (state) =>
  useMemo(
    () => {
      const activeSchedules = state.schedules.filter((schedule) => schedule.status === "active");
      const byEmployee = state.schedules.reduce((map, schedule) => {
        if (!schedule.employeeId) return map;
        return { ...map, [schedule.employeeId]: [...(map[schedule.employeeId] || []), schedule] };
      }, {});
      return { schedules: state.schedules, activeSchedules, byEmployee };
    },
    [state.schedules],
  );

export default useShifts;
