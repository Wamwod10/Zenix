import { Activity, CalendarDays, MapPin, RefreshCw, Wifi } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./DashboardGreeting.scss";

const formatUpdatedAt = (timestamp) => {
  if (!timestamp) return "Yangilanish kutilmoqda";

  const diffMs = Date.now() - Number(timestamp);
  const minutes = Math.max(0, Math.floor(diffMs / 60000));

  if (minutes < 1) return "Hozirgina yangilandi";
  if (minutes < 60) return `${minutes} daqiqa oldin yangilandi`;

  const hours = Math.floor(minutes / 60);
  return `${hours} soat oldin yangilandi`;
};

const DashboardGreeting = ({ isFetching, lastUpdated, onRefresh, summary }) => {
  const navigate = useNavigate();
  const userName = summary?.user?.fullName;
  const tenantName = summary?.tenant?.name;
  const city = summary?.tenant?.city || summary?.tenant?.branchName;
  const lowStockCount = Number(summary?.stats?.lowStockCount ?? 0);

  return (
    <section className="dashboard-greeting">
      <div className="dashboard-greeting__content">
        <span className="dashboard-greeting__badge">
          <CalendarDays size={14} />
          Bugungi holat
        </span>

        <h1>{userName ? `Xush kelibsiz, ${userName}!` : "Xush kelibsiz!"}</h1>

        <p>
          {tenantName
            ? `${tenantName} bo'yicha asosiy savdo, foyda va operatsion risklar.`
            : "Asosiy savdo, foyda va operatsion risklar shu yerda jamlanadi."}
        </p>

        <div className="dashboard-greeting__live">
          <span>
            <Wifi size={13} />
            <small>Aloqa</small>
            <strong>{isFetching ? "Yangilanmoqda" : "Faol"}</strong>
          </span>
          <span>
            <Activity size={13} />
            <small>Holat</small>
            <strong>{lowStockCount ? `${lowStockCount} ta risk` : "Barqaror"}</strong>
          </span>
        </div>
      </div>

      <div className="dashboard-greeting__side">
        <div className="dashboard-greeting__filters">
          <button
            type="button"
            aria-label="Bugungi savdo hisobotini ochish"
            title="Bugungi savdo hisobotini ochish"
            onClick={() => navigate("/reports/sales")}
          >
            <CalendarDays size={16} />
            Bugungi hisobot
          </button>

          <button
            type="button"
            aria-label="Filial omborlarini ochish"
            title={city ? `${city} omborlarini ochish` : "Filial tanlanmagan"}
            onClick={() => navigate("/warehouse/warehouses")}
          >
            <MapPin size={16} />
            <span>{city || "Filial tanlanmagan"}</span>
          </button>

          <button
            type="button"
            aria-label="Dashboard ma'lumotlarini yangilash"
            title={formatUpdatedAt(lastUpdated)}
            onClick={onRefresh}
          >
            <RefreshCw size={16} />
            <span>{isFetching ? "Yangilanmoqda" : formatUpdatedAt(lastUpdated)}</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default DashboardGreeting;
