import {
  Database,
  Inbox,
  LockKeyhole,
  RefreshCw,
  SearchX,
  TriangleAlert,
} from "lucide-react";

import "./CRMStateView.scss";

const stateDefaults = {
  empty: {
    icon: Inbox,
    eyebrow: "Hozircha bo‘sh",
    title: "Bu yerda hali ma’lumot yo‘q",
    description:
      "Birinchi ma’lumotni qo‘shganingizdan keyin u shu yerda ko‘rinadi.",
  },

  search: {
    icon: SearchX,
    eyebrow: "Natija topilmadi",
    title: "Qidiruv bo‘yicha mijoz topilmadi",
    description:
      "Qidiruv matnini tekshiring yoki faol filtrlarni tozalab qayta urinib ko‘ring.",
  },

  error: {
    icon: TriangleAlert,
    eyebrow: "Yuklashda muammo",
    title: "Ma’lumotlarni olib bo‘lmadi",
    description:
      "Internet aloqasini tekshiring va ma’lumotlarni qayta yuklashga urinib ko‘ring.",
  },

  permission: {
    icon: LockKeyhole,
    eyebrow: "Ruxsat talab qilinadi",
    title: "Bu ma’lumot siz uchun cheklangan",
    description:
      "Moliyaviy yoki maxfiy mijoz ma’lumotlarini ko‘rish uchun administrator ruxsati kerak.",
  },
};

const CRMStateView = ({
  type = "empty",
  eyebrow,
  title,
  description,
  icon,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  action,
  secondaryAction,
  compact = false,
  loadingRows = 4,
  className = "",
}) => {
  if (type === "loading") {
    const safeRowCount = Math.min(Math.max(Number(loadingRows) || 4, 1), 8);

    return (
      <div
        className={[
          "crm-state-view",
          "crm-state-view--loading",
          compact ? "crm-state-view--compact" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label="CRM ma’lumotlari yuklanmoqda"
      >
        <div className="crm-state-view__loading-head">
          <span className="crm-state-view__skeleton crm-state-view__skeleton--icon" />

          <div>
            <span className="crm-state-view__skeleton crm-state-view__skeleton--title" />
            <span className="crm-state-view__skeleton crm-state-view__skeleton--text" />
          </div>
        </div>

        <div className="crm-state-view__loading-list" aria-hidden="true">
          {Array.from({ length: safeRowCount }, (_, index) => (
            <div className="crm-state-view__loading-row" key={index}>
              <span className="crm-state-view__skeleton crm-state-view__skeleton--avatar" />

              <div>
                <span className="crm-state-view__skeleton crm-state-view__skeleton--row-title" />
                <span className="crm-state-view__skeleton crm-state-view__skeleton--row-text" />
              </div>

              <span className="crm-state-view__skeleton crm-state-view__skeleton--value" />
            </div>
          ))}
        </div>

        <span className="crm-state-view__sr-only">
          CRM ma’lumotlari yuklanmoqda
        </span>
      </div>
    );
  }

  const selectedState = stateDefaults[type] || stateDefaults.empty;
  const StateIcon = icon || selectedState.icon || Database;

  const resolvedEyebrow = eyebrow || selectedState.eyebrow;
  const resolvedTitle = title || selectedState.title;
  const resolvedDescription = description || selectedState.description;

  const role = type === "error" ? "alert" : "status";

  return (
    <section
      className={[
        "crm-state-view",
        `crm-state-view--${type}`,
        compact ? "crm-state-view--compact" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role={role}
      aria-live={type === "error" ? "assertive" : "polite"}
    >
      <div className="crm-state-view__glow" aria-hidden="true" />

      <div className="crm-state-view__icon" aria-hidden="true">
        <StateIcon size={25} strokeWidth={1.75} />
      </div>

      <div className="crm-state-view__content">
        {resolvedEyebrow && (
          <span className="crm-state-view__eyebrow">{resolvedEyebrow}</span>
        )}

        <h2>{resolvedTitle}</h2>

        {resolvedDescription && <p>{resolvedDescription}</p>}
      </div>

      {(action ||
        secondaryAction ||
        (actionLabel && onAction) ||
        (secondaryActionLabel && onSecondaryAction)) && (
        <div className="crm-state-view__actions">
          {action ||
            (actionLabel && onAction && (
              <button
                className="crm-state-view__action crm-state-view__action--primary"
                type="button"
                onClick={onAction}
              >
                {type === "error" && <RefreshCw size={15} aria-hidden="true" />}

                {actionLabel}
              </button>
            ))}

          {secondaryAction ||
            (secondaryActionLabel && onSecondaryAction && (
              <button
                className="crm-state-view__action crm-state-view__action--secondary"
                type="button"
                onClick={onSecondaryAction}
              >
                {secondaryActionLabel}
              </button>
            ))}
        </div>
      )}
    </section>
  );
};

export default CRMStateView;
