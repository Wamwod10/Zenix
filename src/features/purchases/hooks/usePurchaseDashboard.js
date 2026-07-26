// PDF 1: Purchase Dashboard — KPI, oylik grafik, bugungi/kutilayotgan
// yetkazishlar, top supplierlar, holatlar taqsimoti, AI tavsiya.

import { useMemo } from "react";

import { INVOICE_STATUSES } from "../constants/paymentTerms";
import {
  PURCHASE_STATUSES,
  PURCHASE_STATUS_LABELS,
  PURCHASE_STATUS_TONES,
} from "../constants/purchaseStatuses";
import { getReorderSuggestions } from "../data/purchaseProducts";
import {
  calculateOrderTotals,
  getInvoiceRemaining,
  getInvoiceRemainingInBaseCurrency,
} from "../utils/purchaseCalculations";

const OPEN_STATUSES = [
  PURCHASE_STATUSES.pendingApproval,
  PURCHASE_STATUSES.approved,
  PURCHASE_STATUSES.sent,
  PURCHASE_STATUSES.partiallyReceived,
];

const MONTH_LABELS = [
  "Yan",
  "Fev",
  "Mar",
  "Apr",
  "May",
  "Iyn",
  "Iyl",
  "Avg",
  "Sen",
  "Okt",
  "Noy",
  "Dek",
];

const isSameMonth = (dateValue, now) => {
  const date = new Date(dateValue);

  return (
    date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
  );
};

// PDF 47: aralash valyuta — hamma summa UZS ekvivalentida agregatlanadi
const getOrderBaseTotal = (order) =>
  Math.round(calculateOrderTotals(order).total * (order.exchangeRate || 1));

export const usePurchaseDashboard = ({ orders, invoices, getSupplier }) => {
  return useMemo(() => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    const activeOrders = orders.filter(
      (order) => order.status !== PURCHASE_STATUSES.cancelled,
    );

    // KPI: bu oygi xarid summasi
    const monthTotal = activeOrders
      .filter(
        (order) =>
          order.status !== PURCHASE_STATUSES.draft &&
          isSameMonth(order.createdAt, now),
      )
      .reduce((sum, order) => sum + getOrderBaseTotal(order), 0);

    // KPI: ochiq PO
    const openOrders = activeOrders.filter((order) =>
      OPEN_STATUSES.includes(order.status),
    );

    // KPI: kutilayotgan yetkazish
    const incomingOrders = activeOrders
      .filter((order) =>
        [PURCHASE_STATUSES.sent, PURCHASE_STATUSES.partiallyReceived].includes(
          order.status,
        ),
      )
      .map((order) => ({
        ...order,
        isLate: order.expectedDate < today,
        isToday: order.expectedDate === today,
      }))
      .sort((a, b) => new Date(a.expectedDate) - new Date(b.expectedDate));

    // Bugun keladiganlar — alohida ro'yxat
    const todayArrivals = incomingOrders.filter(
      (order) => order.isToday || order.isLate,
    );

    // KPI: qarzdorlik (to'lanmagan invoyslar) — turli invoyslar turli PO
    // valyutasidan meros bo'lishi mumkin, shuning uchun BAZAVIY (UZS)
    // valyutadagi qoldiq yig'iladi (getInvoiceRemainingInBaseCurrency).
    const outstanding = invoices
      .filter((invoice) => invoice.status !== INVOICE_STATUSES.paid)
      .reduce((sum, invoice) => sum + getInvoiceRemainingInBaseCurrency(invoice), 0);

    // Xarid grafigi: oxirgi 6 oy (UZS ekvivalentida)
    const monthlySeries = Array.from({ length: 6 }, (_, index) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - index, 1);

      const total = activeOrders
        .filter(
          (order) =>
            order.status !== PURCHASE_STATUSES.draft &&
            isSameMonth(order.createdAt, monthDate),
        )
        .reduce((sum, order) => sum + getOrderBaseTotal(order), 0);

      return {
        label: MONTH_LABELS[monthDate.getMonth()],
        total,
      };
    }).reverse();

    // Holatlar taqsimoti (Purchase Status Overview)
    const statusOverview = Object.values(PURCHASE_STATUSES)
      .map((status) => ({
        status,
        label: PURCHASE_STATUS_LABELS[status],
        tone: PURCHASE_STATUS_TONES[status],
        count: orders.filter((order) => order.status === status).length,
      }))
      .filter((entry) => entry.count > 0);

    // Top supplierlar
    const supplierTotals = activeOrders.reduce((map, order) => {
      if (order.status === PURCHASE_STATUSES.draft) return map;

      map[order.supplierId] =
        (map[order.supplierId] || 0) + getOrderBaseTotal(order);

      return map;
    }, {});

    const topSuppliers = Object.entries(supplierTotals)
      .map(([supplierId, total]) => ({
        supplier: getSupplier(supplierId),
        total,
      }))
      .filter((entry) => entry.supplier)
      .sort((a, b) => b.total - a.total)
      .slice(0, 4);

    // To'lov ogohlantirishlari: muddati yaqin yoki o'tgan
    const paymentAlerts = invoices
      .filter((invoice) => invoice.status !== INVOICE_STATUSES.paid)
      .map((invoice) => {
        const dueInDays = Math.ceil(
          (new Date(invoice.dueDate) - now) / (1000 * 60 * 60 * 24),
        );

        return { ...invoice, dueInDays, remaining: getInvoiceRemaining(invoice) };
      })
      .filter((invoice) => invoice.dueInDays <= 7)
      .sort((a, b) => a.dueInDays - b.dueInDays);

    // AI tavsiya: "bu tovar tugayapti — buyurtma bering" (PDF 1, 62)
    const reorderSuggestions = getReorderSuggestions().slice(0, 4);

    return {
      kpi: {
        monthTotal,
        openCount: openOrders.length,
        incomingCount: incomingOrders.length,
        outstanding,
      },
      monthlySeries,
      incomingOrders: incomingOrders.slice(0, 5),
      todayArrivals,
      statusOverview,
      topSuppliers,
      paymentAlerts: paymentAlerts.slice(0, 4),
      reorderSuggestions,
    };
  }, [orders, invoices, getSupplier]);
};

export default usePurchaseDashboard;
