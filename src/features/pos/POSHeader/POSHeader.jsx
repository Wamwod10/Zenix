import {
  ArchiveRestore,
  Clock3,
  ReceiptText,
  Sparkles,
  UserRound,
  Zap,
} from "lucide-react";

import "./POSHeader.scss";

const liveStatus = [
  {
    icon: Clock3,
    label: "Shift: 09:00 - 23:00",
    tone: "success",
  },
  {
    icon: UserRound,
    label: "Kassir: Admin",
    tone: "default",
  },
  {
    icon: Sparkles,
    label: "AI kuzatuv faol",
    tone: "ai",
  },
];

const POSHeader = ({
  metrics = [],
  heldCount = 0,
  recentCount = 0,
  onOpenHeldOrders,
  onOpenRecentSales,
}) => {
  return (
    <section className="pos-header">
      <div className="pos-header__content">
        <span className="pos-header__eyebrow">
          <Zap size={14} />
          Retail POS Workspace
        </span>

        <h1>Tezkor savdo oynasi</h1>

        <div className="pos-header__live">
          {liveStatus.map((item) => {
            const Icon = item.icon;

            return (
              <span
                className={`pos-header__live-item is-${item.tone}`}
                key={item.label}
              >
                <Icon size={13} />
                {item.label}
              </span>
            );
          })}
        </div>
      </div>

      <div className="pos-header__metrics">
        {metrics.map((metric) => (
          <article
            className={`pos-header__metric pos-header__metric--${metric.tone}`}
            key={metric.label}
          >
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}

        <div className="pos-header__buttons">
          <button type="button" onClick={onOpenHeldOrders}>
            <ArchiveRestore size={15} />
            Hold ({heldCount})
          </button>

          <button type="button" onClick={onOpenRecentSales}>
            <ReceiptText size={15} />
            Recent ({recentCount})
          </button>
        </div>
      </div>
    </section>
  );
};

export default POSHeader;
