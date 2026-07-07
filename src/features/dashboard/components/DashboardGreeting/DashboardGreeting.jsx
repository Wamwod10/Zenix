import "./DashboardGreeting.scss";
import { Activity, CalendarDays, MapPin, Sparkles } from "lucide-react";

const DashboardGreeting = () => {
  return (
    <section className="dashboard-greeting">
      <div className="dashboard-greeting__content">
        <span className="dashboard-greeting__badge">
          <Sparkles size={14} />
          ZENIX Business OS
        </span>

        <h1>Xush kelibsiz, Akramov Akram!</h1>

        <p>
          Bugungi savdo, ombor, mijozlar va AI tavsiyalar bir joyda jamlandi.
          ZENIX biznesingizdagi muhim o‘zgarishlarni kuzatmoqda.
        </p>
      </div>

      <div className="dashboard-greeting__side">
        <div className="dashboard-greeting__filters">
          <button type="button">
            <CalendarDays size={16} />
            Bugun
          </button>

          <button type="button">
            <MapPin size={16} />
            Toshkent filiali
          </button>
        </div>

        <div className="dashboard-greeting__ai-note">
          <span>
            <Activity size={17} />
          </span>

          <div>
            <strong>AI kuzatuv</strong>
            <p>3 ta muhim tavsiya va 2 ta risk aniqlandi.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardGreeting;
