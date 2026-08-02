import { saveBusinessState } from "./businessPersistence.js";

export const businessPersistenceMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (typeof action.type === "string" && action.type.startsWith("businessOS/")) {
    saveBusinessState(store.getState().businessOS);
  }

  return result;
};
