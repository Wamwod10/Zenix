import "./SettingsSectionCard.scss";

const SettingsSectionCard = ({ eyebrow, title, description, action, children, className = "" }) => (
  <section className={`settings-section-card ${className}`}>
    <header className="settings-section-card__head">
      <div>
        {eyebrow && <span>{eyebrow}</span>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </header>
    {children}
  </section>
);

export default SettingsSectionCard;
