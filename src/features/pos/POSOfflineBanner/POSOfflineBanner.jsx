import { CloudOff, RefreshCw, Wifi } from "lucide-react";

import "./POSOfflineBanner.scss";

const POSOfflineBanner = ({
  isOnline,
  queueCount = 0,
  isSyncing = false,
  onSync,
  onGoOffline,
  onGoOnline,
}) => {
  return (
    <section className={`pos-offline-banner ${isOnline ? "is-online" : "is-offline"}`} aria-live="polite">
      <span>
        {isOnline ? <Wifi size={16} /> : <CloudOff size={16} />}
        {isOnline ? "Online" : "Offline mode"}
      </span>
      <p>
        {queueCount
          ? `${queueCount} ta offline sale sync navbatida`
          : "Offline queue bo'sh"}
      </p>
      <div>
        <button type="button" onClick={isOnline ? onGoOffline : onGoOnline}>
          {isOnline ? "Offline simulate" : "Online qaytish"}
        </button>
        <button type="button" disabled={!isOnline || !queueCount || isSyncing} onClick={onSync}>
          <RefreshCw size={14} />
          Sync
        </button>
      </div>
    </section>
  );
};

export default POSOfflineBanner;
