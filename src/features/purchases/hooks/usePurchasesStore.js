// Xaridlar modulining markaziy lokal holati (backend ulanguncha fallback).
// Barcha business qoidalar PDF bo'yicha shu yerda: state machine (18),
// approval matrix (5), qabul (21-26), qaytarish (36-37), invoys/to'lov (41-46).

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { store } from "../../../app/store/store";
import { businessOSActions } from "../../../core/businessOS/businessOSSlice";
import {
  APPROVAL_STEP_STATUSES,
  resolveApprovalSteps,
} from "../constants/approvalMatrix";
import {
  INVOICE_STATUSES,
  RETURN_STATUSES,
  computePaymentDueDate,
} from "../constants/paymentTerms";
import {
  CANCELLABLE_STATUSES,
  PURCHASE_STATUSES,
  RECEIVABLE_STATUSES,
  canTransitionStatus,
} from "../constants/purchaseStatuses";
import {
  BASE_PURCHASE_CURRENCY,
  convertToBaseCurrency,
  getDefaultExchangeRate,
} from "../constants/currencies";
import { purchaseCurrentUser, purchaseWarehouses } from "../data/purchaseSuppliers";
import { purchaseProducts as seedPurchaseProducts } from "../data/purchaseProducts";
// Task 5: Suppliers — yagona manba Suppliers modulida (suppliersApi.js).
// Purchases o'z supplier nusxasini saqlamaydi, shu yerdan iste'mol qiladi.
import { getSupplierSnapshot, useSuppliers } from "../../suppliers/suppliersApi";
import {
  seedBudgets,
  seedCounters,
  seedGoodsReceipts,
  seedPurchaseInvoices,
  seedPurchaseOrders,
  seedPurchaseReturns,
  seedQualityInspections,
} from "../data/purchaseSeed";
import {
  calculateOrderTotals,
  getInvoiceRemaining,
  getRemainingQty,
  isOrderFullyReceived,
} from "../utils/purchaseCalculations";
import {
  DOCUMENT_PREFIXES,
  createDocumentNumber,
  createEntityId,
} from "../utils/purchaseIds";
import { buildThreeWayMatch, getOrderedUnitPrice } from "../utils/threeWayMatching";
import { computeLandedCostAllocation } from "../utils/landedCostAllocation";
import {
  INSPECTION_ACTIONS,
  INSPECTION_STATUS_LABELS,
  INSPECTION_STATUSES,
} from "../constants/qualityInspection";
import {
  computeInspectionStatus,
  computeItemInspectionStatus,
  normalizeInspectionItem,
  validateInspectionItem,
} from "../utils/qualityInspection";
import { getApplicableBudgetImpacts } from "../utils/budgetCalculations";
import { validateBudgetPayload } from "../utils/budgetValidation";
import {
  loadPurchasesState,
  savePurchasesState,
} from "../utils/purchasesStorage";
import { formatCurrencyMoney, normalizeNumber } from "../utils/purchaseMoney";
import {
  notifyGoodsReceived,
  notifyInvoiceCreated,
  notifyInvoiceMatched,
  notifyInvoiceMismatch,
  notifyPartialReceiving,
  notifyPaymentCreated,
  notifyPurchaseOrderApproved,
  notifyPurchaseOrderCreated,
  notifyPurchaseOrderRejected,
  notifyPurchaseOrderSubmitted,
  notifyPurchaseReturn,
  notifyQualityInspection,
} from "../notifications/notificationTriggers";

const createInitialState = () => ({
  // Bug fix (ERP arxitektura): Product katalogi ilgari `purchaseProducts`dan
  // TO'G'RIDAN-TO'G'RI, o'zgarmas holda o'qilardi (reaktiv state emas) —
  // shu sabab yangi mahsulot yaratish IMKONSIZ edi (hech qayerga
  // yozilmasdi). Endi boshqa hamma narsa kabi (orders/invoices/...) shu
  // singleton store holatining bir qismi — `createProduct` orqali yangi
  // mahsulot qo'shilsa, u PO Wizard, Supplier bog'lash va boshqa har bir
  // joyda DARHOL ko'rinadi (yagona manba).
  products: seedPurchaseProducts,
  orders: seedPurchaseOrders,
  receipts: seedGoodsReceipts,
  invoices: seedPurchaseInvoices,
  returns: seedPurchaseReturns,
  inspections: seedQualityInspections,
  budgets: seedBudgets,
  counters: seedCounters,
});

// Bug fix (schema evolution): eski sessiyalarda localStorage'ga byudjet
// maydoni bo'lmagan holat saqlanib qolgan bo'lishi mumkin — shu sabab
// yuklangan holatga yangi maydonlar (masalan `budgets`) mavjud bo'lmasa,
// boshlang'ich qiymat bilan to'ldiriladi (createInitialState butunlay
// almashtirilmaydi — foydalanuvchining mavjud orders/invoices ma'lumoti
// saqlanib qoladi).
const loadedState = loadPurchasesState();
let storeState = loadedState
  ? {
      ...createInitialState(),
      ...loadedState,
      budgets: loadedState.budgets || seedBudgets,
      inspections: loadedState.inspections || seedQualityInspections,
    }
  : createInitialState();
const listeners = new Set();

const emit = () => {
  savePurchasesState(storeState);
  listeners.forEach((listener) => listener(storeState));
};

const setStoreState = (updater) => {
  storeState = updater(storeState);
  emit();
};

const nowIso = () => new Date().toISOString();

const normalizeAttachments = (attachments = [], actor = purchaseCurrentUser) =>
  attachments
    .filter((file) => file?.name?.trim())
    .map((file) => ({
      id: file.id || createEntityId("att"),
      name: file.name.trim(),
      size: Number(file.size) || 0,
      type: file.type || file.name.split(".").pop() || "file",
      extension: file.extension || file.name.split(".").pop()?.toLowerCase() || "",
      mimeType: file.mimeType || "",
      previewUrl: file.previewUrl || "",
      downloadUrl: file.downloadUrl || "",
      localOnly: !!file.localOnly,
      author: actor.name,
      uploadedAt: file.uploadedAt || nowIso(),
    }));

const withTimeline = (order, type, label, actor) => ({
  ...order,
  timeline: [
    ...(order.timeline || []),
    { id: createEntityId("tl"), type, label, actor, at: nowIso() },
  ],
});

const getApprovalTotal = (order, totals) =>
  Math.round((totals?.total || 0) * (normalizeNumber(order.exchangeRate) || 1));

// PDF 58 (Enterprise Budget Control): shu PO tasdiqqa yuborilsa qaysi FAOL
// Hard Limit byudjetlar 100% dan oshib ketishini topadi. Wizard buni UI'da
// oldindan to'sadi (Tasdiqqa yuborish tugmasi bloklanadi), lekin store
// darajasida ham qayta tekshiriladi — boshqa chaqiruvchi (masalan
// kelajakdagi API yoki reviziya oqimi) UI'ni chetlab o'tishi mumkin.
const getHardBlockingImpacts = (order, state) =>
  getApplicableBudgetImpacts(order, state.budgets || [], state.orders, {
    products: state.products,
    excludeOrderId: order.id,
  }).filter((entry) => entry.impact.willBlock);

// Invoys qator (line item) yozuvini normallashtiradi — manba istalgan bo'lishi
// mumkin (qo'lda kiritilgan PurchaseInvoiceModal qatori yoki avtomatik
// receiveOrder qabul qatori), natija har doim bir xil shaklda.
const normalizeInvoiceLines = (lines = []) =>
  (lines || [])
    .filter((line) => line && (line.itemId || line.name?.trim()))
    .map((line) => ({
      itemId: line.itemId || null,
      name: (line.name || "").trim(),
      sku: line.sku || "",
      invoicedQty: Math.max(normalizeNumber(line.invoicedQty), 0),
      unitPrice: Math.max(normalizeNumber(line.unitPrice), 0),
      discountPercent: Math.min(
        Math.max(normalizeNumber(line.discountPercent), 0),
        100,
      ),
      taxRate: Math.max(normalizeNumber(line.taxRate), 0),
    }))
    .filter((line) => line.invoicedQty > 0);

