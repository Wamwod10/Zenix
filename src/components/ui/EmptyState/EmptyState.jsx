import "./EmptyState.scss";

export function EmptyState({ title = "No data", description, icon: Icon, action }) {
  return (
    <div className="ui-empty-state">
      {Icon && (
        <div className="ui-empty-state__icon">
          <Icon size={40} />
        </div>
      )}
      <p className="ui-empty-state__title">{title}</p>
      {description && <p className="ui-empty-state__description">{description}</p>}
      {action && <div className="ui-empty-state__action">{action}</div>}
    </div>
  );
}
