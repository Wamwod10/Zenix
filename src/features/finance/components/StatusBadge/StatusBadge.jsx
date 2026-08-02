import {
  Archive,
  Ban,
  CheckCircle2,
  CircleDashed,
  Clock3,
  FilePenLine,
  RotateCcw,
  Send,
} from "lucide-react";

import { formatStatusLabel } from "../../utils/financeFormatters";

import "./StatusBadge.scss";

const statusIcons = {
  Draft: FilePenLine,
  Pending: Clock3,
  Approved: CheckCircle2,
  Posted: Send,
  Reversed: RotateCcw,
  Cancelled: Ban,
  Archived: Archive,
  danger: Ban,
  warning: CircleDashed,
  success: CheckCircle2,
};

const StatusBadge = ({ status, label }) => {
  const Icon = statusIcons[status] || CircleDashed;

  return (
    <span className={`finance-status finance-status--${String(status).toLowerCase()}`}>
      <Icon size={13} />
      {label || formatStatusLabel(status)}
    </span>
  );
};

export default StatusBadge;
