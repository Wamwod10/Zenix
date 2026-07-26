// PDF 44-46, 49: To'lov — qisman bo'lishi mumkin, invoysdan oshmaydi,
// usul tanlanadi (bank, naqd, karta, akkreditiv).

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Wallet } from "lucide-react";

import PurchaseAttachmentManager from "../../components/PurchaseAttachmentManager/PurchaseAttachmentManager";
import PurchaseAlert from "../../components/PurchaseAlert/PurchaseAlert";
import PurchaseDateField from "../../components/PurchaseDateField/PurchaseDateField";
import PurchaseModal from "../../components/PurchaseModal/PurchaseModal";
import PurchaseSelectField from "../../components/PurchaseSelectField/PurchaseSelectField";
import PurchaseTextField from "../../components/PurchaseTextField/PurchaseTextField";
import PurchaseTextarea from "../../components/PurchaseTextarea/PurchaseTextarea";
import { PAYMENT_METHODS } from "../../constants/paymentTerms";
import { getInvoiceRemaining } from "../../utils/purchaseCalculations";
import { formatMoney, normalizeNumber } from "../../utils/purchaseMoney";

const todayStr = () => new Date().toISOString().slice(0, 10);

const CASH_ACCOUNTS = [
  { id: "main_cash", label: "Asosiy kassa" },
  { id: "branch_cash", label: "Filial kassasi" },
];

const BANK_ACCOUNTS = [
  { id: "kapitalbank_uzs", label: "Kapitalbank UZS" },
  { id: "ipakyuli_usd", label: "Ipak Yo'li USD" },
];

const PurchasePaymentModal = ({ open, invoice, onClose, onConfirm }) => {
  const remaining = invoice ? getInvoiceRemaining(invoice) : 0;
  const [attachments, setAttachments] = useState([]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: "",
      paymentDate: todayStr(),
      method: PAYMENT_METHODS[0].id,
      cashAccount: "",
      bankAccount: BANK_ACCOUNTS[0].id,
      transactionNumber: "",
      comment: "",
    },
  });

  useEffect(() => {
    if (open && invoice) {
      reset({
        amount: remaining,
        paymentDate: todayStr(),
        method: PAYMENT_METHODS[0].id,
        cashAccount: "",
        bankAccount: BANK_ACCOUNTS[0].id,
        transactionNumber: "",
        comment: "",
      });
      setAttachments([]);
    }
  }, [open, invoice, remaining, reset]);

  const amountValue = normalizeNumber(watch("amount"));
  const isPartial = amountValue > 0 && amountValue < remaining;

  const submit = handleSubmit((values) => {
    onConfirm?.({
      invoiceId: invoice.id,
      amount: normalizeNumber(values.amount),
      method: values.method,
      paymentDate: values.paymentDate,
      cashAccount: values.cashAccount,
      bankAccount: values.bankAccount,
      transactionNumber: values.transactionNumber,
      comment: values.comment,
      attachments,
    });
  });

  return (
    <PurchaseModal
      open={open}
      size="sm"
      eyebrow={
        <>
          <Wallet size={14} />
          To'lov qayd etish
        </>
      }
      title={invoice ? `${invoice.number} — to'lov` : "To'lov"}
      description={`Qoldiq: ${formatMoney(remaining)}. Jami to'lov invoysdan oshmaydi.`}
      onClose={onClose}
      footer={
        <>
          <button className="purchase-btn purchase-btn--ghost" type="button" onClick={onClose}>
            Bekor qilish
          </button>
          <button className="purchase-btn purchase-btn--success" type="button" onClick={submit}>
            <Wallet size={16} />
            To'lovni saqlash
          </button>
        </>
      }
    >
      <Controller
        control={control}
        name="amount"
        rules={{
          required: "Summa majburiy",
          validate: (value) => {
            const amount = normalizeNumber(value);

            if (amount <= 0) return "Summa 0 dan katta bo'lsin";
            if (amount > remaining) {
              return "To'lov invoys qoldig'idan oshmasin";
            }

            return true;
          },
        }}
        render={({ field: { ref: _ref, ...field } }) => (
          <PurchaseTextField
            label="To'lov summasi"
            type="number"
            min="0"
            max={remaining}
            step="1000"
            autoFocus
            error={errors.amount?.message}
            {...field}
          />
        )}
      />

      <Controller
        control={control}
        name="paymentDate"
        rules={{ required: "To'lov sanasi majburiy" }}
        render={({ field }) => (
          <PurchaseDateField
            label="To'lov sanasi"
            error={errors.paymentDate?.message}
            {...field}
          />
        )}
      />

      <Controller
        control={control}
        name="method"
        render={({ field: { ref: _ref, ...field } }) => (
          <PurchaseSelectField
            label="To'lov usuli"
            options={PAYMENT_METHODS.map((method) => ({
              value: method.id,
              label: method.label,
            }))}
            {...field}
          />
        )}
      />

      <Controller
        control={control}
        name="cashAccount"
        render={({ field: { ref: _ref, ...field } }) => (
          <PurchaseSelectField
            label="Kassa hisobvarag'i"
            options={[
              { value: "", label: "Tanlanmagan" },
              ...CASH_ACCOUNTS.map((account) => ({
                value: account.id,
                label: account.label,
              })),
            ]}
            {...field}
          />
        )}
      />

      <Controller
        control={control}
        name="bankAccount"
        render={({ field: { ref: _ref, ...field } }) => (
          <PurchaseSelectField
            label="Bank hisobvarag'i"
            options={BANK_ACCOUNTS.map((account) => ({
              value: account.id,
              label: account.label,
            }))}
            {...field}
          />
        )}
      />

      <Controller
        control={control}
        name="transactionNumber"
        render={({ field: { ref: _ref, ...field } }) => (
          <PurchaseTextField
            label="Tranzaksiya raqami"
            placeholder="TRX-2026-0001"
            {...field}
          />
        )}
      />

      <PurchaseAttachmentManager
        compact
        title="Kvitansiya / ilova"
        emptyTitle="Kvitansiya biriktirilmagan"
        emptyText="Bank kvitansiyasi, chek yoki to'lov dalilini qo'shing."
        attachments={attachments}
        onAdd={(files) => setAttachments((current) => [...current, ...files])}
        onRemove={(file) =>
          setAttachments((current) =>
            current.filter((entry) => entry.id !== file.id),
          )
        }
      />

      <Controller
        control={control}
        name="comment"
        render={({ field }) => (
          <PurchaseTextarea
            label="Izoh"
            rows={2}
            placeholder="To'lov bo'yicha qisqa izoh..."
            {...field}
          />
        )}
      />

      {isPartial && (
        <PurchaseAlert tone="warning">
          Qisman to'lov — invoys holati "Qisman to'langan" bo'ladi, qoldiq
          kuzatuvda qoladi.
        </PurchaseAlert>
      )}
    </PurchaseModal>
  );
};

export default PurchasePaymentModal;
