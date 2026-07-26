import { Link } from "react-router-dom";
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  History,
  ShoppingBag,
  UserPlus,
} from "lucide-react";

import CRMStateView from "../CRMStateView/CRMStateView";
import CustomerAvatar from "../CustomerAvatar/CustomerAvatar";

import { getCustomerDetailsPath } from "../../config/crmNavigation";
import { formatRelativeDate } from "../../utils/crmFormatters";

import "./DashboardActivityFeed.scss";

const activityIcons = {
  purchase: ShoppingBag,
  "customer-created": UserPlus,
  "debt-reminder": BellRing,
  "task-completed": CheckCircle2,
};

const DashboardActivityFeed = ({ items = [], referenceDate }) => {
  return (
    <section
      className="crm-activity-feed"
      aria-labelledby="crm-activity-feed-title"
    >
      <div className="crm-activity-feed__header">
        <div>
          <span>CRM faoliyati</span>

          <h2 id="crm-activity-feed-title">So‘nggi harakatlar</h2>

          <p>
            Mijozlar, xaridlar, eslatmalar va menejer vazifalaridagi so‘nggi
            o‘zgarishlar.
          </p>
        </div>

        <Link to="/crm/activities">
          Faoliyat tarixini ochish
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>

      {!items.length ? (
        <CRMStateView
          compact
          type="empty"
          icon={History}
          title="Hali faoliyat qayd etilmagan"
          description="Mijoz bilan birinchi aloqa yoki xarid shu yerda ko‘rinadi."
        />
      ) : (
        <ol className="crm-activity-feed__list">
          {items.map((item) => {
            const ActivityIcon = activityIcons[item.type] || History;

            return (
              <li
                className={`crm-activity-feed__item is-${item.tone}`}
                key={item.id}
              >
                <span
                  className="crm-activity-feed__timeline-icon"
                  aria-hidden="true"
                >
                  <ActivityIcon size={16} strokeWidth={1.9} />
                </span>

                <div className="crm-activity-feed__content">
                  <div className="crm-activity-feed__title-row">
                    <h3>{item.title}</h3>

                    <time dateTime={item.createdAt}>
                      {formatRelativeDate(item.createdAt, referenceDate)}
                    </time>
                  </div>

                  <p>{item.description}</p>

                  {item.customerId && item.customerName && (
                    <Link
                      className="crm-activity-feed__customer"
                      to={getCustomerDetailsPath(item.customerId)}
                    >
                      <CustomerAvatar fullName={item.customerName} size="xs" />

                      <span>{item.customerName}</span>

                      <ArrowRight size={13} aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
};

export default DashboardActivityFeed;
