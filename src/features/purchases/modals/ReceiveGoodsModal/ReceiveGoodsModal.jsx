// PDF 21-29, 33, 56: Goods Receiving — qisman/to'liq qabul, ombor tanlash,
// buzuq/yetishmagan, barcode qabul, batch/muddat kuzatuvi, landed cost
// (Enterprise taqsimlash dvigateli), fayllar.

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Droplets,
  Equal,
  Hash,
  Package,
  PackageCheck,
  Plus,
  ScanLine,
  SlidersHorizontal,
  Trash2,
  Weight,
} from "lucide-react";

import PurchaseAttachmentManager from "../../components/PurchaseAttachmentManager/PurchaseAttachmentManager";
import PurchaseAlert from "../../components/PurchaseAlert/PurchaseAlert";
import PurchaseDateField from "../../components/PurchaseDateField/PurchaseDateField";
import PurchaseModal from "../../components/PurchaseModal/PurchaseModal";
import PurchaseSelectField from "../../components/PurchaseSelectField/PurchaseSelectField";
import PurchaseStatusBadge from "../../components/PurchaseStatusBadge/PurchaseStatusBadge";
import PurchaseTextarea from "../../components/PurchaseTextarea/PurchaseTextarea";
// Bug fix: Barcode maydoni ilgari xom JSX bilan .purchase-text-field
// class'larini qo'lda takrorlar edi (label+control+input) — bu Ombor
// selectori (PurchaseSelectField/ui-dropdown) bilan solishtirganda bir
// necha piksel farq berardi (masalan hint/xabar qatori struktura jihatidan
// yo'q edi). Endi ASL PurchaseTextField komponenti ishlatiladi — shu
// modulda hamma joyda ishlatilgani uchun boshqa maydonlar bilan piksel
// darajasida KAFOLATLANGAN bir xil struktura/balandlik beradi.
import PurchaseTextField from "../../components/PurchaseTextField/PurchaseTextField";
import { DAMAGED_ACTIONS } from "../../constants/paymentTerms";
import {
  LANDED_COST_ALLOCATION_METHODS,
  LANDED_COST_TYPES,
  getLandedCostAllocationMethodLabel,
} from "../../constants/landedCosts";
import {
  getRemainingQty,
  toBaseQuantity,
} from "../../utils/purchaseCalculations";
import { computeLandedCostAllocation, sumLandedCostEntries, validateLandedCostEntries } from "../../utils/landedCostAllocation";
import {
  formatCurrencyMoney,
  formatQuantity,
  normalizeNumber,
} from "../../utils/purchaseMoney";

import "./ReceiveGoodsModal.scss";

const buildLines = (order) =>
  (order?.items || []).map((item) => ({
    itemId: item.id,
    name: item.name,
    sku: item.sku,
    barcode: item.barcode || "",
    ordered: toBaseQuantity(item),
    alreadyReceived: item.receivedQty,
    remaining: getRemainingQty(item),
    received: getRemainingQty(item),
    damaged: 0,
    missing: 0,
    damagedAction: DAMAGED_ACTIONS[0].id,
    // PDF 29, 33: partiya va muddat kuzatuvi
    batchNumber: "",
    manufacturingDate: "",
    expiryDate: "",
    trackBatch: false,
    // PDF 56 (Enterprise): landed cost taqsimlash bazasi — asl narx buyurtmadan
    // meros olinadi, og'irlik/hajm esa faqat shu usul tanlanganda kerak bo'lgani
    // uchun qabul vaqtida qo'lda kiritiladi (mahsulot katalogida hali yo'q).
    unitPrice: normalizeNumber(item.price),
    weightPerUnit: "",
    volumePerUnit: "",
  }));

let costEntrySeq = 0;
const makeCostEntry = () => ({
  id: `cost-${Date.now()}-${costEntrySeq++}`,
  type: LANDED_COST_TYPES[0].id,
  amount: "",
});

