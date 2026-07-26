// Task 5-7: "To'lov jadvali" — endi qo'lda invoys kiritish o'rniga PO'ning
// (avtomatik yaratilgan) invoyslari va ularning to'lov muddatlarini ko'rsatadi.
// "Bo'lib to'lash" shartida 30/60/90 kunlik bo'lib-to'lash jadvali avtomatik
// generatsiya qilinadi (generateInstallmentSchedule — hisoblash takrorlanmaydi).

import { CalendarClock, Receipt } from "lucide-react";

import PurchaseModal from "../../components/PurchaseModal/PurchaseModal";
import { InvoiceStatusBadge } from "../../components/PurchaseStatusBadge/PurchaseStatusBadge";
import { PAYMENT_TERM_TYPES, getPaymentTermById } from "../../constants/paymentTerms";
import {
  generateInstallmentSchedule,
  getInvoiceRemaining,
} from "../../utils/purchaseCalculations";
import { formatCurrencyMoney, formatPurchaseDate } from "../../utils/purchaseMoney";

import "./PaymentScheduleModal.scss";

const installmentStatus = (invoice, installment) => {
  if (invoice.status === "paid") return { label: "To'langan", tone: "success" };

  const today = new Date().toISOString().slice(0, 10);

  if (invoice.paidAmount >= installment.cumulativeAmount) {
    return { label: "To'langan", tone: "success" };
  }

  if (installment.dueDate < today) {
    return { label: "Muddati o'tgan", tone: "danger" };
  }

  return { label: "Rejalashtirilgan", tone: "info" };
};

const PaymentScheduleModal = ({ open, order, invoices = [], supplier, onClose }) => {
  return (
    <PurchaseModal
      open={open}
      size="lg"
      eyebrow={
        <>
          <CalendarClock size={14} />
          To'lov jadvali
        </>
      }
      title={order ? `${order.number} — to'lov jadvali` : "To'lov jadvali"}
      description="Avtomatik yaratilgan invoyslar va ularning to'lov muddatlari."
      onClose={onClose}
      footer={
        <button className="purchase-btn purchase-btn--ghost" type="button" onClick={onClose}>
          Yopish
        </button>
      }
    >
      {!invoices.length && (
        <p className="payment-schedule__empty">
          Bu PO uchun invoys hali yaratilmagan — invoys tovar qabul qilinganda
          avtomatik hosil bo'ladi.
        </p>
      )}

      {invoices.map((invoice) => {
        const term = getPaymentTermById(invoice.paymentTerm);
        const isInstallment = invoice.paymentTerm === PAYMENT_TERM_TYPES.installment;
        const schedule = isInstallment
          ? generateInstallmentSchedule(
              invoice.amount,
              invoice.deliveredAt || invoice.createdAt,
            )
          : [];

        let cumulative = 0;
        const scheduleWithCumulative = schedule.map((installment) => {
          cumulative += installment.amount;
          return { ...installment, cumulativeAmount: cumulative };
        });

        return (
          <div className="payment-schedule__invoice" key={invoice.id}>
            <div className="payment-schedule__row">
              <span className="payment-schedule__field">
                <small>Invoys raqami</small>
                <strong>
                  <Receipt size={13} />
                  {invoice.number}
                </strong>
              </span>
              <span className="payment-schedule__field">
                <small>Yetkazib beruvchi</small>
                <strong>{supplier?.name || "—"}</strong>
              </span>
              <span className="payment-schedule__field">
                <small>Invoys summasi</small>
                <strong>{formatCurrencyMoney(invoice.amount, invoice.currency)}</strong>
              </span>
              <span className="payment-schedule__field">
                <small>To'lov sharti</small>
                <strong>{term.label}</strong>
              </span>
              <span className="payment-schedule__field">
                <small>Yetkazish sanasi</small>
                <strong>
                  {formatPurchaseDate(invoice.deliveredAt || order?.expectedDate)}
                </strong>
              </span>
              <span className="payment-schedule__field">
                <small>Muddat</small>
                <strong>{formatPurchaseDate(invoice.dueDate)}</strong>
              </span>
              <span className="payment-schedule__field">
                <small>Qoldiq</small>
                <strong>
                  {formatCurrencyMoney(getInvoiceRemaining(invoice), invoice.currency)}
                </strong>
              </span>
              <span className="payment-schedule__field">
                <small>Holat</small>
                <InvoiceStatusBadge status={invoice.status} />
              </span>
            </div>

            {isInstallment && (
              <div className="payment-schedule__installments">
                <span className="payment-schedule__installments-title">
                  Bo'lib to'lash jadvali ({scheduleWithCumulative.length} ta bo'lak)
                </span>

                <div className="payment-schedule__installment-list">
                  {scheduleWithCumulative.map((installment) => {
                    const status = installmentStatus(invoice, installment);

                    return (
                      <div className="payment-schedule__installment" key={installment.index}>
                        <span>{installment.index}-bo'lak</span>
                        <span>{formatPurchaseDate(installment.dueDate)}</span>
                        <span>{formatCurrencyMoney(installment.amount, invoice.currency)}</span>
                        <span
                          className={`payment-schedule__installment-status payment-schedule__installment-status--${status.tone}`}
                        >
                          {status.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </PurchaseModal>
  );
};

export default PaymentScheduleModal;
