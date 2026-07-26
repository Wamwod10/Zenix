import { useMemo, useState } from "react";
import {
  Activity,
  Banknote,
  BellRing,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  FileText,
  Mail,
  MessageSquare,
  NotebookPen,
  Phone,
  Pin,
  Plus,
  ReceiptText,
  RefreshCcw,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Tag,
  UserPlus,
  Users,
} from "lucide-react";

import { crmActivities, crmActivityTypes } from "../../data/crmActivities";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatRelativeDate,
} from "../../utils/crmFormatters";

import "./CustomerTimeline.scss";

const INITIAL_VISIBLE_COUNT = 6;
const LOAD_MORE_COUNT = 5;

const activityIcons = {
  call: Phone,
  email: Mail,
  message: MessageSquare,
  meeting: Users,
  note: NotebookPen,
  purchase: ShoppingBag,
  quotation: FileText,
  reservation: CalendarCheck,
  payment: Banknote,
  refund: RotateCcw,
  debt: CircleDollarSign,
  task: CheckCircle2,
  reminder: BellRing,
  status: RefreshCcw,
  created: UserPlus,
  tag: Tag,
};

const activityGroups = [
  {
    id: "all",
    label: "Barchasi",
  },
  {
    id: "communication",
    label: "Aloqa",
  },
  {
    id: "sales",
    label: "Savdo",
  },
  {
    id: "finance",
    label: "Moliya",
  },
  {
    id: "tasks",
    label: "Vazifalar",
  },
  {
    id: "system",
    label: "Tizim",
  },
];

const statusLabels = {
  completed: "Yakunlangan",
  pending: "Kutilmoqda",
  cancelled: "Bekor qilingan",
  failed: "Bajarilmadi",
};

const directionLabels = {
  incoming: "Kiruvchi",
  outgoing: "Chiquvchi",
};

const outcomeLabels = {
  answered: "Javob berildi",
  missed: "Javobsiz",
  delivered: "Yetkazildi",
  opened: "Ochildi",
  read: "O‘qildi",
};

const getActivityGroup = (activityType) =>
  crmActivityTypes.find((type) => type.id === activityType)?.group ?? "system";

const getActorName = (actor) => {
  if (!actor) {
    return "ZENIX tizimi";
  }

  if (typeof actor === "string") {
    return actor;
  }

  return actor.name ?? actor.fullName ?? "ZENIX tizimi";
};

const getActorRole = (actor) => {
  if (!actor || typeof actor === "string") {
    return null;
  }

  return actor.role ?? null;
};

