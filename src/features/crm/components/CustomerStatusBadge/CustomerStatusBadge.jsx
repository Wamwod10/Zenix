import {
  Archive,
  Ban,
  CheckCircle2,
  CircleDashed,
  UserRoundSearch,
} from "lucide-react";

import { formatCustomerStatus } from "../../utils/crmFormatters";

import "./CustomerStatusBadge.scss";

const statusConfiguration = {
  active: {
    icon: CheckCircle2,
    tone: "success",
  },
  inactive: {
    icon: CircleDashed,
    tone: "neutral",
  },
  prospect: {
    icon: UserRoundSearch,
    tone: "warning",
  },
  lead: {
    icon: UserRoundSearch,
    tone: "warning",
  },
  blocked: {
    icon: Ban,
    tone: "danger",
  },
  archived: {
    icon: Archive,
    tone: "neutral",
  },
};

const CustomerStatusBadge = ({
  status,
  label,
  size = "md",
  className = "",
}) => {
  const normalizedStatus = String(status || "inactive").toLowerCase();

  const configuration =
    statusConfiguration[normalizedStatus] || statusConfiguration.inactive;

  const Icon = configuration.icon;
  const resolvedLabel = label || formatCustomerStatus(normalizedStatus);

  const classes = [
    "crm-customer-status",
    `crm-customer-status--${configuration.tone}`,
    `crm-customer-status--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} aria-label={`Mijoz holati: ${resolvedLabel}`}>
      <Icon size={13} strokeWidth={2} aria-hidden="true" />
      <span>{resolvedLabel}</span>
    </span>
  );
};

export default CustomerStatusBadge;
