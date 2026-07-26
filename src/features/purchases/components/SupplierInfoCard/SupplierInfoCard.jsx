// PDF 6, 53: Supplier ma'lumot kartasi — score, aloqa, qarz, kredit limit.
// Qayta ishlatiladigan komponent (detail sahifa, kelajakda supplier sahifasi).

import { Phone, Star, Truck } from "lucide-react";

import PurchaseAlert from "../PurchaseAlert/PurchaseAlert";
import PurchaseProgressBar from "../PurchaseProgressBar/PurchaseProgressBar";
import { formatCompactMoney, formatMoney } from "../../utils/purchaseMoney";

import "./SupplierInfoCard.scss";

const scoreTone = (score) => {
  if (score >= 80) return "high";
  if (score >= 50) return "mid";

  return "low";
};

const SupplierInfoCard = ({ supplier }) => {
  if (!supplier) {
    return (
      <p className="supplier-info-card__empty">Yetkazib beruvchi ma'lumoti topilmadi.</p>
    );
  }

  const creditUsedPercent = supplier.creditLimit
    ? Math.min(Math.round((supplier.debt / supplier.creditLimit) * 100), 100)
    : 0;

  return (
    <div className="supplier-info-card">
      <div className="supplier-info-card__head">
        <div>
          <strong>{supplier.name}</strong>
          <small>{supplier.category}</small>
        </div>

        <span
          className={`supplier-info-card__score supplier-info-card__score--${scoreTone(
            supplier.score,
          )}`}
        >
          <Star size={13} />
          {supplier.score}/100
        </span>
      </div>

      {supplier.blocked && (
        <PurchaseAlert tone="danger">
          Qora ro'yxatda — yangi PO ochib bo'lmaydi
        </PurchaseAlert>
      )}

      <div className="supplier-info-card__rows">
        <div>
          <Phone size={14} />
          <span>{supplier.phone || "Telefon kiritilmagan"}</span>
        </div>
        <div>
          <Truck size={14} />
          <span>O'rtacha yetkazish: {supplier.leadTimeDays} kun</span>
        </div>
      </div>

      <div className="supplier-info-card__credit">
        <div className="supplier-info-card__credit-head">
          <span>Qarz / kredit limit</span>
          <strong>
            {formatCompactMoney(supplier.debt)} /{" "}
            {formatCompactMoney(supplier.creditLimit)}
          </strong>
        </div>

        <PurchaseProgressBar
          value={supplier.debt}
          max={supplier.creditLimit || 1}
          tone={creditUsedPercent >= 80 ? "danger" : "info"}
        />

        <small>
          {creditUsedPercent}% ishlatilgan · joriy qarz{" "}
          {formatMoney(supplier.debt)}
        </small>
      </div>
    </div>
  );
};

export default SupplierInfoCard;
