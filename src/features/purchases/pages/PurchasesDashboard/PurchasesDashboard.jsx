// PDF 1: Purchase Dashboard — KPI, grafik, kutilayotgan yetkazish,
// top supplierlar, to'lov ogohlantirishlari, AI tavsiya.

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ClipboardList,
  PackageCheck,
  PackageSearch,
  Plus,
  Sparkles,
  Truck,
  Wallet,
} from "lucide-react";

import PurchaseStatusBadge from "../../components/PurchaseStatusBadge/PurchaseStatusBadge";

import PageHeader from "../../../../components/layout/PageHeader/PageHeader";
import BudgetStatusBadge from "../../components/BudgetStatusBadge/BudgetStatusBadge";
import PurchaseKpiCard from "../../components/PurchaseKpiCard/PurchaseKpiCard";
import PurchaseProgressBar from "../../components/PurchaseProgressBar/PurchaseProgressBar";
import BudgetManagerModal from "../../modals/BudgetManagerModal/BudgetManagerModal";
import AIWorkspace from "../../ai/components/AIWorkspace/AIWorkspace";
import usePurchaseDashboard from "../../hooks/usePurchaseDashboard";
import usePurchasesStore from "../../hooks/usePurchasesStore";
import {
  computeBudgetConsumption,
  getBudgetPeriodLabel,
  resolveBudgetStatus,
} from "../../utils/budgetCalculations";
import { BUDGET_ENFORCEMENT, BUDGET_STATUSES } from "../../constants/budgets";
import {
  formatCompactMoney,
  formatMoney,
  formatPurchaseDate,
} from "../../utils/purchaseMoney";

import "./PurchasesDashboard.scss";

