import {
  BadgePercent,
  Clock3,
  Coins,
  Crown,
  Gift,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  calculateLoyaltyProgress,
  getCustomerLoyaltyProfile,
  getCustomerLoyaltyTransactions,
} from "../../data/crmLoyalty";
import {
  formatCurrency,
  formatDate,
  formatRelativeDate,
} from "../../utils/crmFormatters";
import "./CustomerLoyaltyPanel.scss";

const progressSegments = Array.from({ length: 10 }, (_, index) => index + 1);

const transactionConfig = {
  earned: {
    label: "Bonus olindi",
    icon: TrendingUp,
    tone: "success",
  },
  cashback: {
    label: "Cashback olindi",
    icon: Coins,
    tone: "primary",
  },
  redeemed: {
    label: "Bonus ishlatildi",
    icon: TrendingDown,
    tone: "warning",
  },
  adjustment: {
    label: "Tuzatish kiritildi",
    icon: RotateCcw,
    tone: "neutral",
  },
  expired: {
    label: "Bonus muddati tugadi",
    icon: Clock3,
    tone: "danger",
  },
};

const ProtectedValue = ({ allowed, children }) =>
  allowed ? children : <span aria-label="Yashirilgan qiymat">••••••</span>;

const LoyaltyMetric = ({
  icon: Icon,
  label,
  value,
  description,
  tone = "neutral",
}) => (
  <article
    className={`crm-customer-loyalty__metric crm-customer-loyalty__metric--${tone}`}
  >
    <div className="crm-customer-loyalty__metric-icon" aria-hidden="true">
      <Icon size={19} />
    </div>

    <div className="crm-customer-loyalty__metric-copy">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{description}</small>
    </div>
  </article>
);

const LoyaltyProgress = ({ progress, canViewFinancials }) => {
  const activeSegments = Math.ceil(progress.percentage / 10);

  return (
    <div className="crm-customer-loyalty__progress">
      <div className="crm-customer-loyalty__progress-heading">
        <div>
          <span>Daraja progressi</span>
          <strong>
            {progress.nextTier
              ? `${progress.nextTier.name} darajasigacha`
              : "Eng yuqori daraja"}
          </strong>
        </div>

        <span className="crm-customer-loyalty__progress-value">
          {progress.percentage}%
        </span>
      </div>

      <div
        className="crm-customer-loyalty__progress-track"
        role="progressbar"
        aria-label={
          progress.nextTier
            ? `${progress.nextTier.name} darajasiga o‘tish progressi`
            : "Loyalty darajasi to‘liq"
        }
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={progress.percentage}
      >
        {progressSegments.map((segment) => (
          <span
            className={
              segment <= activeSegments
                ? "crm-customer-loyalty__progress-segment crm-customer-loyalty__progress-segment--active"
                : "crm-customer-loyalty__progress-segment"
            }
            key={`loyalty-progress-${segment}`}
          />
        ))}
      </div>

      <p>
        {progress.nextTier ? (
          <>
            Yana{" "}
            <ProtectedValue allowed={canViewFinancials}>
              {formatCurrency(progress.remainingSpend)}
            </ProtectedValue>{" "}
            miqdorida xariddan so‘ng yangi daraja ochiladi.
          </>
        ) : (
          "Mijoz barcha premium loyalty imkoniyatlaridan foydalanishi mumkin."
        )}
      </p>
    </div>
  );
};

