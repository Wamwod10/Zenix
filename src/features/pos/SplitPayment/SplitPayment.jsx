import { Banknote, CreditCard, Minus, Plus, Smartphone } from "lucide-react";

import { validateSplitPayment } from "../utils/posCalculations";
import { formatMoney } from "../utils/posMoney";

import "./SplitPayment.scss";

const paymentRows = [
  {
    id: "cash",
    label: "Naqd",
    icon: Banknote,
  },
  {
    id: "card",
    label: "Karta",
    icon: CreditCard,
  },
  {
    id: "digital",
    label: "Mobil",
    icon: Smartphone,
  },
];

const SplitPayment = ({ total = 0, values = {}, onChange }) => {
  const { paidAmount, remaining, overpaid } = validateSplitPayment(values, total);

  const handleValueChange = (methodId, nextValue) => {
    const normalizedValue = Math.max(Number(nextValue) || 0, 0);

    onChange?.({
      ...values,
      [methodId]: normalizedValue,
    });
  };

  const fillRemaining = (methodId) => {
    handleValueChange(methodId, Number(values[methodId] || 0) + remaining);
  };

  return (
    <div className="pos-split-payment">
      <div className="pos-split-payment__head">
        <div>
          <span>Split payment</span>
          <strong>To‘lovni bo‘lib qabul qilish</strong>
        </div>

        <small>{formatMoney(total)}</small>
      </div>

      <div className="pos-split-payment__rows">
        {paymentRows.map((row) => {
          const Icon = row.icon;
          const value = Number(values[row.id] || 0);

          return (
            <div className="pos-split-payment__row" key={row.id}>
              <span className="pos-split-payment__method">
                <span>
                  <Icon size={17} />
                </span>
                <strong>{row.label}</strong>
              </span>

              <div className="pos-split-payment__input">
                <button
                  type="button"
                  aria-label={`${row.label} qiymatini kamaytirish`}
                  onClick={() =>
                    handleValueChange(row.id, Math.max(value - 1000, 0))
                  }
                >
                  <Minus size={13} />
                </button>

                <label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={value}
                    onChange={(event) =>
                      handleValueChange(row.id, event.target.value)
                    }
                  />
                  <span>so‘m</span>
                </label>

                <button
                  type="button"
                  aria-label={`${row.label} qiymatini oshirish`}
                  onClick={() => handleValueChange(row.id, value + 1000)}
                >
                  <Plus size={13} />
                </button>
              </div>

              <button
                className="pos-split-payment__fill"
                type="button"
                disabled={remaining <= 0}
                onClick={() => fillRemaining(row.id)}
              >
                Qolganini qo‘shish
              </button>
            </div>
          );
        })}
      </div>

      <div className="pos-split-payment__summary">
        <div>
          <span>Qabul qilindi</span>
          <strong>{formatMoney(paidAmount)}</strong>
        </div>

        <div className={remaining > 0 ? "is-warning" : "is-complete"}>
          <span>{overpaid > 0 ? "Qaytim" : "Qoldi"}</span>
          <strong>{formatMoney(overpaid > 0 ? overpaid : remaining)}</strong>
        </div>
      </div>
    </div>
  );
};

export default SplitPayment;
