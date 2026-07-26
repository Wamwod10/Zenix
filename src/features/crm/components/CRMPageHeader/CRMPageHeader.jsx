import { useId } from "react";
import { Sparkles } from "lucide-react";

import "./CRMPageHeader.scss";

const CRMPageHeader = ({
  eyebrow = "ZENIX CRM",
  title,
  description,
  badge = "AI-native workspace",
  meta = [],
  actions,
  className = "",
}) => {
  const generatedTitleId = useId();
  const titleId = `crm-page-title-${generatedTitleId.replace(/:/g, "")}`;

  const classes = ["crm-page-header", className].filter(Boolean).join(" ");

  return (
    <header className={classes} aria-labelledby={titleId}>
      <div className="crm-page-header__glow" aria-hidden="true" />
      <div
        className="crm-page-header__orb crm-page-header__orb--primary"
        aria-hidden="true"
      />
      <div
        className="crm-page-header__orb crm-page-header__orb--secondary"
        aria-hidden="true"
      />

      <div className="crm-page-header__content">
        <div className="crm-page-header__eyebrow-row">
          {eyebrow && (
            <span className="crm-page-header__eyebrow">
              <span
                className="crm-page-header__eyebrow-dot"
                aria-hidden="true"
              />
              {eyebrow}
            </span>
          )}

          {badge && (
            <span className="crm-page-header__badge">
              <Sparkles size={13} strokeWidth={2} aria-hidden="true" />
              {badge}
            </span>
          )}
        </div>

        <div className="crm-page-header__heading">
          <h1 id={titleId}>{title}</h1>

          {description && <p>{description}</p>}
        </div>

        {meta.length > 0 && (
          <ul
            className="crm-page-header__meta"
            aria-label="Sahifa ma’lumotlari"
          >
            {meta.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.id || item.label}>
                  {Icon && (
                    <span
                      className="crm-page-header__meta-icon"
                      aria-hidden="true"
                    >
                      <Icon size={14} strokeWidth={2} />
                    </span>
                  )}

                  <span className="crm-page-header__meta-label">
                    {item.label}
                  </span>

                  {item.value !== undefined && item.value !== null && (
                    <strong>{item.value}</strong>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {actions && (
        <div className="crm-page-header__actions" aria-label="Sahifa amallari">
          {actions}
        </div>
      )}
    </header>
  );
};

export default CRMPageHeader;