// Umumiy invoys qurish — createInvoice (qo'lda) VA receiveOrder ichidagi
// avtomatik invoyslashtirish ikkisi ham shu YAGONA formuladan foydalanadi:
// PO dan valyuta/kurs/to'lov sharti/soliq rejimi/chegirma/ombor/kutilgan
// yetkazish sanasi meros qilinadi — mantiq ikki joyda yozilmaydi (Task 4/9).
// Task N (Three-Way Matching): `items` — invoysning O'ZIGA XOS qator
// ro'yxati (PO qatoridan MUSTAQIL — supplier haqiqatda nima uchun hisob
// taqdim etganini ifodalaydi). `matching` endi shu qatorlardan qator
// darajasida hisoblanadi (threeWayMatching.js) — chaqiruvchi tomonidan
// tayyor holda uzatilmaydi.
const buildInvoiceFromOrder = (
  order,
  {
    sequence,
    amount,
    dueDate,
    invoiceNumber = "",
    invoiceDate = "",
    invoiceQty = 0,
    note = "",
    items = [],
    attachments = [],
    actor = purchaseCurrentUser,
    extra = {},
  },
) => {
  const currency = order.currency || BASE_PURCHASE_CURRENCY;
  const exchangeRate = normalizeNumber(order.exchangeRate) || 1;
  const invoiceLines = normalizeInvoiceLines(items);
  const { lines: matchLines, summary: matchSummary } = buildThreeWayMatch(
    order,
    invoiceLines,
    currency,
  );

  return {
    id: createEntityId("inv"),
    number: createDocumentNumber(DOCUMENT_PREFIXES.invoice, sequence),
    orderId: order.id,
    orderNumber: order.number,
    supplierId: order.supplierId,
    warehouseId: order.warehouseId,
    amount,
    currency,
    exchangeRate,
    baseCurrencyAmount: Math.round(amount * exchangeRate),
    // Task 4: PO ma'lumotlari to'liq meros qilinadi (audit/ko'rsatish uchun).
    paymentTerm: order.paymentTerm,
    taxMode: order.taxMode,
    orderDiscountPercent: order.orderDiscountPercent,
    expectedDate: order.expectedDate,
    dueDate,
    invoiceNumber,
    invoiceDate,
    invoiceQty,
    note,
    createdAt: nowIso(),
    createdBy: actor.name,
    status: matchSummary.matched
      ? INVOICE_STATUSES.matched
      : INVOICE_STATUSES.mismatch,
    paidAmount: 0,
    payments: [],
    attachments: normalizeAttachments(attachments, actor),
    items: invoiceLines,
    // Orqaga moslik: eski UI kodi (PurchaseInvoicesTable va h.k.)
    // poTotal/receivedValue/delta/matched maydonlarini to'g'ridan-to'g'ri
    // o'qiydi — endi ular qator-darajasidagi yig'indidan hisoblanadi.
    matching: {
      poTotal: matchSummary.totals.ordered,
      receivedValue: matchSummary.totals.received,
      delta: matchSummary.delta,
      matched: matchSummary.matched,
      lines: matchLines,
      summary: matchSummary,
    },
    ...extra,
  };
};

const updateOrderInState = (state, orderId, updater) => ({
  ...state,
  orders: state.orders.map((order) =>
    order.id === orderId ? updater(order) : order,
  ),
});

const resolveOrderStatusAfterInvoices = (state, orderId) => {
  const invoices = state.invoices.filter((inv) => inv.orderId === orderId);

  if (!invoices.length) return null;

  const allPaid = invoices.every(
    (inv) => inv.status === INVOICE_STATUSES.paid,
  );

  return allPaid ? PURCHASE_STATUSES.paid : PURCHASE_STATUSES.invoiced;
};