const LANDED_COST_METHOD_ICONS = {
  quantity: Hash,
  value: Package,
  weight: Weight,
  volume: Droplets,
  equal: Equal,
  manual: SlidersHorizontal,
};

// UI fix: "Taqsimlash usuli" dropdown har bir variant chap tomonda o'z
// ikonkasi bilan ko'rsatilishi kerak (dizayn maqsadiga muvofiq). Shared
// Dropdown komponenti (`components/ui/Dropdown`) options.label'ni istalgan
// React node sifatida render qiladi — shu sabab ikonka shared komponentga
// tegmasdan, faqat shu yerda (option label'ini boyitish orqali) qo'shiladi.
const buildLandedCostMethodOptions = () =>
  LANDED_COST_ALLOCATION_METHODS.map((method) => {
    const Icon = LANDED_COST_METHOD_ICONS[method.id] || Package;

    return {
      value: method.id,
      label: (
        <span className="receive-goods__method-option" title={method.description}>
          <Icon size={15} />
          {method.label}
        </span>
      ),
    };
  });

// Statik ma'lumotdan qurilgan — komponent har render'ida qayta hisoblanishi
// shart emas, bir marta modul darajasida tayyorlanadi.
const landedCostMethodOptions = buildLandedCostMethodOptions();
const landedCostTypeOptions = LANDED_COST_TYPES.map((type) => ({
  value: type.id,
  label: type.label,
}));

