// PDF 41-43: Purchase Invoice + Enterprise Three-Way Matching — invoys endi
// PO qatoridan MUSTAQIL o'z qator ro'yxatiga ega (supplier haqiqatda nima
// uchun hisob taqdim etgani: miqdor, narx, chegirma, QQS har bir qatorda
// alohida). Solishtirish (PurchaseThreeWayMatchPanel) shu qatorlardan
// qator-darajasida hisoblanadi — threeWayMatching.js YAGONA manba.

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { AlertTriangle, ChevronDown, Plus, Receipt, Trash2 } from "lucide-react";

import PurchaseAttachmentManager from "../../components/PurchaseAttachmentManager/PurchaseAttachmentManager";
import PurchaseAlert from "../../components/PurchaseAlert/PurchaseAlert";
import PurchaseDateField from "../../components/PurchaseDateField/PurchaseDateField";
import PurchaseModal from "../../components/PurchaseModal/PurchaseModal";
import PurchaseTextField from "../../components/PurchaseTextField/PurchaseTextField";
import PurchaseTextarea from "../../components/PurchaseTextarea/PurchaseTextarea";
import PurchaseThreeWayMatchPanel from "../../components/PurchaseThreeWayMatchPanel/PurchaseThreeWayMatchPanel";
import {
  buildThreeWayMatch,
  getInvoiceableOrderItems,
} from "../../utils/threeWayMatching";
import {
  formatMoney,
  formatPurchaseDate,
  formatQuantity,
  normalizeNumber,
} from "../../utils/purchaseMoney";
import { createEntityId } from "../../utils/purchaseIds";

import "./PurchaseInvoiceModal.scss";

const todayStr = () => new Date().toISOString().slice(0, 10);

const createLineFromOrderItem = (item) => ({
  itemId: item.itemId,
  name: item.name,
  sku: item.sku,
  orderedQty: item.orderedQty,
  receivedQty: item.receivedQty,
  // Standart: qabul qilingan miqdor invoyslanadi. Hali hech narsa qabul
  // qilinmagan bo'lsa (masalan avans-invoys) — buyurtma miqdori taklif
  // qilinadi, foydalanuvchi kerak bo'lsa pastga o'zgartiradi.
  invoicedQty: item.receivedQty > 0 ? item.receivedQty : item.orderedQty,
  unitPrice: item.unitPrice,
  discountPercent: item.discountPercent,
  taxRate: item.taxRate,
  advancedOpen: false,
});

const createExtraLine = () => ({
  id: createEntityId("extra"),
  name: "",
  invoicedQty: 1,
  unitPrice: 0,
  discountPercent: 0,
  taxRate: 0,
  advancedOpen: false,
});

