import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CakeSlice,
  Crown,
  HandCoins,
  ShieldAlert,
} from "lucide-react";

import CRMStateView from "../CRMStateView/CRMStateView";
import CustomerAvatar from "../CustomerAvatar/CustomerAvatar";

import { getCustomerDetailsPath } from "../../config/crmNavigation";
import {
  formatCurrency,
  formatDate,
  formatLoyaltyLevel,
  formatRelativeDate,
} from "../../utils/crmFormatters";

import "./DashboardCustomerPanels.scss";

const panelTabs = [
  {
    id: "top",
    label: "Top mijozlar",
    icon: Crown,
  },
  {
    id: "debt",
    label: "Qarzdorlar",
    icon: HandCoins,
  },
  {
    id: "risk",
    label: "Churn xavfi",
    icon: ShieldAlert,
  },
  {
    id: "birthdays",
    label: "Tug‘ilgan kunlar",
    icon: CakeSlice,
  },
];

const giftStatusLabels = {
  ready: "Sovg‘a tayyor",
  pending: "Kutilmoqda",
  sent: "Yuborilgan",
};

const channelLabels = {
  telegram: "Telegram",
  sms: "SMS",
  email: "Email",
  whatsapp: "WhatsApp",
  call: "Qo‘ng‘iroq",
};

