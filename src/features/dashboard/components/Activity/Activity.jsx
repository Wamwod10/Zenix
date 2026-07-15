import {
  Activity as ActivityIcon,
  ClipboardCheck,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";
import "./Activity.scss";

const fallbackActivityFeed = [
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

const actionLabels = {
  AUTH_LOGIN: "Tizimga kirildi",
  AUTH_REGISTER: "Yangi akkaunt yaratildi",
  AUTH_VERIFY_EMAIL: "Email tasdiqlandi",
  AUTH_RESEND_CODE: "Tasdiqlash kodi yuborildi",
  POS_SALE_CREATED: "Yangi savdo yaratildi",
  POS_SHIFT_OPENED: "Smena ochildi",
};

const toActivity = (items) => {
  if (!items?.length) {
    return fallbackActivityFeed;
  }

  return items.slice(0, 4).map((item, index) => ({
    icon: [ClipboardCheck, Truck, ShieldCheck, Users][index % 4],
    title: actionLabels[item.action] || item.action?.replaceAll("_", " ") || "Operatsiya",
    text: item.userName || new Date(item.createdAt).toLocaleString("uz-UZ"),
    tone: ["green", "blue", "gold", "cyan"][index % 4],
  }));
};

const Activity = ({ items }) => {
  const activityFeed = toActivity(items);

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
              key={`${item.title}-${index}`}
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
