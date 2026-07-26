import { useEffect, useRef, useState } from "react";

const useSettingsAutosave = ({ dirtyKey, enabled = true, onSave }) => {
  const [status, setStatus] = useState("saved");
  const first = useRef(true);

  useEffect(() => {
    if (!enabled) return undefined;
    if (first.current) {
      first.current = false;
      return undefined;
    }

    setStatus("saving");
    const timeout = window.setTimeout(async () => {
      try {
        await onSave?.();
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [dirtyKey, enabled, onSave]);

  return { autosaveStatus: status, setAutosaveStatus: setStatus };
};

export default useSettingsAutosave;
