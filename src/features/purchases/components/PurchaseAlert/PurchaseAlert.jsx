import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

import "./PurchaseAlert.scss";

const TONE_ICONS = {
  info: Info,
  warning: AlertTriangle,
  danger: XCircle,
  success: CheckCircle2,
};

const PurchaseAlert = ({ tone = "info", title, children, className = "" }) => {
  const Icon = TONE_ICONS[tone] || Info;

  return (
    <div
      className={["purchase-alert", `purchase-alert--${tone}`, className]
        .filter(Boolean)
        .join(" ")}
    >
      <Icon size={16} className="purchase-alert__icon" />

      <div className="purchase-alert__body">
        {title && <strong>{title}</strong>}
        <p>{children}</p>
      </div>
    </div>
  );
};

export default PurchaseAlert;
