import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  PackageCheck,
  ShieldAlert,
} from "lucide-react";

import "./StatusBadge.scss";

const badgeMap = {
  healthy: { label: "Bor", icon: CheckCircle2, tone: "success" },
  low: { label: "Kam", icon: AlertTriangle, tone: "warning" },
  out: { label: "Tugagan", icon: ShieldAlert, tone: "danger" },
  reserved: { label: "Band qilingan", icon: Clock3, tone: "info" },
  active: { label: "Faol", icon: CheckCircle2, tone: "success" },
  inactive: { label: "Nofaol", icon: ShieldAlert, tone: "muted" },
  "in-transit": { label: "Yo'lda", icon: Clock3, tone: "info" },
  received: { label: "Qabul qilingan", icon: PackageCheck, tone: "success" },
  partial: { label: "Qisman qabul", icon: AlertTriangle, tone: "warning" },
  delayed: { label: "Kechikkan", icon: AlertTriangle, tone: "danger" },
  "on-time": { label: "O'z vaqtida", icon: CheckCircle2, tone: "success" },
  planned: { label: "Rejalashtirilgan", icon: Clock3, tone: "info" },
  critical: { label: "Muhim", icon: ShieldAlert, tone: "danger" },
  important: { label: "E'tibor kerak", icon: AlertTriangle, tone: "warning" },
  normal: { label: "Sog'lom", icon: CheckCircle2, tone: "success" },
};

const StatusBadge = ({ status, label }) => {
  const item = badgeMap[status] || { label: label || status, icon: CheckCircle2, tone: "muted" };
  const Icon = item.icon;

  return (
    <span className={`warehouse-status warehouse-status--${item.tone}`}>
      <Icon size={13} />
      {label || item.label}
    </span>
  );
};

export default StatusBadge;
