// Enterprise Reports & Analytics (PDF 73-80): Xaridlar bo'yicha to'liq
// hisobot va tahlil markazi. Mavjud hisoblash formulalari (purchaseCalculations,
// budgetCalculations) va komponentlar (PurchaseKpiCard,
// PurchaseStatusBadge, PurchaseTabs) qayta ishlatiladi — yangi dizayn
// yaratilmaydi, faqat mavjud Liquid Glass tizimi kengaytiriladi.

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  Building2,
  ClipboardCheck,
  Coins,
  CreditCard,
  Gauge,
  Layers,
  LineChart,
  PackageCheck,
  Percent,
  PieChart,
  Receipt,
  ShieldCheck,
  Star,
  Tags,
  Timer,
  TrendingDown,
  TrendingUp,
  Truck,
  Undo2,
  Users,
  Wallet,
} from "lucide-react";

import PageHeader from "../../../../components/layout/PageHeader/PageHeader";
import PurchaseKpiCard from "../../components/PurchaseKpiCard/PurchaseKpiCard";
import PurchaseSelectField from "../../components/PurchaseSelectField/PurchaseSelectField";
import PurchaseStatusBadge from "../../components/PurchaseStatusBadge/PurchaseStatusBadge";
import PurchaseTabs from "../../components/PurchaseTabs/PurchaseTabs";
import BudgetStatusBadge from "../../components/BudgetStatusBadge/BudgetStatusBadge";
import ReportBarChart from "../../components/ReportBarChart/ReportBarChart";
import ReportDataTable from "../../components/ReportDataTable/ReportDataTable";
import ReportExportMenu from "../../components/ReportExportMenu/ReportExportMenu";
import ReportFilterBar from "../../components/ReportFilterBar/ReportFilterBar";

import usePurchaseReports from "../../hooks/usePurchaseReports";
import { PERIOD_TYPES, getOrderBaseTotal } from "../../utils/reportCalculations";
import { PURCHASE_STATUS_LABELS } from "../../constants/purchaseStatuses";
import { getDepartmentLabel } from "../../constants/departments";
import {
  INVOICE_STATUS_LABELS,
  PAYMENT_METHODS,
  RETURN_REASONS,
  RETURN_STATUS_LABELS,
} from "../../constants/paymentTerms";
import { AGING_LABELS } from "../../utils/purchaseCalculations";
import {
  getDamageTypeLabel,
  getInspectionActionLabel,
  getSeverityLabel,
  INSPECTION_STATUS_LABELS,
} from "../../constants/qualityInspection";
import {
  formatCompactMoney,
  formatMoney,
  formatPurchaseDate,
} from "../../utils/purchaseMoney";

import "./PurchaseReports.scss";

const RETURN_REASON_LABELS = Object.fromEntries(
  RETURN_REASONS.map((entry) => [entry.id, entry.label]),
);
const PAYMENT_METHOD_LABELS = Object.fromEntries(
  PAYMENT_METHODS.map((entry) => [entry.id, entry.label]),
);

const PERIOD_TOGGLE_OPTIONS = [
  { id: PERIOD_TYPES.monthly, label: "Oylik" },
  { id: PERIOD_TYPES.quarterly, label: "Choraklik" },
  { id: PERIOD_TYPES.annual, label: "Yillik" },
];

const REPORT_TABS = [
  { id: "overview", label: "Boshqaruv", icon: Gauge },
  { id: "purchases", label: "Xaridlar", icon: BarChart3 },
  { id: "suppliers", label: "Yetkazib beruvchilar", icon: Users },
  { id: "financial", label: "Moliya", icon: Wallet },
  { id: "quality", label: "Sifat va qaytarish", icon: ShieldCheck },
  { id: "price", label: "Narx tahlili", icon: LineChart },
];

const growthTone = (value) => (value >= 0 ? "success" : "danger");
const GrowthIcon = ({ value }) =>
  value >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />;

