import { useCallback, useState } from "react";

import { safeSettingsRead, safeSettingsWrite, settingsStorageKeys } from "../utils/settingsStorage";

const useSettingsFavorites = () => {
  const [favorites, setFavorites] = useState(() =>
    safeSettingsRead(settingsStorageKeys.favorites, ["company", "permissions", "backup", "integrations"]),
  );

  const toggleFavorite = useCallback((pageId) => {
    setFavorites((current) => {
      const next = current.includes(pageId)
        ? current.filter((item) => item !== pageId)
        : [pageId, ...current].slice(0, 8);
      safeSettingsWrite(settingsStorageKeys.favorites, next);
      return next;
    });
  }, []);

  return { favorites, toggleFavorite };
};

export default useSettingsFavorites;
