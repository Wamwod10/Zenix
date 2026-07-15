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

<<<<<<< HEAD:src/features/dashboard/components/DashboardGreeting/DashboardGreeting.jsx
const DashboardGreeting = ({ summary }) => {
  const userName = summary?.user?.fullName || "Akramov Akram";
  const tenantName = summary?.tenant?.name || "ZENIX Workspace";
  const city = summary?.tenant?.city || "Toshkent filiali";
  const recommendations = summary?.stats?.lowStockCount
    ? `${summary.stats.lowStockCount} ta risk`
    : "3 ta muhim tavsiya";
=======
const DashboardGreeting = () => {
  const { data } = useDashboardSummaryQuery();

  const fullName = data?.user?.fullName;
  const city = data?.tenant?.city;
  const companyName = data?.tenant?.name;
>>>>>>> d6b99a90462b6f5577d34dbe8eb51623ebd2e0a4:frontend/src/features/dashboard/components/DashboardGreeting/DashboardGreeting.jsx

  return (
    <section className="dashboard-greeting">
      <div className="dashboard-greeting__content">
        <span className="dashboard-greeting__badge">
          <Sparkles size={14} />
          ZENIX Business OS
        </span>

<<<<<<< HEAD:src/features/dashboard/components/DashboardGreeting/DashboardGreeting.jsx
        <h1>Xush kelibsiz, {userName}!</h1>
=======
        <h1>Xush kelibsiz{fullName ? `, ${fullName}` : ""}!</h1>
>>>>>>> d6b99a90462b6f5577d34dbe8eb51623ebd2e0a4:frontend/src/features/dashboard/components/DashboardGreeting/DashboardGreeting.jsx

        <p>
          {tenantName} uchun bugungi savdo, ombor, mijozlar va AI tavsiyalar
          bir joyda jamlandi. ZENIX muhim o'zgarishlarni kuzatmoqda.
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
<<<<<<< HEAD:src/features/dashboard/components/DashboardGreeting/DashboardGreeting.jsx
            {city}
=======
            {city || companyName || "Asosiy filial"}
>>>>>>> d6b99a90462b6f5577d34dbe8eb51623ebd2e0a4:frontend/src/features/dashboard/components/DashboardGreeting/DashboardGreeting.jsx
          </button>
        </div>

        <div className="dashboard-greeting__ai-note">
          <span>
            <Activity size={17} />
          </span>

          <div>
            <strong>AI kuzatuv</strong>
<<<<<<< HEAD:src/features/dashboard/components/DashboardGreeting/DashboardGreeting.jsx
            <p>{recommendations} va real-time monitoring faol.</p>
=======
            <p>AI moduli ma'lumot yig'moqda. Savdo boshlangach tavsiyalar chiqadi.</p>
>>>>>>> d6b99a90462b6f5577d34dbe8eb51623ebd2e0a4:frontend/src/features/dashboard/components/DashboardGreeting/DashboardGreeting.jsx
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardGreeting;
