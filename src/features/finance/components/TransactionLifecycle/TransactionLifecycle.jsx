import { Archive, Ban, CheckCircle2, Clock3, FilePenLine, RotateCcw, Send } from "lucide-react";

import "./TransactionLifecycle.scss";

const steps = [
  { id: "Draft", icon: FilePenLine },
  { id: "Pending", icon: Clock3 },
  { id: "Approved", icon: CheckCircle2 },
  { id: "Posted", icon: Send },
  { id: "Reversed", icon: RotateCcw },
  { id: "Cancelled", icon: Ban },
  { id: "Archived", icon: Archive },
];

const TransactionLifecycle = ({ status }) => {
  const activeIndex = steps.findIndex((item) => item.id === status);

  return (
    <ol className="transaction-lifecycle" aria-label="Transaction lifecycle">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const complete = activeIndex >= index && activeIndex <= 3;

        return (
          <li
            key={step.id}
            className={`${status === step.id ? "is-active" : ""} ${complete ? "is-complete" : ""}`}
          >
            <span>
              <Icon size={14} />
            </span>
            <strong>{step.id}</strong>
          </li>
        );
      })}
    </ol>
  );
};

export default TransactionLifecycle;
