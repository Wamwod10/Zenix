// PDF 57-60 (Enterprise): Byudjetlarni boshqarish — ro'yxat, filtr, yaratish/
// tahrirlash, faol/nofaol, o'chirish. Dashboarddagi "Byudjetlarni boshqarish"
// tugmasi orqali ochiladi (alohida route kerak emas — Purchases ichidagi
// mavjud sahifadan modal sifatida).

import { useMemo, useState } from "react";
import { Plus, Wallet } from "lucide-react";

import BudgetProgressCard from "../../components/BudgetProgressCard/BudgetProgressCard";
import PurchaseModal from "../../components/PurchaseModal/PurchaseModal";
import PurchaseTabs from "../../components/PurchaseTabs/PurchaseTabs";
import ConfirmReasonModal from "../ConfirmReasonModal/ConfirmReasonModal";
import BudgetFormModal from "../BudgetFormModal/BudgetFormModal";
import { BUDGET_SCOPE_LABELS, BUDGET_SCOPE_TYPES } from "../../constants/budgets";
import { computeBudgetConsumption } from "../../utils/budgetCalculations";

import "./BudgetManagerModal.scss";

const BudgetManagerModal = ({
  open,
  onClose,
  budgets = [],
  orders = [],
  products = [],
  suppliers = [],
  getSupplier,
  actions,
}) => {
  const [scopeFilter, setScopeFilter] = useState("all");
  const [formState, setFormState] = useState(null); // null | "new" | budget object
  const [deleteTarget, setDeleteTarget] = useState(null);

  const visibleBudgets = useMemo(
    () =>
      scopeFilter === "all"
        ? budgets
        : budgets.filter((budget) => budget.scopeType === scopeFilter),
    [budgets, scopeFilter],
  );

  const tabs = [
    { id: "all", label: "Barchasi", count: budgets.length },
    ...Object.values(BUDGET_SCOPE_TYPES).map((scopeType) => ({
      id: scopeType,
      label: BUDGET_SCOPE_LABELS[scopeType],
      count: budgets.filter((budget) => budget.scopeType === scopeType).length,
    })),
  ];

  const editingBudget = formState && formState !== "new" ? formState : null;
  const editingConsumption = editingBudget
    ? computeBudgetConsumption(editingBudget, orders, {
        products,
        excludeOrderId: null,
      })
    : null;

  const handleSubmit = (payload) => {
    const result = editingBudget
      ? actions.updateBudget(editingBudget.id, payload)
      : actions.createBudget(payload);

    if (result.budget) setFormState(null);

    return result;
  };

  return (
    <>
      <PurchaseModal
        open={open}
        size="lg"
        eyebrow={
          <>
            <Wallet size={14} />
            Byudjet nazorati
          </>
        }
        title="Xarid byudjetlarini boshqarish"
        description="Umumiy, yetkazib beruvchi, kategoriya, bo'lim va loyiha kesimida byudjet — sarf, qoldiq va nazorat rejimi bilan."
        onClose={onClose}
        footer={
          <>
            <button className="purchase-btn purchase-btn--ghost" type="button" onClick={onClose}>
              Yopish
            </button>
            <button
              className="purchase-btn purchase-btn--primary"
              type="button"
              onClick={() => setFormState("new")}
            >
              <Plus size={15} />
              Yangi byudjet
            </button>
          </>
        }
      >
        <PurchaseTabs tabs={tabs} activeTab={scopeFilter} onChange={setScopeFilter} />

        <div className="budget-manager__list">
          {visibleBudgets.length === 0 && (
            <p className="budget-manager__empty">
              Bu kesimda byudjet yo'q. "Yangi byudjet" tugmasi orqali qo'shing.
            </p>
          )}

          {visibleBudgets.map((budget) => (
            <BudgetProgressCard
              key={budget.id}
              budget={budget}
              consumption={computeBudgetConsumption(budget, orders, { products })}
              getSupplier={getSupplier}
              onEdit={setFormState}
              onToggleActive={actions.setBudgetActive}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      </PurchaseModal>

      <BudgetFormModal
        open={!!formState}
        budget={editingBudget}
        suppliers={suppliers}
        products={products}
        existingBudgets={budgets}
        consumedForEdit={editingConsumption?.consumed || 0}
        onClose={() => setFormState(null)}
        onSubmit={handleSubmit}
      />

      <ConfirmReasonModal
        open={!!deleteTarget}
        title="Byudjetni o'chirish"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" byudjeti butunlay o'chiriladi. Bu amalni bekor qilib bo'lmaydi.`
            : ""
        }
        confirmLabel="O'chirish"
        reasonRequired={false}
        tone="danger"
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          actions.deleteBudget(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </>
  );
};

export default BudgetManagerModal;
