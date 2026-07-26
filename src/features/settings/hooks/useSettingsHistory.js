import { useCallback, useState } from "react";

const useSettingsHistory = (initialPast = []) => {
  const [past, setPast] = useState(initialPast);
  const [future, setFuture] = useState([]);

  const pushHistory = useCallback((entry) => {
    setPast((current) => [entry, ...current].slice(0, 30));
    setFuture([]);
  }, []);

  const undo = useCallback((applyEntry) => {
    setPast((current) => {
      const [latest, ...rest] = current;
      if (!latest) return current;
      applyEntry(latest, "undo");
      setFuture((items) => [latest, ...items].slice(0, 30));
      return rest;
    });
  }, []);

  const redo = useCallback((applyEntry) => {
    setFuture((current) => {
      const [latest, ...rest] = current;
      if (!latest) return current;
      applyEntry(latest, "redo");
      setPast((items) => [latest, ...items].slice(0, 30));
      return rest;
    });
  }, []);

  return {
    past,
    future,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    pushHistory,
    undo,
    redo,
  };
};

export default useSettingsHistory;
