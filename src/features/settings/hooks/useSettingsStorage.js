import { useCallback, useState } from "react";

import { defaultSettingsState } from "../data/settingsMockData";
import { mergeSettingsDefaults, safeSettingsRead, safeSettingsWrite, settingsStorageKeys } from "../utils/settingsStorage";

const normalizeSettingsState = (savedState) => {
  const merged = mergeSettingsDefaults(defaultSettingsState, savedState || {});
  const isLegacy = !savedState?.schemaVersion || savedState.schemaVersion < defaultSettingsState.schemaVersion;
  if (isLegacy) {
    ["branches", "warehouses", "users", "taxes", "payments", "auditLog"].forEach((key) => {
      if (!Array.isArray(savedState?.[key]) || savedState[key].length === 0) {
        merged[key] = defaultSettingsState[key];
      }
    });
    if (!Array.isArray(savedState?.currencies?.rates) || savedState.currencies.rates.length === 0) {
      merged.currencies = defaultSettingsState.currencies;
    }
  }
  return {
    ...merged,
    schemaVersion: defaultSettingsState.schemaVersion,
  };
};

const useSettingsStorage = () => {
  const [state, setStateValue] = useState(() =>
    normalizeSettingsState(safeSettingsRead(settingsStorageKeys.state, null)),
  );

  const setState = useCallback((updater) => {
    setStateValue((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      return next;
    });
  }, []);

  const persistState = useCallback((nextState) => {
    safeSettingsWrite(settingsStorageKeys.state, nextState);
  }, []);

  const resetState = useCallback(() => {
    setStateValue(defaultSettingsState);
    safeSettingsWrite(settingsStorageKeys.state, defaultSettingsState);
  }, []);

  return { state, setState, persistState, resetState };
};

export default useSettingsStorage;
