import "./PageHeader.scss";

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <section className="page-header">
      <div>
        {eyebrow && <p className="page-header__eyebrow">{eyebrow}</p>}
        <h1 className="page-header__title">{title}</h1>
        {description && <p className="page-header__description">{description}</p>}
      </div>

      {action && <div className="page-header__action">{action}</div>}
    </section>
  );
}