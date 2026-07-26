import { useCallback, useState } from "react";

import { safeSettingsRead, safeSettingsWrite, settingsStorageKeys } from "../utils/settingsStorage";

const useRecentSettings = () => {
  const [recent, setRecent] = useState(() =>
    safeSettingsRead(settingsStorageKeys.recent, ["security", "documents", "finance"]),
  );

  const touchRecent = useCallback((pageId) => {
    setRecent((current) => {
      const next = [pageId, ...current.filter((item) => item !== pageId)].slice(0, 8);
      safeSettingsWrite(settingsStorageKeys.recent, next);
      return next;
    });
  }, []);

  return { recent, touchRecent };
};

export default useRecentSettings;
