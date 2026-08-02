import { useCallback, useState } from "react";

import { defaultSettingsState } from "../data/settingsMockData";
import { safeSettingsRead, safeSettingsWrite, settingsStorageKeys } from "../utils/settingsStorage";

const useSettingsStorage = () => {
  const [state, setStateValue] = useState(() =>
    safeSettingsRead(settingsStorageKeys.state, defaultSettingsState),
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
