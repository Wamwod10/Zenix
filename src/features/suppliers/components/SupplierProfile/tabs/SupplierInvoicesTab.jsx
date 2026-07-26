// Extracted from SupplierProfile.jsx: "Invoyslar" bo'limi — Purchases
// moduli ma'lumotlari, faqat o'qish uchun ko'rsatiladi.

import { CalendarClock, ReceiptText } from "lucide-react";

import { Card } from "../../../../../components/ui/Card/Card";
import { EmptyState } from "../../../../../components/ui/EmptyState/EmptyState";
import {
  formatCurrencyMoney,
  formatPurchaseDate,
} from "../../../../purchases/utils/purchaseMoney";

const INVOICE_STATUS_LABELS = {
  pending: "Kutilmoqda",
  matched: "Mos",
  mismatch: "Farq bor",
  partially_paid: "Qisman to'langan",
  paid: "To'langan",
};

const INVOICE_STATUS_TONES = {
  pending: "warning",
  matched: "info",
  mismatch: "danger",
  partially_paid: "warning",
  paid: "success",
};

const SupplierInvoicesTab = ({ invoices }) => (
  <Card
    className="supplier-profile__card"
    role="tabpanel"
    id="supplier-tabpanel-invoices"
    aria-labelledby="supplier-tab-invoices"
  >
    <h3>Invoyslar</h3>

    {invoices.length ? (
      <div className="supplier-profile__history">
        {invoices.map((invoice) => (
          <div className="supplier-profile__history-row" key={invoice.id}>
            <span className="supplier-profile__history-primary">
              <strong>{invoice.number}</strong>
              <small>
                <CalendarClock size={11} />
                Muddat: {formatPurchaseDate(invoice.dueDate)}
              </small>
            </span>
            <span
              className={`supplier-profile__invoice-status supplier-profile__invoice-status--${
                INVOICE_STATUS_TONES[invoice.status] || "neutral"
              }`}
            >
              {INVOICE_STATUS_LABELS[invoice.status] || invoice.status}
            </span>
            <span className="supplier-profile__history-money">
              {formatCurrencyMoney(invoice.amount, invoice.currency)}
            </span>
          </div>
        ))}
      </div>
    ) : (
      <EmptyState
        icon={ReceiptText}
        title="Invoys yo'q"
        description="Bu yetkazib beruvchi uchun hali invoys yaratilmagan."
      />
    )}
  </Card>
);

export default SupplierInvoicesTab;
