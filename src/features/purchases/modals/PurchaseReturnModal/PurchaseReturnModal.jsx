// PDF 36: Purchase Return — faqat qabul qilingan tovar qaytariladi,
// miqdor qabuldan oshmaydi, sabab majburiy, menejer tasdig'iga yuboriladi.

import { useEffect, useMemo, useState } from "react";
import { Undo2 } from "lucide-react";

import PurchaseAlert from "../../components/PurchaseAlert/PurchaseAlert";
import PurchaseModal from "../../components/PurchaseModal/PurchaseModal";
import PurchaseSelectField from "../../components/PurchaseSelectField/PurchaseSelectField";
import PurchaseTextarea from "../../components/PurchaseTextarea/PurchaseTextarea";
import { RETURN_COMPENSATIONS, RETURN_REASONS } from "../../constants/paymentTerms";
import { formatCurrencyMoney, formatQuantity } from "../../utils/purchaseMoney";

import "./PurchaseReturnModal.scss";

const buildLines = (order) =>
  (order?.items || [])
    .map((item) => ({
      itemId: item.id,
      name: item.name,
      price: item.price / (item.unitFactor || 1), // bazaviy birlik narxi
      maxQty: Math.max(item.receivedQty - (item.returnedQty || 0), 0),
      quantity: 0,
    }))
    .filter((line) => line.maxQty > 0);

const PurchaseReturnModal = ({ open, order, onClose, onConfirm }) => {
  const [lines, setLines] = useState([]);
  const [reason, setReason] = useState(RETURN_REASONS[0].id);
  const [compensation, setCompensation] = useState(RETURN_COMPENSATIONS[0].id);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open || !order) return;

    setLines(buildLines(order));
    setReason(RETURN_REASONS[0].id);
    setCompensation(RETURN_COMPENSATIONS[0].id);
    setNote("");
  }, [open, order]);

  const updateQuantity = (itemId, rawValue) => {
    setLines((current) =>
      current.map((line) =>
        line.itemId === itemId
          ? {
              ...line,
              // PDF 36: qaytarish miqdori qabuldan oshmasin
              quantity: Math.min(Math.max(Number(rawValue) || 0, 0), line.maxQty),
            }
          : line,
      ),
    );
  };

  const total = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity * line.price, 0),
    [lines],
  );

  const canConfirm = total > 0;

  return (
    <PurchaseModal
      open={open}
      eyebrow={
        <>
          <Undo2 size={14} />
          Xarid qaytarish
        </>
      }
      title={order ? `${order.number} — qaytarish` : "Qaytarish"}
      description="Qaytarish menejer tasdig'idan keyin yetkazib beruvchiga yuboriladi. Ombor qoldig'i va yetkazib beruvchi qarzi kamayadi."
      onClose={onClose}
      footer={
        <>
          <button className="purchase-btn purchase-btn--ghost" type="button" onClick={onClose}>
            Bekor qilish
          </button>
          <button
            className="purchase-btn purchase-btn--primary"
            type="button"
            disabled={!canConfirm}
            onClick={() =>
              onConfirm?.({
                orderId: order.id,
                reason,
                compensation,
                note,
                items: lines
                  .filter((line) => line.quantity > 0)
                  .map(({ itemId, name, quantity, price }) => ({
                    itemId,
                    name,
                    quantity,
                    price,
                  })),
              })
            }
          >
            <Undo2 size={16} />
            Tasdiqqa yuborish
          </button>
        </>
      }
    >
      <div className="purchase-return__reason-grid">
        <PurchaseSelectField
          label="Qaytarish sababi"
          value={reason}
          options={RETURN_REASONS.map((entry) => ({
            value: entry.id,
            label: entry.label,
          }))}
          onChange={setReason}
        />

        <PurchaseSelectField
          label="Kompensatsiya turi"
          value={compensation}
          options={RETURN_COMPENSATIONS.map((entry) => ({
            value: entry.id,
            label: entry.label,
          }))}
          onChange={setCompensation}
        />
      </div>

      <div className="purchase-return__lines">
        {lines.length === 0 && (
          <PurchaseAlert tone="info">
            Qaytarish uchun qabul qilingan tovar yo'q.
          </PurchaseAlert>
        )}

        {lines.map((line) => (
          <div className="purchase-return__line" key={line.itemId}>
            <span className="purchase-return__name">
              {line.name}
              <small>Qaytarish mumkin: {formatQuantity(line.maxQty)}</small>
            </span>

            <span className="purchase-return__qty">
              <input
                type="number"
                min="0"
                max={line.maxQty}
                value={line.quantity}
                onChange={(event) =>
                  updateQuantity(line.itemId, event.target.value)
                }
              />
              <button
                type="button"
                title="Hammasini qaytarish"
                onClick={() => updateQuantity(line.itemId, line.maxQty)}
              >
                max
              </button>
            </span>

            <strong>
              {formatCurrencyMoney(line.quantity * line.price, order?.currency)}
            </strong>
          </div>
        ))}
      </div>

      <PurchaseTextarea
        label="Izoh / dalil"
        rows={2}
        value={note}
        placeholder="Nuqson tavsifi, dalil havolasi..."
        onChange={(event) => setNote(event.target.value)}
      />

      <div className="purchase-return__total">
        <span>Jami qaytarish summasi</span>
        <strong>{formatCurrencyMoney(total, order?.currency)}</strong>
      </div>
    </PurchaseModal>
  );
};

export default PurchaseReturnModal;
