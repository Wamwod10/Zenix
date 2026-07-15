import {
  Activity as ActivityIcon,
  KeyRound,
  MailCheck,
  Settings2,
  ShieldCheck,
  UserPlus,
  Wallet,
} from "lucide-react";
import "./Activity.scss";
// ✅ BACKEND INTEGRATION: real faoliyat oqimi (audit_logs jadvalidan)
import { useDashboardSummaryQuery } from "../../dashboardApi";

// Backend action kodlarini o'zbekcha matnga o'girish
const actionLabels = {
  AUTH_REGISTER: { title: "Yangi akkaunt yaratildi", icon: UserPlus, tone: "green" },
  AUTH_VERIFY_EMAIL: { title: "Email tasdiqlandi", icon: MailCheck, tone: "blue" },
  AUTH_LOGIN: { title: "Tizimga kirildi", icon: KeyRound, tone: "cyan" },
  AUTH_RESEND_CODE: { title: "Tasdiqlash kodi yuborildi", icon: MailCheck, tone: "gold" },
  ONBOARDING_BUSINESS_TYPE: { title: "Biznes turi tanlandi", icon: Settings2, tone: "blue" },
  ONBOARDING_BUSINESS_SETUP: { title: "Kompaniya ma'lumotlari saqlandi", icon: Settings2, tone: "green" },
  ONBOARDING_PLAN_SELECTED: { title: "Tarif tanlandi", icon: ShieldCheck, tone: "gold" },
  ONBOARDING_CARD_SAVED: { title: "To'lov kartasi qo'shildi", icon: Wallet, tone: "cyan" },
  POS_SALE_CREATED: { title: "Yangi savdo", icon: Wallet, tone: "green" },
  POS_RETURN_CREATED: { title: "Qaytarish rasmiylashtirildi", icon: ShieldCheck, tone: "gold" },
  POS_SALE_VOIDED: { title: "Savdo bekor qilindi", icon: ShieldCheck, tone: "gold" },
  POS_SHIFT_OPENED: { title: "Smena ochildi", icon: KeyRound, tone: "blue" },
  POS_SHIFT_CLOSED: { title: "Smena yopildi", icon: KeyRound, tone: "cyan" },
};

function timeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "Hozirgina";
  if (minutes < 60) return `${minutes} daqiqa oldin`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} soat oldin`;

  return `${Math.floor(hours / 24)} kun oldin`;
}

const Activity = () => {
  const { data } = useDashboardSummaryQuery();
  const feed = data?.activity ?? [];

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
        {feed.length === 0 && (
          <div className="dashboard-activity__item dashboard-activity__item--blue">
            <span>
              <ActivityIcon size={15} />
            </span>
            <div>
              <strong>Hozircha faoliyat yo'q</strong>
              <small>Amallar shu yerda ko'rinadi</small>
            </div>
          </div>
        )}

        {feed.slice(0, 6).map((item, index) => {
          const meta = actionLabels[item.action] ?? {
            title: item.action,
            icon: ActivityIcon,
            tone: "blue",
          };
          const Icon = meta.icon;

          return (
            <div
              className={`dashboard-activity__item dashboard-activity__item--${meta.tone}`}
              key={item.id}
              style={{ "--item-index": index }}
            >
              <span>
                <Icon size={15} />
              </span>
              <div>
                <strong>{meta.title}</strong>
                <small>
                  {item.userName ? `${item.userName} · ` : ""}
                  {timeAgo(item.createdAt)}
                </small>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
};

export default Activity;
