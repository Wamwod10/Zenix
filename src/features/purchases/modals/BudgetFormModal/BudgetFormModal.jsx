// PDF 57 (Enterprise): Byudjet yaratish/tahrirlash — scope, davr, valyuta,
// ajratma, nazorat rejimi (Hard/Soft Limit), chegaralar. Validatsiya xabarlari
// har bir o'zgarishda darhol ko'rsatiladi (submitdan oldin).

import { useEffect, useMemo, useState } from "react";
import { Wallet } from "lucide-react";

import PurchaseAlert from "../../components/PurchaseAlert/PurchaseAlert";
import PurchaseModal from "../../components/PurchaseModal/PurchaseModal";
import PurchaseSelectField from "../../components/PurchaseSelectField/PurchaseSelectField";
import PurchaseTextarea from "../../components/PurchaseTextarea/PurchaseTextarea";
import PurchaseTextField from "../../components/PurchaseTextField/PurchaseTextField";
import {
  BUDGET_ENFORCEMENT_LABELS,
  BUDGET_PERIOD_LABELS,
  BUDGET_PERIOD_TYPES,
  BUDGET_SCOPE_LABELS,
  BUDGET_SCOPE_TYPES,
  DEFAULT_BUDGET_THRESHOLDS,
  MONTH_LABELS,
  QUARTER_LABELS,
  SCOPE_REQUIRES_VALUE,
} from "../../constants/budgets";
import { PURCHASE_DEPARTMENTS } from "../../constants/departments";
import { PURCHASE_CURRENCIES } from "../../constants/currencies";
import { getBudgetPayloadWarnings, validateBudgetPayload } from "../../utils/budgetValidation";

import "./BudgetFormModal.scss";

const emptyForm = {
  name: "",
  scopeType: BUDGET_SCOPE_TYPES.overall,
  scopeValue: "",
  periodType: BUDGET_PERIOD_TYPES.monthly,
  periodYear: new Date().getFullYear(),
  periodMonth: new Date().getMonth() + 1,
  periodQuarter: Math.floor(new Date().getMonth() / 3) + 1,
  currency: "UZS",
  allocated: "",
  thresholds: DEFAULT_BUDGET_THRESHOLDS.slice(0, 4),
  hardLimit: false,
  active: true,
  notes: "",
};

