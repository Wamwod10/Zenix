import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CircleDollarSign,
  Crown,
  Heart,
  LockKeyhole,
  Mail,
  MessageSquarePlus,
  Pencil,
  Phone,
  ReceiptText,
  ShieldAlert,
  Sparkles,
  UserRoundCog,
} from "lucide-react";

import CustomerAvatar from "../CustomerAvatar/CustomerAvatar";
import CustomerStatusBadge from "../CustomerStatusBadge/CustomerStatusBadge";
import CustomerTags from "../CustomerTags/CustomerTags";
import { getCustomerEditPath } from "../../config/crmNavigation";
import {
  formatCurrency,
  formatDate,
  formatLoyaltyLevel,
  formatNumber,
  formatPhoneNumber,
  formatRelativeDate,
} from "../../utils/crmFormatters";

import "./CustomerProfileHeader.scss";

const getManagerName = (manager) => {
  if (!manager) {
    return "Menejer biriktirilmagan";
  }

  if (typeof manager === "string") {
    return manager;
  }

  return (
    manager.fullName ??
    manager.name ??
    manager.label ??
    "Menejer biriktirilmagan"
  );
};

const getChurnRiskMeta = (risk = 0) => {
  if (risk >= 70) {
    return {
      tone: "danger",
      label: "Yuqori xavf",
      description: "Mijozni yo‘qotish ehtimoli yuqori",
    };
  }

  if (risk >= 40) {
    return {
      tone: "warning",
      label: "O‘rta xavf",
      description: "Mijoz faolligini kuzatish kerak",
    };
  }

  return {
    tone: "success",
    label: "Past xavf",
    description: "Mijoz bilan munosabat barqaror",
  };
};

const FinancialValue = ({
  label,
  value,
  description,
  icon: Icon,
  tone = "neutral",
  protectedValue = false,
}) => (
  <article
    className={`crm-customer-profile-header__metric crm-customer-profile-header__metric--${tone}`}
  >
    <span className="crm-customer-profile-header__metric-icon">
      {protectedValue ? (
        <LockKeyhole aria-hidden="true" />
      ) : (
        <Icon aria-hidden="true" />
      )}
    </span>

    <div className="crm-customer-profile-header__metric-copy">
      <span>{label}</span>

      {protectedValue ? (
        <strong
          className="crm-customer-profile-header__protected-value"
          aria-label="Moliyaviy ma’lumotni ko‘rish uchun ruxsat kerak"
        >
          Ruxsat kerak
        </strong>
      ) : (
        <strong>{value}</strong>
      )}

      <small>
        {protectedValue ? "Moliyaviy ma’lumot yashirilgan" : description}
      </small>
    </div>
  </article>
);