const getDateGroupKey = (dateValue) => {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "unknown";
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

const formatTime = (dateValue) => {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Vaqt noma’lum";
  }

  return new Intl.DateTimeFormat("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getDateHeading = (dateValue) => {
  const targetDate = new Date(dateValue);

  if (Number.isNaN(targetDate.getTime())) {
    return "Sana noma’lum";
  }

  const today = new Date();
  const yesterday = new Date();

  yesterday.setDate(today.getDate() - 1);

  const targetKey = getDateGroupKey(targetDate);
  const todayKey = getDateGroupKey(today);
  const yesterdayKey = getDateGroupKey(yesterday);

  if (targetKey === todayKey) {
    return "Bugun";
  }

  if (targetKey === yesterdayKey) {
    return "Kecha";
  }

  return formatDate(targetDate);
};

const CustomerTimeline = ({
  customerId,
  activities = crmActivities,
  initialVisibleCount = INITIAL_VISIBLE_COUNT,
  onAddActivity,
}) => {
  const [activeGroup, setActiveGroup] = useState("all");
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);

  const customerActivities = useMemo(
    () =>
      activities
        .filter(
          (activity) => String(activity.customerId) === String(customerId),
        )
        .sort(
          (firstActivity, secondActivity) =>
            new Date(secondActivity.createdAt).getTime() -
            new Date(firstActivity.createdAt).getTime(),
        ),
    [activities, customerId],
  );

  const groupCounts = useMemo(() => {
    const counts = {
      all: customerActivities.length,
    };

    customerActivities.forEach((activity) => {
      const group = getActivityGroup(activity.type);

      counts[group] = (counts[group] ?? 0) + 1;
    });

    return counts;
  }, [customerActivities]);

  const filteredActivities = useMemo(() => {
    if (activeGroup === "all") {
      return customerActivities;
    }

    return customerActivities.filter(
      (activity) => getActivityGroup(activity.type) === activeGroup,
    );
  }, [activeGroup, customerActivities]);

  const visibleActivities = filteredActivities.slice(0, visibleCount);

  const groupedActivities = useMemo(
    () =>
      visibleActivities.reduce((groups, activity) => {
        const dateKey = getDateGroupKey(activity.createdAt);

        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }

        groups[dateKey].push(activity);

        return groups;
      }, {}),
    [visibleActivities],
  );

  const hasMore = visibleActivities.length < filteredActivities.length;

  const handleGroupChange = (groupId) => {
    setActiveGroup(groupId);
    setVisibleCount(initialVisibleCount);
  };

  const handleLoadMore = () => {
    setVisibleCount((currentCount) => currentCount + LOAD_MORE_COUNT);
  };

  return (
    <section
      className="crm-customer-timeline"
      aria-labelledby="crm-customer-timeline-title"
    >
      <div className="crm-customer-timeline__header">
        <div className="crm-customer-timeline__heading">
          <span className="crm-customer-timeline__heading-icon">
            <Activity aria-hidden="true" />
          </span>

          <div>
            <h2 id="crm-customer-timeline-title">Mijoz faoliyati</h2>

            <p>Aloqa, savdo, moliya va tizim hodisalarining yagona tarixi</p>
          </div>
        </div>

        {typeof onAddActivity === "function" ? (
          <button
            className="crm-customer-timeline__add"
            type="button"
            onClick={onAddActivity}
          >
            <Plus aria-hidden="true" />
            <span>Faoliyat qo‘shish</span>
          </button>
        ) : null}
      </div>

      <div
        className="crm-customer-timeline__filters"
        aria-label="Faoliyat turini filtrlash"
      >
        {activityGroups.map((group) => (
          <button
            key={group.id}
            className={`crm-customer-timeline__filter ${
              activeGroup === group.id
                ? "crm-customer-timeline__filter--active"
                : ""
            }`}
            type="button"
            aria-pressed={activeGroup === group.id}
            onClick={() => handleGroupChange(group.id)}
          >
            <span>{group.label}</span>
            <small>{groupCounts[group.id] ?? 0}</small>
          </button>
        ))}
      </div>

      {filteredActivities.length > 0 ? (
        <>
          <div className="crm-customer-timeline__content">
            {Object.entries(groupedActivities).map(
              ([dateKey, dateActivities]) => (
                <section
                  className="crm-customer-timeline__date-group"
                  key={dateKey}
                  aria-labelledby={`crm-timeline-date-${dateKey}`}
                >
                  <div className="crm-customer-timeline__date-heading">
                    <span>
                      <Clock3 aria-hidden="true" />
                    </span>

                    <h3 id={`crm-timeline-date-${dateKey}`}>
                      {getDateHeading(dateActivities[0]?.createdAt)}
                    </h3>

                    <small>{dateActivities.length} ta hodisa</small>
                  </div>

                  <ol className="crm-customer-timeline__list">
                    {dateActivities.map((activity) => {
                      const Icon = activityIcons[activity.type] ?? Sparkles;

                      const actorName = getActorName(activity.actor);

                      const actorRole = getActorRole(activity.actor);

                      return (
                        <li
                          className={`crm-customer-timeline__item crm-customer-timeline__item--${activity.type}`}
                          key={activity.id}
                        >
                          <div className="crm-customer-timeline__rail">
                            <span className="crm-customer-timeline__activity-icon">
                              <Icon aria-hidden="true" />
                            </span>
                          </div>

                          <article className="crm-customer-timeline__activity">
                            <div className="crm-customer-timeline__activity-header">
                              <div className="crm-customer-timeline__activity-title">
                                <div>
                                  <h4>{activity.title}</h4>

                                  {activity.pinned ? (
                                    <span
                                      className="crm-customer-timeline__pinned"
                                      title="Muhim faoliyat"
                                    >
                                      <Pin aria-hidden="true" />
                                      Muhim
                                    </span>
                                  ) : null}
                                </div>

                                <p>{activity.description}</p>
                              </div>

                              <time
                                dateTime={activity.createdAt}
                                title={formatDateTime(activity.createdAt)}
                              >
                                {formatTime(activity.createdAt)}
                              </time>
                            </div>

                            {activity.amount !== undefined ? (
                              <div className="crm-customer-timeline__amount">
                                <ReceiptText aria-hidden="true" />
                                <span>Qiymati</span>
                                <strong>
                                  {formatCurrency(activity.amount)}
                                </strong>
                              </div>
                            ) : null}

                            {activity.details?.length > 0 ? (
                              <dl className="crm-customer-timeline__details">
                                {activity.details.map((detail) => (
                                  <div key={`${activity.id}-${detail.label}`}>
                                    <dt>{detail.label}</dt>
                                    <dd>{detail.value}</dd>
                                  </div>
                                ))}
                              </dl>
                            ) : null}

                            <footer className="crm-customer-timeline__activity-footer">
                              <div className="crm-customer-timeline__actor">
                                <span>
                                  {actorName
                                    .split(" ")
                                    .map((word) => word[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </span>

                                <div>
                                  <strong>{actorName}</strong>

                                  {actorRole ? (
                                    <small>{actorRole}</small>
                                  ) : null}
                                </div>
                              </div>

                              <div className="crm-customer-timeline__meta">
                                {activity.direction ? (
                                  <span>
                                    {directionLabels[activity.direction] ??
                                      activity.direction}
                                  </span>
                                ) : null}

                                {activity.outcome ? (
                                  <span>
                                    {outcomeLabels[activity.outcome] ??
                                      activity.outcome}
                                  </span>
                                ) : null}

                                {activity.relatedEntity ? (
                                  <span>{activity.relatedEntity.label}</span>
                                ) : null}

                                {activity.status ? (
                                  <span
                                    className={`crm-customer-timeline__status crm-customer-timeline__status--${activity.status}`}
                                  >
                                    {statusLabels[activity.status]}
                                  </span>
                                ) : null}

                                <span>
                                  {formatRelativeDate(activity.createdAt)}
                                </span>
                              </div>
                            </footer>
                          </article>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              ),
            )}
          </div>

          {hasMore ? (
            <button
              className="crm-customer-timeline__load-more"
              type="button"
              onClick={handleLoadMore}
            >
              <ChevronDown aria-hidden="true" />

              <span>Yana ko‘rsatish</span>

              <small>
                {filteredActivities.length - visibleActivities.length} ta qoldi
              </small>
            </button>
          ) : null}
        </>
      ) : (
        <div className="crm-customer-timeline__empty">
          <span>
            <Activity aria-hidden="true" />
          </span>

          <h3>Bu turdagi faoliyat topilmadi</h3>

          <p>
            Boshqa filtrni tanlang yoki mijoz uchun yangi faoliyat yarating.
          </p>

          {activeGroup !== "all" ? (
            <button type="button" onClick={() => handleGroupChange("all")}>
              Barcha faoliyatlarni ko‘rsatish
            </button>
          ) : null}
        </div>
      )}
    </section>
  );
};

export default CustomerTimeline;
