import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import "./ModuleHubCard.scss";

const ModuleHubCardContent = ({ item }) => {
  const Icon = item.icon;

  return (
    <>
      <span className="module-hub-card__shine" aria-hidden="true" />

      <span className="module-hub-card__icon" aria-hidden="true">
        {Icon ? <Icon size={23} strokeWidth={1.9} /> : <ArrowRight size={23} strokeWidth={1.9} />}
      </span>

      <span className="module-hub-card__copy">
        <strong>{item.title}</strong>
        {item.description ? <span>{item.description}</span> : null}
      </span>

      <span className="module-hub-card__open" aria-hidden="true">
        <ArrowRight size={15} strokeWidth={2} />
      </span>
    </>
  );
};

const ModuleHubCard = ({ item }) => {
  const disabled = Boolean(item.state?.disabled);
  const reasonId = item.state?.reason ? `module-hub-card-${item.id}-reason` : undefined;
  const classes = [
    "module-hub-card",
    disabled ? "module-hub-card--disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (!disabled && item.route) {
    return (
      <Link className={classes} to={item.route} aria-label={`${item.title} sahifasini ochish`}>
        <ModuleHubCardContent item={item} />
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      aria-disabled="true"
      aria-describedby={reasonId}
      title={item.state?.reason}
      aria-label={`${item.title}. ${item.state?.reason || "Hozircha ochilmaydi."}`}
      onClick={(event) => event.preventDefault()}
    >
      <ModuleHubCardContent item={{ ...item, reasonId }} />
    </button>
  );
};

export default ModuleHubCard;
