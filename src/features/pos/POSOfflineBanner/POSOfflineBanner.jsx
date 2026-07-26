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
        {isOnline ? "Onlayn" : "Oflayn rejim"}
      </span>
      <p>
        {queueCount
          ? `${queueCount} ta oflayn savdo sinxronlash navbatida`
          : "Oflayn navbat bo'sh"}
      </p>
      <div>
        <button type="button" onClick={isOnline ? onGoOffline : onGoOnline}>
          {isOnline ? "Oflaynni sinash" : "Onlaynga qaytish"}
        </button>
        <button type="button" disabled={!isOnline || !queueCount || isSyncing} onClick={onSync}>
          <RefreshCw size={14} />
          Sinxronlash
        </button>
      </div>
    </section>
  );
};

export default POSOfflineBanner;
