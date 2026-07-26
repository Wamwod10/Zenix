// Derived ogohlantirishlarni Purchases/Suppliers joriy holatidan avtomatik
// muvofiqlashtiradi (payment due/overdue, budget warning/exceeded, supplier
// document expiring). NotificationBell mavjud har bir sahifada (Purchases va
// Suppliers) shu hook chaqiriladi — bir nechta nusxada ishlashi xavfsiz,
// chunki reconcile idempotent (dedupeKey asosida).

import { useLayoutEffect, useRef } from "react";

import usePurchasesStore from "../hooks/usePurchasesStore";
import { useSuppliers } from "../../suppliers/suppliersApi";
import { reconcileDerivedNotifications } from "./notificationsStore";
import {
  buildBudgetExceededMap,
  buildBudgetWarningMap,
  buildPaymentDueMap,
  buildPaymentOverdueMap,
  buildSupplierDocumentExpiringMap,
} from "./notificationsSync";

// Har sahifa almashinuvida qayta hisoblash real vaqtdagidek tuyulishi uchun
// kifoya — doimiy interval (setInterval) shart emas, chunki reconcile HAR
// mount/dependency o'zgarishida joriy `Date.now()` bilan ishlaydi.
//
// useLayoutEffect (useEffect emas) ATAYLAB tanlangan: reconcile natijasida
// paydo bo'lgan YANGI derived bildirishnomalar (masalan budget/to'lov
// muddati) NotificationBell'ning toast-ko'prigi birinchi marta ishlashidan
// OLDIN joriy holatga qo'shilishi kerak — aks holda ular "yangi voqea" deb
// noto'g'ri qabul qilinib, sahifa har ochilganda ortiqcha toast chiqaradi.
export const useNotificationsSync = () => {
  const { invoices, budgets, orders, products } = usePurchasesStore();
  const { suppliers } = useSuppliers();
  const lastRunRef = useRef(0);

  useLayoutEffect(() => {
    // Bir xil render tsiklida ortiqcha ishlamasin (masalan bir necha
    // NotificationBell nusxasi bitta sahifada) — 500ms debounce.
    const now = Date.now();

    if (now - lastRunRef.current < 500) return undefined;

    lastRunRef.current = now;

    const runAt = new Date();

    reconcileDerivedNotifications("payment_due", buildPaymentDueMap(invoices, runAt));
    reconcileDerivedNotifications("payment_overdue", buildPaymentOverdueMap(invoices, runAt));
    reconcileDerivedNotifications(
      "budget_warning",
      buildBudgetWarningMap(budgets, orders, products, runAt),
    );
    reconcileDerivedNotifications(
      "budget_exceeded",
      buildBudgetExceededMap(budgets, orders, products, runAt),
    );
    reconcileDerivedNotifications(
      "supplier_document_expiring",
      buildSupplierDocumentExpiringMap(suppliers, runAt),
    );

    return undefined;
  }, [invoices, budgets, orders, products, suppliers]);
};

export default useNotificationsSync;
