import "./ModuleHubHeader.scss";

const ModuleHubHeader = ({
  id,
  title,
  description,
}) => {
  return (
    <header className="module-hub-header">
      <div className="module-hub-header__content">
        <div className="module-hub-header__heading">
          <h1 id={id}>{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>
      </div>
    </header>
  );
};

export default ModuleHubHeader;
