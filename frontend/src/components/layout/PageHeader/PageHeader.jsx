import "./PageHeader.scss";

const PageHeader = ({ eyebrow, title, description, actions }) => {
  return (
    <div className="zenix-page-header">
      <div className="zenix-page-header__content">
        {eyebrow && <span>{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>

      {actions && <div className="zenix-page-header__actions">{actions}</div>}
    </div>
  );
};

export default PageHeader;
