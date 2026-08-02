import {
  ArrowLeft,
  Building2,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Crown,
  History,
  Link2,
  Mail,
  MessageSquareText,
  MoreHorizontal,
  NotebookPen,
  Phone,
  ShoppingBag,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import CustomerCommunication from "../../components/CustomerCommunication/CustomerCommunication";
import CustomerNotes from "../../components/CustomerNotes/CustomerNotes";
import CustomerOverview from "../../components/CustomerOverview/CustomerOverview";
import CustomerPurchases from "../../components/CustomerPurchases/CustomerPurchases";
import CustomerRelationships from "../../components/CustomerRelationships/CustomerRelationships";

import useCustomerProfile from "../../hooks/useCustomerProfile";
import { formatCurrency, formatDate } from "../../utils/crmFormatters";

import "./CustomerDetails.scss";

const customerTabs = [
  {
    id: "overview",
    label: "Umumiy",
    description: "Asosiy ma’lumotlar",
    icon: UserRound,
  },
  {
    id: "purchases",
    label: "Xaridlar",
    description: "Savdo va buyurtmalar",
    icon: ShoppingBag,
  },
  {
    id: "communication",
    label: "Aloqa tarixi",
    description: "Qo‘ng‘iroq va xabarlar",
    icon: MessageSquareText,
  },
  {
    id: "notes",
    label: "Eslatmalar",
    description: "Ichki qaydlar",
    icon: NotebookPen,
  },
  {
    id: "relationships",
    label: "Bog‘lanishlar",
    description: "Kontakt va tashkilotlar",
    icon: Link2,
  },
];
const getCustomerTabStorageKey = (customerId) =>
  `zenix-crm-customer-${customerId}-active-tab`;

const customerStatusLabels = {
  active: "Faol mijoz",
  inactive: "Faol emas",
  blocked: "Bloklangan",
  lead: "Potensial mijoz",
};

const customerSegmentLabels = {
  vip: "VIP mijoz",
  loyal: "Sodiq mijoz",
  regular: "Doimiy mijoz",
  new: "Yangi mijoz",
  risk: "Xavf ostida",
};

const getCustomerName = (customer) =>
  customer?.fullName ??
  customer?.name ??
  customer?.companyName ??
  "Noma’lum mijoz";

const getCustomerInitials = (customer) => {
  const customerName = getCustomerName(customer);

  return customerName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
};

const CustomerDetails = () => {
  const navigate = useNavigate();
  const { customerId } = useParams();

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === "undefined" || !customerId) {
      return "overview";
    }

    return window.localStorage.getItem(getCustomerTabStorageKey(customerId)) || "overview";
  });
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const { customer, isLoading } = useCustomerProfile(customerId);

  useEffect(() => {
    if (typeof window === "undefined" || !customerId) {
      return;
    }

    window.localStorage.setItem(getCustomerTabStorageKey(customerId), activeTab);
  }, [activeTab, customerId]);

  const customerMetrics = useMemo(() => {
    if (!customer) {
      return {
        totalSpent: 0,
        purchaseCount: 0,
        averageCheck: 0,
        lastPurchaseAt: null,
      };
    }

    const totalSpent =
      customer.totalSpent ??
      customer.totalPurchasesAmount ??
      customer.lifetimeValue ??
      0;

    const purchaseCount =
      customer.purchaseCount ??
      customer.ordersCount ??
      customer.totalPurchases ??
      0;

    return {
      totalSpent,
      purchaseCount,
      averageCheck:
        customer.averageCheck ??
        (purchaseCount > 0 ? totalSpent / purchaseCount : 0),
      lastPurchaseAt:
        customer.lastPurchaseAt ?? customer.lastPurchase ?? customer.updatedAt,
    };
  }, [customer]);

  if (isLoading) {
    return (
      <main className="crm-customer-details">
        <section className="crm-customer-details__not-found">
          <div>
            <UserRound size={28} aria-hidden="true" />
          </div>
          <span>CRM В· Mijoz profili</span>
          <h1>Mijoz yuklanmoqda</h1>
          <p>Mijoz ma'lumotlari CRM bazasidan olinmoqda.</p>
        </section>
      </main>
    );
  }

  if (!customer) {
    return (
      <main className="crm-customer-details">
        <section className="crm-customer-details__not-found">
          <div>
            <UserRound size={28} aria-hidden="true" />
          </div>

          <span>CRM · Mijoz profili</span>
          <h1>Mijoz topilmadi</h1>

          <p>Ushbu mijoz o‘chirilgan yoki havola noto‘g‘ri bo‘lishi mumkin.</p>

          <button type="button" onClick={() => navigate("/crm/customers")}>
            <ArrowLeft size={17} aria-hidden="true" />
            Mijozlar ro‘yxatiga qaytish
          </button>
        </section>
      </main>
    );
  }

  const customerName = getCustomerName(customer);
  const customerStatus = customer.status ?? "active";
  const customerSegment = customer.segment ?? "regular";

  const renderActiveTab = () => {
    switch (activeTab) {
      case "purchases":
        return (
          <CustomerPurchases customer={customer} customerId={customer.id} />
        );

      case "communication":
        return (
          <CustomerCommunication customer={customer} customerId={customer.id} />
        );

      case "notes":
        return (
          <CustomerNotes
            customer={customer}
            customerId={customer.id}
            canManageNotes
          />
        );

      case "relationships":
        return (
          <CustomerRelationships
            customerId={customer.id}
            canManageRelationships
          />
        );

      case "overview":
      default:
        return <CustomerOverview customer={customer} />;
    }
  };

  return (
    <main className="crm-customer-details">
      <nav
        className="crm-customer-details__breadcrumb"
        aria-label="Sahifa yo‘li"
      >
        <button type="button" onClick={() => navigate("/crm/customers")}>
          Mijozlar
        </button>

        <ChevronRight size={14} aria-hidden="true" />
        <span>{customerName}</span>
      </nav>

      <section className="crm-customer-details__profile">
        <div className="crm-customer-details__profile-glow" />

        <div className="crm-customer-details__profile-main">
          <button
            className="crm-customer-details__back"
            type="button"
            onClick={() => navigate("/crm/customers")}
            aria-label="Mijozlar ro‘yxatiga qaytish"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="crm-customer-details__avatar">
            <span>{getCustomerInitials(customer)}</span>

            <div
              className={`crm-customer-details__presence crm-customer-details__presence--${customerStatus}`}
              title={customerStatusLabels[customerStatus]}
            />
          </div>

          <div className="crm-customer-details__identity">
            <div className="crm-customer-details__eyebrow">
              <Sparkles size={14} aria-hidden="true" />
              <span>CRM mijoz profili</span>

              <span
                className={`crm-customer-details__status crm-customer-details__status--${customerStatus}`}
              >
                {customerStatusLabels[customerStatus] ?? customerStatus}
              </span>
            </div>

            <h1>{customerName}</h1>

            <div className="crm-customer-details__identity-meta">
              {customer.companyName || customer.company ? (
                <span>
                  <Building2 size={15} aria-hidden="true" />
                  {customer.companyName ?? customer.company}
                </span>
              ) : null}

              <span>
                <CalendarDays size={15} aria-hidden="true" />
                Mijoz bo‘lgan sana: {formatDate(customer.createdAt)}
              </span>
            </div>

            <div className="crm-customer-details__contact-row">
              {customer.phone ? (
                <a href={`tel:${customer.phone}`}>
                  <Phone size={15} aria-hidden="true" />
                  {customer.phone}
                </a>
              ) : null}

              {customer.email ? (
                <a href={`mailto:${customer.email}`}>
                  <Mail size={15} aria-hidden="true" />
                  {customer.email}
                </a>
              ) : null}
            </div>
          </div>

          <div className="crm-customer-details__profile-actions">
            <span
              className={`crm-customer-details__segment crm-customer-details__segment--${customerSegment}`}
            >
              {customerSegment === "vip" ? (
                <Crown size={14} aria-hidden="true" />
              ) : (
                <Sparkles size={14} aria-hidden="true" />
              )}

              {customerSegmentLabels[customerSegment] ?? customerSegment}
            </span>

            <div className="crm-customer-details__actions-menu">
              <button
                type="button"
                aria-label="Qo‘shimcha amallar"
                aria-expanded={isActionsOpen}
                onClick={() => setIsActionsOpen((current) => !current)}
              >
                <MoreHorizontal size={19} />
              </button>

              {isActionsOpen ? (
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("communication");
                      setIsActionsOpen(false);
                    }}
                  >
                    <MessageSquareText size={15} />
                    Aloqa qo‘shish
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("notes");
                      setIsActionsOpen(false);
                    }}
                  >
                    <NotebookPen size={15} />
                    Eslatma yozish
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("relationships");
                      setIsActionsOpen(false);
                    }}
                  >
                    <Link2 size={15} />
                    Bog‘lanish qo‘shish
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="crm-customer-details__metrics">
          <article>
            <div>
              <CircleDollarSign size={18} aria-hidden="true" />
            </div>

            <span>Jami xarid qiymati</span>
            <strong>{formatCurrency(customerMetrics.totalSpent)}</strong>
          </article>

          <article>
            <div>
              <ShoppingBag size={18} aria-hidden="true" />
            </div>

            <span>Xaridlar soni</span>
            <strong>{customerMetrics.purchaseCount} ta</strong>
          </article>

          <article>
            <div>
              <Sparkles size={18} aria-hidden="true" />
            </div>

            <span>O‘rtacha chek</span>
            <strong>{formatCurrency(customerMetrics.averageCheck)}</strong>
          </article>

          <article>
            <div>
              <History size={18} aria-hidden="true" />
            </div>

            <span>Oxirgi faollik</span>
            <strong>
              {customerMetrics.lastPurchaseAt
                ? formatDate(customerMetrics.lastPurchaseAt)
                : "Ma’lumot yo‘q"}
            </strong>
          </article>
        </div>
      </section>

      <section className="crm-customer-details__workspace">
        <aside className="crm-customer-details__tabs">
          <div className="crm-customer-details__tabs-heading">
            <span>Profil boshqaruvi</span>
            <strong>Mijoz ma’lumotlari</strong>
          </div>

          <div role="tablist" aria-label="Mijoz profili bo‘limlari">
            {customerTabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  className={
                    isActive
                      ? "crm-customer-details__tab crm-customer-details__tab--active"
                      : "crm-customer-details__tab"
                  }
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span>
                    <TabIcon size={17} aria-hidden="true" />
                  </span>

                  <span>
                    <strong>{tab.label}</strong>
                    <small>{tab.description}</small>
                  </span>

                  <ChevronRight size={15} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </aside>

        <div
          className="crm-customer-details__content"
          role="tabpanel"
          key={activeTab}
        >
          {renderActiveTab()}
        </div>
      </section>
    </main>
  );
};

export default CustomerDetails;
