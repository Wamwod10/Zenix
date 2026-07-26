import {
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Crown,
  Globe2,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  Sparkles,
  Tag,
  UserRound,
} from "lucide-react";
import { useMemo } from "react";

import { formatCurrency, formatDate } from "../../utils/crmFormatters";

import "./CustomerOverview.scss";

const segmentLabels = {
  vip: "VIP mijoz",
  loyal: "Sodiq mijoz",
  regular: "Doimiy mijoz",
  new: "Yangi mijoz",
  risk: "Xavf ostida",
};

const statusLabels = {
  active: "Faol",
  inactive: "Faol emas",
  blocked: "Bloklangan",
  lead: "Potensial mijoz",
};

const sourceLabels = {
  instagram: "Instagram",
  telegram: "Telegram",
  website: "Veb-sayt",
  recommendation: "Tavsiya",
  walk_in: "Bevosita tashrif",
  advertisement: "Reklama",
  other: "Boshqa",
};

const getCustomerName = (customer) =>
  customer?.fullName ??
  customer?.name ??
  customer?.companyName ??
  "Noma’lum mijoz";

const getAddress = (customer) => {
  if (typeof customer?.address === "string") {
    return customer.address;
  }

  if (customer?.address && typeof customer.address === "object") {
    return [
      customer.address.country,
      customer.address.region,
      customer.address.city,
      customer.address.street,
    ]
      .filter(Boolean)
      .join(", ");
  }

  return [customer?.country, customer?.region, customer?.city, customer?.street]
    .filter(Boolean)
    .join(", ");
};

