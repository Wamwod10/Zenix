// PDF 19: Purchase Timeline — PO ning barcha hodisalari vaqt chizig'ida.

import {
  Ban,
  CheckCircle2,
  CircleDot,
  FilePlus2,
  PackageCheck,
  Receipt,
  Send,
  Undo2,
  Wallet,
  XCircle,
} from "lucide-react";

import { formatPurchaseDate } from "../../utils/purchaseMoney";

import "./PurchaseTimeline.scss";

const EVENT_ICONS = {
  created: FilePlus2,
  submitted: Send,
  approved: CheckCircle2,
  rejected: XCircle,
  sent: Send,
  received: PackageCheck,
  return_requested: Undo2,
  returned: Undo2,
  invoiced: Receipt,
  payment: Wallet,
  paid: Wallet,
  cancelled: Ban,
  closed: CircleDot,
};

const EVENT_TONES = {
  approved: "success",
  received: "success",
  paid: "success",
  rejected: "danger",
  cancelled: "danger",
  return_requested: "warning",
  returned: "warning",
};

const PurchaseTimeline = ({ events = [] }) => {
  if (!events.length) {
    return <p className="purchase-timeline__empty">Hodisalar hali yo'q.</p>;
  }

  return (
    <ol className="purchase-timeline">
      {[...events]
        .sort((a, b) => new Date(a.at) - new Date(b.at))
        .map((event) => {
          const Icon = EVENT_ICONS[event.type] || CircleDot;
          const tone = EVENT_TONES[event.type] || "info";

          return (
            <li className="purchase-timeline__item" key={event.id}>
              <span
                className={`purchase-timeline__marker purchase-timeline__marker--${tone}`}
              >
                <Icon size={14} />
              </span>

              <div className="purchase-timeline__content">
                <strong>{event.label}</strong>
                <small>
                  {event.actor} · {formatPurchaseDate(event.at, { withTime: true })}
                </small>
              </div>
            </li>
          );
        })}
    </ol>
  );
};

export default PurchaseTimeline;
