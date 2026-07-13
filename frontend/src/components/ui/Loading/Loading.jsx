import "./Loading.scss";

export function Loading({ label = "Loading..." }) {
  return (
    <div className="ui-loading" role="status" aria-live="polite">
      <span className="ui-loading__spinner" />
      <span>{label}</span>
    </div>
  );
}