const PurchasesDashboard = () => {
  const navigate = useNavigate();
  const {
    orders,
    invoices,
    budgets,
    products,
    suppliers,
    getSupplier,
    actions,
  } = usePurchasesStore();
  const dashboard = usePurchaseDashboard({ orders, invoices, getSupplier });
  const [budgetManagerOpen, setBudgetManagerOpen] = useState(false);

  // PDF 58-59 (Enterprise Budget Control): faol byudjetlarning joriy holati —
  // eng yuqori foizdan pastga saralanadi, chegaraga yaqin/oshganlar tepada
  // ko'rinadi.
  const budgetOverview = useMemo(
    () =>
      budgets
        .filter((budget) => budget.active)
        .map((budget) => {
          const consumption = computeBudgetConsumption(budget, orders, { products });
          const status = resolveBudgetStatus(
            consumption.utilizationPercent,
            budget.hardLimit ? BUDGET_ENFORCEMENT.hard : BUDGET_ENFORCEMENT.soft,
          );

          return { budget, consumption, status };
        })
        .sort((a, b) => b.consumption.utilizationPercent - a.consumption.utilizationPercent),
    [budgets, orders, products],
  );

  const budgetsAtRisk = budgetOverview.filter((entry) =>
    [BUDGET_STATUSES.warning, BUDGET_STATUSES.exceeded, BUDGET_STATUSES.blocked].includes(
      entry.status,
    ),
  ).length;

  const maxMonthly = Math.max(
    ...dashboard.monthlySeries.map((entry) => entry.total),
    1,
  );
  const maxStatusCount = Math.max(
    ...dashboard.statusOverview.map((entry) => entry.count),
    1,
  );

  return (
    <div className="purchases-dashboard">
      <PageHeader
        eyebrow="Xaridlar"
        title="Xaridlar boshqaruv markazi"
        description="Bugungi buyurtmalar, kutilayotgan yetkazishlar, qarzdorlik va AI tavsiyalari bir ko'rinishda."
        actions={
          <button
            className="purchase-btn purchase-btn--primary"
            type="button"
            onClick={() => navigate("/purchases/orders/new")}
          >
            <Plus size={16} />
            Yangi buyurtma
          </button>
        }
      />

      <section className="purchases-dashboard__kpi">
        <PurchaseKpiCard
          icon={Wallet}
          label="Bu oygi xarid"
          value={formatMoney(dashboard.kpi.monthTotal)}
          hint="UZS ekvivalentida · draftlar hisobga olinmaydi"
        />
        <PurchaseKpiCard
          icon={ClipboardList}
          label="Ochiq PO"
          value={`${dashboard.kpi.openCount} ta`}
          hint="Tasdiq, yuborilgan va qisman kelganlar"
        />
        <PurchaseKpiCard
          icon={Truck}
          label="Kutilayotgan yetkazish"
          value={`${dashboard.kpi.incomingCount} ta`}
          tone="warning"
          hint="Yaqin kunlarda keladi"
        />
        <PurchaseKpiCard
          icon={AlertTriangle}
          label="Qarzdorlik"
          value={formatMoney(dashboard.kpi.outstanding)}
          tone="danger"
          hint="To'lanmagan invoyslar qoldig'i"
        />
      </section>

      <section className="purchases-dashboard__grid">

        <article className="purchases-dashboard__panel purchases-dashboard__panel--chart">
          <h3>
            <Wallet size={16} />
            Oxirgi 6 oy — xarid dinamikasi
          </h3>

          <div className="purchases-dashboard__chart">
            {dashboard.monthlySeries.map((entry) => (
              <div className="purchases-dashboard__bar-wrap" key={entry.label}>
                <span className="purchases-dashboard__bar-value">
                  {formatCompactMoney(entry.total)}
                </span>
                <span
                  className="purchases-dashboard__bar"
                  style={{ height: `${Math.max((entry.total / maxMonthly) * 100, entry.total > 0 ? 4 : 0)}%` }}
                />
                <span className="purchases-dashboard__bar-label">{entry.label}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="purchases-dashboard__panel purchases-dashboard__panel--today">
          <h3>
            <PackageCheck size={16} />
            Bugun keladiganlar
          </h3>

          {dashboard.todayArrivals.length === 0 && (
            <p className="purchases-dashboard__empty">
              Bugunga rejalashtirilgan yetkazish yo'q.
            </p>
          )}

          <ul className="purchases-dashboard__list">
            {dashboard.todayArrivals.map((order) => (
              <li
                key={order.id}
                onClick={() => navigate(`/purchases/orders/${order.id}`)}
              >
                <div>
                  <strong>{order.number}</strong>
                  <small>{getSupplier(order.supplierId)?.name}</small>
                </div>
                <span
                  className={
                    order.isLate
                      ? "purchases-dashboard__due purchases-dashboard__due--late"
                      : "purchases-dashboard__due"
                  }
                >
                  {order.isLate ? "Kechikdi!" : "Bugun keladi"}
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="purchases-dashboard__panel">
          <h3>
            <ClipboardList size={16} />
            Holatlar taqsimoti
          </h3>

          <div className="purchases-dashboard__statuses">
            {dashboard.statusOverview.map((entry) => (
              <div
                className="purchases-dashboard__status-row"
                key={entry.status}
              >
                <PurchaseStatusBadge status={entry.status} />
                <PurchaseProgressBar
                  value={entry.count}
                  max={maxStatusCount}
                  tone={entry.tone}
                  minPercent={8}
                />
                <span className="purchases-dashboard__status-count">
                  {entry.count}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="purchases-dashboard__panel">
          <h3>
            <Truck size={16} />
            Kutilayotgan yetkazishlar
          </h3>

          {dashboard.incomingOrders.length === 0 && (
            <p className="purchases-dashboard__empty">
              Kutilayotgan yetkazish yo'q.
            </p>
          )}

          <ul className="purchases-dashboard__list">
            {dashboard.incomingOrders.map((order) => (
              <li
                key={order.id}
                onClick={() => navigate(`/purchases/orders/${order.id}`)}
              >
                <div>
                  <strong>{order.number}</strong>
                  <small>{getSupplier(order.supplierId)?.name}</small>
                </div>
                <span
                  className={
                    order.isLate
                      ? "purchases-dashboard__due purchases-dashboard__due--late"
                      : "purchases-dashboard__due"
                  }
                >
                  {order.isLate
                    ? "Kechikdi!"
                    : order.isToday
                      ? "Bugun"
                      : formatPurchaseDate(order.expectedDate)}
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="purchases-dashboard__panel">
          <h3>
            <PackageSearch size={16} />
            Top yetkazib beruvchilar
          </h3>

          <ul className="purchases-dashboard__list">
            {dashboard.topSuppliers.map((entry) => (
              <li key={entry.supplier.id}>
                <div>
                  <strong>{entry.supplier.name}</strong>
                  <small>Score: {entry.supplier.score}/100</small>
                </div>
                <span className="purchases-dashboard__amount">
                  {formatCompactMoney(entry.total)}
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="purchases-dashboard__panel">
          <h3>
            <Wallet size={16} />
            To'lov ogohlantirishlari
          </h3>

          {dashboard.paymentAlerts.length === 0 && (
            <p className="purchases-dashboard__empty">
              Yaqin muddatli to'lov yo'q.
            </p>
          )}

          <ul className="purchases-dashboard__list">
            {dashboard.paymentAlerts.map((invoice) => (
              <li key={invoice.id} onClick={() => navigate("/purchases/invoices")}>
                <div>
                  <strong>{invoice.number}</strong>
                  <small>{getSupplier(invoice.supplierId)?.name}</small>
                </div>
                <span
                  className={
                    invoice.dueInDays < 0
                      ? "purchases-dashboard__due purchases-dashboard__due--late"
                      : "purchases-dashboard__due"
                  }
                >
                  {invoice.dueInDays < 0
                    ? `${Math.abs(invoice.dueInDays)} kun o'tdi`
                    : `${invoice.dueInDays} kun qoldi`}{" "}
                  · {formatCompactMoney(invoice.remaining)}
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="purchases-dashboard__panel purchases-dashboard__panel--ai">
          <h3>
            <Sparkles size={16} />
            AI tavsiya — zaxira tugayapti
          </h3>

          {dashboard.reorderSuggestions.length === 0 && (
            <p className="purchases-dashboard__empty">
              Barcha tovarlar yetarli darajada.
            </p>
          )}

          <ul className="purchases-dashboard__list">
            {dashboard.reorderSuggestions.map((product) => (
              <li
                key={product.id}
                onClick={() => navigate("/purchases/orders/new")}
              >
                <div>
                  <strong>{product.name}</strong>
                  <small>
                    Qoldiq: {product.stock} / min {product.reorderPoint}
                  </small>
                </div>
                <span className="purchases-dashboard__cta">
                  {product.suggestedQty} dona buyurtma
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="purchases-dashboard__panel purchases-dashboard__panel--budget">
          <h3>
            <Wallet size={16} />
            Byudjet nazorati
            {budgetsAtRisk > 0 && (
              <span className="purchases-dashboard__budget-risk">
                {budgetsAtRisk} chegaraga yaqin/oshgan
              </span>
            )}
          </h3>

          {budgetOverview.length === 0 && (
            <p className="purchases-dashboard__empty">Faol byudjet mavjud emas.</p>
          )}

          <ul className="purchases-dashboard__list">
            {budgetOverview.slice(0, 4).map(({ budget, consumption, status }) => (
              <li key={budget.id} onClick={() => setBudgetManagerOpen(true)}>
                <div>
                  <strong>{budget.name}</strong>
                  <small>
                    {getBudgetPeriodLabel(budget)} ·{" "}
                    {formatCompactMoney(consumption.consumed)} /{" "}
                    {formatCompactMoney(consumption.allocated)} (
                    {Math.round(consumption.utilizationPercent)}%)
                  </small>
                </div>
                <BudgetStatusBadge status={status} />
              </li>
            ))}
          </ul>

          <button
            className="purchase-btn purchase-btn--ghost purchases-dashboard__budget-manage"
            type="button"
            onClick={() => setBudgetManagerOpen(true)}
          >
            <Wallet size={14} />
            Byudjetlarni boshqarish
          </button>
        </article>
      </section>

      <section className="purchases-dashboard__panel purchases-dashboard__panel--ai-workspace">
        <AIWorkspace
          title="AI ishchi maydoni"
          description="Xarid, byudjet, yetkazib beruvchi va invoys ma'lumotlaridan avtomatik hisoblangan tavsiya, ogohlantirish, bashorat va imkoniyatlar — barchasi bitta joyda."
        />
      </section>

      <BudgetManagerModal
        open={budgetManagerOpen}
        onClose={() => setBudgetManagerOpen(false)}
        budgets={budgets}
        orders={orders}
        products={products}
        suppliers={suppliers}
        getSupplier={getSupplier}
        actions={actions}
      />
    </div>
  );
};

export default PurchasesDashboard;