export const usePurchasesStore = () => {
  const [state, setState] = useState(storeState);
  const businessWarehouses = useSelector((reduxState) => {
    const warehouses = reduxState.businessOS?.entities?.warehouses;

    return (warehouses?.allIds || [])
      .map((id) => warehouses.byId[id])
      .filter((warehouse) => warehouse && warehouse.status !== "inactive")
      .map((warehouse) => ({
        ...warehouse,
        branch: warehouse.branch || warehouse.branchName || warehouse.branchId || "Filial belgilanmagan",
      }));
  });
  const availableWarehouses = useMemo(
    () => (businessWarehouses.length ? businessWarehouses : purchaseWarehouses),
    [businessWarehouses],
  );
  // Task 5: suppliers Suppliers modulidan reaktiv o'qiladi (yagona manba) —
  // supplier o'zgarishi (Suppliers sahifasida) avtomatik shu yerda ham
  // ko'rinadi, Purchases o'z nusxasini saqlamaydi.
  // Step 4/5: Purchases faqat supplier ma'lumotini O'QIYDI (yagona manba —
  // Suppliers moduli); yaratish/tahrirlash amallarini chaqirmaydi.
  const { suppliers, getSupplier } = useSuppliers();

  useEffect(() => {
    const listener = (next) => setState(next);

    listeners.add(listener);

    return () => listeners.delete(listener);
  }, []);

  // ---------- PO lifecycle ----------

  // PDF 3-4: yaratish (draft yoki tasdiqqa yuborish)
  const createOrder = useCallback((payload, { submit = false } = {}) => {
    let created = null;

    setStoreState((current) => {
      // Store-level qoida (PDF 6) — bloklangan supplierga PO ochilmaydi.
      // UI (wizard) buni avvaldan to'sadi, lekin qoida shu yerda ham
      // bo'lishi kerak — boshqa chaqiruvchi (masalan kelajakda API) uchun.
      // Task 5: supplier ma'lumoti Suppliers modulidan sinxron o'qiladi
      // (yagona manba — Purchases o'z nusxasini saqlamaydi).
      const supplier = getSupplierSnapshot(payload.supplierId);

      if (supplier?.blocked) return current;

      const sequence = current.counters.order;
      const totals = calculateOrderTotals(payload);

      let status = PURCHASE_STATUSES.draft;
      let approvalSteps = [];
      let order = {
        id: createEntityId("po"),
        number: createDocumentNumber(DOCUMENT_PREFIXES.order, sequence),
        currency: "UZS",
        exchangeRate: 1,
        baseCurrency: "UZS",
        notes: payload.notes || [],
        attachments: payload.attachments || [],
        timeline: [],
        ...payload,
        buyer: payload.buyer || purchaseCurrentUser,
        createdAt: nowIso(),
        status,
        approvalSteps,
      };

      order = withTimeline(
        order,
        "created",
        submit ? "PO yaratildi" : "Qoralama yaratildi",
        order.buyer.name,
      );

      if (submit) {
        // PDF 58: Hard Limit byudjet oshib ketsa — tasdiqqa yuborish
        // bloklanadi, PO qoralama holatida qoladi (Soft Limit UI darajasida
        // sabab bilan allaqachon o'tkazilgan bo'ladi — bu yerda faqat Hard
        // Limit tekshiriladi).
        const blockingBudgets = getHardBlockingImpacts(order, current);

        if (blockingBudgets.length > 0) {
          order = withTimeline(
            order,
            "budget_blocked",
            `Tasdiqqa yuborilmadi — qattiq byudjet chegarasi oshib ketdi (${blockingBudgets
              .map((entry) => entry.budget.name)
              .join(", ")})`,
            "Tizim",
          );
        } else {
          // PDF 5: approval matrix — summaga qarab bosqichlar
          approvalSteps = resolveApprovalSteps(getApprovalTotal(payload, totals));

          if (approvalSteps.length === 0) {
            status = PURCHASE_STATUSES.approved; // 1 mln gacha avtomatik
            order = withTimeline(
              order,
              "approved",
              "Avtomatik tasdiqlandi (1 mln gacha)",
              "Tizim",
            );
          } else {
            status = PURCHASE_STATUSES.pendingApproval;
            order = withTimeline(
              order,
              "submitted",
              "Tasdiqqa yuborildi",
              order.buyer.name,
            );
          }
        }
      }

      created = { ...order, status, approvalSteps };

      return {
        ...current,
        orders: [created, ...current.orders],
        counters: { ...current.counters, order: sequence + 1 },
      };
    });

    if (created) {
      const supplierName = getSupplierSnapshot(created.supplierId)?.name;

      notifyPurchaseOrderCreated({ order: created, supplierName });
      store.dispatch(businessOSActions.purchaseOrderUpserted(created));

      if (created.status === PURCHASE_STATUSES.pendingApproval) {
        notifyPurchaseOrderSubmitted({ order: created, supplierName });
      } else if (submit && created.status === PURCHASE_STATUSES.approved) {
        notifyPurchaseOrderApproved({ order: created, supplierName, auto: true });
      }
    }

    return created;
  }, []);

  // PDF 3: draftni yangilash / davom ettirish
  const updateDraft = useCallback((orderId, payload) => {
    setStoreState((current) =>
      updateOrderInState(current, orderId, (order) => ({
        ...order,
        ...payload,
        timeline: order.timeline,
      })),
    );
  }, []);

  // PDF 5: draftni tasdiqqa yuborish
  const submitOrder = useCallback((orderId, actor = purchaseCurrentUser) => {
    let result = null;

    setStoreState((current) =>
      updateOrderInState(current, orderId, (order) => {
        if (order.status !== PURCHASE_STATUSES.draft) return order;

        // Store-level qoida (PDF 6) — draft yaratilgandan keyin supplier
        // bloklangan bo'lsa, tasdiqqa yuborilmasin.
        const supplier = getSupplierSnapshot(order.supplierId);

        if (supplier?.blocked) return order;

        // PDF 58: Hard Limit byudjet oshib ketsa — draftdan tasdiqqa
        // o'tkazilmaydi.
        const blockingBudgets = getHardBlockingImpacts(order, current);

        if (blockingBudgets.length > 0) {
          return withTimeline(
            order,
            "budget_blocked",
            `Tasdiqqa yuborilmadi — qattiq byudjet chegarasi oshib ketdi (${blockingBudgets
              .map((entry) => entry.budget.name)
              .join(", ")})`,
            "Tizim",
          );
        }

        const totals = calculateOrderTotals(order);
        const approvalSteps = resolveApprovalSteps(getApprovalTotal(order, totals));

        if (approvalSteps.length === 0) {
          result = withTimeline(
            { ...order, status: PURCHASE_STATUSES.approved, approvalSteps },
            "approved",
            "Avtomatik tasdiqlandi (1 mln gacha)",
            "Tizim",
          );

          return result;
        }

        result = withTimeline(
          { ...order, status: PURCHASE_STATUSES.pendingApproval, approvalSteps },
          "submitted",
          "Tasdiqqa yuborildi",
          actor.name,
        );

        return result;
      }),
    );

    if (result) {
      const supplierName = getSupplierSnapshot(result.supplierId)?.name;

      if (result.status === PURCHASE_STATUSES.pendingApproval) {
        notifyPurchaseOrderSubmitted({ order: result, supplierName, actor: actor.name });
      } else if (result.status === PURCHASE_STATUSES.approved) {
        notifyPurchaseOrderApproved({ order: result, supplierName, auto: true });
      }
    }
  }, []);

  // PDF 5: bosqichni tasdiqlash — barcha bosqich o'tsa Approved
  const approveOrderStep = useCallback((orderId, actor = purchaseCurrentUser) => {
    let result = null;

    setStoreState((current) =>
      updateOrderInState(current, orderId, (order) => {
        if (order.status !== PURCHASE_STATUSES.pendingApproval) return order;

        const stepIndex = order.approvalSteps.findIndex(
          (step) => step.status === APPROVAL_STEP_STATUSES.pending,
        );

        if (stepIndex === -1) return order;

        const approvalSteps = order.approvalSteps.map((step, index) =>
          index === stepIndex
            ? {
                ...step,
                status: APPROVAL_STEP_STATUSES.approved,
                actor: actor.name,
                actedAt: nowIso(),
              }
            : step,
        );

        const allApproved = approvalSteps.every(
          (step) => step.status === APPROVAL_STEP_STATUSES.approved,
        );

        let next = withTimeline(
          { ...order, approvalSteps },
          "approved",
          `${approvalSteps[stepIndex].label} tasdiqladi`,
          actor.name,
        );

        if (allApproved) {
          next = { ...next, status: PURCHASE_STATUSES.approved };
        }

        result = next;

        return next;
      }),
    );

    if (result?.status === PURCHASE_STATUSES.approved) {
      notifyPurchaseOrderApproved({
        order: result,
        supplierName: getSupplierSnapshot(result.supplierId)?.name,
        auto: false,
        actor: actor.name,
      });
    }
  }, []);

  // PDF 5: rad etish — sabab majburiy, PO xaridorga (draft) qaytadi
  const rejectOrderStep = useCallback(
    (orderId, reason, actor = purchaseCurrentUser) => {
      if (!reason?.trim()) return;

      let result = null;

      setStoreState((current) =>
        updateOrderInState(current, orderId, (order) => {
          if (order.status !== PURCHASE_STATUSES.pendingApproval) return order;

          const stepIndex = order.approvalSteps.findIndex(
            (step) => step.status === APPROVAL_STEP_STATUSES.pending,
          );

          if (stepIndex === -1) return order;

          const approvalSteps = order.approvalSteps.map((step, index) =>
            index === stepIndex
              ? {
                  ...step,
                  status: APPROVAL_STEP_STATUSES.rejected,
                  actor: actor.name,
                  actedAt: nowIso(),
                  reason: reason.trim(),
                }
              : step,
          );

          result = withTimeline(
            { ...order, approvalSteps, status: PURCHASE_STATUSES.draft },
            "rejected",
            `${approvalSteps[stepIndex].label} rad etdi: ${reason.trim()}`,
            actor.name,
          );

          return result;
        }),
      );

      if (result) {
        notifyPurchaseOrderRejected({
          order: result,
          supplierName: getSupplierSnapshot(result.supplierId)?.name,
          reason: reason.trim(),
          actor: actor.name,
        });
      }
    },
    [],
  );

  // PDF 18: Approved → Sent
  const sendOrder = useCallback((orderId, actor = purchaseCurrentUser) => {
    setStoreState((current) =>
      updateOrderInState(current, orderId, (order) => {
        if (!canTransitionStatus(order.status, PURCHASE_STATUSES.sent)) {
          return order;
        }

        return withTimeline(
          { ...order, status: PURCHASE_STATUSES.sent, sentAt: nowIso() },
          "sent",
          "Supplierga yuborildi",
          actor.name,
        );
      }),
    );
  }, []);

  // PDF 2, 18: bekor qilish — faqat kelmagan PO, sabab bilan
  const cancelOrder = useCallback(
    (orderId, reason, actor = purchaseCurrentUser) => {
      if (!reason?.trim()) return;

      setStoreState((current) =>
        updateOrderInState(current, orderId, (order) => {
          if (!CANCELLABLE_STATUSES.includes(order.status)) return order;

          return withTimeline(
            {
              ...order,
              status: PURCHASE_STATUSES.cancelled,
              cancelReason: reason.trim(),
            },
            "cancelled",
            `Bekor qilindi: ${reason.trim()}`,
            actor.name,
          );
        }),
      );
    },
    [],
  );

  // PDF 22: qolgan kelmasa — qo'lda yopish
  const closeOrder = useCallback(
    (orderId, reason = "", actor = purchaseCurrentUser) => {
      setStoreState((current) =>
        updateOrderInState(current, orderId, (order) => {
          if (!canTransitionStatus(order.status, PURCHASE_STATUSES.closed)) {
            return order;
          }

          return withTimeline(
            { ...order, status: PURCHASE_STATUSES.closed },
            "closed",
            reason ? `Yopildi: ${reason}` : "PO yopildi",
            actor.name,
          );
        }),
      );
    },
    [],
  );

  // ---------- Receiving (PDF 21-26) ----------

  const receiveOrder = useCallback(
    (
      {
        orderId,
        warehouseId,
        lines,
        note = "",
        landedCosts = [],
        landedCostMethod = "quantity",
        manualAllocations = {},
        attachments = [],
      },
      actor = purchaseCurrentUser,
    ) => {
      let receipt = null;
      let notifyPayload = null;

      setStoreState((current) => {
        const order = current.orders.find((entry) => entry.id === orderId);

        if (!order) return current;

        // Store-level qoidalar (PDF 21-26) — ReceiveGoodsModal buni UI'da
        // oldindan to'sadi, lekin qoida shu yerda ham bo'lishi kerak: boshqa
        // chaqiruvchi (masalan kelajakda API) UI'ni chetlab o'tishi mumkin.
        if (!RECEIVABLE_STATUSES.includes(order.status)) return current;

        // "Mumkin bo'lmagan miqdorlar" — manfiy/raqam bo'lmagan qiymatlar 0'ga
        // tenglashtiriladi, chaqiruvchi tomonidan yuborilgan xom qiymatlarga
        // ishonilmaydi.
        const normalizedLines = (lines || []).map((line) => ({
          ...line,
          received: Math.max(normalizeNumber(line.received), 0),
          damaged: Math.max(normalizeNumber(line.damaged), 0),
          missing: Math.max(normalizeNumber(line.missing), 0),
        }));

        const validLines = normalizedLines.filter(
          (line) => line.received > 0 || line.damaged > 0 || line.missing > 0,
        );

        if (!validLines.length) return current;

        // PDF 22: jami qabul (yaxshi) buyurtma qolgan miqdoridan oshmasin,
        // va qabul+buzuq+yetishmagan shu partiyada kutilayotgan miqdordan
        // (remaining) oshib ketmasin — aks holda hujjatdagidan ko'p tovar
        // "kelgan" degan mumkin bo'lmagan holat yuzaga keladi. Qiymatlar
        // buyurtmaning JORIY holatidan qayta hisoblanadi — modal tomonidan
        // yuborilgan `line.remaining`ga ishonilmaydi.
        const hasInvalidLine = validLines.some((line) => {
          const item = order.items.find((entry) => entry.id === line.itemId);

          if (!item) return true;

          const remaining = getRemainingQty(item);
          const EPSILON = 1e-6;

          if (line.received - remaining > EPSILON) return true;
          if (line.received + line.damaged + line.missing - remaining > EPSILON) {
            return true;
          }

          return false;
        });

        if (hasInvalidLine) return current;

        // PDF 56 (Enterprise): Landed Cost Allocation — clientdan kelgan
        // TAYYOR taqsimlash natijasiga ishonilmaydi (boshqa manba, masalan
        // kelajakdagi API, UI'ni chetlab o'tishi mumkin). Store xarajat
        // ro'yxati + usul + og'irlik/hajm/qo'lda kiritilgan qiymatlardan
        // taqsimlashni MUSTAQIL qayta hisoblaydi (ReceiveGoodsModal bilan
        // bir xil dvigateldan — landedCostAllocation.js — foydalanib).
        const landedCostTotal = (landedCosts || []).reduce(
          (sum, entry) => sum + normalizeNumber(entry.amount),
          0,
        );

        const landedCostResult = computeLandedCostAllocation({
          totalCost: landedCostTotal,
          method: landedCostMethod,
          lines: validLines.map((line) => ({
            itemId: line.itemId,
            name: line.name,
            quantity: line.received,
            unitPrice: order.items.find((entry) => entry.id === line.itemId)?.price,
            weightPerUnit: line.weightPerUnit,
            volumePerUnit: line.volumePerUnit,
          })),
          manualAllocations,
        });

        // Xatoliklar bo'lsa (masalan qo'lda taqsimlash mos kelmadi, yoki
        // og'irlik/hajm kiritilmagan) — ReceiveGoodsModal buni oldindan
        // to'sadi, lekin store bu yerda ham rad etishi kerak (PDF 22dagi
        // hasInvalidLine bilan bir xil himoya darajasi).
        if (landedCostTotal > 0 && landedCostResult.errors.length) return current;

        const sequence = current.counters.receipt;

        receipt = {
          id: createEntityId("gr"),
          number: createDocumentNumber(DOCUMENT_PREFIXES.receipt, sequence),
          orderId: order.id,
          orderNumber: order.number,
          supplierId: order.supplierId,
          warehouseId: warehouseId || order.warehouseId,
          receivedAt: nowIso(),
          receivedBy: actor.name,
          note,
          landedCosts,
          landedCostMethod,
          landedCostTotal,
          landedCostAllocations: landedCostResult.allocations,
          attachments: normalizeAttachments(attachments, actor),
          items: validLines.map((line) => ({
            itemId: line.itemId,
            name: line.name,
            ordered: line.ordered,
            received: line.received,
            damaged: line.damaged || 0,
            missing: line.missing || 0,
            damagedAction: line.damagedAction || "inspection",
            batchNumber: line.batchNumber || "",
            manufacturingDate: line.manufacturingDate || "",
            expiryDate: line.expiryDate || "",
          })),
        };

        // Enterprise Damaged Goods & Quality Inspection: shu qabulda buzuq
        // deb belgilangan qatorlar bo'lsa, "Tekshiruv kutilmoqda" holatida
        // tekshiruv hujjati AVTOMATIK yaratiladi (bitta qabulga — bitta
        // tekshiruv, shu bilan duplicate inspection oldindan bloklanadi).
        // Buzuq miqdor tekshiruv yakunlanguncha ombor qoldig'iga kirmaydi.
        const damagedLines = validLines.filter((line) => (line.damaged || 0) > 0);
        let pendingInspection = null;

        if (damagedLines.length) {
          const inspectionSequence = current.counters.inspection;

          pendingInspection = {
            id: createEntityId("qi"),
            number: createDocumentNumber(DOCUMENT_PREFIXES.inspection, inspectionSequence),
            receiptId: receipt.id,
            receiptNumber: receipt.number,
            orderId: order.id,
            orderNumber: order.number,
            supplierId: order.supplierId,
            status: INSPECTION_STATUSES.pending,
            createdAt: nowIso(),
            createdBy: actor.name,
            inspectedAt: null,
            inspectedBy: null,
            items: damagedLines.map((line) => ({
              itemId: line.itemId,
              name: line.name,
              sku: line.sku || "",
              damagedQty: line.damaged,
              damageType: "",
              severity: "medium",
              notes: "",
              photos: [],
              action: "",
              acceptedQty: 0,
              rejectedQty: 0,
              inspectorName: "",
              inspectionDate: "",
              status: INSPECTION_STATUSES.pending,
            })),
            timeline: [
              {
                id: createEntityId("qil"),
                type: "created",
                label: "Tekshiruv yaratildi (avtomatik, buzuq tovar aniqlandi)",
                actor: actor.name,
                at: nowIso(),
              },
            ],
          };
        }

        // PDF 24: qabul va qoldiq bir tranzaksiyada — items yangilanadi
        const items = order.items.map((item) => {
          const line = validLines.find((entry) => entry.itemId === item.id);

          if (!line) return item;

          const nextReceivedQty = item.receivedQty + line.received;
          // PDF 56 (Enterprise): landed cost YIG'ILADI (bir necha qisman
          // qabulda ham) — har bir mahsulotning haqiqiy o'rtacha tannarxi
          // (asl narx + taqsimlangan qo'shimcha xarajat) doim to'g'ri bo'lishi
          // uchun. Bu audit'da topilgan asosiy bo'shliqni yopadi: taqsimlash
          // endi jami summaga emas, har bir qatorning birlik tannarxiga tegadi.
          const allocationEntry = landedCostResult.allocations.find(
            (entry) => entry.itemId === item.id,
          );
          const allocatedThisReceipt = allocationEntry?.allocatedAmount || 0;
          const nextLandedCostAllocated =
            (item.landedCostAllocated || 0) + allocatedThisReceipt;

          return {
            ...item,
            receivedQty: nextReceivedQty,
            damagedQty: (item.damagedQty || 0) + (line.damaged || 0),
            // Bug fix: "yetishmagan" (missing) miqdor ilgari HECH QAYERDA
            // order item darajasida to'planmasdi (faqat shu qabul hujjatida
            // qayd etilardi) — shu sababli getRemainingQty uni hisobga
            // olmasdi va PO hech qachon "to'liq qabul qilindi" holatiga
            // o'tmasdi. Endi damagedQty bilan bir xil tarzda to'planadi.
            missingQty: (item.missingQty || 0) + (line.missing || 0),
            landedCostAllocated: nextLandedCostAllocated,
            landedUnitCost: nextReceivedQty
              ? nextLandedCostAllocated / nextReceivedQty
              : 0,
          };
        });

        const updatedOrder = { ...order, items };
        const fullyReceived = isOrderFullyReceived(updatedOrder);

        receipt.type = fullyReceived ? "full" : "partial";

        const nextStatus = fullyReceived
          ? PURCHASE_STATUSES.received
          : PURCHASE_STATUSES.partiallyReceived;

        const orderWithStatus = withTimeline(
          { ...updatedOrder, status: nextStatus },
          "received",
          `${fullyReceived ? "To'liq" : "Qisman"} qabul qilindi (${receipt.number})`,
          actor.name,
        );

        // TASK 1: Receive Goods -> Invoice AVTOMATIK yaratiladi (qo'lda
        // "Invoys kiritish" endi yo'q). Faqat SHU qabulda kelgan miqdor
        // invoyslanadi — qisman qabulda qisman invoys, to'liq qabulda butun
        // (shu partiyadagi) miqdor. PO ma'lumotlari (to'lov sharti, valyuta,
        // kurs, soliq rejimi, chegirmalar, supplier, ombor, izoh, landed cost)
        // createInvoice bilan BIR XIL formuladan (calculateOrderTotals)
        // foydalanib meros qilinadi — mantiq ikki joyda yozilmaydi.
        const receivedQuantityByItemId = validLines.reduce((map, line) => {
          map[line.itemId] = line.received;
          return map;
        }, {});

        const receiptOrderShape = {
          ...order,
          items: order.items.map((item) => ({
            ...item,
            quantity:
              (receivedQuantityByItemId[item.id] || 0) /
              (normalizeNumber(item.unitFactor) || 1),
          })),
          // PDF 56: shu qabulning landed cost'i (agar mavjud bo'lsa) invoys
          // summasiga qo'shiladi — Task 5 bilan bir xil formula.
          landedCostTotal: receipt.landedCostTotal,
        };

        const receiptTotals = calculateOrderTotals(receiptOrderShape);
        const invoiceAmount = receiptTotals.total;

        let invoices = current.invoices;
        let invoiceCounter = current.counters.invoice;
        let orderAfterInvoice = orderWithStatus;

        if (invoiceAmount > 0) {
          const invoiceSequence = invoiceCounter;

          // Avtomatik invoys shu qabul ma'lumotidan hisoblab yaratiladi — PO
          // ning O'ZINING narx/chegirma/soliq qatorlari asosida, shu sababli
          // three-way matching (buildThreeWayMatch) uni haqiqatan HAM to'liq
          // mos deb topadi (invoicedQty === receivedQty, narx/chegirma/soliq
          // PO bilan bir xil) — bu endi hisoblangan natija, qattiq kodlangan
          // taxmin emas. Qo'lda kiritilgan invoys (createInvoice) esa
          // supplierning MUSTAQIL raqamlarini oladi va haqiqatan farq
          // chiqishi mumkin.
          const autoInvoiceLines = validLines.map((line) => {
            const orderItem = updatedOrder.items.find(
              (entry) => entry.id === line.itemId,
            );

            return {
              itemId: line.itemId,
              name: line.name,
              sku: orderItem?.sku || "",
              invoicedQty: line.received,
              unitPrice: getOrderedUnitPrice(orderItem || {}),
              discountPercent: orderItem?.discountPercent || 0,
              taxRate: orderItem?.taxRate || 0,
            };
          });

          // Bug fix: matching (buildThreeWayMatch) shu qabuldan KEYINGI
          // receivedQty'ga qarab hisoblashi kerak — `order` bu yerda hali
          // ESKI (qabuldan OLDINGI) holat, shu sabab `updatedOrder`
          // (receivedQty allaqachon yangilangan) uzatiladi. Aks holda
          // matching "hech narsa qabul qilinmagan" deb noto'g'ri hisoblab,
          // avtomatik (har doim mos bo'lishi kerak) invoysni ham
          // "nomuvofiq" qilib ko'rsatardi.
          const autoInvoice = buildInvoiceFromOrder(updatedOrder, {
            sequence: invoiceSequence,
            amount: invoiceAmount,
            dueDate: computePaymentDueDate(order.paymentTerm, receipt.receivedAt),
            note: receipt.note || "",
            actor: { name: "Tizim" },
            items: autoInvoiceLines,
            extra: {
              // Task 4/6: shu qabulga xos ma'lumotlar — PO darajasidagi
              // buildInvoiceFromOrder qiymatlarini shu qabul bilan almashtiradi.
              // deliveredAt — To'lov jadvali modalida "Yetkazish sanasi" sifatida
              // ko'rsatiladi (haqiqiy qabul sanasi, PO'ning rejalashtirilgan
              // expectedDate'idan farqli).
              warehouseId: receipt.warehouseId,
              landedCostTotal: receipt.landedCostTotal,
              deliveredAt: receipt.receivedAt,
              receiptId: receipt.id,
              receiptNumber: receipt.number,
            },
          });

          invoices = [autoInvoice, ...current.invoices];
          invoiceCounter = invoiceSequence + 1;

          orderAfterInvoice = withTimeline(
            canTransitionStatus(orderWithStatus.status, PURCHASE_STATUSES.invoiced)
              ? { ...orderWithStatus, status: PURCHASE_STATUSES.invoiced }
              : orderWithStatus,
            "invoiced",
            `Invoys avtomatik yaratildi (${autoInvoice.number})`,
            "Tizim",
          );
        }

        notifyPayload = {
          order: orderAfterInvoice,
          fullyReceived,
          autoInvoice: invoiceAmount > 0 ? invoices[0] : null,
        };

        return {
          ...current,
          orders: current.orders.map((entry) =>
            entry.id === orderId ? orderAfterInvoice : entry,
          ),
          receipts: [receipt, ...current.receipts],
          invoices,
          inspections: pendingInspection
            ? [pendingInspection, ...current.inspections]
            : current.inspections,
          counters: {
            ...current.counters,
            receipt: sequence + 1,
            invoice: invoiceCounter,
            inspection: pendingInspection
              ? current.counters.inspection + 1
              : current.counters.inspection,
          },
        };
      });

      if (notifyPayload) {
        const supplierName = getSupplierSnapshot(notifyPayload.order.supplierId)?.name;
        const receivingArgs = {
          order: notifyPayload.order,
          receipt,
          supplierName,
          actor: actor.name,
        };

        if (notifyPayload.fullyReceived) {
          notifyGoodsReceived(receivingArgs);
        } else {
          notifyPartialReceiving(receivingArgs);
        }

        if (notifyPayload.autoInvoice) {
          notifyInvoiceCreated({
            invoice: notifyPayload.autoInvoice,
            supplierName,
            actor: "Tizim",
          });

          if (notifyPayload.autoInvoice.status === INVOICE_STATUSES.matched) {
            notifyInvoiceMatched({ invoice: notifyPayload.autoInvoice, supplierName });
          } else if (notifyPayload.autoInvoice.status === INVOICE_STATUSES.mismatch) {
            notifyInvoiceMismatch({ invoice: notifyPayload.autoInvoice, supplierName });
          }
        }

        store.dispatch(
          businessOSActions.purchaseReceived({
            order: notifyPayload.order,
            receipt,
            actorId: actor.id || actor.name || "system",
          }),
        );
      }

      return receipt;
    },
    [],
  );

  // ---------- Returns (PDF 36-37) ----------

  const createReturn = useCallback(
    (
      { orderId, reason, items, note = "", compensation = "reduce_debt" },
      actor = purchaseCurrentUser,
    ) => {
      let created = null;

      setStoreState((current) => {
        const order = current.orders.find((entry) => entry.id === orderId);

        if (!order) return current;

        const validItems = (items || []).filter((item) => item.quantity > 0);

        if (!validItems.length) return current;

        const sequence = current.counters.return;
        const total = validItems.reduce(
          (sum, item) => sum + item.quantity * item.price,
          0,
        );

        created = {
          id: createEntityId("ret"),
          number: createDocumentNumber(DOCUMENT_PREFIXES.return, sequence),
          orderId: order.id,
          orderNumber: order.number,
          supplierId: order.supplierId,
          reason,
          compensation,
          note,
          status: RETURN_STATUSES.pendingApproval, // PDF 37: ichki tasdiq
          total,
          createdAt: nowIso(),
          createdBy: actor.name,
          approvedBy: null,
          approvedAt: null,
          rejectReason: "",
          timeline: [
            {
              id: createEntityId("rtl"),
              type: "pending",
              label: "Qaytarish tasdiqqa yuborildi",
              actor: actor.name,
              at: nowIso(),
            },
          ],
          items: validItems,
        };

        const orderWithEvent = withTimeline(
          order,
          "return_requested",
          `Qaytarish so'raldi (${created.number})`,
          actor.name,
        );

        return {
          ...current,
          orders: current.orders.map((entry) =>
            entry.id === orderId ? orderWithEvent : entry,
          ),
          returns: [created, ...current.returns],
          counters: { ...current.counters, return: sequence + 1 },
        };
      });

      if (created) {
        notifyPurchaseReturn({
          returnEntry: created,
          supplierName: getSupplierSnapshot(created.supplierId)?.name,
          actor: actor.name,
        });
      }

      return created;
    },
    [],
  );

  const approveReturn = useCallback(
    (returnId, actor = purchaseCurrentUser) => {
      setStoreState((current) => {
        const entry = current.returns.find((item) => item.id === returnId);

        if (!entry || entry.status !== RETURN_STATUSES.pendingApproval) {
          return current;
        }

        // PDF 36: ombor qoldig'i kamayadi, supplier qarzi kamayadi
        const returns = current.returns.map((item) =>
          item.id === returnId
            ? {
                ...item,
                status: RETURN_STATUSES.completed,
                approvedBy: actor.name,
                approvedAt: nowIso(),
                timeline: [
                  ...(item.timeline || []),
                  {
                    id: createEntityId("rtl"),
                    type: "approved",
                    label: "Qaytarish tasdiqlandi",
                    actor: actor.name,
                    at: nowIso(),
                  },
                ],
              }
            : item,
        );

        const orders = current.orders.map((order) => {
          if (order.id !== entry.orderId) return order;

          const items = order.items.map((item) => {
            const returnedLine = entry.items.find(
              (line) => line.itemId === item.id,
            );

            if (!returnedLine) return item;

            return {
              ...item,
              returnedQty: (item.returnedQty || 0) + returnedLine.quantity,
            };
          });

          return withTimeline(
            { ...order, items },
            "returned",
            `Qaytarish tasdiqlandi (${entry.number})`,
            actor.name,
          );
        });

        return { ...current, returns, orders };
      });
    },
    [],
  );

  const rejectReturn = useCallback(
    (returnId, reason, actor = purchaseCurrentUser) => {
      if (!reason?.trim()) return;

      setStoreState((current) => ({
        ...current,
        returns: current.returns.map((item) =>
          item.id === returnId && item.status === RETURN_STATUSES.pendingApproval
            ? {
                ...item,
                status: RETURN_STATUSES.rejected,
                approvedBy: actor.name,
                approvedAt: nowIso(),
                rejectReason: reason.trim(),
                timeline: [
                  ...(item.timeline || []),
                  {
                    id: createEntityId("rtl"),
                    type: "rejected",
                    label: `Rad etildi: ${reason.trim()}`,
                    actor: actor.name,
                    at: nowIso(),
                  },
                ],
              }
            : item,
        ),
      }));
    },
    [],
  );

  // ---------- Quality Inspection (Enterprise: Damaged Goods) ----------

  const submitInspection = useCallback(
    ({ inspectionId, items = [] }, actor = purchaseCurrentUser) => {
      let finalizedInspection = null;
      let autoReturn = null;

      setStoreState((current) => {
        const inspection = current.inspections.find(
          (entry) => entry.id === inspectionId,
        );

        // Invalid status flow / duplicate inspection guard — faqat
        // "Tekshiruv kutilmoqda" holatidagi hujjat yakunlanishi mumkin,
        // allaqachon yakunlangan tekshiruv qayta topshirilsa jimgina
        // rad etiladi.
        if (!inspection || inspection.status !== INSPECTION_STATUSES.pending) {
          return current;
        }

        const order = current.orders.find((entry) => entry.id === inspection.orderId);

        if (!order) return current;

        // Clientdan (modal) kelgan tayyor natijaga ishonilmaydi — har bir
        // qator o'zining damagedQty asosida MUSTAQIL qayta normallashtiriladi
        // va hisoblanadi (landed cost/receiving bilan bir xil ishonch darajasi).
        const resolvedItems = inspection.items
          .map((original) => {
            const incoming =
              items.find((entry) => entry.itemId === original.itemId) || {};

            return normalizeInspectionItem(
              { ...original, ...incoming },
              original.damagedQty,
            );
          })
          .map((item) => ({
            ...item,
            status: computeItemInspectionStatus(item, item.damagedQty),
          }));

        // Validatsiya: manfiy miqdor, Accepted+Rejected > Received, to'liq
        // hisobga olinmagan miqdor, shikast turi/amal tanlanmagan.
        const errors = resolvedItems.flatMap((item) =>
          validateInspectionItem(item, item.damagedQty),
        );

        if (errors.length) return current;

        const overallStatus = computeInspectionStatus(
          resolvedItems.map((item) => item.status),
        );

        finalizedInspection = {
          ...inspection,
          status: overallStatus,
          items: resolvedItems,
          inspectedAt: nowIso(),
          inspectedBy: actor.name,
          timeline: [
            ...(inspection.timeline || []),
            {
              id: createEntityId("qil"),
              type: overallStatus,
              label: `Tekshiruv yakunlandi — ${INSPECTION_STATUS_LABELS[overallStatus] || overallStatus}`,
              actor: actor.name,
              at: nowIso(),
            },
          ],
        };

        // Har bir qatorning natijasi ENDI REAL ta'sir qiladi (audit topilmasi
        // §34: ilgari "Karantin"/"Yo'q qilish" faqat yorliq edi): qabul
        // qilingan qism ombor qoldig'iga (receivedQty) qo'shiladi, butun
        // hal qilingan miqdor buzuq havzasidan (damagedQty) chiqadi, tanlangan
        // amal bo'yicha hisobot uchun kumulyativ hisoblagichlar yuritiladi.
        const orderItems = order.items.map((item) => {
          const line = resolvedItems.find((entry) => entry.itemId === item.id);

          if (!line) return item;

          const resolvedQty = line.acceptedQty + line.rejectedQty;

          return {
            ...item,
            receivedQty: item.receivedQty + line.acceptedQty,
            damagedQty: Math.max((item.damagedQty || 0) - resolvedQty, 0),
            qcAcceptedQty: (item.qcAcceptedQty || 0) + line.acceptedQty,
            qcRejectedQty: (item.qcRejectedQty || 0) + line.rejectedQty,
            qcReturnQty:
              (item.qcReturnQty || 0) +
              (line.action === INSPECTION_ACTIONS.returnSupplier ? line.rejectedQty : 0),
            qcReplacementQty:
              (item.qcReplacementQty || 0) +
              (line.action === INSPECTION_ACTIONS.replacement ? line.rejectedQty : 0),
            qcDisposedQty:
              (item.qcDisposedQty || 0) +
              (line.action === INSPECTION_ACTIONS.dispose ? line.rejectedQty : 0),
            qcRepairQty:
              (item.qcRepairQty || 0) +
              (line.action === INSPECTION_ACTIONS.repair ? line.rejectedQty : 0),
            qcQuarantineQty:
              (item.qcQuarantineQty || 0) +
              (line.action === INSPECTION_ACTIONS.quarantine ? line.rejectedQty : 0),
          };
        });

        const updatedOrder = withTimeline(
          { ...order, items: orderItems },
          "quality_inspection",
          `Sifat tekshiruvi yakunlandi (${inspection.number}) — ${INSPECTION_STATUS_LABELS[overallStatus] || overallStatus}`,
          actor.name,
        );

        // "Yetkazib beruvchiga qaytarish" amali tanlangan qatorlar — haqiqiy
        // Return hujjati AVTOMATIK shakllantiriladi va menejer tasdig'iga
        // yuboriladi (audit topilmasi: ilgari bu amal hech narsaga ta'sir
        // qilmasdi, foydalanuvchi qaytarishni noldan boshlashga majbur edi).
        const returnLines = resolvedItems
          .filter(
            (item) =>
              item.action === INSPECTION_ACTIONS.returnSupplier && item.rejectedQty > 0,
          )
          .map((item) => {
            const orderItem = order.items.find((entry) => entry.id === item.itemId);
            const unitPrice = orderItem
              ? orderItem.price / (normalizeNumber(orderItem.unitFactor) || 1)
              : 0;

            return {
              itemId: item.itemId,
              name: item.name,
              quantity: item.rejectedQty,
              price: unitPrice,
            };
          });

        let returns = current.returns;
        let returnCounter = current.counters.return;
        let orderAfterReturn = updatedOrder;

        if (returnLines.length) {
          const returnSequence = returnCounter;
          const total = returnLines.reduce(
            (sum, line) => sum + line.quantity * line.price,
            0,
          );

          autoReturn = {
            id: createEntityId("ret"),
            number: createDocumentNumber(DOCUMENT_PREFIXES.return, returnSequence),
            orderId: order.id,
            orderNumber: order.number,
            supplierId: order.supplierId,
            reason: "damaged",
            compensation: "replace",
            note: `Sifat tekshiruvidan avtomatik yaratildi (${inspection.number})`,
            status: RETURN_STATUSES.pendingApproval,
            total,
            createdAt: nowIso(),
            createdBy: actor.name,
            approvedBy: null,
            approvedAt: null,
            rejectReason: "",
            timeline: [
              {
                id: createEntityId("rtl"),
                type: "pending",
                label: `Sifat tekshiruvidan avtomatik yaratildi (${inspection.number})`,
                actor: actor.name,
                at: nowIso(),
              },
            ],
            items: returnLines,
          };

          returns = [autoReturn, ...current.returns];
          returnCounter = returnSequence + 1;

          orderAfterReturn = withTimeline(
            updatedOrder,
            "return_requested",
            `Qaytarish so'raldi (${autoReturn.number})`,
            actor.name,
          );
        }

        return {
          ...current,
          orders: current.orders.map((entry) =>
            entry.id === order.id ? orderAfterReturn : entry,
          ),
          inspections: current.inspections.map((entry) =>
            entry.id === inspectionId ? finalizedInspection : entry,
          ),
          returns,
          counters: { ...current.counters, return: returnCounter },
        };
      });

      if (finalizedInspection) {
        const supplierName = getSupplierSnapshot(finalizedInspection.supplierId)?.name;

        notifyQualityInspection({
          inspection: finalizedInspection,
          statusLabel:
            INSPECTION_STATUS_LABELS[finalizedInspection.status] ||
            finalizedInspection.status,
          supplierName,
          actor: actor.name,
        });

        if (autoReturn) {
          notifyPurchaseReturn({
            returnEntry: autoReturn,
            supplierName,
            actor: actor.name,
          });
        }
      }

      return finalizedInspection;
    },
    [],
  );

  // ---------- Invoices & payments (PDF 41-46) ----------

  const createInvoice = useCallback(
    (
      {
        orderId,
        amount,
        dueDate,
        invoiceNumber = "",
        invoiceDate = "",
        invoiceQty = 0,
        note = "",
        items = [],
        attachments = [],
      },
      actor = purchaseCurrentUser,
    ) => {
      let created = null;

      setStoreState((current) => {
        const order = current.orders.find((entry) => entry.id === orderId);

        if (!order || amount <= 0) return current;

        const sequence = current.counters.invoice;

        // Enterprise Three-Way Matching (PDF 42-43): bu yerda invoys endi PO
        // qatoridan MUSTAQIL o'z qator ro'yxatiga ega — supplier haqiqatda
        // nima uchun hisob taqdim etgani (miqdor/narx/chegirma/soliq har
        // qatorda). Solishtirish (matching) buildInvoiceFromOrder ichida
        // shu qatorlardan avtomatik hisoblanadi (threeWayMatching.js) —
        // receiveOrder ichidagi avtomatik invoyslashtirish bilan BIR XIL
        // formula (mantiq ikki joyda yozilmaydi).
        created = buildInvoiceFromOrder(order, {
          sequence,
          amount,
          dueDate,
          invoiceNumber,
          invoiceDate,
          invoiceQty,
          note,
          items,
          attachments,
          actor,
        });

        const orderWithEvent = withTimeline(
          canTransitionStatus(order.status, PURCHASE_STATUSES.invoiced)
            ? { ...order, status: PURCHASE_STATUSES.invoiced }
            : order,
          "invoiced",
          `Invoys kiritildi (${created.number})`,
          actor.name,
        );

        return {
          ...current,
          orders: current.orders.map((entry) =>
            entry.id === orderId ? orderWithEvent : entry,
          ),
          invoices: [created, ...current.invoices],
          counters: { ...current.counters, invoice: sequence + 1 },
        };
      });

      if (created) {
        const supplierName = getSupplierSnapshot(created.supplierId)?.name;

        notifyInvoiceCreated({ invoice: created, supplierName, actor: actor.name });

        if (created.status === INVOICE_STATUSES.matched) {
          notifyInvoiceMatched({ invoice: created, supplierName });
        } else if (created.status === INVOICE_STATUSES.mismatch) {
          notifyInvoiceMismatch({ invoice: created, supplierName });
        }
      }

      return created;
    },
    [],
  );

  // PDF 44-46: to'lov — qisman bo'lishi mumkin, invoysdan oshmasin.
  // To'lov HAR DOIM invoysning valyutasida amalga oshiriladi — alohida
  // valyuta tanlanmaydi, aks holda bir invoysga turli valyutada to'lov
  // qo'shilib, qoldiq hisob-kitobi buziladi.
  const addPayment = useCallback(
    (
      {
        invoiceId,
        amount,
        method,
        paymentDate,
        cashAccount = "",
        bankAccount = "",
        transactionNumber = "",
        comment = "",
        attachment = null,
        attachments = [],
      },
      actor = purchaseCurrentUser,
    ) => {
      let notifyPayload = null;

      setStoreState((current) => {
        const invoice = current.invoices.find((entry) => entry.id === invoiceId);

        if (!invoice) return current;

        const remaining = getInvoiceRemaining(invoice);
        // "Mumkin bo'lmagan miqdorlar" — manfiy/raqam bo'lmagan summa 0'ga
        // tenglashtiriladi.
        const safeAmount = Math.min(
          Math.max(normalizeNumber(amount), 0),
          remaining,
        );

        if (safeAmount <= 0) return current;

        const paidAmount = invoice.paidAmount + safeAmount;
        const fullyPaid = paidAmount >= invoice.amount;
        const invoiceCurrency = invoice.currency || BASE_PURCHASE_CURRENCY;
        const invoiceRate = normalizeNumber(invoice.exchangeRate) || 1;

        const invoices = current.invoices.map((entry) =>
          entry.id === invoiceId
            ? {
                ...entry,
                paidAmount,
                status: fullyPaid
                  ? INVOICE_STATUSES.paid
                  : INVOICE_STATUSES.partiallyPaid,
                payments: [
                  ...entry.payments,
                  {
                    id: createEntityId("pay"),
                    amount: safeAmount,
                    // PDF 44 + valyuta: to'lov invoys valyutasini meros qiladi.
                    currency: invoiceCurrency,
                    baseCurrencyAmount: Math.round(safeAmount * invoiceRate),
                    method,
                    paymentDate: paymentDate || nowIso().slice(0, 10),
                    paidAt: paymentDate
                      ? new Date(paymentDate).toISOString()
                      : nowIso(),
                    paidBy: actor.name,
                    cashAccount,
                    bankAccount,
                    transactionNumber,
                    comment,
                    attachments: normalizeAttachments(
                      attachments.length
                        ? attachments
                        : attachment?.name
                          ? [attachment]
                          : [],
                      actor,
                    ),
                  },
                ],
              }
            : entry,
        );

        const nextState = { ...current, invoices };
        const nextOrderStatus = resolveOrderStatusAfterInvoices(
          nextState,
          invoice.orderId,
        );

        const orders = current.orders.map((order) => {
          if (order.id !== invoice.orderId) return order;

          let next = withTimeline(
            order,
            "payment",
            `To'lov: ${formatCurrencyMoney(safeAmount, invoiceCurrency)} (${invoice.number})`,
            actor.name,
          );

          if (
            nextOrderStatus === PURCHASE_STATUSES.paid &&
            canTransitionStatus(next.status, PURCHASE_STATUSES.paid)
          ) {
            next = withTimeline(
              { ...next, status: PURCHASE_STATUSES.paid },
              "paid",
              "Barcha invoyslar to'landi",
              actor.name,
            );
          }

          return next;
        });

        notifyPayload = {
          invoice: invoices.find((entry) => entry.id === invoiceId),
          amount: safeAmount,
          currency: invoiceCurrency,
        };

        return { ...nextState, orders };
      });

      if (notifyPayload) {
        notifyPaymentCreated({
          invoice: notifyPayload.invoice,
          amount: notifyPayload.amount,
          currency: notifyPayload.currency,
          supplierName: getSupplierSnapshot(notifyPayload.invoice.supplierId)?.name,
          actor: actor.name,
        });
      }
    },
    [],
  );

  // ---------- Notes & attachments (PDF 15-16) ----------

  const addNote = useCallback(
    (orderId, { type, text }, actor = purchaseCurrentUser) => {
      if (!text?.trim()) return;

      setStoreState((current) =>
        updateOrderInState(current, orderId, (order) => ({
          ...order,
          notes: [
            ...(order.notes || []),
            {
              id: createEntityId("note"),
              type,
              text: text.trim(),
              author: actor.name,
              createdAt: nowIso(),
            },
          ],
        })),
      );
    },
    [],
  );

  const addAttachment = useCallback(
    (orderId, file, actor = purchaseCurrentUser) => {
      setStoreState((current) =>
        updateOrderInState(current, orderId, (order) => ({
          ...order,
          attachments: [
            ...(order.attachments || []),
            {
              id: createEntityId("att"),
              name: file.name,
              size: Number(file.size) || 0,
              type: file.type || file.name.split(".").pop() || "file",
              extension:
                file.extension || file.name.split(".").pop()?.toLowerCase() || "",
              mimeType: file.mimeType || "",
              previewUrl: file.previewUrl || "",
              downloadUrl: file.downloadUrl || "",
              localOnly: !!file.localOnly,
              author: actor.name,
              uploadedAt: nowIso(),
            },
          ],
        })),
      );
    },
    [],
  );

  const removeAttachment = useCallback((orderId, attachmentId) => {
    setStoreState((current) =>
      updateOrderInState(current, orderId, (order) => ({
        ...order,
        attachments: (order.attachments || []).filter(
          (file) => file.id !== attachmentId,
        ),
      })),
    );
  }, []);

  // ---------- Products (Product katalogi) ----------

  // ERP arxitektura: "Yangi mahsulot yaratish" (Product Master) — supplier
  // bog'lanishidan MUSTAQIL amal. Mahsulot bir marta yaratiladi va
  // katalogda qoladi; qaysi supplierlarga bog'langani (`supplier.
  // productIds`, Suppliers moduli) butunlay alohida narsa. Bu funksiya
  // FAQAT mahsulotni yaratadi va uni chaqiruvchiga qaytaradi — keyin
  // chaqiruvchi (masalan Supplier profili) uni tegishli supplierga
  // bog'laydi. Shu bilan "mahsulot yaratish" va "mahsulotni supplierга
  // bog'lash" ikki alohida qadam bo'lib qoladi (lekin UI ularni bitta
  // "Saqlash" bosilishida ketma-ket chaqirishi mumkin).
  const createProduct = useCallback((payload = {}) => {
    // Katalogda narx doim BAZAVIY valyutada (product.lastPrice hech qachon
    // valyuta maydoniga ega emas — PurchaseOrders bilan bir xil qoida).
    // Foydalanuvchi boshqa valyutada kiritsa, statik kurs bilan
    // konvertatsiya qilinadi (currencies.js — boshqa joylarda ham xuddi
    // shu mock kurslar ishlatiladi).
    const exchangeRate = getDefaultExchangeRate(payload.currency);
    const priceInBaseCurrency = convertToBaseCurrency(
      Number(payload.price) || 0,
      exchangeRate,
    );

    const product = {
      id: createEntityId("prd"),
      name: (payload.name || "").trim(),
      sku: (payload.sku || "").trim(),
      barcode: (payload.barcode || "").trim(),
      category: (payload.category || "").trim(),
      stock: 0,
      reorderPoint: Number(payload.reorderPoint) || 0,
      moq: Math.max(Number(payload.moq) || 1, 1),
      lastPrice: Math.max(priceInBaseCurrency, 0),
      units: [
        { code: "purchase", label: payload.purchaseUnit || "Dona", factor: 1 },
        ...(payload.saleUnit
          ? [{ code: "sale", label: payload.saleUnit, factor: 1 }]
          : []),
      ],
    };

    setStoreState((current) => ({
      ...current,
      products: [product, ...current.products],
    }));

    store.dispatch(
      businessOSActions.upsertProduct({
        ...product,
        price: product.lastPrice,
        categoryId: product.category,
        status: "active",
      }),
    );

    return product;
  }, []);

  // ---------- Byudjet (PDF 57-60, Enterprise) ----------

  // Yaratish/tahrirlash — UI (BudgetFormModal) validatsiyani oldindan
  // ko'rsatadi, lekin store bu yerda HAM qayta tekshiradi (bir xil
  // validateBudgetPayload dvigateli — mantiq ikki joyda yozilmaydi).
  // Xato bo'lsa `{ budget: null, errors }` qaytadi, muvaffaqiyatda
  // `{ budget, errors: [] }`.
  const createBudget = useCallback((payload = {}, actor = purchaseCurrentUser) => {
    let result = { budget: null, errors: [] };

    setStoreState((current) => {
      const errors = validateBudgetPayload(payload, {
        existingBudgets: current.budgets,
      });

      if (errors.length) {
        result = { budget: null, errors };
        return current;
      }

      const budget = {
        id: createEntityId("bud"),
        name: payload.name.trim(),
        scopeType: payload.scopeType,
        scopeValue: payload.scopeValue || null,
        periodType: payload.periodType,
        periodYear: normalizeNumber(payload.periodYear),
        periodMonth: payload.periodMonth ? normalizeNumber(payload.periodMonth) : null,
        periodQuarter: payload.periodQuarter ? normalizeNumber(payload.periodQuarter) : null,
        currency: payload.currency,
        allocated: normalizeNumber(payload.allocated),
        thresholds: payload.thresholds?.length ? payload.thresholds : undefined,
        hardLimit: !!payload.hardLimit,
        active: payload.active !== false,
        notes: (payload.notes || "").trim(),
        createdAt: nowIso(),
        createdBy: actor.name,
      };

      result = { budget, errors: [] };

      return { ...current, budgets: [budget, ...current.budgets] };
    });

    return result;
  }, []);

  const updateBudget = useCallback((budgetId, payload = {}) => {
    let result = { budget: null, errors: [] };

    setStoreState((current) => {
      const existing = current.budgets.find((entry) => entry.id === budgetId);

      if (!existing) {
        result = { budget: null, errors: ["Byudjet topilmadi."] };
        return current;
      }

      const merged = { ...existing, ...payload };
      const errors = validateBudgetPayload(merged, {
        existingBudgets: current.budgets,
        excludeId: budgetId,
      });

      if (errors.length) {
        result = { budget: null, errors };
        return current;
      }

      const updated = {
        ...existing,
        name: merged.name.trim(),
        scopeType: merged.scopeType,
        scopeValue: merged.scopeValue || null,
        periodType: merged.periodType,
        periodYear: normalizeNumber(merged.periodYear),
        periodMonth: merged.periodMonth ? normalizeNumber(merged.periodMonth) : null,
        periodQuarter: merged.periodQuarter ? normalizeNumber(merged.periodQuarter) : null,
        currency: merged.currency,
        allocated: normalizeNumber(merged.allocated),
        thresholds: merged.thresholds?.length ? merged.thresholds : existing.thresholds,
        hardLimit: !!merged.hardLimit,
        active: merged.active !== false,
        notes: (merged.notes || "").trim(),
      };

      result = { budget: updated, errors: [] };

      return {
        ...current,
        budgets: current.budgets.map((entry) =>
          entry.id === budgetId ? updated : entry,
        ),
      };
    });

    return result;
  }, []);

  const setBudgetActive = useCallback((budgetId, active) => {
    setStoreState((current) => ({
      ...current,
      budgets: current.budgets.map((entry) =>
        entry.id === budgetId ? { ...entry, active: !!active } : entry,
      ),
    }));
  }, []);

  const deleteBudget = useCallback((budgetId) => {
    setStoreState((current) => ({
      ...current,
      budgets: current.budgets.filter((entry) => entry.id !== budgetId),
    }));
  }, []);

  // ---------- Selectors ----------

  const getOrderById = useCallback(
    (orderId) => state.orders.find((order) => order.id === orderId) || null,
    [state.orders],
  );

  // PDF 57-60: berilgan (hali saqlanmagan yoki mavjud) PO shakliga tegishli
  // barcha FAOL byudjetlar va ularga ta'sirini qaytaradi — Wizard (real-time
  // preview) va Order Detail (post-factum ko'rsatish) ikkisi ham shu bitta
  // selectordan foydalanadi.
  const getBudgetImpactsForOrder = useCallback(
    (orderShape, { excludeOrderId = null } = {}) =>
      getApplicableBudgetImpacts(orderShape, state.budgets, state.orders, {
        products: state.products,
        excludeOrderId,
      }),
    [state.budgets, state.orders, state.products],
  );

  return {
    currentUser: purchaseCurrentUser,
    suppliers,
    warehouses: availableWarehouses,
    products: state.products,
    orders: state.orders,
    receipts: state.receipts,
    invoices: state.invoices,
    returns: state.returns,
    inspections: state.inspections,
    budgets: state.budgets,
    getSupplier,
    getOrderById,
    getRemainingQty,
    getBudgetImpactsForOrder,
    actions: {
      createOrder,
      updateDraft,
      submitOrder,
      approveOrderStep,
      rejectOrderStep,
      sendOrder,
      cancelOrder,
      closeOrder,
      receiveOrder,
      createReturn,
      approveReturn,
      rejectReturn,
      submitInspection,
      createInvoice,
      addPayment,
      addNote,
      addAttachment,
      removeAttachment,
      createProduct,
      createBudget,
      updateBudget,
      setBudgetActive,
      deleteBudget,
    },
  };
};

export default usePurchasesStore;
