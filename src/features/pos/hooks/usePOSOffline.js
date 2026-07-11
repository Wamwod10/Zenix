import { useCallback, useEffect, useState } from "react";

import { offlineSyncAdapter } from "../utils/posAdapters";
import { readOfflineQueue, writeOfflineQueue } from "../utils/posStorage";

const getInitialOnlineStatus = () =>
  typeof navigator === "undefined" ? true : navigator.onLine;

const usePOSOffline = () => {
  const [isOnline, setIsOnline] = useState(getInitialOnlineStatus);
  const [queue, setQueue] = useState(() => readOfflineQueue());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    writeOfflineQueue(queue);
  }, [queue]);

  const enqueueSale = useCallback((sale) => {
    setQueue((current) => [
      {
        ...sale,
        syncStatus: "queued",
        queuedAt: new Date().toISOString(),
      },
      ...current,
    ]);
  }, []);

  const syncQueue = useCallback(async () => {
    if (!queue.length || !isOnline) {
      return [];
    }

    setIsSyncing(true);
    const synced = await offlineSyncAdapter.syncSales(queue);
    setQueue([]);
    setIsSyncing(false);
    return synced;
  }, [isOnline, queue]);

  const simulateOffline = useCallback(() => setIsOnline(false), []);
  const simulateOnline = useCallback(() => setIsOnline(true), []);

  return {
    isOnline,
    queue,
    queueCount: queue.length,
    isSyncing,
    enqueueSale,
    syncQueue,
    simulateOffline,
    simulateOnline,
  };
};

export default usePOSOffline;
