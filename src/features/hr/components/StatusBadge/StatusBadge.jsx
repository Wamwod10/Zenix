import "./StatusBadge.scss";

const labels = {
  active: "Ishda",
  leave: "Ta'tilda",
  sick: "Kasal",
  late: "Kechikkan",
  terminated: "Bo'shagan",
  normal: "Normal",
  warning: "Warning",
  critical: "Critical",
  expired: "Expired",
  archived: "Archived",
  Draft: "Draft",
  Calculated: "Calculated",
  Approved: "Approved",
  Paid: "Paid",
  Pending: "Pending",
  Rejected: "Rejected",
  Completed: "Completed",
  New: "New",
  "In Progress": "In Progress",
};

const StatusBadge = ({ status, label }) => (
  <span className={`hr-status hr-status--${String(status).toLowerCase().replace(/\s+/g, "-")}`}>
    {label || labels[status] || status}
  </span>
);

export default StatusBadge;
