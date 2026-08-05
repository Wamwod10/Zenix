import { Inbox } from "lucide-react";
import "./ModuleHubEmptyState.scss";

const ModuleHubEmptyState = ({ title, description, actionLabel, onAction }) => (
  <section className="module-hub-empty-state" role={onAction ? "alert" : "status"}>
    <span className="module-hub-empty-state__icon" aria-hidden="true">
      <Inbox size={20} />
    </span>
    <div>
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
    </div>
    {onAction && actionLabel ? (
      <button type="button" onClick={onAction}>
        {actionLabel}
      </button>
    ) : null}
  </section>
);

export default ModuleHubEmptyState;
