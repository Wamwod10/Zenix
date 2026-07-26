import {
  AlertTriangle,
  BadgePercent,
  CircleDollarSign,
  Gift,
  ShieldAlert,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { formatCurrency } from "../../utils/crmFormatters";
import "./CustomerFinancePanel.scss";

const toAmount = (value) => {
  const amount = Number(value);

  return Number.isFinite(amount) ? amount : 0;
};

const FinanceMetric = ({
  icon: Icon,
  label,
  value,
  description,
  tone = "neutral",
}) => (
  <article
    className={`crm-customer-finance__metric crm-customer-finance__metric--${tone}`}
  >
    <div className="crm-customer-finance__metric-icon" aria-hidden="true">
      <Icon size={18} />
    </div>

    <div className="crm-customer-finance__metric-copy">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{description}</small>
    </div>
  </article>
);

const CustomerFinancePanel = ({ customer, canViewFinancials = true }) => {
  if (!canViewFinancials) {
    return (
      <div
        className="crm-customer-finance__permission"
        role="status"
        aria-live="polite"
      >
        <div
          className="crm-customer-finance__permission-icon"
          aria-hidden="true"
        >
          <ShieldAlert size={25} />
        </div>

        <strong>Moliyaviy ma’lumotlarga ruxsat yo‘q</strong>

        <p>
          Balans, qarzdorlik va to‘lov ma’lumotlarini ko‘rish uchun
          foydalanuvchiga tegishli CRM ruxsati berilishi kerak.
        </p>
      </div>
    );
  }

  const balance = toAmount(customer.balance);
  const debt = toAmount(customer.debt);
  const debtLimit = toAmount(customer.debtLimit);
  const bonus = toAmount(customer.bonus);
  const cashback = toAmount(customer.cashback);
  const remainingDebtLimit = Math.max(debtLimit - debt, 0);
  const debtUsagePercentage =
    debtLimit > 0 ? Math.min(Math.round((debt / debtLimit) * 100), 100) : 0;
  const hasExceededLimit = debtLimit > 0 && debt > debtLimit;

  const debtState = hasExceededLimit
    ? {
        label: "Limitdan oshgan",
        description:
          "Yangi qarzli savdoni tasdiqlashdan oldin qarzdorlikni kamaytirish kerak.",
        icon: AlertTriangle,
        tone: "danger",
      }
    : debt > 0
      ? {
          label: "Faol qarzdorlik",
          description:
            "Qarzdorlik limit doirasida. Keyingi to‘lov muddatini nazorat qiling.",
          icon: CircleDollarSign,
          tone: "warning",
        }
      : {
          label: "Qarzdorlik yo‘q",
          description: "Mijozning ochiq qarzdorligi mavjud emas.",
          icon: ShieldCheck,
          tone: "success",
        };

  const DebtStateIcon = debtState.icon;
  const progressLevel = Math.ceil(debtUsagePercentage / 10);

  return (
    <div className="crm-customer-finance">
      <div className="crm-customer-finance__metrics">
        <FinanceMetric
          icon={WalletCards}
          label="Joriy balans"
          value={formatCurrency(balance)}
          description="Mijoz hisobidagi mablag‘"
          tone={balance >= 0 ? "success" : "warning"}
        />

        <FinanceMetric
          icon={CircleDollarSign}
          label="Qarzdorlik"
          value={formatCurrency(debt)}
          description={`Limit: ${formatCurrency(debtLimit)}`}
          tone={debt > 0 ? "warning" : "neutral"}
        />

        <FinanceMetric
          icon={Gift}
          label="Bonus"
          value={formatCurrency(bonus)}
          description="Xaridda ishlatish mumkin"
          tone="primary"
        />

        <FinanceMetric
          icon={BadgePercent}
          label="Cashback"
          value={formatCurrency(cashback)}
          description="Jamlangan cashback"
          tone="neutral"
        />
      </div>

      <div className="crm-customer-finance__grid">
        <section className="crm-customer-finance__surface">
          <div className="crm-customer-finance__heading">
            <div
              className={`crm-customer-finance__heading-icon crm-customer-finance__heading-icon--${debtState.tone}`}
              aria-hidden="true"
            >
              <DebtStateIcon size={19} />
            </div>

            <div>
              <span>Kredit nazorati</span>
              <h2>{debtState.label}</h2>
            </div>
          </div>

          <div className="crm-customer-finance__debt-summary">
            <div>
              <span>Joriy qarz</span>
              <strong>{formatCurrency(debt)}</strong>
            </div>

            <div>
              <span>Qolgan limit</span>
              <strong>{formatCurrency(remainingDebtLimit)}</strong>
            </div>
          </div>

          <div className="crm-customer-finance__limit">
            <div className="crm-customer-finance__limit-heading">
              <span>Qarz limitidan foydalanish</span>
              <strong>{debtUsagePercentage}%</strong>
            </div>

            <div
              className="crm-customer-finance__limit-track"
              role="progressbar"
              aria-label="Qarz limitidan foydalanish"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={debtUsagePercentage}
            >
              <span
                className={`crm-customer-finance__limit-value crm-customer-finance__limit-value--${progressLevel}`}
              />
            </div>
          </div>

          <div
            className={`crm-customer-finance__notice crm-customer-finance__notice--${debtState.tone}`}
          >
            <DebtStateIcon size={18} aria-hidden="true" />
            <p>{debtState.description}</p>
          </div>
        </section>

        <section className="crm-customer-finance__surface">
          <div className="crm-customer-finance__heading">
            <div
              className="crm-customer-finance__heading-icon"
              aria-hidden="true"
            >
              <WalletCards size={19} />
            </div>

            <div>
              <span>Moliyaviy profil</span>
              <h2>Hisob holati</h2>
            </div>
          </div>

          <dl className="crm-customer-finance__details">
            <div>
              <dt>Joriy balans</dt>
              <dd>{formatCurrency(balance)}</dd>
            </div>

            <div>
              <dt>Qarz limiti</dt>
              <dd>{formatCurrency(debtLimit)}</dd>
            </div>

            <div>
              <dt>Foydalanilgan limit</dt>
              <dd>{formatCurrency(debt)}</dd>
            </div>

            <div>
              <dt>Mavjud limit</dt>
              <dd>{formatCurrency(remainingDebtLimit)}</dd>
            </div>

            <div>
              <dt>Bonus va cashback</dt>
              <dd>{formatCurrency(bonus + cashback)}</dd>
            </div>

            <div>
              <dt>Kredit holati</dt>
              <dd>
                <span
                  className={`crm-customer-finance__status crm-customer-finance__status--${debtState.tone}`}
                >
                  {debtState.label}
                </span>
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
};

export default CustomerFinancePanel;