const BudgetFormModal = ({
  open,
  budget = null,
  suppliers = [],
  products = [],
  existingBudgets = [],
  consumedForEdit = 0,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState(emptyForm);

  const categoryOptions = useMemo(
    () => [...new Set(products.map((product) => product.category).filter(Boolean))],
    [products],
  );

  useEffect(() => {
    if (!open) return;

    setForm(
      budget
        ? {
            ...emptyForm,
            ...budget,
            scopeValue: budget.scopeValue || "",
            thresholds: (budget.thresholds || DEFAULT_BUDGET_THRESHOLDS).slice(0, 4),
          }
        : emptyForm,
    );
  }, [open, budget]);

  const payload = useMemo(
    () => ({
      ...form,
      thresholds: [...form.thresholds, 100],
    }),
    [form],
  );

  const errors = useMemo(
    () =>
      validateBudgetPayload(payload, {
        existingBudgets,
        excludeId: budget?.id || null,
      }),
    [payload, existingBudgets, budget],
  );

  const warnings = useMemo(
    () => getBudgetPayloadWarnings(payload, { consumed: consumedForEdit }),
    [payload, consumedForEdit],
  );

  const set = (patch) => setForm((current) => ({ ...current, ...patch }));

  const scopeValueField = () => {
    if (!SCOPE_REQUIRES_VALUE[form.scopeType]) return null;

    if (form.scopeType === BUDGET_SCOPE_TYPES.supplier) {
      return (
        <PurchaseSelectField
          label="Yetkazib beruvchi"
          value={form.scopeValue}
          placeholder="Yetkazib beruvchi tanlang"
          options={suppliers.map((supplier) => ({
            value: supplier.id,
            label: supplier.name,
          }))}
          onChange={(value) => set({ scopeValue: value })}
        />
      );
    }

    if (form.scopeType === BUDGET_SCOPE_TYPES.category) {
      return (
        <PurchaseSelectField
          label="Kategoriya"
          value={form.scopeValue}
          placeholder="Kategoriya tanlang"
          options={categoryOptions.map((category) => ({
            value: category,
            label: category,
          }))}
          onChange={(value) => set({ scopeValue: value })}
        />
      );
    }

    if (form.scopeType === BUDGET_SCOPE_TYPES.department) {
      return (
        <PurchaseSelectField
          label="Bo'lim"
          value={form.scopeValue}
          placeholder="Bo'lim tanlang"
          options={PURCHASE_DEPARTMENTS.map((entry) => ({
            value: entry.id,
            label: entry.label,
          }))}
          onChange={(value) => set({ scopeValue: value })}
        />
      );
    }

    return (
      <PurchaseTextField
        label="Loyiha nomi"
        placeholder="Masalan: Yozgi aksiya"
        value={form.scopeValue}
        onChange={(event) => set({ scopeValue: event.target.value })}
      />
    );
  };

  return (
    <PurchaseModal
      open={open}
      size="lg"
      eyebrow={
        <>
          <Wallet size={14} />
          Xarid byudjeti
        </>
      }
      title={budget ? "Byudjetni tahrirlash" : "Yangi byudjet"}
      description="Byudjet turi, davri va ajratmasini belgilang — PO wizardida real vaqtda tekshiriladi."
      onClose={onClose}
      footer={
        <>
          <button className="purchase-btn purchase-btn--ghost" type="button" onClick={onClose}>
            Bekor qilish
          </button>
          <button
            className="purchase-btn purchase-btn--primary"
            type="button"
            disabled={errors.length > 0}
            title={errors.length > 0 ? "Avval ko'rsatilgan xatolarni tuzating" : undefined}
            onClick={() => onSubmit?.(payload)}
          >
            <Wallet size={15} />
            {budget ? "Saqlash" : "Byudjet yaratish"}
          </button>
        </>
      }
    >
      <div className="budget-form">
        <PurchaseTextField
          label="Byudjet nomi"
          placeholder="Masalan: 2026 Iyul — Ichimlik kategoriyasi"
          value={form.name}
          onChange={(event) => set({ name: event.target.value })}
        />

        <div className="budget-form__grid">
          <PurchaseSelectField
            label="Byudjet turi"
            value={form.scopeType}
            options={Object.values(BUDGET_SCOPE_TYPES).map((value) => ({
              value,
              label: BUDGET_SCOPE_LABELS[value],
            }))}
            onChange={(value) => set({ scopeType: value, scopeValue: "" })}
          />

          {scopeValueField()}
        </div>

        <div className="budget-form__grid">
          <PurchaseSelectField
            label="Davr turi"
            value={form.periodType}
            options={Object.values(BUDGET_PERIOD_TYPES).map((value) => ({
              value,
              label: BUDGET_PERIOD_LABELS[value],
            }))}
            onChange={(value) => set({ periodType: value })}
          />

          <PurchaseTextField
            label="Yil"
            type="number"
            min="2000"
            max="2100"
            value={form.periodYear}
            onChange={(event) => set({ periodYear: event.target.value })}
          />

          {form.periodType === BUDGET_PERIOD_TYPES.monthly && (
            <PurchaseSelectField
              label="Oy"
              value={String(form.periodMonth)}
              options={MONTH_LABELS.map((label, index) => ({
                value: String(index + 1),
                label,
              }))}
              onChange={(value) => set({ periodMonth: Number(value) })}
            />
          )}

          {form.periodType === BUDGET_PERIOD_TYPES.quarterly && (
            <PurchaseSelectField
              label="Chorak"
              value={String(form.periodQuarter)}
              options={Object.entries(QUARTER_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
              onChange={(value) => set({ periodQuarter: Number(value) })}
            />
          )}
        </div>

        <div className="budget-form__grid">
          <PurchaseSelectField
            label="Valyuta"
            value={form.currency}
            options={PURCHASE_CURRENCIES.map((currency) => ({
              value: currency.code,
              label: currency.label,
            }))}
            onChange={(value) => set({ currency: value })}
          />

          <PurchaseTextField
            label="Ajratilgan byudjet"
            type="number"
            min="0"
            step="1000"
            value={form.allocated}
            onChange={(event) => set({ allocated: event.target.value })}
          />

          <PurchaseSelectField
            label="Nazorat rejimi"
            value={form.hardLimit ? "hard" : "soft"}
            options={Object.entries(BUDGET_ENFORCEMENT_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
            onChange={(value) => set({ hardLimit: value === "hard" })}
          />
        </div>

        <div className="budget-form__thresholds">
          <span>Ogohlantirish chegaralari (%)</span>
          <div className="budget-form__thresholds-grid">
            {form.thresholds.map((value, index) => (
              <input
                key={index}
                type="number"
                min="1"
                max="99"
                value={value}
                onChange={(event) => {
                  const next = [...form.thresholds];

                  next[index] = Number(event.target.value) || 0;
                  set({ thresholds: next });
                }}
              />
            ))}
            <span className="budget-form__thresholds-fixed">100% (avtomatik)</span>
          </div>
        </div>

        <label className="budget-form__active">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event) => set({ active: event.target.checked })}
          />
          <span>Byudjet faol (nazoratga qatnashadi)</span>
        </label>

        <PurchaseTextarea
          label="Izoh (ixtiyoriy)"
          rows={2}
          value={form.notes}
          onChange={(event) => set({ notes: event.target.value })}
        />

        {warnings.map((warning) => (
          <PurchaseAlert tone="warning" key={warning}>
            {warning}
          </PurchaseAlert>
        ))}

        {errors.length > 0 && (
          <ul className="budget-form__errors">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}
      </div>
    </PurchaseModal>
  );
};

export default BudgetFormModal;
