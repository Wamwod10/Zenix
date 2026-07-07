import {
  Activity as ActivityIcon,
  ClipboardCheck,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";
import "./Activity.scss";

const activityFeed = [
  {
    icon: ClipboardCheck,
    title: "12 ta buyurtma yopildi",
    text: "Oxirgi 30 daqiqada",
    tone: "green",
  },
  {
    icon: Truck,
    title: "2 ta yetkazma yo'lda",
    text: "Toshkent filiali",
    tone: "blue",
  },
  {
    icon: ShieldCheck,
    title: "Risklar nazoratda",
    text: "AI tekshiruv yakunlandi",
    tone: "gold",
  },
  {
    icon: Users,
    title: "34 yangi mijoz",
    text: "Bugungi segment",
    tone: "cyan",
  },
];

const Activity = () => {
  return (
    <article className="zenix-dashboard__panel dashboard-activity">
      <div className="zenix-dashboard__panel-head">
        <div className="zenix-dashboard__panel-title">
          <span>
            <ActivityIcon size={14} />
            Live activity
          </span>
          <h3>Operatsiyalar oqimi</h3>
        </div>

        <span className="zenix-dashboard__panel-icon">
          <ActivityIcon size={18} />
        </span>
      </div>

      <div className="dashboard-activity__list">
        {activityFeed.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              className={`dashboard-activity__item dashboard-activity__item--${item.tone}`}
              key={item.title}
              style={{ "--item-index": index }}
            >
              <span>
                <Icon size={15} />
              </span>
              <div>
                <strong>{item.title}</strong>
                <small>{item.text}</small>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
};

export default Activity;
