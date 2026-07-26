// AI Workspace — markaziy hook: mavjud Purchases/Suppliers ma'lumotidan
// (usePurchasesStore — yagona manba, Suppliers ham shu yerdan o'qiladi)
// insightlar hisoblanadi (aiEngine), so'ng foydalanuvchi holati (pin/complete/
// dismiss — aiStorage) bilan birlashtiriladi. `scopeFilter` — bitta sahifada
// (masalan Supplier profili) faqat shu supplierga tegishli insightlarni
// ko'rsatish uchun ixtiyoriy predikat.

import { useMemo } from "react";

import usePurchasesStore from "../hooks/usePurchasesStore";
import { buildAISummary, generateAIInsights } from "./aiEngine";
import { useAIUserState } from "./aiStorage";

export const useAIWorkspace = ({ scopeFilter } = {}) => {
  const { orders, invoices, budgets, products, suppliers, receipts, getSupplier } =
    usePurchasesStore();
  const { entries, history, actions } = useAIUserState();

  const rawInsights = useMemo(
    () =>
      generateAIInsights({
        orders,
        invoices,
        budgets,
        products,
        suppliers,
        receipts,
        getSupplier,
      }),
    [orders, invoices, budgets, products, suppliers, receipts, getSupplier],
  );

  const insights = useMemo(() => {
    const merged = rawInsights.map((insight) => ({
      ...insight,
      pinned: !!entries[insight.id]?.pinned,
      completed: !!entries[insight.id]?.completed,
      dismissed: !!entries[insight.id]?.dismissed,
    }));

    return scopeFilter ? merged.filter(scopeFilter) : merged;
  }, [rawInsights, entries, scopeFilter]);

  const summary = useMemo(() => buildAISummary(insights.filter((entry) => !entry.dismissed)), [insights]);

  const scopedHistory = useMemo(() => {
    if (!scopeFilter) return history;

    const scopedIds = new Set(insights.map((entry) => entry.id));

    return history.filter((entry) => scopedIds.has(entry.insightId));
  }, [history, insights, scopeFilter]);

  return {
    insights,
    summary,
    history: scopedHistory,
    actions: {
      pin: (insight) => actions.pin(insight.id, insight.title),
      complete: (insight) => actions.complete(insight.id, insight.title),
      dismiss: (insight) => actions.dismiss(insight.id, insight.title),
      restore: (insight) => actions.restore(insight.id, insight.title),
    },
  };
};

export default useAIWorkspace;
