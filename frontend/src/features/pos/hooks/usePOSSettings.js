import { useCallback, useEffect, useState } from "react";

import { defaultPOSSettings } from "../data/posSettings";
import { readPOSSettings, writePOSSettings } from "../utils/posStorage";

const usePOSSettings = () => {
  const [settings, setSettings] = useState(() =>
    readPOSSettings(defaultPOSSettings),
  );

  useEffect(() => {
    writePOSSettings(settings);
  }, [settings]);

  const updateSettings = useCallback((patch) => {
    setSettings((current) => ({
      ...current,
      ...patch,
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultPOSSettings);
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
  };
};

export default usePOSSettings;
