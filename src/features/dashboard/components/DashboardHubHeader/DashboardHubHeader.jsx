import { CalendarDays, MapPin, RefreshCw } from "lucide-react";
import "./DashboardHubHeader.scss";

const formatUpdatedAt = (timestamp) => {
  if (!timestamp) return "Yangilanish kutilmoqda";

  const minutes = Math.max(0, Math.floor((Date.now() - Number(timestamp)) / 60000));
  if (minutes < 1) return "Hozirgina";
  if (minutes < 60) return `${minutes} daqiqa oldin`;
  return `${Math.floor(minutes / 60)} soat oldin`;
};

const DashboardHubHeader = ({
  userName,
  tenantName,
  branchName,
  periodLabel,
  lastUpdated,
  updating,
  onRefresh,
}) => (
  <header className="dashboard-hub-header">
    <div className="dashboard-hub-header__copy">
      <span className="dashboard-hub-header__eyebrow">{tenantName || "ZENIX"}</span>
      <h1>{userName ? `Xush kelibsiz, ${userName}` : "Xush kelibsiz"}</h1>
      <p>Bugungi biznes holati, asosiy risklar va modullarga tez kirish.</p>
    </div>

    <div className="dashboard-hub-header__meta" aria-label="Dashboard konteksti">
      <span>
        <CalendarDays size={15} aria-hidden="true" />
        {periodLabel}
      </span>
      <span>
        <MapPin size={15} aria-hidden="true" />
        {branchName}
      </span>
      <button
        type="button"
        aria-label="Dashboard ma'lumotlarini yangilash"
        title={formatUpdatedAt(lastUpdated)}
        onClick={onRefresh}
      >
        <RefreshCw size={15} aria-hidden="true" className={updating ? "is-spinning" : ""} />
        {updating ? "Yangilanmoqda" : formatUpdatedAt(lastUpdated)}
      </button>
    </div>
  </header>
);

export default DashboardHubHeader;
