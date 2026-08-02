import { useMemo } from "react";

export const taskStatuses = ["Yangi", "Jarayonda", "Tekshiruvda", "Bajarildi", "Bloklangan"];

const statusMap = {
  New: "Yangi",
  "In Progress": "Jarayonda",
  Review: "Tekshiruvda",
  Done: "Bajarildi",
  Blocked: "Bloklangan",
};

export const useTasks = (state) =>
  useMemo(() => {
    const tasks = state.tasks.map((task) => ({ ...task, localStatus: statusMap[task.status] || task.status }));
    const board = Object.fromEntries(taskStatuses.map((status) => [status, tasks.filter((task) => task.localStatus === status)]));
    return { tasks, board, openTasks: tasks.filter((task) => task.localStatus !== "Bajarildi") };
  }, [state.tasks]);

export default useTasks;