const CustomerOverview = ({ customer }) => {
  const customerInformation = useMemo(() => {
    const totalSpent =
      customer?.totalSpent ??
      customer?.totalPurchasesAmount ??
      customer?.lifetimeValue ??
      0;

    const purchaseCount =
      customer?.purchaseCount ??
      customer?.ordersCount ??
      customer?.totalPurchases ??
      0;

    return {
      totalSpent,
      purchaseCount,
      averageCheck:
        customer?.averageCheck ??
        (purchaseCount > 0 ? totalSpent / purchaseCount : 0),
      address: getAddress(customer),
    };
  }, [customer]);

  const tags = Array.isArray(customer?.tags) ? customer.tags : [];

  const customerStatus = customer?.status ?? "active";
  const customerSegment = customer?.segment ?? "regular";
  const customerSource =
    customer?.source ?? customer?.acquisitionSource ?? "other";

  const lastActivity =
    customer?.lastPurchaseAt ??
    customer?.lastPurchase ??
    customer?.lastActivityAt ??
    customer?.updatedAt;

  const createdAt =
    customer?.createdAt ?? customer?.registeredAt ?? customer?.joinedAt;

  return (
    <section className="crm-customer-overview">
      <div className="crm-customer-overview__heading">
        <div>
          <span className="crm-customer-overview__heading-icon">
            <UserRound size={19} aria-hidden="true" />
          </span>

          <div>
            <span>Profil ko‘rinishi</span>
            <h2>Mijoz haqida umumiy ma’lumot</h2>
          </div>
        </div>

        <span className="crm-customer-overview__updated">
          <Clock3 size={14} aria-hidden="true" />
          Oxirgi faollik:{" "}
          {lastActivity ? formatDate(lastActivity) : "Ma’lumot yo‘q"}
        </span>
      </div>

      <div className="crm-customer-overview__metrics">
        <article>
          <span className="crm-customer-overview__metric-icon">
            <CircleDollarSign size={19} aria-hidden="true" />
          </span>

          <div>
            <span>Jami xarid qiymati</span>
            <strong>{formatCurrency(customerInformation.totalSpent)}</strong>
          </div>
        </article>

        <article>
          <span className="crm-customer-overview__metric-icon">
            <ShoppingBag size={19} aria-hidden="true" />
          </span>

          <div>
            <span>Xaridlar soni</span>
            <strong>{customerInformation.purchaseCount} ta</strong>
          </div>
        </article>

        <article>
          <span className="crm-customer-overview__metric-icon">
            <Sparkles size={19} aria-hidden="true" />
          </span>

          <div>
            <span>O‘rtacha chek</span>
            <strong>{formatCurrency(customerInformation.averageCheck)}</strong>
          </div>
        </article>
      </div>

      <div className="crm-customer-overview__layout">
        <div className="crm-customer-overview__main">
          <article className="crm-customer-overview__card">
            <div className="crm-customer-overview__card-heading">
              <div>
                <span>
                  <UserRound size={17} aria-hidden="true" />
                </span>

                <div>
                  <h3>Shaxsiy ma’lumotlar</h3>
                  <p>Mijozning asosiy profil ma’lumotlari</p>
                </div>
              </div>
            </div>

            <div className="crm-customer-overview__details-grid">
              <div className="crm-customer-overview__detail">
                <span>To‘liq ism</span>
                <strong>{getCustomerName(customer)}</strong>
              </div>

              <div className="crm-customer-overview__detail">
                <span>Mijoz turi</span>
                <strong>
                  {customer?.customerType === "business"
                    ? "Yuridik shaxs"
                    : "Jismoniy shaxs"}
                </strong>
              </div>

              <div className="crm-customer-overview__detail">
                <span>Tug‘ilgan sana</span>
                <strong>
                  {customer?.birthDate
                    ? formatDate(customer.birthDate)
                    : "Kiritilmagan"}
                </strong>
              </div>

              <div className="crm-customer-overview__detail">
                <span>Mijoz bo‘lgan sana</span>
                <strong>
                  {createdAt ? formatDate(createdAt) : "Kiritilmagan"}
                </strong>
              </div>

              <div className="crm-customer-overview__detail">
                <span>Mas’ul menejer</span>
                <strong>
                  {customer?.managerName ??
                    customer?.assignedManager ??
                    "Biriktirilmagan"}
                </strong>
              </div>

              <div className="crm-customer-overview__detail">
                <span>Mijoz manbasi</span>
                <strong>
                  {sourceLabels[customerSource] ?? customerSource}
                </strong>
              </div>
            </div>
          </article>

          <article className="crm-customer-overview__card">
            <div className="crm-customer-overview__card-heading">
              <div>
                <span>
                  <Phone size={17} aria-hidden="true" />
                </span>

                <div>
                  <h3>Aloqa ma’lumotlari</h3>
                  <p>Mijoz bilan bog‘lanish uchun kontaktlar</p>
                </div>
              </div>
            </div>

            <div className="crm-customer-overview__contacts">
              <div>
                <span>
                  <Phone size={16} aria-hidden="true" />
                </span>

                <div>
                  <small>Telefon raqami</small>

                  {customer?.phone ? (
                    <a href={`tel:${customer.phone}`}>{customer.phone}</a>
                  ) : (
                    <strong>Kiritilmagan</strong>
                  )}
                </div>

                {customer?.phone ? (
                  <CheckCircle2
                    className="crm-customer-overview__verified"
                    size={16}
                    aria-label="Tasdiqlangan"
                  />
                ) : null}
              </div>

              <div>
                <span>
                  <Mail size={16} aria-hidden="true" />
                </span>

                <div>
                  <small>Elektron pochta</small>

                  {customer?.email ? (
                    <a href={`mailto:${customer.email}`}>{customer.email}</a>
                  ) : (
                    <strong>Kiritilmagan</strong>
                  )}
                </div>

                {customer?.email ? (
                  <CheckCircle2
                    className="crm-customer-overview__verified"
                    size={16}
                    aria-label="Tasdiqlangan"
                  />
                ) : null}
              </div>

              <div>
                <span>
                  <MapPin size={16} aria-hidden="true" />
                </span>

                <div>
                  <small>Manzil</small>
                  <strong>
                    {customerInformation.address || "Kiritilmagan"}
                  </strong>
                </div>
              </div>

              {customer?.website ? (
                <div>
                  <span>
                    <Globe2 size={16} aria-hidden="true" />
                  </span>

                  <div>
                    <small>Veb-sayt</small>

                    <a href={customer.website} target="_blank" rel="noreferrer">
                      {customer.website}
                    </a>
                  </div>
                </div>
              ) : null}
            </div>
          </article>

          {customer?.companyName || customer?.company ? (
            <article className="crm-customer-overview__card">
              <div className="crm-customer-overview__card-heading">
                <div>
                  <span>
                    <Building2 size={17} aria-hidden="true" />
                  </span>

                  <div>
                    <h3>Kompaniya ma’lumotlari</h3>
                    <p>Mijozga bog‘langan biznes ma’lumotlari</p>
                  </div>
                </div>
              </div>

              <div className="crm-customer-overview__details-grid">
                <div className="crm-customer-overview__detail">
                  <span>Kompaniya nomi</span>
                  <strong>{customer.companyName ?? customer.company}</strong>
                </div>

                <div className="crm-customer-overview__detail">
                  <span>Lavozimi</span>
                  <strong>{customer.position ?? "Kiritilmagan"}</strong>
                </div>

                <div className="crm-customer-overview__detail">
                  <span>STIR</span>
                  <strong>{customer.taxId ?? "Kiritilmagan"}</strong>
                </div>

                <div className="crm-customer-overview__detail">
                  <span>Faoliyat sohasi</span>
                  <strong>{customer.industry ?? "Kiritilmagan"}</strong>
                </div>
              </div>
            </article>
          ) : null}
        </div>

        <aside className="crm-customer-overview__sidebar">
          <article className="crm-customer-overview__status-card">
            <div className="crm-customer-overview__card-heading">
              <div>
                <span>
                  <Sparkles size={17} aria-hidden="true" />
                </span>

                <div>
                  <h3>CRM holati</h3>
                  <p>Segment va mijoz statusi</p>
                </div>
              </div>
            </div>

            <div className="crm-customer-overview__status-list">
              <div>
                <span>Status</span>

                <strong
                  className={`crm-customer-overview__status crm-customer-overview__status--${customerStatus}`}
                >
                  {statusLabels[customerStatus] ?? customerStatus}
                </strong>
              </div>

              <div>
                <span>Segment</span>

                <strong
                  className={`crm-customer-overview__segment crm-customer-overview__segment--${customerSegment}`}
                >
                  {customerSegment === "vip" ? (
                    <Crown size={13} aria-hidden="true" />
                  ) : (
                    <Sparkles size={13} aria-hidden="true" />
                  )}

                  {segmentLabels[customerSegment] ?? customerSegment}
                </strong>
              </div>

              <div>
                <span>Mas’ul menejer</span>
                <strong>
                  {customer?.managerName ??
                    customer?.assignedManager ??
                    "Biriktirilmagan"}
                </strong>
              </div>

              <div>
                <span>Keyingi aloqa</span>
                <strong>
                  {customer?.nextContactAt
                    ? formatDate(customer.nextContactAt)
                    : "Rejalashtirilmagan"}
                </strong>
              </div>
            </div>
          </article>

          <article className="crm-customer-overview__ai-card">
            <div className="crm-customer-overview__ai-heading">
              <span>
                <Sparkles size={18} aria-hidden="true" />
              </span>

              <div>
                <small>ZENIX AI tavsiyasi</small>
                <strong>Mijoz bilan ishlash</strong>
              </div>
            </div>

            <p>
              {customerInformation.purchaseCount > 5
                ? "Bu mijoz platformadagi faol xaridorlardan biri. Individual taklif yoki sodiqlik chegirmasini yuborish tavsiya etiladi."
                : "Mijozning faolligini oshirish uchun yangi mahsulotlar, maxsus takliflar yoki shaxsiy chegirma haqida xabar yuboring."}
            </p>

            <div>
              <CalendarDays size={14} aria-hidden="true" />
              Xaridlar asosida avtomatik tavsiya
            </div>
          </article>

          <article className="crm-customer-overview__tags-card">
            <div className="crm-customer-overview__tags-heading">
              <span>
                <Tag size={16} aria-hidden="true" />
                Teglar
              </span>

              <small>{tags.length} ta</small>
            </div>

            {tags.length > 0 ? (
              <div className="crm-customer-overview__tags">
                {tags.map((tag) => (
                  <span key={typeof tag === "string" ? tag : tag.id}>
                    {typeof tag === "string" ? tag : (tag.label ?? tag.name)}
                  </span>
                ))}
              </div>
            ) : (
              <p className="crm-customer-overview__empty-tags">
                Bu mijozga hali teg biriktirilmagan.
              </p>
            )}
          </article>
        </aside>
      </div>
    </section>
  );
};

export default CustomerOverview;