const PurchaseReports = () => {
  const navigate = useNavigate();
  const reports = usePurchaseReports();
  const {
    filters,
    setFilter,
    resetFilters,
    activeFilterCount,
    filterOptions,
    periodType,
    setPeriodType,
    filteredOrders,
    products,
    getSupplier,
    summary,
    trend,
    periodComparison,
    supplierPerformance,
    supplierRating,
    categorySpending,
    departmentSpending,
    projectSpending,
    invoiceAnalysis,
    paymentAnalysis,
    returnAnalysis,
    qualityAnalysis,
    receivingAnalysis,
    leadTimeAnalysis,
    costTrend,
    costBreakdown,
    topProducts,
    topSuppliers,
    budgetPerformance,
    executiveKpis,
    getProductPriceTrend,
  } = reports;

  const [activeTab, setActiveTab] = useState("overview");
  const [priceProductId, setPriceProductId] = useState(products[0]?.id || "");

  const priceTrend = useMemo(
    () => (priceProductId ? getProductPriceTrend(priceProductId) : []),
    [priceProductId, getProductPriceTrend],
  );

  const exportPayload = () => ({
    title: "Xaridlar hisobot eksporti",
    subtitle: `${filteredOrders.length} ta buyurtma · joriy filtr bo'yicha`,
    filename: `xaridlar-hisobot-${new Date().toISOString().slice(0, 10)}`,
    summary: [
      { label: "Jami summa", value: formatMoney(summary.totalSpend) },
      { label: "Buyurtmalar", value: summary.totalOrders },
      { label: "O'rtacha qiymat", value: formatMoney(summary.avgOrderValue) },
    ],
    columns: [
      { key: "number", label: "PO", value: (row) => row.number },
      { key: "supplier", label: "Yetkazib beruvchi", value: (row) => getSupplier(row.supplierId)?.name || "" },
      { key: "date", label: "Sana", value: (row) => formatPurchaseDate(row.createdAt) },
      { key: "status", label: "Holat", value: (row) => PURCHASE_STATUS_LABELS[row.status] || row.status },
      { key: "department", label: "Bo'lim", value: (row) => getDepartmentLabel(row.department) },
      { key: "project", label: "Loyiha", value: (row) => row.project || "" },
      { key: "currency", label: "Valyuta", value: (row) => row.currency || "UZS" },
      { key: "total", label: "Jami (UZS)", value: (row) => getOrderBaseTotal(row) },
    ],
    rows: filteredOrders,
  });

  return (
    <div className="purchase-reports">
      <PageHeader
        eyebrow="Xaridlar"
        title="Hisobotlar va tahlillar"
        description="Xarid faoliyatining to'liq tasviri — hisobotlar, tahlillar va eksport bir joyda."
        actions={<ReportExportMenu getExportPayload={exportPayload} />}
      />

      <ReportFilterBar
        filters={filters}
        setFilter={setFilter}
        resetFilters={resetFilters}
        options={filterOptions}
        activeFilterCount={activeFilterCount}
      />

      <PurchaseTabs tabs={REPORT_TABS} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "overview" && (
        <div className="purchase-reports__section">
          <section className="purchase-reports__kpi">
            <PurchaseKpiCard
              icon={Wallet}
              label="Jami xarid"
              value={formatMoney(executiveKpis.totalSpend)}
              hint={
                <span className={`purchase-reports__growth purchase-reports__growth--${growthTone(executiveKpis.growthPercent)}`}>
                  <GrowthIcon value={executiveKpis.growthPercent} />
                  {Math.abs(Math.round(executiveKpis.growthPercent))}% oldingi davrga nisbatan
                </span>
              }
            />
            <PurchaseKpiCard
              icon={Receipt}
              label="O'rtacha buyurtma qiymati"
              value={formatMoney(executiveKpis.avgOrderValue)}
              hint="Faol (draft/cancel'siz) buyurtmalar bo'yicha"
            />
            <PurchaseKpiCard
              icon={Star}
              label="O'rtacha yetkazib beruvchi bali"
              value={`${executiveKpis.avgSupplierScore}/100`}
              hint="Joriy filtrdagi supplierlar"
            />
            <PurchaseKpiCard
              icon={Timer}
              label="O'rtacha yetkazish muddati"
              value={executiveKpis.avgLeadTimeDays === null ? "—" : `${executiveKpis.avgLeadTimeDays} kun`}
              hint="Buyurtmadan birinchi qabulgacha"
            />
            <PurchaseKpiCard
              icon={Gauge}
              label="Byudjet band qilinishi"
              value={executiveKpis.budgetUtilizationPercent === null ? "—" : `${executiveKpis.budgetUtilizationPercent}%`}
              tone={executiveKpis.budgetUtilizationPercent >= 90 ? "danger" : "default"}
              hint="Faol byudjetlar o'rtacha"
            />
            <PurchaseKpiCard
              icon={Undo2}
              label="Qaytarish darajasi"
              value={`${executiveKpis.returnRate}%`}
              tone={executiveKpis.returnRate > 5 ? "warning" : "default"}
              hint="Qabul qilingan summaga nisbatan"
            />
            <PurchaseKpiCard
              icon={AlertTriangle}
              label="Buzuq tovar darajasi"
              value={`${executiveKpis.damageRate}%`}
              tone={executiveKpis.damageRate > 5 ? "danger" : "default"}
              hint="Qabul qilingan miqdorga nisbatan"
            />
            <PurchaseKpiCard
              icon={Truck}
              label="O'z vaqtida qabul"
              value={executiveKpis.onTimeReceivingPercent === null ? "—" : `${executiveKpis.onTimeReceivingPercent}%`}
              hint="Rejalashtirilgan sanaga nisbatan"
            />
          </section>

          <section className="purchase-reports__panel purchase-reports__panel--wide">
            <div className="purchase-reports__panel-head">
              <h3>
                <LineChart size={16} />
                Xarid dinamikasi
              </h3>
              <div className="purchase-reports__period-toggle">
                {PERIOD_TOGGLE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={periodType === option.id ? "is-active" : ""}
                    onClick={() => setPeriodType(option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <ReportBarChart
              data={trend.series.map((entry) => ({ key: entry.key, label: entry.label, value: entry.total }))}
              valueFormatter={formatCompactMoney}
            />
          </section>

          <section className="purchase-reports__panel">
            <h3>
              <Percent size={16} />
              Davriy taqqoslash (Comparison)
            </h3>

            <div className="purchase-reports__comparison">
              <div>
                <span>Oldingi davr — {periodComparison.previous.label}</span>
                <strong>{formatCompactMoney(periodComparison.previous.total)}</strong>
                <small>{periodComparison.previous.count} ta buyurtma</small>
              </div>
              <div>
                <span>Joriy davr — {periodComparison.current.label}</span>
                <strong>{formatCompactMoney(periodComparison.current.total)}</strong>
                <small>{periodComparison.current.count} ta buyurtma</small>
              </div>
              <div>
                <span>O'sish (summa)</span>
                <strong className={`purchase-reports__growth purchase-reports__growth--${growthTone(periodComparison.spendGrowthPercent)}`}>
                  <GrowthIcon value={periodComparison.spendGrowthPercent} />
                  {Math.abs(Math.round(periodComparison.spendGrowthPercent))}%
                </strong>
              </div>
              <div>
                <span>O'sish (buyurtma soni)</span>
                <strong className={`purchase-reports__growth purchase-reports__growth--${growthTone(periodComparison.orderGrowthPercent)}`}>
                  <GrowthIcon value={periodComparison.orderGrowthPercent} />
                  {Math.abs(Math.round(periodComparison.orderGrowthPercent))}%
                </strong>
              </div>
            </div>
          </section>
        </div>
      )}

      {activeTab === "purchases" && (
        <div className="purchase-reports__section">
          <section className="purchase-reports__kpi">
            <PurchaseKpiCard icon={Receipt} label="Jami buyurtma" value={`${summary.totalOrders} ta`} />
            <PurchaseKpiCard icon={PackageCheck} label="Faol buyurtma" value={`${summary.activeOrders} ta`} />
            <PurchaseKpiCard icon={Users} label="Yetkazib beruvchilar" value={`${summary.supplierCount} ta`} />
            <PurchaseKpiCard icon={Boxes} label="Jami tovar qatori" value={`${summary.totalItems} ta`} />
          </section>

          <section className="purchase-reports__panel">
            <h3>
              <PieChart size={16} />
              Holatlar taqsimoti (Purchase Summary)
            </h3>

            <div className="purchase-reports__statuses">
              {summary.byStatus.map((entry) => (
                <div className="purchase-reports__status-row" key={entry.status}>
                  <PurchaseStatusBadge status={entry.status} />
                  <span>{entry.count} ta</span>
                </div>
              ))}
            </div>
          </section>

          <div className="purchase-reports__grid-2">
            <section className="purchase-reports__panel">
              <h3>
                <Tags size={16} />
                Kategoriya bo'yicha sarf
              </h3>
              <ReportBarChart
                data={categorySpending.slice(0, 8).map((entry) => ({
                  key: entry.category,
                  label: entry.category,
                  value: entry.total,
                }))}
                valueFormatter={formatCompactMoney}
                onBarClick={(entry) => setFilter("category", entry.key)}
              />
            </section>

            <section className="purchase-reports__panel">
              <h3>
                <Building2 size={16} />
                Bo'lim bo'yicha sarf
              </h3>
              <ReportBarChart
                data={departmentSpending.map((entry) => ({ key: entry.key, label: entry.label, value: entry.total }))}
                valueFormatter={formatCompactMoney}
                onBarClick={(entry) => entry.key !== "—" && setFilter("department", entry.key)}
                tone="success"
              />
            </section>
          </div>

          <section className="purchase-reports__panel">
            <h3>
              <Layers size={16} />
              Loyiha bo'yicha sarf
            </h3>
            <ReportBarChart
              data={projectSpending.map((entry) => ({ key: entry.key, label: entry.label, value: entry.total }))}
              valueFormatter={formatCompactMoney}
              tone="warning"
            />
          </section>

          <section className="purchase-reports__panel">
            <h3>
              <Star size={16} />
              Eng ko'p xarid qilingan tovarlar (Top Products)
            </h3>
            <ReportDataTable
              columns={[
                { key: "name", label: "Tovar", render: (row) => (
                  <div className="purchase-reports__cell-primary">
                    <strong>{row.name}</strong>
                    <small>{row.sku}</small>
                  </div>
                ) },
                { key: "category", label: "Kategoriya" },
                { key: "orderCount", label: "Buyurtma soni", align: "right" },
                { key: "totalQty", label: "Miqdor", align: "right", render: (row) => Math.round(row.totalQty) },
                { key: "totalSpend", label: "Sarf", align: "right", render: (row) => formatMoney(row.totalSpend) },
              ]}
              rows={topProducts}
            />
          </section>
        </div>
      )}

      {activeTab === "suppliers" && (
        <div className="purchase-reports__section">
          <section className="purchase-reports__panel">
            <h3>
              <Star size={16} />
              Top yetkazib beruvchilar
            </h3>
            <ul className="purchase-reports__leaderboard">
              {topSuppliers.slice(0, 5).map((entry, index) => (
                <li key={entry.supplierId} onClick={() => navigate(`/suppliers/${entry.supplierId}`)}>
                  <span className="purchase-reports__rank">{index + 1}</span>
                  <div>
                    <strong>{entry.supplier?.name || entry.supplierId}</strong>
                    <small>{entry.orderCount} ta buyurtma · {entry.onTimePercent === null ? "—" : `${entry.onTimePercent}% o'z vaqtida`}</small>
                  </div>
                  <span className="purchase-reports__amount">{formatCompactMoney(entry.totalSpend)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="purchase-reports__panel">
            <h3>
              <Gauge size={16} />
              Yetkazib beruvchi samaradorligi (Performance)
            </h3>
            <ReportDataTable
              onRowClick={(row) => navigate(`/suppliers/${row.supplierId}`)}
              columns={[
                { key: "name", label: "Yetkazib beruvchi", render: (row) => row.supplier?.name || row.supplierId },
                { key: "orderCount", label: "Buyurtma", align: "right" },
                { key: "totalSpend", label: "Sarf", align: "right", render: (row) => formatCompactMoney(row.totalSpend) },
                { key: "onTimePercent", label: "O'z vaqtida %", align: "right", render: (row) => (row.onTimePercent === null ? "—" : `${row.onTimePercent}%`) },
                { key: "avgLeadTimeDays", label: "O'rtacha muddat", align: "right", render: (row) => (row.avgLeadTimeDays === null ? "—" : `${row.avgLeadTimeDays} kun`) },
                { key: "damageRate", label: "Buzuq %", align: "right", render: (row) => `${row.damageRate}%` },
                { key: "returnCount", label: "Qaytarish", align: "right" },
              ]}
              rows={supplierPerformance}
            />
          </section>

          <section className="purchase-reports__panel">
            <h3>
              <ShieldCheck size={16} />
              Yetkazib beruvchi reytingi (Composite Rating)
            </h3>
            <ReportDataTable
              onRowClick={(row) => navigate(`/suppliers/${row.supplierId}`)}
              columns={[
                { key: "rank", label: "#", render: (row) => row.rankIndex },
                { key: "name", label: "Yetkazib beruvchi", render: (row) => row.supplier?.name || row.supplierId },
                { key: "compositeRating", label: "Reyting", align: "right", render: (row) => `${row.compositeRating}/100` },
                { key: "score", label: "Statik ball", align: "right", render: (row) => `${row.supplier?.score ?? "—"}/100` },
                { key: "onTimePercent", label: "O'z vaqtida %", align: "right", render: (row) => (row.onTimePercent === null ? "—" : `${row.onTimePercent}%`) },
              ]}
              rows={supplierRating.map((row, index) => ({ ...row, id: row.supplierId, rankIndex: index + 1 }))}
            />
          </section>

          <section className="purchase-reports__panel">
            <h3>
              <Timer size={16} />
              Yetkazish muddati tahlili (Lead Time)
            </h3>
            <ReportBarChart
              data={leadTimeAnalysis.bySupplier.slice(0, 8).map((entry) => ({
                key: entry.supplierId,
                label: entry.name,
                value: entry.avgLeadTimeDays,
              }))}
              valueFormatter={(value) => `${value} kun`}
            />
          </section>
        </div>
      )}

      {activeTab === "financial" && (
        <div className="purchase-reports__section">
          <section className="purchase-reports__kpi">
            <PurchaseKpiCard icon={Receipt} label="Jami invoys" value={formatMoney(invoiceAnalysis.totalInvoiced)} />
            <PurchaseKpiCard icon={ShieldCheck} label="Moslik darajasi" value={`${invoiceAnalysis.matchRate}%`} />
            <PurchaseKpiCard icon={AlertTriangle} label="Nomuvofiq invoys" value={`${invoiceAnalysis.mismatchedCount} ta`} tone={invoiceAnalysis.mismatchedCount > 0 ? "warning" : "default"} />
            <PurchaseKpiCard icon={Wallet} label="Qoldiq qarzdorlik" value={formatMoney(paymentAnalysis.totalOutstanding)} tone="danger" />
          </section>

          <div className="purchase-reports__grid-2">
            <section className="purchase-reports__panel">
              <h3>
                <Receipt size={16} />
                Invoys tahlili (holat bo'yicha)
              </h3>
              <ReportDataTable
                columns={[
                  { key: "status", label: "Holat", render: (row) => INVOICE_STATUS_LABELS[row.status] || row.status },
                  { key: "count", label: "Soni", align: "right" },
                  { key: "amount", label: "Summasi", align: "right", render: (row) => formatCompactMoney(row.amount) },
                ]}
                rows={invoiceAnalysis.byStatus}
              />
            </section>

            <section className="purchase-reports__panel">
              <h3>
                <CreditCard size={16} />
                To'lov usullari (Payment Analysis)
              </h3>
              <ReportDataTable
                columns={[
                  { key: "method", label: "Usul", render: (row) => PAYMENT_METHOD_LABELS[row.method] || row.method },
                  { key: "amount", label: "Summasi", align: "right", render: (row) => formatCompactMoney(row.amount) },
                ]}
                rows={paymentAnalysis.byMethod}
                emptyText="To'lov qayd etilmagan."
              />
            </section>
          </div>

          <section className="purchase-reports__panel">
            <h3>
              <Coins size={16} />
              Qarzdorlik yoshi (Aging)
            </h3>
            <ReportBarChart
              data={paymentAnalysis.agingBuckets.map((entry) => ({
                key: entry.bucket,
                label: AGING_LABELS[entry.bucket],
                value: entry.amount,
              }))}
              valueFormatter={formatCompactMoney}
              tone="danger"
            />
          </section>

          <section className="purchase-reports__panel">
            <h3>
              <Gauge size={16} />
              Byudjet ishlashi (Budget Performance)
            </h3>
            {budgetPerformance.length === 0 ? (
              <p className="purchase-reports__empty">Faol byudjet mavjud emas.</p>
            ) : (
              <div className="purchase-reports__budget-list">
                {budgetPerformance.map((entry) => (
                  <div className="purchase-reports__budget-row" key={entry.budget.id}>
                    <div className="purchase-reports__budget-info">
                      <strong>{entry.budget.name}</strong>
                      <small>{entry.scopeLabel} · {entry.periodLabel}</small>
                    </div>
                    <span className="purchase-reports__budget-percent">
                      {Math.round(entry.consumption.utilizationPercent)}%
                    </span>
                    <BudgetStatusBadge status={entry.status} />
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="purchase-reports__panel">
            <h3>
              <TrendingUp size={16} />
              Xarajat dinamikasi (Cost Trend)
            </h3>
            <ReportBarChart
              data={costTrend.map((entry) => ({
                key: entry.key,
                label: entry.label,
                value: entry.productCost + entry.tax + entry.landedCost,
              }))}
              valueFormatter={formatCompactMoney}
            />
            <div className="purchase-reports__breakdown">
              <span>Mahsulot narxi: <strong>{formatCompactMoney(costBreakdown.productCost)}</strong></span>
              <span>Soliq: <strong>{formatCompactMoney(costBreakdown.tax)}</strong></span>
              <span>Landed cost: <strong>{formatCompactMoney(costBreakdown.landedCost)}</strong></span>
              <span>Chegirma: <strong>-{formatCompactMoney(costBreakdown.discount)}</strong></span>
            </div>
          </section>
        </div>
      )}

      {activeTab === "quality" && (
        <div className="purchase-reports__section">
          <section className="purchase-reports__kpi">
            <PurchaseKpiCard icon={Undo2} label="Qaytarishlar" value={`${returnAnalysis.totalReturns} ta`} />
            <PurchaseKpiCard icon={Wallet} label="Qaytarish yo'qotishi" value={formatMoney(returnAnalysis.totalLoss)} tone="danger" />
            <PurchaseKpiCard icon={ClipboardCheck} label="Sifat tekshiruvlari" value={`${qualityAnalysis.totalInspections} ta`} />
            <PurchaseKpiCard icon={Truck} label="O'z vaqtida qabul" value={receivingAnalysis.onTimePercent === null ? "—" : `${receivingAnalysis.onTimePercent}%`} />
          </section>

          <div className="purchase-reports__grid-2">
            <section className="purchase-reports__panel">
              <h3>
                <Undo2 size={16} />
                Qaytarish sababi bo'yicha
              </h3>
              <ReportBarChart
                data={returnAnalysis.byReason.map((entry) => ({
                  key: entry.reason,
                  label: RETURN_REASON_LABELS[entry.reason] || entry.reason,
                  value: entry.count,
                }))}
                tone="danger"
              />
            </section>

            <section className="purchase-reports__panel">
              <h3>
                <PieChart size={16} />
                Qaytarish holati
              </h3>
              <ReportDataTable
                columns={[
                  { key: "status", label: "Holat", render: (row) => RETURN_STATUS_LABELS[row.status] || row.status },
                  { key: "count", label: "Soni", align: "right" },
                ]}
                rows={returnAnalysis.byStatus}
              />
            </section>
          </div>

          <div className="purchase-reports__grid-2">
            <section className="purchase-reports__panel">
              <h3>
                <ClipboardCheck size={16} />
                Sifat tekshiruvi — holat
              </h3>
              <ReportDataTable
                columns={[
                  { key: "status", label: "Holat", render: (row) => INSPECTION_STATUS_LABELS[row.status] || row.status },
                  { key: "count", label: "Soni", align: "right" },
                ]}
                rows={qualityAnalysis.byStatus}
              />
            </section>

            <section className="purchase-reports__panel">
              <h3>
                <AlertTriangle size={16} />
                Sifat tekshiruvi — jiddiylik
              </h3>
              <ReportDataTable
                columns={[
                  { key: "severity", label: "Jiddiylik", render: (row) => getSeverityLabel(row.severity) },
                  { key: "count", label: "Soni", align: "right" },
                ]}
                rows={qualityAnalysis.bySeverity}
              />
            </section>
          </div>

          <div className="purchase-reports__grid-2">
            <section className="purchase-reports__panel">
              <h3>
                <ShieldCheck size={16} />
                Sifat tekshiruvi — qilingan amal
              </h3>
              <ReportDataTable
                columns={[
                  { key: "action", label: "Amal", render: (row) => getInspectionActionLabel(row.action) },
                  { key: "count", label: "Soni", align: "right" },
                ]}
                rows={qualityAnalysis.byAction}
              />
            </section>

            <section className="purchase-reports__panel">
              <h3>
                <AlertTriangle size={16} />
                Sifat tekshiruvi — shikast turi
              </h3>
              <ReportDataTable
                columns={[
                  { key: "damageType", label: "Shikast turi", render: (row) => getDamageTypeLabel(row.damageType) },
                  { key: "count", label: "Soni", align: "right" },
                ]}
                rows={qualityAnalysis.byDamageType}
                emptyText="Shikast turi belgilanmagan."
              />
            </section>
          </div>

          <section className="purchase-reports__panel">
            <h3>
              <Gauge size={16} />
              Sifat tekshiruvi — qabul/rad nisbati
            </h3>
            <div className="purchase-reports__breakdown">
              <span>Buzuq miqdor: <strong>{qualityAnalysis.totalDamaged}</strong></span>
              <span>Qabul qilingan: <strong>{qualityAnalysis.totalAccepted}</strong></span>
              <span>Rad etilgan: <strong>{qualityAnalysis.totalRejected}</strong></span>
              <span>Qabul darajasi: <strong>{qualityAnalysis.acceptanceRate}%</strong></span>
            </div>
          </section>

          <section className="purchase-reports__panel">
            <h3>
              <PackageCheck size={16} />
              Qabul qilish tahlili (Receiving Analysis)
            </h3>
            <div className="purchase-reports__breakdown">
              <span>Jami qabul: <strong>{receivingAnalysis.totalReceipts} ta</strong></span>
              <span>To'liq: <strong>{receivingAnalysis.fullCount} ta</strong></span>
              <span>Qisman: <strong>{receivingAnalysis.partialCount} ta</strong></span>
              <span>O'rtacha kechikish: <strong>{receivingAnalysis.avgLagDays === null ? "—" : `${receivingAnalysis.avgLagDays} kun`}</strong></span>
            </div>
          </section>
        </div>
      )}

      {activeTab === "price" && (
        <div className="purchase-reports__section">
          <section className="purchase-reports__panel">
            <h3>
              <LineChart size={16} />
              Narx tendensiyasi (Price Trend)
            </h3>

            <PurchaseSelectField
              label="Tovar tanlang"
              value={priceProductId}
              options={products.map((product) => ({ value: product.id, label: `${product.name} (${product.sku})` }))}
              onChange={setPriceProductId}
            />

            <ReportDataTable
              columns={[
                { key: "date", label: "Sana", render: (row) => formatPurchaseDate(row.date) },
                { key: "orderNumber", label: "PO" },
                { key: "price", label: "Narx", align: "right", render: (row) => formatMoney(row.price) },
                {
                  key: "changePercent",
                  label: "O'zgarish",
                  align: "right",
                  render: (row) => (
                    <span className={`purchase-reports__growth purchase-reports__growth--${growthTone(row.changePercent)}`}>
                      {row.changePercent > 0 ? "+" : ""}
                      {row.changePercent}%
                    </span>
                  ),
                },
              ]}
              rows={priceTrend}
              emptyText="Bu tovar uchun xarid tarixi topilmadi."
            />
          </section>
        </div>
      )}
    </div>
  );
};

export default PurchaseReports;