const CustomerProfileHeader = ({
  customer,
  metrics,
  canViewFinancials = true,
  isFavorite = false,
  onAddActivity,
  onToggleFavorite,
}) => {
  if (!customer) {
    return null;
  }

  const churnRisk = Number(metrics?.churnRisk ?? customer.churnRisk ?? 0);

  const risk = getChurnRiskMeta(churnRisk);

  const lifetimeValue = Number(
    metrics?.lifetimeValue ??
      customer.LTV ??
      customer.ltv ??
      customer.totalSpent ??
      0,
  );

  const managerName = getManagerName(customer.assignedManager);

  const phoneHref = customer.phone
    ? `tel:${String(customer.phone).replace(/[^\d+]/g, "")}`
    : null;

  const emailHref = customer.email ? `mailto:${customer.email}` : null;

  return (
    <section
      className="crm-customer-profile-header"
      aria-labelledby="crm-customer-profile-title"
    >
      <div className="crm-customer-profile-header__navigation">
        <Link className="crm-customer-profile-header__back" to="/crm/customers">
          <ArrowLeft aria-hidden="true" />
          <span>Mijozlarga qaytish</span>
        </Link>

        <div className="crm-customer-profile-header__quick-actions">
          {typeof onToggleFavorite === "function" ? (
            <button
              className={`crm-customer-profile-header__favorite ${
                isFavorite
                  ? "crm-customer-profile-header__favorite--active"
                  : ""
              }`}
              type="button"
              aria-label={
                isFavorite
                  ? "Saralanganlardan olib tashlash"
                  : "Saralanganlarga qo‘shish"
              }
              aria-pressed={isFavorite}
              onClick={onToggleFavorite}
            >
              <Heart aria-hidden="true" />
            </button>
          ) : null}

          {phoneHref ? (
            <a
              className="crm-customer-profile-header__contact-action"
              href={phoneHref}
              aria-label={`${customer.fullName}ga qo‘ng‘iroq qilish`}
            >
              <Phone aria-hidden="true" />
              <span>Qo‘ng‘iroq</span>
            </a>
          ) : null}

          {emailHref ? (
            <a
              className="crm-customer-profile-header__contact-action"
              href={emailHref}
              aria-label={`${customer.fullName}ga email yuborish`}
            >
              <Mail aria-hidden="true" />
              <span>Email</span>
            </a>
          ) : null}

          {typeof onAddActivity === "function" ? (
            <button
              className="crm-customer-profile-header__activity-action"
              type="button"
              onClick={onAddActivity}
            >
              <MessageSquarePlus aria-hidden="true" />
              <span>Faoliyat qo‘shish</span>
            </button>
          ) : null}

          <Link
            className="crm-customer-profile-header__edit"
            to={getCustomerEditPath(customer.id)}
          >
            <Pencil aria-hidden="true" />
            <span>Tahrirlash</span>
          </Link>
        </div>
      </div>

      <div className="crm-customer-profile-header__hero">
        <div className="crm-customer-profile-header__identity">
          <div className="crm-customer-profile-header__avatar">
            <CustomerAvatar
              customer={customer}
              name={customer.fullName}
              src={customer.avatar}
              image={customer.avatar}
              avatar={customer.avatar}
              alt={`${customer.fullName} profil rasmi`}
              size="xl"
            />

            <span
              className="crm-customer-profile-header__verified"
              aria-label="Tasdiqlangan mijoz"
              title="Tasdiqlangan mijoz"
            >
              <BadgeCheck aria-hidden="true" />
            </span>
          </div>

          <div className="crm-customer-profile-header__identity-copy">
            <div className="crm-customer-profile-header__name-row">
              <h1 id="crm-customer-profile-title">{customer.fullName}</h1>

              <CustomerStatusBadge status={customer.status} />
            </div>

            <p>
              {customer.company || "Jismoniy mijoz sifatida ro‘yxatdan o‘tgan"}
            </p>

            <div className="crm-customer-profile-header__contact-line">
              {customer.phone ? (
                <a href={phoneHref}>
                  <Phone aria-hidden="true" />
                  <span>{formatPhoneNumber(customer.phone)}</span>
                </a>
              ) : (
                <span>
                  <Phone aria-hidden="true" />
                  Telefon kiritilmagan
                </span>
              )}

              {customer.email ? (
                <a href={emailHref}>
                  <Mail aria-hidden="true" />
                  <span>{customer.email}</span>
                </a>
              ) : (
                <span>
                  <Mail aria-hidden="true" />
                  Email kiritilmagan
                </span>
              )}
            </div>

            <CustomerTags tags={customer.tags} maxVisible={4} size="md" />
          </div>
        </div>

        <aside
          className={`crm-customer-profile-header__risk crm-customer-profile-header__risk--${risk.tone}`}
          aria-label={`Mijozni yo‘qotish xavfi: ${churnRisk}%`}
        >
          <div className="crm-customer-profile-header__risk-heading">
            <span className="crm-customer-profile-header__risk-icon">
              <ShieldAlert aria-hidden="true" />
            </span>

            <div>
              <span>Yo‘qotish xavfi</span>
              <strong>{risk.label}</strong>
            </div>
          </div>

          <div className="crm-customer-profile-header__risk-score">
            <strong>{churnRisk}%</strong>
            <span>{risk.description}</span>
          </div>
        </aside>
      </div>

      <div className="crm-customer-profile-header__details">
        <div className="crm-customer-profile-header__detail">
          <span className="crm-customer-profile-header__detail-icon">
            <Crown aria-hidden="true" />
          </span>

          <div>
            <span>Sodiqlik darajasi</span>
            <strong>{formatLoyaltyLevel(customer.loyaltyLevel)}</strong>
          </div>
        </div>

        <div className="crm-customer-profile-header__detail">
          <span className="crm-customer-profile-header__detail-icon">
            <Building2 aria-hidden="true" />
          </span>

          <div>
            <span>Mijoz guruhi</span>
            <strong>{customer.group || "Guruhsiz"}</strong>
          </div>
        </div>

        <div className="crm-customer-profile-header__detail">
          <span className="crm-customer-profile-header__detail-icon">
            <UserRoundCog aria-hidden="true" />
          </span>

          <div>
            <span>Mas’ul menejer</span>
            <strong>{managerName}</strong>
          </div>
        </div>

        <div className="crm-customer-profile-header__detail">
          <span className="crm-customer-profile-header__detail-icon">
            <BriefcaseBusiness aria-hidden="true" />
          </span>

          <div>
            <span>Mijoz manbasi</span>
            <strong>{customer.source || "Noma’lum"}</strong>
          </div>
        </div>

        <div className="crm-customer-profile-header__detail">
          <span className="crm-customer-profile-header__detail-icon">
            <CalendarDays aria-hidden="true" />
          </span>

          <div>
            <span>CRM’ga qo‘shilgan</span>
            <strong>
              {customer.createdAt
                ? formatDate(customer.createdAt)
                : "Sana ko‘rsatilmagan"}
            </strong>

            {customer.createdAt ? (
              <small>{formatRelativeDate(customer.createdAt)}</small>
            ) : null}
          </div>
        </div>
      </div>

      <div
        className="crm-customer-profile-header__metrics"
        aria-label="Mijozning asosiy ko‘rsatkichlari"
      >
        <FinancialValue
          label="Jami xarid"
          value={formatCurrency(customer.totalSpent)}
          description={`${formatNumber(customer.orderCount || 0)} ta buyurtma`}
          icon={CircleDollarSign}
          tone="primary"
          protectedValue={!canViewFinancials}
        />

        <FinancialValue
          label="O‘rtacha chek"
          value={formatCurrency(customer.averageCheck)}
          description={
            customer.lastPurchase
              ? `So‘nggi xarid ${formatRelativeDate(customer.lastPurchase)}`
              : "Xarid hali amalga oshirilmagan"
          }
          icon={ReceiptText}
          protectedValue={!canViewFinancials}
        />

        <FinancialValue
          label="Mijoz qiymati"
          value={formatCurrency(lifetimeValue)}
          description="Kutilayotgan umumiy LTV"
          icon={Sparkles}
          tone="highlight"
          protectedValue={!canViewFinancials}
        />

        <FinancialValue
          label="Qarzdorlik"
          value={
            Number(customer.debt || 0) > 0
              ? formatCurrency(customer.debt)
              : "Qarzi yo‘q"
          }
          description={
            Number(customer.debt || 0) > 0 &&
            Number(customer.debtLimit || 0) > 0
              ? `Limit: ${formatCurrency(customer.debtLimit)}`
              : "Hisob holati barqaror"
          }
          icon={ShieldAlert}
          tone={Number(customer.debt || 0) > 0 ? "danger" : "success"}
          protectedValue={!canViewFinancials}
        />
      </div>
    </section>
  );
};

export default CustomerProfileHeader;