const PurchaseInvoiceModal = ({
  open,
  order,
  existingInvoices = [],
  getSupplier,
  onClose,
  onConfirm,
}) => {
  const [duplicatePending, setDuplicatePending] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [lines, setLines] = useState([]);
  const [extraLines, setExtraLines] = useState([]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      invoiceNumber: "",
      invoiceDate: todayStr(),
      dueDate: "",
      note: "",
    },
  });

  useEffect(() => {
    if (!open || !order) return;

    setLines(getInvoiceableOrderItems(order).map(createLineFromOrderItem));
    setExtraLines([]);
    setDuplicatePending(false);
    setAttachments([]);
    reset({
      invoiceNumber: "",
      invoiceDate: todayStr(),
      dueDate: "",
      note: "",
    });
  }, [open, order, reset]);

  const updateLine = (itemId, field, value) => {
    setLines((current) =>
      current.map((line) =>
        line.itemId === itemId ? { ...line, [field]: value } : line,
      ),
    );
  };

  const updateExtraLine = (id, field, value) => {
    setExtraLines((current) =>
      current.map((line) => (line.id === id ? { ...line, [field]: value } : line)),
    );
  };

  const removeExtraLine = (id) => {
    setExtraLines((current) => current.filter((line) => line.id !== id));
  };

  // Har bir tahrirlanadigan qator (PO qatori + qo'shimcha qator) bitta
  // umumiy shaklga o'tkaziladi — threeWayMatching.js aynan shu shaklni kutadi.
  const invoiceLineInputs = useMemo(
    () => [
      ...lines
        .filter((line) => normalizeNumber(line.invoicedQty) > 0)
        .map((line) => ({
          itemId: line.itemId,
          name: line.name,
          sku: line.sku,
          invoicedQty: line.invoicedQty,
          unitPrice: line.unitPrice,
          discountPercent: line.discountPercent,
          taxRate: line.taxRate,
        })),
      ...extraLines
        .filter((line) => line.name?.trim() && normalizeNumber(line.invoicedQty) > 0)
        .map((line) => ({
          itemId: null,
          name: line.name,
          invoicedQty: line.invoicedQty,
          unitPrice: line.unitPrice,
          discountPercent: line.discountPercent,
          taxRate: line.taxRate,
        })),
    ],
    [lines, extraLines],
  );

  const matchResult = useMemo(
    () =>
      order
        ? buildThreeWayMatch(order, invoiceLineInputs, order.currency)
        : { lines: [], summary: null },
    [order, invoiceLineInputs],
  );

  const totalAmount = matchResult.summary?.totals.invoiced || 0;
  const canSubmitInvoice = totalAmount > 0;

  const invoiceNumberValue = watch("invoiceNumber")?.trim();
  const invoiceDateValue = watch("invoiceDate");

  const duplicateInvoice = existingInvoices.find(
    (invoice) =>
      invoice.supplierId === order?.supplierId &&
      (invoice.invoiceNumber || invoice.number) === invoiceNumberValue &&
      (invoice.invoiceDate || invoice.createdAt?.slice(0, 10)) === invoiceDateValue &&
      normalizeNumber(invoice.amount) === totalAmount,
  );

  const persist = (values) => {
    onConfirm?.({
      orderId: order.id,
      invoiceNumber: values.invoiceNumber.trim(),
      invoiceDate: values.invoiceDate,
      dueDate: values.dueDate,
      note: values.note,
      amount: totalAmount,
      invoiceQty: invoiceLineInputs.reduce(
        (sum, line) => sum + normalizeNumber(line.invoicedQty),
        0,
      ),
      items: invoiceLineInputs,
      attachments,
    });
  };

  const submit = handleSubmit((values) => {
    if (!canSubmitInvoice) return;

    if (duplicateInvoice && !duplicatePending) {
      setDuplicatePending(true);
      return;
    }

    persist(values);
  });

  return (
    <PurchaseModal
      open={open}
      size="lg"
      eyebrow={
        <>
          <Receipt size={14} />
          Xarid invoysi
        </>
      }
      title={order ? `${order.number} — invoys kiritish` : "Invoys"}
      description="Yetkazib beruvchi hisob-fakturasi qator darajasida buyurtma va qabul bilan solishtiriladi (Three-Way Matching)."
      onClose={onClose}
      footer={
        <>
          <button className="purchase-btn purchase-btn--ghost" type="button" onClick={onClose}>
            Bekor qilish
          </button>
          <button
            className="purchase-btn purchase-btn--primary"
            type="button"
            disabled={!canSubmitInvoice}
            onClick={submit}
          >
            <Receipt size={16} />
            Invoysni saqlash
          </button>
        </>
      }
    >
      {duplicatePending && duplicateInvoice && (
        <div className="purchase-invoice__duplicate-dialog" role="alertdialog">
          <AlertTriangle size={18} />
          <div>
            <strong>Dublikat invoys aniqlandi</strong>
            <p>
              {getSupplier?.(order?.supplierId)?.name || "Yetkazib beruvchi"} ·{" "}
              {invoiceNumberValue} · {formatPurchaseDate(invoiceDateValue)} ·{" "}
              {formatMoney(totalAmount)} allaqachon mavjud.
            </p>
            <div className="purchase-invoice__duplicate-actions">
              <button
                className="purchase-btn purchase-btn--ghost"
                type="button"
                onClick={() => setDuplicatePending(false)}
              >
                Qayta tekshirish
              </button>
              <button
                className="purchase-btn purchase-btn--danger"
                type="button"
                onClick={handleSubmit(persist)}
              >
                Baribir saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      <PurchaseThreeWayMatchPanel
        lines={matchResult.lines}
        summary={matchResult.summary}
        compact
        emptyText="Hali hech narsa qabul qilinmagan — qatorlarga miqdor kiriting."
      />

      {duplicateInvoice && !duplicatePending && (
        <PurchaseAlert tone="warning" title="Dublikat ehtimoli bor">
          Shu yetkazib beruvchi, invoys raqami, sana va summa bilan hujjat
          topildi. Saqlashdan oldin alohida tasdiq talab qilinadi.
        </PurchaseAlert>
      )}

      <Controller
        control={control}
        name="invoiceNumber"
        rules={{ required: "Invoys raqami majburiy" }}
        render={({ field: { ref: _ref, ...field } }) => (
          <PurchaseTextField
            label="Invoys raqami"
            placeholder="SUP-INV-2026-001"
            error={errors.invoiceNumber?.message}
            {...field}
          />
        )}
      />

      <Controller
        control={control}
        name="invoiceDate"
        rules={{ required: "Invoys sanasi majburiy" }}
        render={({ field }) => (
          <PurchaseDateField
            label="Invoys sanasi"
            error={errors.invoiceDate?.message}
            {...field}
          />
        )}
      />

      <span className="purchase-invoice__section-title">
        Invoys qatorlari — supplier hisobiga ko'ra
      </span>

      <div className="purchase-invoice__lines" role="table">
        <div className="purchase-invoice__line-row purchase-invoice__line-row--head" role="row">
          <span>Tovar</span>
          <span>Qabul</span>
          <span>Invoys miqdori</span>
          <span>Narx</span>
          <span>Jami</span>
        </div>

        {lines.map((line) => {
          const computed = matchResult.lines.find((row) => row.itemId === line.itemId);

          return (
            <div className="purchase-invoice__line-wrap" key={line.itemId}>
              <div className="purchase-invoice__line-row" role="row">
                <span className="purchase-invoice__line-name">
                  {line.name}
                  <small>{line.sku}</small>
                  <button
                    type="button"
                    className={
                      line.advancedOpen
                        ? "purchase-invoice__line-toggle purchase-invoice__line-toggle--open"
                        : "purchase-invoice__line-toggle"
                    }
                    onClick={() =>
                      updateLine(line.itemId, "advancedOpen", !line.advancedOpen)
                    }
                  >
                    {line.advancedOpen ? "Chegirma / QQS" : "+ Chegirma / QQS"}
                    <ChevronDown size={12} />
                  </button>
                </span>

                <span className="purchase-invoice__line-ref">
                  {formatQuantity(line.receivedQty)}
                  <small>buyurtma {formatQuantity(line.orderedQty)}</small>
                </span>

                <span>
                  <input
                    type="number"
                    min="0"
                    value={line.invoicedQty}
                    onChange={(event) =>
                      updateLine(line.itemId, "invoicedQty", event.target.value)
                    }
                  />
                </span>

                <span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={line.unitPrice}
                    onChange={(event) =>
                      updateLine(line.itemId, "unitPrice", event.target.value)
                    }
                  />
                </span>

                <span className="purchase-invoice__line-total">
                  {formatMoney(computed?.lineTotal.invoiced || 0)}
                </span>
              </div>

              {line.advancedOpen && (
                <div className="purchase-invoice__line-advanced">
                  <label>
                    <span>Chegirma (%)</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={line.discountPercent}
                      onChange={(event) =>
                        updateLine(line.itemId, "discountPercent", event.target.value)
                      }
                    />
                  </label>
                  <label>
                    <span>QQS (%)</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={line.taxRate}
                      onChange={(event) =>
                        updateLine(line.itemId, "taxRate", event.target.value)
                      }
                    />
                  </label>
                </div>
              )}
            </div>
          );
        })}

        {!lines.length && (
          <p className="purchase-invoice__lines-empty">
            Bu PO bo'yicha hali qabul qilingan tovar yo'q.
          </p>
        )}
      </div>

      <div className="purchase-invoice__extra-lines">
        {extraLines.map((line) => (
          <div className="purchase-invoice__extra-line" key={line.id}>
            <input
              type="text"
              placeholder="Qo'shimcha tovar / xizmat nomi..."
              value={line.name}
              onChange={(event) => updateExtraLine(line.id, "name", event.target.value)}
            />
            <input
              type="number"
              min="0"
              placeholder="Miqdor"
              value={line.invoicedQty}
              onChange={(event) =>
                updateExtraLine(line.id, "invoicedQty", event.target.value)
              }
            />
            <input
              type="number"
              min="0"
              step="1000"
              placeholder="Narx"
              value={line.unitPrice}
              onChange={(event) =>
                updateExtraLine(line.id, "unitPrice", event.target.value)
              }
            />
            <button
              type="button"
              aria-label="Qatorni olib tashlash"
              onClick={() => removeExtraLine(line.id)}
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}

        <button
          className="purchase-invoice__add-line"
          type="button"
          onClick={() => setExtraLines((current) => [...current, createExtraLine()])}
        >
          <Plus size={14} />
          PO'da yo'q qator qo'shish (ortiqcha tovar/xizmat)
        </button>
      </div>

      <div className="purchase-invoice__total">
        <span>Invoys summasi</span>
        <strong>{formatMoney(totalAmount)}</strong>
      </div>

      <Controller
        control={control}
        name="dueDate"
        rules={{ required: "To'lov muddati majburiy" }}
        render={({ field }) => (
          <PurchaseDateField
            label="To'lov muddati"
            error={errors.dueDate?.message}
            {...field}
          />
        )}
      />

      <Controller
        control={control}
        name="note"
        render={({ field }) => (
          <PurchaseTextarea
            label="Izoh"
            rows={2}
            placeholder="Invoys bo'yicha izoh..."
            {...field}
          />
        )}
      />

      <PurchaseAttachmentManager
        compact
        title="Invoys fayllari"
        emptyTitle="Invoys fayli biriktirilmagan"
        emptyText="Hisob-faktura PDF, rasm yoki qo'shimcha hujjatlarni qo'shing."
        attachments={attachments}
        onAdd={(files) => setAttachments((current) => [...current, ...files])}
        onRemove={(file) =>
          setAttachments((current) =>
            current.filter((entry) => entry.id !== file.id),
          )
        }
      />
    </PurchaseModal>
  );
};

export default PurchaseInvoiceModal;