const CustomerLoyaltyPanel = ({ customer, canViewFinancials = true }) => {
  const profile = getCustomerLoyaltyProfile(customer.id, customer);
  const transactions = getCustomerLoyaltyTransactions(customer.id);
  const progress = calculateLoyaltyProgress(profile);

  return (
    <div className="crm-customer-loyalty">
      <section
        className={`crm-customer-loyalty__hero crm-customer-loyalty__hero--${profile.tier.id}`}
      >
        <div className="crm-customer-loyalty__hero-glow" aria-hidden="true" />

        <div className="crm-customer-loyalty__hero-main">
          <div className="crm-customer-loyalty__tier-icon" aria-hidden="true">
            <Crown size={25} />
          </div>

          <div className="crm-customer-loyalty__tier-copy">
            <span>Joriy loyalty darajasi</span>
            <h2>{profile.tier.name}</h2>
            <p>
              Har bir mos xariddan {profile.tier.cashbackRate}% cashback
              hisoblanadi.
            </p>
          </div>
        </div>

        <LoyaltyProgress
          progress={progress}
          canViewFinancials={canViewFinancials}
        />
      </section>

      <div className="crm-customer-loyalty__metrics">
        <LoyaltyMetric
          icon={Gift}
          label="Bonus balansi"
          value={
            <ProtectedValue allowed={canViewFinancials}>
              {formatCurrency(profile.bonusBalance)}
            </ProtectedValue>
          }
          description="Xaridlarda ishlatish mumkin"
          tone="primary"
        />

        <LoyaltyMetric
          icon={Coins}
          label="Cashback balansi"
          value={
            <ProtectedValue allowed={canViewFinancials}>
              {formatCurrency(profile.cashbackBalance)}
            </ProtectedValue>
          }
          description={`${profile.tier.cashbackRate}% joriy stavka`}
          tone="success"
        />

        <LoyaltyMetric
          icon={BadgePercent}
          label="Loyalty ballari"
          value={profile.points.toLocaleString("uz-UZ")}
          description="Faol ballar"
          tone="warning"
        />

        <LoyaltyMetric
          icon={ShieldCheck}
          label="Jami ishlatilgan"
          value={
            <ProtectedValue allowed={canViewFinancials}>
              {formatCurrency(profile.lifetimeRedeemed)}
            </ProtectedValue>
          }
          description="Butun davr davomida"
        />
      </div>

      <div className="crm-customer-loyalty__content-grid">
        <section className="crm-customer-loyalty__surface">
          <div className="crm-customer-loyalty__section-heading">
            <div className="crm-customer-loyalty__section-icon">
              <Gift size={19} aria-hidden="true" />
            </div>

            <div>
              <span>Faol imkoniyatlar</span>
              <h3>{profile.tier.name} darajasi imtiyozlari</h3>
            </div>
          </div>

          <ul className="crm-customer-loyalty__benefits">
            {profile.tier.benefits.map((benefit) => (
              <li key={benefit}>
                <Sparkles size={16} aria-hidden="true" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          <dl className="crm-customer-loyalty__details">
            <div>
              <dt>Dasturga qo‘shilgan</dt>
              <dd>
                {profile.joinedAt
                  ? formatDate(profile.joinedAt)
                  : "Ko‘rsatilmagan"}
              </dd>
            </div>

            <div>
              <dt>Oxirgi loyalty faolligi</dt>
              <dd>
                {profile.lastActivityAt
                  ? formatRelativeDate(profile.lastActivityAt)
                  : "Hali faollik yo‘q"}
              </dd>
            </div>

            <div>
              <dt>Daraja uchun xaridlar</dt>
              <dd>
                <ProtectedValue allowed={canViewFinancials}>
                  {formatCurrency(profile.qualifyingSpend)}
                </ProtectedValue>
              </dd>
            </div>

            <div>
              <dt>Jami yig‘ilgan</dt>
              <dd>
                <ProtectedValue allowed={canViewFinancials}>
                  {formatCurrency(profile.lifetimeEarned)}
                </ProtectedValue>
              </dd>
            </div>
          </dl>
        </section>

        <section className="crm-customer-loyalty__surface crm-customer-loyalty__surface--transactions">
          <div className="crm-customer-loyalty__section-heading">
            <div className="crm-customer-loyalty__section-icon">
              <Clock3 size={19} aria-hidden="true" />
            </div>

            <div>
              <span>Operatsiyalar</span>
              <h3>Loyalty tarixi</h3>
            </div>

            {transactions.length > 0 ? (
              <span className="crm-customer-loyalty__count">
                {transactions.length}
              </span>
            ) : null}
          </div>

          {transactions.length > 0 ? (
            <div className="crm-customer-loyalty__transactions">
              {transactions.map((transaction) => {
                const config =
                  transactionConfig[transaction.type] ??
                  transactionConfig.adjustment;
                const TransactionIcon = config.icon;
                const isPositive = transaction.amount > 0;

                return (
                  <article
                    className="crm-customer-loyalty__transaction"
                    key={transaction.id}
                  >
                    <div
                      className={`crm-customer-loyalty__transaction-icon crm-customer-loyalty__transaction-icon--${config.tone}`}
                      aria-hidden="true"
                    >
                      <TransactionIcon size={17} />
                    </div>

                    <div className="crm-customer-loyalty__transaction-copy">
                      <div>
                        <strong>{transaction.description}</strong>
                        <span>{config.label}</span>
                      </div>

                      <p>
                        {transaction.reference
                          ? `Hujjat: ${transaction.reference}`
                          : "CRM loyalty operatsiyasi"}
                      </p>

                      <time dateTime={transaction.createdAt}>
                        {formatDate(transaction.createdAt)} ·{" "}
                        {formatRelativeDate(transaction.createdAt)}
                      </time>
                    </div>

                    <strong
                      className={
                        isPositive
                          ? "crm-customer-loyalty__transaction-value crm-customer-loyalty__transaction-value--positive"
                          : "crm-customer-loyalty__transaction-value crm-customer-loyalty__transaction-value--negative"
                      }
                    >
                      <ProtectedValue allowed={canViewFinancials}>
                        {isPositive ? "+" : "−"}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </ProtectedValue>
                    </strong>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="crm-customer-loyalty__empty">
              <Gift size={23} aria-hidden="true" />
              <strong>Loyalty operatsiyalari hali yo‘q</strong>
              <p>
                Mijoz bonus yoki cashback olganda operatsiyalar shu yerda
                ko‘rinadi.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CustomerLoyaltyPanel;