const DashboardCustomerPanels = ({
  topCustomers = [],
  debtors = [],
  churnRisks = [],
  birthdays = [],
  referenceDate,
}) => {
  const tabRefs = useRef([]);
  const [activeTab, setActiveTab] = useState("top");

  const dataByTab = {
    top: topCustomers,
    debt: debtors,
    risk: churnRisks,
    birthdays,
  };

  const activeItems = dataByTab[activeTab] || [];

  const handleTabKeyDown = (event, currentIndex) => {
    let nextIndex = currentIndex;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % panelTabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + panelTabs.length) % panelTabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = panelTabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();

    const nextTab = panelTabs[nextIndex];

    setActiveTab(nextTab.id);
    tabRefs.current[nextIndex]?.focus();
  };

  const renderTopCustomer = (customer) => (
    <Link
      className="crm-customer-panels__row crm-customer-panels__row--top"
      key={customer.id}
      to={getCustomerDetailsPath(customer.id)}
    >
      <CustomerAvatar
        fullName={customer.fullName}
        initials={customer.initials}
        status={customer.status}
        size="md"
      />

      <div className="crm-customer-panels__identity">
        <strong>{customer.fullName}</strong>
        <span>{customer.company || customer.phone}</span>

        <div className="crm-customer-panels__inline-meta">
          <span className="is-loyalty">
            {formatLoyaltyLevel(customer.loyaltyLevel)}
          </span>
          <span>{customer.orderCount} ta xarid</span>
        </div>
      </div>

      <div className="crm-customer-panels__value">
        <strong>{formatCurrency(customer.totalSpent)}</strong>
        <span>LTV: {formatCurrency(customer.ltv, { compact: true })}</span>
      </div>

      <ArrowRight
        className="crm-customer-panels__arrow"
        size={15}
        aria-hidden="true"
      />
    </Link>
  );

  const renderDebtor = (customer) => (
    <article
      className="crm-customer-panels__row crm-customer-panels__row--debt"
      key={customer.id}
    >
      <CustomerAvatar
        fullName={customer.fullName}
        initials={customer.initials}
        status="active"
        size="md"
      />

      <div className="crm-customer-panels__identity">
        <strong>{customer.fullName}</strong>
        <span>{customer.company || customer.phone}</span>

        <div className="crm-customer-panels__inline-meta">
          <span
            className={customer.overdueDays > 0 ? "is-overdue" : "is-on-time"}
          >
            {customer.overdueDays > 0
              ? `${customer.overdueDays} kun kechikkan`
              : `${formatDate(customer.dueDate, {
                  short: true,
                })} gacha`}
          </span>

          <span>{customer.assignedManager}</span>
        </div>
      </div>

      <div className="crm-customer-panels__value is-debt">
        <strong>{formatCurrency(customer.debt)}</strong>
        <span>
          Limit:{" "}
          {formatCurrency(customer.debtLimit, {
            compact: true,
          })}
        </span>
      </div>

      <Link
        className="crm-customer-panels__row-action"
        to={`/crm/activities?compose=debt-reminder&customer=${encodeURIComponent(
          customer.id,
        )}`}
        aria-label={`${customer.fullName} uchun qarz eslatmasi yaratish`}
      >
        Eslatish
      </Link>
    </article>
  );

  const renderChurnRisk = (customer) => (
    <article
      className="crm-customer-panels__row crm-customer-panels__row--risk"
      key={customer.id}
    >
      <CustomerAvatar
        fullName={customer.fullName}
        initials={customer.initials}
        status="inactive"
        size="md"
      />

      <div className="crm-customer-panels__identity">
        <strong>{customer.fullName}</strong>
        <span>{customer.reason}</span>

        <div className="crm-customer-panels__inline-meta">
          <span className="is-risk">{customer.churnProbability}% xavf</span>

          <span>
            {formatRelativeDate(customer.lastPurchaseAt, referenceDate)}
          </span>
        </div>
      </div>

      <div className="crm-customer-panels__value">
        <strong>
          {formatCurrency(customer.estimatedLtv, {
            compact: true,
          })}
        </strong>
        <span>Taxminiy LTV</span>
      </div>

      <Link
        className="crm-customer-panels__row-action"
        to={`/crm/activities?compose=follow-up&customer=${encodeURIComponent(
          customer.id,
        )}`}
        aria-label={`${customer.fullName} uchun follow-up yaratish`}
      >
        Bog‘lanish
      </Link>
    </article>
  );

  const renderBirthday = (customer) => (
    <article
      className="crm-customer-panels__row crm-customer-panels__row--birthday"
      key={customer.id}
    >
      <CustomerAvatar
        fullName={customer.fullName}
        initials={customer.initials}
        status="active"
        size="md"
      />

      <div className="crm-customer-panels__identity">
        <strong>{customer.fullName}</strong>
        <span>{customer.suggestedGift}</span>

        <div className="crm-customer-panels__inline-meta">
          <span className={`is-gift-${customer.giftStatus}`}>
            {giftStatusLabels[customer.giftStatus] || customer.giftStatus}
          </span>

          <span>
            {channelLabels[customer.preferredChannel] ||
              customer.preferredChannel}
          </span>
        </div>
      </div>

      <div className="crm-customer-panels__value">
        <strong>{formatLoyaltyLevel(customer.loyaltyLevel)}</strong>
        <span>{formatDate(customer.birthday)}</span>
      </div>

      <Link
        className="crm-customer-panels__row-action"
        to={`/crm/activities?compose=birthday&customer=${encodeURIComponent(
          customer.id,
        )}`}
        aria-label={`${customer.fullName} uchun tug‘ilgan kun tabrigi yaratish`}
      >
        Tabriklash
      </Link>
    </article>
  );

  const renderActiveItems = () => {
    if (!activeItems.length) {
      return (
        <CRMStateView
          compact
          type="empty"
          title="Bu bo‘limda mijozlar yo‘q"
          description="Tegishli mijozlar paydo bo‘lganda ular shu yerda ko‘rinadi."
        />
      );
    }

    if (activeTab === "top") {
      return activeItems.map(renderTopCustomer);
    }

    if (activeTab === "debt") {
      return activeItems.map(renderDebtor);
    }

    if (activeTab === "risk") {
      return activeItems.map(renderChurnRisk);
    }

    return activeItems.map(renderBirthday);
  };

  return (
    <section
      className="crm-customer-panels"
      aria-labelledby="crm-customer-panels-title"
    >
      <div className="crm-customer-panels__header">
        <div>
          <span>Mijozlar markazi</span>
          <h2 id="crm-customer-panels-title">Muhim mijoz signallari</h2>
          <p>
            Qiymatli mijozlar, qarz, ketish xavfi va bugungi aloqalarni bir
            joydan kuzating.
          </p>
        </div>

        <Link to="/crm/customers">
          Barcha mijozlar
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>

      <div
        className="crm-customer-panels__tabs"
        role="tablist"
        aria-label="Mijoz signallari"
      >
        {panelTabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const itemCount = dataByTab[tab.id]?.length || 0;

          return (
            <button
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              id={`crm-customer-tab-${tab.id}`}
              className={isActive ? "is-active" : ""}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`crm-customer-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >
              <Icon size={15} strokeWidth={1.9} aria-hidden="true" />
              <span>{tab.label}</span>
              <strong>{itemCount}</strong>
            </button>
          );
        })}
      </div>

      <div
        className="crm-customer-panels__content"
        id={`crm-customer-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`crm-customer-tab-${activeTab}`}
        tabIndex={0}
      >
        {renderActiveItems()}
      </div>
    </section>
  );
};

export default DashboardCustomerPanels;
