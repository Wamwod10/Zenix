// PO hujjati sahifasi: tarkib, holat amallari (PDF 18), approval (PDF 5, 17),
// timeline (PDF 19), izohlar (PDF 16), fayllar (PDF 15), bog'liq hujjatlar.

import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Ban,
  CalendarClock,
  ChevronDown,
  CircleCheckBig,
  Copy,
  History,
  Link2,
  MessageSquare,
  MessageSquarePlus,
  PackageCheck,
  Paperclip,
  PencilLine,
  Printer,
  Receipt,
  Send,
  Undo2,
  Wallet,
} from "lucide-react";

import ApprovalStepsPanel from "../../components/ApprovalStepsPanel/ApprovalStepsPanel";
import BudgetImpactPanel from "../../components/BudgetImpactPanel/BudgetImpactPanel";
import PurchaseAttachmentManager from "../../components/PurchaseAttachmentManager/PurchaseAttachmentManager";
import PurchaseProgressBar from "../../components/PurchaseProgressBar/PurchaseProgressBar";
import PurchaseSelectField from "../../components/PurchaseSelectField/PurchaseSelectField";
import PurchaseStatusBadge, {
  InvoiceStatusBadge,
} from "../../components/PurchaseStatusBadge/PurchaseStatusBadge";
import PurchaseTabs from "../../components/PurchaseTabs/PurchaseTabs";
import PurchaseTextField from "../../components/PurchaseTextField/PurchaseTextField";
import PurchaseThreeWayMatchPanel from "../../components/PurchaseThreeWayMatchPanel/PurchaseThreeWayMatchPanel";
import PurchaseTimeline from "../../components/PurchaseTimeline/PurchaseTimeline";
import SupplierInfoCard from "../../components/SupplierInfoCard/SupplierInfoCard";
import ConfirmReasonModal from "../../modals/ConfirmReasonModal/ConfirmReasonModal";
import PaymentScheduleModal from "../../modals/PaymentScheduleModal/PaymentScheduleModal";
import PurchaseReturnModal from "../../modals/PurchaseReturnModal/PurchaseReturnModal";
import ReceiveGoodsModal from "../../modals/ReceiveGoodsModal/ReceiveGoodsModal";
import {
  CANCELLABLE_STATUSES,
  PURCHASE_STATUSES,
  RECEIVABLE_STATUSES,
  RETURNABLE_STATUSES,
  canTransitionStatus,
} from "../../constants/purchaseStatuses";
import { getPaymentTermById } from "../../constants/paymentTerms";
import {
  getLandedCostAllocationMethodLabel,
  getLandedCostTypeLabel,
} from "../../constants/landedCosts";
import {
  canApproveStep,
  hasPurchasePermission,
} from "../../constants/purchasePermissions";
import usePurchasesStore from "../../hooks/usePurchasesStore";
import {
  calculateLineSubtotal,
  calculateOrderTotals,
  getInvoiceRemaining,
  getSupplierOutstandingDebt,
  toBaseQuantity,
} from "../../utils/purchaseCalculations";
import { BASE_PURCHASE_CURRENCY } from "../../constants/currencies";
import { printPurchaseOrder } from "../../utils/purchasePrint";
import {
  formatCurrencyMoney,
  formatCurrencyWithBase,
  formatMoney,
  formatPurchaseDate,
  formatQuantity,
} from "../../utils/purchaseMoney";

import "./PurchaseOrderDetail.scss";

const PurchaseOrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const {
    currentUser,
    warehouses,
    orders,
    invoices,
    receipts,
    returns,
    getSupplier,
    getOrderById,
    getBudgetImpactsForOrder,
    actions,
  } = usePurchasesStore();

  const order = getOrderById(orderId);
  const supplier = order ? getSupplier(order.supplierId) : null;
  // Qarz supplier kartochkasidagi statik maydondan emas, ochiq invoyslardan
  // jonli hisoblanadi (bitta manba — src/features/purchases/utils/purchaseCalculations.js).
  const supplierDebt = supplier
    ? getSupplierOutstandingDebt(invoices, supplier.id)
    : 0;

  const [activeModal, setActiveModal] = useState(null); // receive | return | schedule | reject | cancel | close
  const [noteType, setNoteType] = useState("internal");
  const [noteText, setNoteText] = useState("");
  const [activeTab, setActiveTab] = useState("payments");
  const [expandedInvoiceId, setExpandedInvoiceId] = useState(null);

  // Task 5: PO YAKUNIY summasi landed cost'ni (yetkazish/bojxona/sug'urta)
  // o'z ichiga olishi kerak — shu PO uchun barcha qabul hujjatlaridagi
  // landed cost yig'indisi calculateOrderTotals'ga uzatiladi.
  const receiptsLandedCostTotal = receipts
    .filter((entry) => entry.orderId === order?.id)
    .reduce((sum, entry) => sum + (entry.landedCostTotal || 0), 0);

  // PDF 56 (Enterprise): foydalanuvchi "Landed cost" summasini bitta ko'r
  // yig'indi emas, balki qaysi xarajat turlaridan (Frax/Bojxona/Sug'urta/...)
  // tashkil topganini darhol ko'rishi kerak — barcha qabul hujjatlaridagi
  // xarajat qatorlari turi bo'yicha yig'iladi.
  const landedCostByType = useMemo(() => {
    const totals = {};

    receipts
      .filter((entry) => entry.orderId === order?.id)
      .forEach((entry) => {
        // Eski (pre-Enterprise) hujjatlarda landedCosts 3 ta qattiq
        // maydonli obyekt bo'lgan, endi esa {type, amount} massivi — eski
        // shakl shu yerda jimgina o'tkazib yuboriladi (buzilmaydi).
        if (!Array.isArray(entry.landedCosts)) return;

        entry.landedCosts.forEach((cost) => {
          totals[cost.type] = (totals[cost.type] || 0) + (Number(cost.amount) || 0);
        });
      });

    return Object.entries(totals).filter(([, amount]) => amount !== 0);
  }, [receipts, order?.id]);

  const totals = useMemo(
    () =>
      order
        ? calculateOrderTotals({
            ...order,
            landedCostTotal: receiptsLandedCostTotal,
          })
        : null,
    [order, receiptsLandedCostTotal],
  );

  if (!order) {
    return (
      <div className="po-detail__missing">
        <p>Buyurtma topilmadi.</p>
        <button
          className="purchase-btn purchase-btn--ghost"
          type="button"
          onClick={() => navigate("/purchases/orders")}
        >
          <ArrowLeft size={15} />
          Ro'yxatga qaytish
        </button>
      </div>
    );
  }

  const relatedReceipts = receipts.filter((entry) => entry.orderId === order.id);
  const relatedInvoices = invoices.filter((entry) => entry.orderId === order.id);
  const relatedReturns = returns.filter((entry) => entry.orderId === order.id);

  // PDF 57-60 (Enterprise Budget Control): shu PO tegishli byudjetlarga qanday
  // ta'sir qilganini ko'rsatadi — `excludeOrderId` shu PO ni bazaviy holatdan
  // chiqarib, keyin "xariddan keyin" sifatida qayta qo'shadi, natijada
  // ko'rsatilgan raqamlar HOZIRGI haqiqiy holatga teng bo'ladi (ikki marta
  // hisoblanmaydi).
  const budgetImpacts = getBudgetImpactsForOrder(order, { excludeOrderId: order.id });

  // Xarid tarixi — shu supplierning boshqa PO lari (PDF 6: tarix)
  const supplierHistory = orders
    .filter(
      (entry) =>
        entry.supplierId === order.supplierId && entry.id !== order.id,
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // To'lov holati — shu PO invoyslari bo'yicha
  const invoicedAmount = relatedInvoices.reduce(
    (sum, invoice) => sum + invoice.amount,
    0,
  );
  const paidAmount = relatedInvoices.reduce(
    (sum, invoice) => sum + invoice.paidAmount,
    0,
  );
  const outstandingAmount = relatedInvoices.reduce(
    (sum, invoice) => sum + getInvoiceRemaining(invoice),
    0,
  );

  const pendingStep = order.approvalSteps?.find(
    (step) => step.status === "pending",
  );
  const userCanApprove = canApproveStep({
    user: currentUser,
    order,
    step: pendingStep,
  });

  const canSubmit =
    order.status === PURCHASE_STATUSES.draft &&
    hasPurchasePermission(currentUser.role, "po.submit");
  const canSend =
    canTransitionStatus(order.status, PURCHASE_STATUSES.sent) &&
    hasPurchasePermission(currentUser.role, "po.send");
  const canReceive =
    RECEIVABLE_STATUSES.includes(order.status) &&
    hasPurchasePermission(currentUser.role, "receiving.create");
  const canReturn =
    RETURNABLE_STATUSES.includes(order.status) &&
    hasPurchasePermission(currentUser.role, "return.create") &&
    order.items.some((item) => item.receivedQty - (item.returnedQty || 0) > 0);
  // Task 5: "Invoys kiritish" o'rniga "To'lov jadvali" — invoyslar endi
  // avtomatik yaratiladi, tugma faqat mavjud invoyslar jadvalini ko'rsatadi.
  const canShowSchedule = relatedInvoices.length > 0;
  const canCancel =
    CANCELLABLE_STATUSES.includes(order.status) &&
    hasPurchasePermission(currentUser.role, "po.cancel");
  const canClose =
    canTransitionStatus(order.status, PURCHASE_STATUSES.closed) &&
    hasPurchasePermission(currentUser.role, "po.close");
  const canCreateRevision =
    order.status === PURCHASE_STATUSES.sent &&
    hasPurchasePermission(currentUser.role, "po.create");

  const statusRule = {
    [PURCHASE_STATUSES.draft]: {
      tone: "success",
      title: "Qoralama — to'liq tahrirlash",
      text: "Tovarlar, narx, ombor, sana va to'lov shartlari erkin o'zgartiriladi.",
    },
    [PURCHASE_STATUSES.approved]: {
      tone: canSend ? "info" : "warning",
      title: "Tasdiqlangan — ruxsat bilan yuboriladi",
      text: canSend
        ? "Sizda yetkazib beruvchiga yuborish huquqi bor."
        : "Yuborish yoki tahrirlash uchun tegishli ruxsat talab qilinadi.",
    },
    [PURCHASE_STATUSES.sent]: {
      tone: "info",
      title: "Yuborilgan — yangi reviziya yaratiladi",
      text: "Asl yuborilgan PO o'zgarmaydi. O'zgarish kerak bo'lsa yangi qoralama reviziya ochiladi.",
    },
    [PURCHASE_STATUSES.partiallyReceived]: {
      tone: "warning",
      title: "Qisman kelgan — faqat qolgan miqdor qabul qilinadi",
      text: "Qabul qilingan qatorlar yopiq. Receiving oynasi faqat qolgan miqdorni tekshiradi.",
    },
    [PURCHASE_STATUSES.received]: {
      tone: "neutral",
      title: "To'liq kelgan — read only",
      text: "Tovar tarkibi va narxlar bloklangan. Faqat invoys, to'lov, hujjat va izohlar yuritiladi.",
    },
    [PURCHASE_STATUSES.paid]: {
      tone: "success",
      title: "To'langan — o'chirib bo'lmaydi",
      text: "Moliyaviy iz yopilgan. PO ni bekor qilish yoki o'chirish mumkin emas.",
    },
  }[order.status] || {
    tone: "neutral",
    title: "Holat bo'yicha cheklovlar",
    text: "Amallar xarid status flow va foydalanuvchi ruxsatlariga qarab cheklanadi.",
  };

  const handleCreateRevision = () => {
    const revision = actions.createOrder(
      {
        supplierId: order.supplierId,
        warehouseId: order.warehouseId,
        branch: order.branch,
        expectedDate: order.expectedDate,
        paymentTerm: order.paymentTerm,
        paymentDueDate: order.paymentDueDate,
        taxMode: order.taxMode,
        orderDiscountPercent: order.orderDiscountPercent,
        currency: order.currency,
        exchangeRate: order.exchangeRate,
        baseCurrency: order.baseCurrency,
        items: order.items.map((item) => ({
          ...item,
          receivedQty: 0,
          returnedQty: 0,
          damagedQty: 0,
          missingQty: 0,
        })),
        notes: [
          {
            id: `note-revision-${order.id}`,
            type: "internal",
            text: `${order.number} uchun reviziya qoralamasi.`,
            author: currentUser.name,
            createdAt: new Date().toISOString(),
          },
        ],
        attachments: [],
      },
      { submit: false },
    );

    if (revision) navigate(`/purchases/orders/${revision.id}`);
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;

    actions.addNote(order.id, { type: noteType, text: noteText });
    setNoteText("");
  };

  return (
    <div className="po-detail">
      <header className="po-detail__header">
        <div className="po-detail__title">
          <button
            className="po-detail__back"
            type="button"
            aria-label="Ro'yxatga qaytish"
            onClick={() => navigate("/purchases/orders")}
          >
            <ArrowLeft size={17} />
          </button>

          <div>
            <h1>{order.number}</h1>
            <p>
              {supplier?.name} · {formatPurchaseDate(order.createdAt)} ·{" "}
              {order.branch}
            </p>
          </div>

          <PurchaseStatusBadge status={order.status} />
        </div>

        <div className="po-detail__actions">
          {order.status === PURCHASE_STATUSES.draft && (
            <button
              className="purchase-btn purchase-btn--ghost"
              type="button"
              onClick={() => navigate(`/purchases/orders/new?draft=${order.id}`)}
            >
              <PencilLine size={15} />
              Tahrirlash
            </button>
          )}

          {canCreateRevision && (
            <button
              className="purchase-btn purchase-btn--ghost"
              type="button"
              onClick={handleCreateRevision}
            >
              <Copy size={15} />
              Reviziya yaratish
            </button>
          )}

          {order.status === PURCHASE_STATUSES.approved && !canSend && (
            <button
              className="purchase-btn purchase-btn--ghost"
              type="button"
              disabled
              title="Yuborish uchun ruxsat kerak"
            >
              <Send size={15} />
              Ruxsat kerak
            </button>
          )}

          {canSubmit && (
            <button
              className="purchase-btn purchase-btn--primary"
              type="button"
              onClick={() => actions.submitOrder(order.id, currentUser)}
            >
              <Send size={15} />
              Tasdiqqa yuborish
            </button>
          )}

          {canSend && (
            <button
              className="purchase-btn purchase-btn--primary"
              type="button"
              onClick={() => actions.sendOrder(order.id, currentUser)}
            >
              <Send size={15} />
              Yetkazib beruvchiga yuborish
            </button>
          )}

          {canReceive && (
            <button
              className="purchase-btn purchase-btn--success"
              type="button"
              onClick={() => setActiveModal("receive")}
            >
              <PackageCheck size={15} />
              Qabul qilish
            </button>
          )}

          {canShowSchedule && (
            <button
              className="purchase-btn purchase-btn--ghost"
              type="button"
              onClick={() => setActiveModal("schedule")}
            >
              <CalendarClock size={15} />
              To'lov jadvali
            </button>
          )}

          {canReturn && (
            <button
              className="purchase-btn purchase-btn--ghost"
              type="button"
              onClick={() => setActiveModal("return")}
            >
              <Undo2 size={15} />
              Qaytarish
            </button>
          )}

          <button
            className="purchase-btn purchase-btn--ghost"
            type="button"
            onClick={() => printPurchaseOrder(order, supplier)}
          >
            <Printer size={15} />
            PDF
          </button>

          {canClose && (
            <button
              className="purchase-btn purchase-btn--ghost"
              type="button"
              onClick={() => setActiveModal("close")}
            >
              <CircleCheckBig size={15} />
              Yopish
            </button>
          )}

          {canCancel && (
            <button
              className="purchase-btn purchase-btn--danger"
              type="button"
              onClick={() => setActiveModal("cancel")}
            >
              <Ban size={15} />
              Bekor qilish
            </button>
          )}
        </div>
      </header>

      <section className={`po-detail__status-rule po-detail__status-rule--${statusRule.tone}`}>
        <div>
          <strong>{statusRule.title}</strong>
          <p>{statusRule.text}</p>
        </div>
        <ul>
          <li className={order.status === PURCHASE_STATUSES.draft ? "is-active" : ""}>
            Draft: to'liq edit
          </li>
          <li className={order.status === PURCHASE_STATUSES.approved ? "is-active" : ""}>
            Approved: permission required
          </li>
          <li className={order.status === PURCHASE_STATUSES.sent ? "is-active" : ""}>
            Sent: create revision
          </li>
          <li className={order.status === PURCHASE_STATUSES.partiallyReceived ? "is-active" : ""}>
            Partial received: remaining only
          </li>
          <li className={order.status === PURCHASE_STATUSES.received ? "is-active" : ""}>
            Received: read only
          </li>
          <li className={order.status === PURCHASE_STATUSES.paid ? "is-active" : ""}>
            Paid: cannot delete
          </li>
        </ul>
      </section>

      <div className="po-detail__grid">
        <section className="po-detail__panel po-detail__panel--items">
          <h3>Tovarlar</h3>

          <div className="po-detail__items">
            <div className="po-detail__item po-detail__item--head">
              <span>Tovar</span>
              <span>Miqdor</span>
              <span>Narx</span>
              <span>Qabul</span>
              <span>Jami</span>
            </div>

            {order.items.map((item) => {
              const baseQty = toBaseQuantity(item);
              const progress = baseQty
                ? Math.min((item.receivedQty / baseQty) * 100, 100)
                : 0;

              return (
                <div className="po-detail__item" key={item.id}>
                  <span className="purchase-table__primary">
                    <strong>{item.name}</strong>
                    <small>
                      {item.sku}
                      {item.discountPercent
                        ? ` · chegirma ${item.discountPercent}%`
                        : ""}{" "}
                      · QQS {item.taxRate}%
                    </small>
                  </span>

                  <span>
                    {formatQuantity(item.quantity, item.unitLabel)}
                    <small className="po-detail__base-qty">
                      = {formatQuantity(baseQty)} dona
                    </small>
                  </span>

                  <span>
                    {formatCurrencyMoney(item.price, order.currency)}
                    {/* PDF 56 (Enterprise): landed cost taqsimlangandan keyingi
                        YAKUNIY birlik tannarxi — audit'da topilgan bo'shliq:
                        ilgari taqsimlash faqat jami summaga tegardi, har bir
                        mahsulotning haqiqiy tannarxi ko'rinmasdi. */}
                    {item.landedUnitCost > 0 && (
                      <small className="po-detail__base-qty">
                        + {formatCurrencyMoney(item.landedUnitCost, order.currency)} landed ={" "}
                        {formatCurrencyMoney(
                          item.price + item.landedUnitCost,
                          order.currency,
                        )}
                      </small>
                    )}
                  </span>

                  <span className="purchase-table__progress">
                    <small>
                      {formatQuantity(item.receivedQty)} /{" "}
                      {formatQuantity(baseQty)}
                      {item.returnedQty
                        ? ` · qaytdi: ${item.returnedQty}`
                        : ""}
                    </small>
                    <PurchaseProgressBar
                      value={item.receivedQty}
                      max={baseQty}
                      tone={
                        progress >= 100
                          ? "success"
                          : progress > 0
                            ? "info"
                            : "neutral"
                      }
                    />
                  </span>

                  <span className="purchase-table__money">
                    {formatCurrencyMoney(
                      calculateLineSubtotal(item),
                      order.currency,
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="po-detail__totals">
            <div>
              <span>Oraliq jami</span>
              <strong>
                {formatCurrencyMoney(totals.linesSubtotal, order.currency)}
              </strong>
            </div>
            <div>
              <span>Umumiy chegirma ({order.orderDiscountPercent || 0}%)</span>
              <strong>
                -{formatCurrencyMoney(totals.orderDiscount, order.currency)}
              </strong>
            </div>
            <div>
              <span>QQS</span>
              <strong>
                {formatCurrencyMoney(totals.taxAmount, order.currency)}
              </strong>
            </div>
            {landedCostByType.map(([type, amount]) => (
              <div key={type}>
                <span>Landed cost — {getLandedCostTypeLabel(type)}</span>
                <strong>{formatCurrencyMoney(amount, order.currency)}</strong>
              </div>
            ))}
            {totals.landedCostTotal > 0 && (
              <div>
                <span>Landed cost — jami</span>
                <strong>
                  {formatCurrencyMoney(totals.landedCostTotal, order.currency)}
                </strong>
              </div>
            )}
            <div className="po-detail__totals-grand">
              <span>JAMI</span>
              {/* Point 12: valyuta formati BUTUN modulda bir xil — "44 USD ≈ 556 600 so'm" */}
              <strong>
                {formatCurrencyWithBase(
                  totals.total,
                  order.currency,
                  order.exchangeRate || 1,
                )}
              </strong>
            </div>
          </div>

          <div className="po-detail__terms">
            <div>
              <span>Yetkazish sanasi</span>
              <strong>{formatPurchaseDate(order.expectedDate)}</strong>
            </div>
            <div>
              <span>To'lov sharti</span>
              <strong>{getPaymentTermById(order.paymentTerm).label}</strong>
            </div>
            <div>
              <span>Ombor</span>
              <strong>
                {warehouses.find((entry) => entry.id === order.warehouseId)
                  ?.name || "—"}
              </strong>
            </div>
            <div>
              <span>Xaridor</span>
              <strong>{order.buyer?.name}</strong>
            </div>
            <div>
              <span>Valyuta</span>
              <strong>
                {order.currency || BASE_PURCHASE_CURRENCY}
                {order.currency !== BASE_PURCHASE_CURRENCY && order.exchangeRate
                  ? ` · kurs ${order.exchangeRate}`
                  : ""}
              </strong>
            </div>
          </div>
        </section>

        <aside className="po-detail__side">
          <section className="po-detail__panel">
            <h3>Yetkazib beruvchi ma'lumoti</h3>
            <SupplierInfoCard supplier={{ ...supplier, debt: supplierDebt }} />
          </section>

          <section className="po-detail__panel">
            <h3>Tasdiqlash jarayoni</h3>
            <ApprovalStepsPanel
              steps={order.approvalSteps || []}
              canAct={
                order.status === PURCHASE_STATUSES.pendingApproval &&
                userCanApprove
              }
              onApprove={() => actions.approveOrderStep(order.id, currentUser)}
              onReject={() => setActiveModal("reject")}
            />
          </section>

          {budgetImpacts.length > 0 && (
            <section className="po-detail__panel">
              <h3>Byudjet nazorati</h3>
              <BudgetImpactPanel impacts={budgetImpacts} getSupplier={getSupplier} compact />
            </section>
          )}

          <section className="po-detail__panel">
            <h3>Vaqt chizig'i</h3>
            <PurchaseTimeline events={order.timeline || []} />
          </section>
        </aside>
      </div>

      <section className="po-detail__panel po-detail__panel--tabbed">
        <PurchaseTabs
          tabs={[
            { id: "payments", label: "To'lovlar", icon: Wallet, count: relatedInvoices.length },
            { id: "history", label: "Xarid tarixi", icon: History, count: supplierHistory.length },
            { id: "notes", label: "Izohlar", icon: MessageSquare, count: (order.notes || []).length },
            { id: "files", label: "Fayllar", icon: Paperclip, count: (order.attachments || []).length },
            {
              id: "related",
              label: "Bog'liq hujjatlar",
              icon: Link2,
              count: relatedReceipts.length + relatedInvoices.length + relatedReturns.length,
            },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <div className="po-detail__tab-panel">
          {activeTab === "payments" && (
            <div>
              <div className="po-detail__payment-summary">
                <div>
                  <span>Invoys qilingan</span>
                  <strong>{formatMoney(invoicedAmount)}</strong>
                </div>
                <div>
                  <span>To'langan</span>
                  <strong className="po-detail__payment-paid">
                    {formatMoney(paidAmount)}
                  </strong>
                </div>
                <div>
                  <span>Qoldiq</span>
                  <strong
                    className={
                      outstandingAmount > 0 ? "po-detail__payment-due" : undefined
                    }
                  >
                    {formatMoney(outstandingAmount)}
                  </strong>
                </div>
              </div>

              <div className="po-detail__invoice-list">
                {relatedInvoices.map((invoice) => {
                  const invoiceExpanded = expandedInvoiceId === invoice.id;

                  return (
                    <div className="po-detail__invoice-group" key={invoice.id}>
                      <button
                        type="button"
                        className="po-detail__invoice"
                        onClick={() =>
                          setExpandedInvoiceId(invoiceExpanded ? null : invoice.id)
                        }
                      >
                        <span className="purchase-table__primary">
                          <strong>{invoice.number}</strong>
                          <small>
                            Muddat: {formatPurchaseDate(invoice.dueDate)} ·{" "}
                            {invoice.payments.length} ta to'lov
                          </small>
                        </span>

                        <span className="purchase-table__money">
                          {formatMoney(invoice.paidAmount)} /{" "}
                          {formatMoney(invoice.amount)}
                        </span>

                        <InvoiceStatusBadge status={invoice.status} />

                        <ChevronDown
                          size={15}
                          className={
                            invoiceExpanded
                              ? "po-detail__invoice-chevron po-detail__invoice-chevron--open"
                              : "po-detail__invoice-chevron"
                          }
                        />
                      </button>

                      {invoiceExpanded && invoice.matching?.lines?.length > 0 && (
                        <PurchaseThreeWayMatchPanel
                          lines={invoice.matching.lines}
                          summary={invoice.matching.summary}
                          compact
                        />
                      )}
                    </div>
                  );
                })}

                {!relatedInvoices.length && (
                  <p className="po-detail__empty">
                    Bu PO uchun invoys hali kiritilmagan.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="po-detail__history">
              {supplierHistory.map((entry) => (
                <div
                  className="po-detail__history-item"
                  key={entry.id}
                  onClick={() => navigate(`/purchases/orders/${entry.id}`)}
                >
                  <span className="purchase-table__primary">
                    <strong>{entry.number}</strong>
                    <small>{formatPurchaseDate(entry.createdAt)}</small>
                  </span>

                  <span className="purchase-table__money">
                    {formatCurrencyMoney(
                      calculateOrderTotals(entry).total,
                      entry.currency,
                    )}
                  </span>

                  <PurchaseStatusBadge status={entry.status} />
                </div>
              ))}

              {!supplierHistory.length && (
                <p className="po-detail__empty">
                  Bu yetkazib beruvchi bilan boshqa xarid yo'q.
                </p>
              )}
            </div>
          )}

          {activeTab === "notes" && (
            <div>
              <div className="po-detail__notes">
                {(order.notes || []).map((note) => (
                  <div
                    className={`po-detail__note po-detail__note--${note.type}`}
                    key={note.id}
                  >
                    <p>{note.text}</p>
                    <small>
                      {note.type === "internal" ? "Ichki" : "Yetkazib beruvchi"} ·{" "}
                      {note.author} ·{" "}
                      {formatPurchaseDate(note.createdAt, { withTime: true })}
                    </small>
                  </div>
                ))}

                {!(order.notes || []).length && (
                  <p className="po-detail__empty">Izohlar yo'q.</p>
                )}
              </div>

              <div className="po-detail__note-form">
                <PurchaseSelectField
                  className="po-detail__note-type"
                  value={noteType}
                  placeholder="Izoh turi"
                  options={[
                    { value: "internal", label: "Ichki izoh" },
                    { value: "supplier", label: "Yetkazib beruvchi izohi" },
                  ]}
                  onChange={setNoteType}
                />

                <PurchaseTextField
                  type="text"
                  placeholder="Izoh yozing..."
                  value={noteText}
                  onChange={(event) => setNoteText(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && handleAddNote()}
                />

                <button
                  className="purchase-btn purchase-btn--primary"
                  type="button"
                  title="Izohni qo'shish"
                  aria-label="Izohni qo'shish"
                  onClick={handleAddNote}
                >
                  <MessageSquarePlus size={15} />
                </button>
              </div>
            </div>
          )}

          {activeTab === "files" && (
            <PurchaseAttachmentManager
              title="PO hujjatlari"
              emptyTitle="Fayl biriktirilmagan"
              emptyText="Shartnoma, narx ro'yxati yoki yetkazib beruvchi hujjatlarini qo'shing."
              attachments={order.attachments || []}
              onAdd={(files) =>
                files.forEach((file) => actions.addAttachment(order.id, file))
              }
              onRemove={(file) => actions.removeAttachment(order.id, file.id)}
            />
          )}

          {activeTab === "related" && (
            <div className="po-detail__related">
              {relatedReceipts.map((entry) => (
                <div className="po-detail__related-item" key={entry.id}>
                  <PackageCheck size={14} />
                  <span>
                    {entry.number} —{" "}
                    {entry.type === "full" ? "to'liq qabul" : "qisman qabul"}
                    {entry.landedCostTotal > 0
                      ? ` · landed cost: ${formatCurrencyMoney(entry.landedCostTotal, order.currency)} (${getLandedCostAllocationMethodLabel(entry.landedCostMethod)})`
                      : ""}
                  </span>
                  <small>{formatPurchaseDate(entry.receivedAt)}</small>
                </div>
              ))}

              {relatedInvoices.map((entry) => (
                <div className="po-detail__related-item" key={entry.id}>
                  <Receipt size={14} />
                  <span>
                    {entry.number} — {formatMoney(entry.amount)}
                  </span>
                  <small>{formatPurchaseDate(entry.createdAt)}</small>
                </div>
              ))}

              {relatedReturns.map((entry) => (
                <div className="po-detail__related-item" key={entry.id}>
                  <Undo2 size={14} />
                  <span>
                    {entry.number} — {formatMoney(entry.total)}
                  </span>
                  <small>{formatPurchaseDate(entry.createdAt)}</small>
                </div>
              ))}

              {!relatedReceipts.length &&
                !relatedInvoices.length &&
                !relatedReturns.length && (
                  <p className="po-detail__empty">Bog'liq hujjatlar yo'q.</p>
                )}
            </div>
          )}
        </div>
      </section>

      {/* Modallar */}
      {/* Bug fix: modal endi natijani KUTADI va faqat muvaffaqiyatli
          saqlangandan keyin o'zi yopiladi (onClose) — shu sabab bu yerda
          natija tekshirilmasdan turib avvaldan yopilmaydi. */}
      <ReceiveGoodsModal
        open={activeModal === "receive"}
        order={order}
        warehouses={warehouses}
        onClose={() => setActiveModal(null)}
        onConfirm={(payload) => actions.receiveOrder(payload, currentUser)}
      />

      <PurchaseReturnModal
        open={activeModal === "return"}
        order={order}
        onClose={() => setActiveModal(null)}
        onConfirm={(payload) => {
          actions.createReturn(payload, currentUser);
          setActiveModal(null);
        }}
      />

      <PaymentScheduleModal
        open={activeModal === "schedule"}
        order={order}
        invoices={relatedInvoices}
        supplier={supplier}
        onClose={() => setActiveModal(null)}
      />

      <ConfirmReasonModal
        open={activeModal === "reject"}
        title="PO ni rad etish"
        description="Rad etishda sabab majburiy — PO xaridorga qaytadi."
        confirmLabel="Rad etish"
        onClose={() => setActiveModal(null)}
        onConfirm={(reason) => {
          actions.rejectOrderStep(order.id, reason, currentUser);
          setActiveModal(null);
        }}
      />

      <ConfirmReasonModal
        open={activeModal === "cancel"}
        title="Buyurtmani bekor qilish"
        description="Bekor qilish faqat tovar kelmagan PO uchun mumkin."
        confirmLabel="Bekor qilish"
        onClose={() => setActiveModal(null)}
        onConfirm={(reason) => {
          actions.cancelOrder(order.id, reason, currentUser);
          setActiveModal(null);
        }}
      />

      <ConfirmReasonModal
        open={activeModal === "close"}
        title="Buyurtmani yopish"
        description="Qolgan tovar kelmasa PO ni qo'lda yopish mumkin."
        confirmLabel="Yopish"
        tone="primary"
        reasonRequired={false}
        onClose={() => setActiveModal(null)}
        onConfirm={(reason) => {
          actions.closeOrder(order.id, reason, currentUser);
          setActiveModal(null);
        }}
      />
    </div>
  );
};

export default PurchaseOrderDetail;
