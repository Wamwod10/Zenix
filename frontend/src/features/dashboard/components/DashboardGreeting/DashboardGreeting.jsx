import "./DashboardGreeting.scss";
import {
  Activity,
  CalendarDays,
  MapPin,
  Server,
  Sparkles,
  Wifi,
} from "lucide-react";
// ✅ BACKEND INTEGRATION: real ism va shahar backend'dan, dizayn o'zgarmagan
import { useDashboardSummaryQuery } from "../../dashboardApi";

const liveStatus = [
  { icon: Wifi, label: "Online", value: "Live" },
  { icon: Activity, label: "Last Sync", value: "2 daq" },
  { icon: Server, label: "Server", value: "99.9%" },
];

const DashboardGreeting = () => {
  const { data } = useDashboardSummaryQuery();

  const fullName = data?.user?.fullName;
  const city = data?.tenant?.city;
  const companyName = data?.tenant?.name;

  return (
    <section className="dashboard-greeting">
      <div className="dashboard-greeting__content">
        <span className="dashboard-greeting__badge">
          <Sparkles size={14} />
          ZENIX Business OS
        </span>

        <h1>Xush kelibsiz{fullName ? `, ${fullName}` : ""}!</h1>

        <p>
          Bugungi savdo, ombor, mijozlar va AI tavsiyalar bir joyda jamlandi.
          ZENIX biznesingizdagi muhim o‘zgarishlarni kuzatmoqda.
        </p>

        <div className="dashboard-greeting__live">
          {liveStatus.map((item) => {
            const Icon = item.icon;

            return (
              <span key={item.label}>
                <Icon size={13} />
                <small>{item.label}</small>
                <strong>{item.value}</strong>
              </span>
            );
          })}
        </div>
      </div>

      <div className="dashboard-greeting__side">
        <div className="dashboard-greeting__filters">
          <button type="button">
            <CalendarDays size={16} />
            Bugun
          </button>

          <button type="button">
            <MapPin size={16} />
            {city || companyName || "Asosiy filial"}
          </button>
        </div>

        <div className="dashboard-greeting__ai-note">
          <span>
            <Activity size={17} />
          </span>

          <div>
            <strong>AI kuzatuv</strong>
            <p>AI moduli ma'lumot yig'moqda. Savdo boshlangach tavsiyalar chiqadi.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardGreeting;
