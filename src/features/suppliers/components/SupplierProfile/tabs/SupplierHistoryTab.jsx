// Extracted from SupplierProfile.jsx: "Xarid tarixi" bo'limi — Purchases
// moduli ma'lumotlari, faqat o'qish uchun ko'rsatiladi.

import { History } from "lucide-react";

import { Card } from "../../../../../components/ui/Card/Card";
import { EmptyState } from "../../../../../components/ui/EmptyState/EmptyState";
import { calculateOrderTotals } from "../../../../purchases/utils/purchaseCalculations";
import {
  formatCurrencyMoney,
  formatPurchaseDate,
} from "../../../../purchases/utils/purchaseMoney";

const SupplierHistoryTab = ({ orders }) => (
  <Card
    className="supplier-profile__card"
    role="tabpanel"
    id="supplier-tabpanel-history"
    aria-labelledby="supplier-tab-history"
  >
    <h3>Xarid tarixi</h3>

    {orders.length ? (
      <div className="supplier-profile__history">
        {orders.map((order) => {
          const totals = calculateOrderTotals(order);

          return (
            <div className="supplier-profile__history-row" key={order.id}>
              <span className="supplier-profile__history-primary">
                <strong>{order.number}</strong>
                <small>{formatPurchaseDate(order.createdAt)}</small>
              </span>
              <span className="supplier-profile__history-money">
                {formatCurrencyMoney(totals.total, order.currency)}
              </span>
            </div>
          );
        })}
      </div>
    ) : (
      <EmptyState
        icon={History}
        title="Xarid tarixi yo'q"
        description="Bu yetkazib beruvchidan hali xarid qilinmagan."
      />
    )}
  </Card>
);

export default SupplierHistoryTab;