const ReceiveGoodsModal = ({ open, order, warehouses = [], onClose, onConfirm }) => {
  const [lines, setLines] = useState([]);
  const [warehouseId, setWarehouseId] = useState("");
  const [note, setNote] = useState("");
  const [barcodeValue, setBarcodeValue] = useState("");
  const [barcodeStatus, setBarcodeStatus] = useState(null);
  const [costEntries, setCostEntries] = useState([makeCostEntry()]);
  const [landedCostMethod, setLandedCostMethod] = useState(
    LANDED_COST_ALLOCATION_METHODS[0].id,
  );
  const [manualAllocations, setManualAllocations] = useState({});
  const [attachments, setAttachments] = useState([]);
  // Bug fix: tasdiqlash saqlanayotganda ikkinchi marta bosilishining oldini
  // olish (duplicate submit) va saqlash muvaffaqiyatsiz bo'lsa xatoni
  // ko'rsatish uchun — modal FAQAT saqlash haqiqatan muvaffaqiyatli
  // bo'lgandan keyin yopiladi.
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (!open || !order) return;

    setLines(buildLines(order));
    setWarehouseId(order.warehouseId || warehouses[0]?.id || "");
    setNote("");
    setBarcodeValue("");
    setBarcodeStatus(null);
    setCostEntries([makeCostEntry()]);
    setLandedCostMethod(LANDED_COST_ALLOCATION_METHODS[0].id);
    setManualAllocations({});
    setAttachments([]);
    setSubmitting(false);
    setSubmitError(null);
  }, [open, order, warehouses]);

  const updateLine = (itemId, field, rawValue) => {
    const numericFields = ["received", "damaged", "missing", "weightPerUnit", "volumePerUnit"];
    const value = numericFields.includes(field)
      ? Math.max(Number(rawValue) || 0, 0)
      : rawValue;

    setLines((current) =>
      current.map((line) =>
        line.itemId === itemId ? { ...line, [field]: value } : line,
      ),
    );
  };

  // PDF 23: "Hammasini qabul" — bir tugma bilan
  const receiveAll = () => {
    setLines((current) =>
      current.map((line) => ({
        ...line,
        received: line.remaining,
        damaged: 0,
        missing: 0,
      })),
    );
  };

  // PDF 27: barcode bilan qabul — har skan +1
  const handleBarcodeSubmit = (event) => {
    event.preventDefault();

    const code = barcodeValue.trim();

    if (!code) return;

    const productLine = lines.find(
      (line) => line.sku === code || line.barcode === code,
    );

    if (!productLine) {
      setBarcodeStatus({ tone: "danger", text: "Bu barcode PO tarkibida yo'q!" });
    } else {
      updateLine(productLine.itemId, "received", productLine.received + 1);
      setBarcodeStatus({ tone: "success", text: `${productLine.name} +1` });
    }

    setBarcodeValue("");
  };

  const summary = useMemo(() => {
    const totalReceived = lines.reduce((sum, line) => sum + line.received, 0);
    const totalDamaged = lines.reduce((sum, line) => sum + line.damaged, 0);
    const totalMissing = lines.reduce((sum, line) => sum + line.missing, 0);
    const overLines = lines.filter((line) => line.received > line.remaining);
    // Bug fix (root cause): oldin faqat "received > remaining" tekshirilardi,
    // lekin buzuq/yetishmagan miqdor ham shu partiyaning qolgan miqdoridan
    // (remaining) oshib ketmasligi kerak — store'dagi qoida ANIQ shu (PDF 22).
    // Bu ikkalasi mos kelmagani sabab foydalanuvchi "Received + Damaged +
    // Missing" jamini remaining'dan oshirib yuborsa, tugma FAOL ko'rinardi,
    // lekin saqlash store tomonida JIMgina rad etilardi (hasInvalidLine) —
    // modal esa baribir yopilib ketardi. Endi shu holat oldindan bloklanadi.
    const overCapacityLines = lines.filter((line) => {
      const EPSILON = 1e-6;
      return line.received + line.damaged + line.missing - line.remaining > EPSILON;
    });
    const fullyReceived = lines.every(
      (line) => line.received >= line.remaining,
    );
    // PDF 33: muddati o'tgan tovar qabul qilinmaydi
    const expiredLines = lines.filter(
      (line) =>
        line.expiryDate &&
        line.expiryDate <= new Date().toISOString().slice(0, 10),
    );

    return {
      totalReceived,
      totalDamaged,
      totalMissing,
      overLines,
      overCapacityLines,
      fullyReceived,
      expiredLines,
    };
  }, [lines]);

  // PDF 56 (Enterprise): shu qabulda haqiqatan miqdori bor qatorlar —
  // og'irlik/hajm/qo'lda taqsimlash maydonlari faqat shular uchun ko'rsatiladi.
  const receivingLines = useMemo(
    () => lines.filter((line) => line.received > 0),
    [lines],
  );

  const landedCostTotal = sumLandedCostEntries(costEntries);
  const landedCostEntryErrors = validateLandedCostEntries(costEntries);

  const landedCostAllocation = useMemo(
    () =>
      computeLandedCostAllocation({
        totalCost: landedCostTotal,
        method: landedCostMethod,
        lines: receivingLines.map((line) => ({
          itemId: line.itemId,
          name: line.name,
          quantity: line.received,
          unitPrice: line.unitPrice,
          weightPerUnit: line.weightPerUnit,
          volumePerUnit: line.volumePerUnit,
        })),
        manualAllocations,
      }),
    [landedCostTotal, landedCostMethod, receivingLines, manualAllocations],
  );

  const landedCostErrors = [
    ...landedCostEntryErrors,
    ...landedCostAllocation.errors,
  ];

  const addCostEntry = () => {
    setCostEntries((current) => [...current, makeCostEntry()]);
  };

  const removeCostEntry = (id) => {
    setCostEntries((current) =>
      current.length > 1 ? current.filter((entry) => entry.id !== id) : current,
    );
  };

  const updateCostEntry = (id, field, value) => {
    setCostEntries((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)),
    );
  };

  const canConfirm =
    !!warehouseId &&
    (summary.totalReceived > 0 ||
      summary.totalDamaged > 0 ||
      summary.totalMissing > 0) &&
    summary.overLines.length === 0 && // PDF 22: jami qabul buyurtmadan oshmasin
    summary.overCapacityLines.length === 0 &&
    summary.expiredLines.length === 0 &&
    landedCostErrors.length === 0 &&
    !submitting;

  // Bug fix: tasdiqlash endi natijani KUTADI va FAQAT muvaffaqiyatli
  // saqlangandan keyin modalni yopadi. `onConfirm` prop'i store amalining
  // natijasini (yaratilgan hujjat yoki `null`/`undefined` agar rad etilgan
  // bo'lsa) qaytarishi kutiladi — ota-komponent endi o'zi mustaqil yopmaydi.
  // `Promise.resolve(...)` kelajakda backend chaqiruvi asinxron bo'lsa ham
  // ishlashini ta'minlaydi (await bilan bir xil ishlaydi).
  const handleConfirm = async () => {
    if (!canConfirm) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const result = await Promise.resolve(
        onConfirm?.({
          orderId: order.id,
          warehouseId,
          note,
          lines,
          // PDF 56 (Enterprise): endi 10 ta standart xarajat turi qo'llab-
          // quvvatlanadi, faqat foydalanuvchi qo'shgan qatorlar yuboriladi —
          // store shu ro'yxatdan taqsimlashni MUSTAQIL qayta hisoblaydi
          // (clientdan kelgan tayyor natijaga ishonilmaydi).
          landedCosts: costEntries
            .filter((entry) => normalizeNumber(entry.amount) !== 0)
            .map((entry) => ({ type: entry.type, amount: normalizeNumber(entry.amount) })),
          landedCostMethod,
          manualAllocations,
          attachments,
        }),
      );

      if (!result) {
        // Store rad etdi (masalan PO holati shu orada o'zgargan) — modal
        // OCHIQ qoladi, kiritilgan ma'lumot yo'qolmaydi, xato ko'rsatiladi.
        setSubmitError(
          "Qabulni saqlab bo'lmadi — miqdorlarni tekshiring yoki buyurtma holatini yangilab qayta urinib ko'ring.",
        );
        return;
      }

      onClose?.();
    } catch (error) {
      setSubmitError(error?.message || "Kutilmagan xatolik yuz berdi — qayta urinib ko'ring.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PurchaseModal
      open={open}
      size="lg"
      eyebrow={
        <>
          <PackageCheck size={14} />
          Tovar qabul qilish
        </>
      }
      title={order ? `${order.number} — qabul` : "Qabul"}
      description="Kelgan miqdorni belgilang. Buzuq tovar omborga kirmaydi, yetishmagan alohida qayd etiladi."
      onClose={onClose}
      footer={
        <>
          <button
            className="purchase-btn purchase-btn--ghost"
            type="button"
            disabled={submitting}
            onClick={onClose}
          >
            Bekor qilish
          </button>
          <button
            className="purchase-btn purchase-btn--success"
            type="button"
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            <PackageCheck size={16} />
            {submitting ? "Saqlanmoqda..." : "Qabulni tasdiqlash"}
          </button>
        </>
      }
    >
      <div className="receive-goods__top">
        <PurchaseSelectField
          className="receive-goods__warehouse"
          label="Ombor"
          value={warehouseId}
          options={warehouses.map((warehouse) => ({
            value: warehouse.id,
            label: `${warehouse.name} · ${warehouse.branch}`,
          }))}
          onChange={setWarehouseId}
        />

        <form className="receive-goods__barcode" onSubmit={handleBarcodeSubmit}>
          <PurchaseTextField
            label="Barcode / SKU skanerlash"
            type="text"
            placeholder="Barcode / SKU skanerlang..."
            leftIcon={<ScanLine size={16} />}
            value={barcodeValue}
            onChange={(event) => setBarcodeValue(event.target.value)}
          />
        </form>
      </div>

      {barcodeStatus && (
        <PurchaseAlert tone={barcodeStatus.tone === "danger" ? "danger" : "success"}>
          {barcodeStatus.text}
        </PurchaseAlert>
      )}

      <div className="receive-goods__table" role="table">
        <div className="receive-goods__row receive-goods__row--head" role="row">
          <span>Tovar</span>
          <span>Buyurtma</span>
          <span>Qolgan</span>
          <span>Keldi</span>
          <span>Buzuq</span>
          <span>Yetishmadi</span>
        </div>

        {lines.map((line) => (
          <div className="receive-goods__line-wrap" key={line.itemId}>
            <div
              className={`receive-goods__row ${
                line.received > line.remaining ? "receive-goods__row--over" : ""
              }`}
              role="row"
            >
              <span className="receive-goods__name">
                {line.name}
                <small>{line.sku}</small>
                <button
                  type="button"
                  className={
                    line.trackBatch
                      ? "receive-goods__batch-toggle receive-goods__batch-toggle--open"
                      : "receive-goods__batch-toggle"
                  }
                  onClick={() =>
                    updateLine(line.itemId, "trackBatch", !line.trackBatch)
                  }
                >
                  {line.trackBatch ? "Partiya / muddat" : "+ Partiya / muddat"}
                  <ChevronDown size={12} />
                </button>
              </span>
              <span>{formatQuantity(line.ordered)}</span>
              <span>{formatQuantity(line.remaining)}</span>
              <span>
                <input
                  type="number"
                  min="0"
                  value={line.received}
                  onChange={(event) =>
                    updateLine(line.itemId, "received", event.target.value)
                  }
                />
              </span>
              <span>
                <input
                  type="number"
                  min="0"
                  value={line.damaged}
                  onChange={(event) =>
                    updateLine(line.itemId, "damaged", event.target.value)
                  }
                />
              </span>
              <span>
                <input
                  type="number"
                  min="0"
                  value={line.missing}
                  onChange={(event) =>
                    updateLine(line.itemId, "missing", event.target.value)
                  }
                />
              </span>
            </div>

            {line.trackBatch && (
              <div className="receive-goods__batch">
                <label>
                  <span>Batch raqami</span>
                  <input
                    type="text"
                    placeholder="B-2026-001"
                    value={line.batchNumber}
                    onChange={(event) =>
                      updateLine(line.itemId, "batchNumber", event.target.value)
                    }
                  />
                </label>
                <PurchaseDateField
                  label="Ishlab chiqarilgan"
                  value={line.manufacturingDate}
                  onChange={(event) =>
                    updateLine(
                      line.itemId,
                      "manufacturingDate",
                      event.target.value,
                    )
                  }
                />
                <PurchaseDateField
                  label="Yaroqlilik muddati"
                  value={line.expiryDate}
                  onChange={(event) =>
                    updateLine(line.itemId, "expiryDate", event.target.value)
                  }
                />
              </div>
            )}

            {line.damaged > 0 && (
              <div className="receive-goods__damaged-action">
                <PurchaseSelectField
                  label={`${line.name} — buzuq tovar amali`}
                  value={line.damagedAction}
                  options={DAMAGED_ACTIONS.map((action) => ({
                    value: action.id,
                    label: action.label,
                  }))}
                  onChange={(value) =>
                    updateLine(line.itemId, "damagedAction", value)
                  }
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {summary.overLines.length > 0 && (
        <PurchaseAlert tone="danger">
          Qabul miqdori buyurtmadan oshmasligi kerak:{" "}
          {summary.overLines.map((line) => line.name).join(", ")}
        </PurchaseAlert>
      )}

      {/* Bug fix: Keldi + Buzuq + Yetishmagan jami shu partiyaning qolgan
          miqdoridan oshmasligi kerak — aks holda saqlash store tomonida
          jimgina rad etilardi. Endi foydalanuvchi buni tasdiqlashdan OLDIN,
          aniq ko'radi. */}
      {summary.overCapacityLines.length > 0 && (
        <PurchaseAlert tone="danger">
          Keldi + Buzuq + Yetishmagan jami qolgan miqdordan oshmasligi kerak:{" "}
          {summary.overCapacityLines.map((line) => line.name).join(", ")}
        </PurchaseAlert>
      )}

      {submitError && <PurchaseAlert tone="danger">{submitError}</PurchaseAlert>}

      {summary.expiredLines.length > 0 && (
        <PurchaseAlert tone="danger">
          Muddati o'tgan tovar qabul qilinmaydi:{" "}
          {summary.expiredLines.map((line) => line.name).join(", ")}
        </PurchaseAlert>
      )}

      {!summary.fullyReceived && summary.totalReceived > 0 && (
        <PurchaseAlert tone="warning">
          Qisman qabul — PO holati "Qisman kelgan" bo'ladi, qolgani kutilmoqda.
        </PurchaseAlert>
      )}

      {/* PDF 56 (Enterprise): Landed cost — qo'shimcha xarajatlar tannarxga,
          taqsimlash usuli tanlanadi va mahsulot bo'yicha AVTOMATIK qayta
          hisoblanadi (usul almashtirilganda kiritilgan summalar yo'qolmaydi). */}
      <div className="receive-goods__landed">
        <span className="receive-goods__landed-title">
          Qo'shimcha xarajatlar — landed cost
        </span>

        <div className="receive-goods__cost-list">
          {costEntries.map((entry, index) => (
            <div className="receive-goods__cost-row" key={entry.id}>
              <PurchaseSelectField
                label={index === 0 ? "Xarajat turi" : undefined}
                value={entry.type}
                options={landedCostTypeOptions}
                onChange={(value) => updateCostEntry(entry.id, "type", value)}
              />

              <label className="receive-goods__cost-amount">
                <span>{index === 0 ? "Summa" : " "}</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="0"
                  value={entry.amount}
                  onChange={(event) =>
                    updateCostEntry(entry.id, "amount", event.target.value)
                  }
                />
              </label>

              <button
                type="button"
                className="receive-goods__cost-remove"
                onClick={() => removeCostEntry(entry.id)}
                disabled={costEntries.length === 1}
                title="Xarajatni o'chirish"
                aria-label="Xarajatni o'chirish"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          <button
            type="button"
            className="receive-goods__cost-add"
            onClick={addCostEntry}
          >
            <Plus size={14} />
            Xarajat qo'shish
          </button>
        </div>

        <PurchaseSelectField
          className="receive-goods__landed-method"
          label="Taqsimlash usuli"
          value={landedCostMethod}
          options={landedCostMethodOptions}
          onChange={setLandedCostMethod}
        />

        {(landedCostMethod === "weight" || landedCostMethod === "volume") &&
          receivingLines.length > 0 && (
            <div className="receive-goods__basis-grid">
              <span className="receive-goods__basis-title">
                {landedCostMethod === "weight"
                  ? "Har tovarning og'irligi (kg / dona)"
                  : "Har tovarning hajmi (m³ / dona)"}
              </span>

              {receivingLines.map((line) => (
                <label key={line.itemId}>
                  <span>{line.name}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={
                      landedCostMethod === "weight"
                        ? line.weightPerUnit
                        : line.volumePerUnit
                    }
                    onChange={(event) =>
                      updateLine(
                        line.itemId,
                        landedCostMethod === "weight" ? "weightPerUnit" : "volumePerUnit",
                        event.target.value,
                      )
                    }
                  />
                </label>
              ))}
            </div>
          )}

        {landedCostMethod === "manual" && receivingLines.length > 0 && (
          <div className="receive-goods__basis-grid">
            <span className="receive-goods__basis-title">
              Har tovar uchun taqsimlanadigan summa
            </span>

            {receivingLines.map((line) => (
              <label key={line.itemId}>
                <span>{line.name}</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="0"
                  value={manualAllocations[line.itemId] ?? ""}
                  onChange={(event) =>
                    setManualAllocations((current) => ({
                      ...current,
                      [line.itemId]: event.target.value,
                    }))
                  }
                />
              </label>
            ))}
          </div>
        )}

        <div className="receive-goods__landed-total">
          <span>Jami landed cost</span>
          <strong>{formatCurrencyMoney(landedCostTotal, order?.currency)}</strong>
          <small>{getLandedCostAllocationMethodLabel(landedCostMethod)}</small>
        </div>

        {landedCostErrors.map((message) => (
          <PurchaseAlert tone="danger" key={message}>
            {message}
          </PurchaseAlert>
        ))}

        {landedCostTotal > 0 && landedCostAllocation.allocations.length > 0 && (
          <div className="receive-goods__allocation">
            <span className="receive-goods__basis-title">
              Taqsimlash natijasi — mahsulot bo'yicha
            </span>

            <div className="receive-goods__allocation-table" role="table">
              <div
                className="receive-goods__allocation-row receive-goods__allocation-row--head"
                role="row"
              >
                <span>Tovar</span>
                <span>Ulush</span>
                <span>Taqsimlangan</span>
                <span>Asl narx</span>
                <span>Yakuniy tannarx</span>
              </div>

              {landedCostAllocation.allocations.map((entry) => {
                const line = lines.find((item) => item.itemId === entry.itemId);
                const unitPrice = normalizeNumber(line?.unitPrice);
                const finalUnitCost = unitPrice + entry.unitCostAdded;

                return (
                  <div
                    className="receive-goods__allocation-row"
                    role="row"
                    key={entry.itemId}
                  >
                    <span>{entry.name}</span>
                    <span>{entry.sharePercent.toFixed(1)}%</span>
                    <span>{formatCurrencyMoney(entry.allocatedAmount, order?.currency)}</span>
                    <span>{formatCurrencyMoney(unitPrice, order?.currency)}</span>
                    <strong>{formatCurrencyMoney(finalUnitCost, order?.currency)}</strong>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* PDF 15, 34: dalil/hujjat biriktirish */}
      <div className="receive-goods__attachments">
        <PurchaseAttachmentManager
          compact
          title="Hujjatlar - dalil, foto, sertifikat"
          emptyTitle="Dalil fayllari qo'shilmagan"
          emptyText="Qabul dalili, rasm, sertifikat yoki akt fayllarini biriktiring."
          attachments={attachments}
          onAdd={(files) => setAttachments((current) => [...current, ...files])}
          onRemove={(file) =>
            setAttachments((current) =>
              current.filter((entry) => entry.id !== file.id),
            )
          }
        />
      </div>

      {/* Qabul xulosasi — Receiving Summary */}
      <span className="receive-goods__section-title">Qabul xulosasi</span>

      <div className="receive-goods__summary">
        <div>
          <span>Qabul qilinadi</span>
          <strong>{formatQuantity(summary.totalReceived)} dona</strong>
        </div>
        <div>
          <span>Buzuq</span>
          <strong
            className={
              summary.totalDamaged > 0 ? "receive-goods__summary-bad" : undefined
            }
          >
            {formatQuantity(summary.totalDamaged)} dona
          </strong>
        </div>
        <div>
          <span>Yetishmagan</span>
          <strong
            className={
              summary.totalMissing > 0 ? "receive-goods__summary-warn" : undefined
            }
          >
            {formatQuantity(summary.totalMissing)} dona
          </strong>
        </div>
        <div>
          <span>Landed cost</span>
          <strong>{formatCurrencyMoney(landedCostTotal, order?.currency)}</strong>
        </div>
        <div>
          <span>Hujjatlar</span>
          <strong>{attachments.length} ta fayl</strong>
        </div>
        <div>
          <span>Natija</span>
          {summary.totalReceived > 0 ? (
            <PurchaseStatusBadge
              status={summary.fullyReceived ? "full" : "partial"}
              label={summary.fullyReceived ? "To'liq qabul" : "Qisman qabul"}
              tone={summary.fullyReceived ? "success" : "warning"}
            />
          ) : (
            <strong>—</strong>
          )}
        </div>
      </div>

      <PurchaseTextarea
        label="Qabul izohi (nomuvofiqlik bo'lsa hujjatlashtiring)"
        rows={2}
        value={note}
        placeholder="Masalan: 1 quti namlangan, yetkazib beruvchiga da'vo qilinadi..."
        onChange={(event) => setNote(event.target.value)}
      />
    </PurchaseModal>
  );
};

export default ReceiveGoodsModal;
