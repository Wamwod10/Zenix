import { AlertTriangle, Boxes, CircleDollarSign, Layers3, PackageCheck, TrendingUp } from "lucide-react";
import { useMemo } from "react";

import AIProductAssistant from "../../components/AIProductAssistant/AIProductAssistant";
import ProductKpiCard from "../../components/ProductKpiCard/ProductKpiCard";
import { formatMoney, labelProductStatus } from "../../utils/productCalculations";

const productCompleteness = (product) => {
  const checks = [
    product.name,
    product.sku,
    product.categoryId,
    product.brandId,
    product.unitId,
    product.description,
    product.barcodes?.length,
    product.media?.length,
    product.price > 0,
    product.integrations?.pos || product.integrations?.warehouse,
  ];

  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};

const ProductsDashboard = ({ metrics, products, aiInsights, onNavigate, onOpenProduct, onRunAiAction }) => {
  const topProducts = useMemo(
    () => [...products].sort((a, b) => b.sales30d - a.sales30d).slice(0, 5),
    [products],
  );
  const approvalProducts = useMemo(
    () => products.filter((item) => item.approvalStatus === "pending").slice(0, 4),
    [products],
  );
  const healthRows = useMemo(() => {
    const ratio = (count) => (products.length ? Math.round((count / products.length) * 100) : 0);
    const complete = products.length
      ? Math.round(products.reduce((sum, product) => sum + productCompleteness(product), 0) / products.length)
      : 0;

    return [
      ["Asosiy ma'lumotlar", complete],
      ["Savdoga tayyorlik", ratio(products.filter((product) => product.status === "active" && product.stock.available > 0).length)],
      ["Narx nazorati", ratio(products.filter((product) => product.price >= product.minPrice && product.approvalStatus !== "rejected").length)],
      ["Rasm qamrovi", ratio(products.filter((product) => product.media?.length).length)],
      ["Ombor mosligi", ratio(products.filter((product) => !["low", "out"].includes(product.stockStatus)).length)],
    ];
  }, [products]);

  return (
    <div className="products-view">
      <div className="products-kpi-grid">
        <ProductKpiCard icon={CircleDollarSign} label="Katalog qiymati" value={formatMoney(metrics.value)} meta="Qoldiq va tannarx asosida" tone="green" />
        <ProductKpiCard icon={PackageCheck} label="Faol mahsulotlar" value={metrics.active} meta={`${metrics.total} jami`} />
        <ProductKpiCard icon={TrendingUp} label="O'rtacha marja" value={`${Math.round(metrics.averageMargin)}%`} meta={`${metrics.sales} savdo / 30 kun`} tone="violet" />
        <ProductKpiCard icon={AlertTriangle} label="E'tibor kerak" value={metrics.low + metrics.pending} meta={`${metrics.pending} tasdiq`} tone="amber" />
      </div>

      {!products.length && (
        <section className="products-empty-state">
          <strong>Katalog hali bo'sh</strong>
          <span>Birinchi mahsulotni qo'shsangiz dashboard ko'rsatkichlari va tahlillar jonlanadi.</span>
          <button type="button" className="products-mini-button is-primary" onClick={() => onNavigate("new")}>
            Birinchi mahsulotni qo'shish
          </button>
        </section>
      )}

      <section className="products-dashboard-grid">
        <section className="products-panel">
          <div className="products-panel__head">
            <div>
              <span><Boxes size={13} /> Katalog salomatligi</span>
              <h2>Mahsulotlar bosh sahifasi</h2>
            </div>
            <button type="button" className="products-mini-button" onClick={() => onNavigate("list")}>Mahsulotlar ro'yxati</button>
          </div>
          <div className="products-health-grid">
            {healthRows.map(([label, value]) => (
              <article key={label}>
                <div><strong>{label}</strong><span>{value}%</span></div>
                <div className="products-progress" aria-label={`${label}: ${value}%`}>
                  <span style={{ width: `${value}%` }} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <AIProductAssistant insights={aiInsights} onRun={onRunAiAction} />
      </section>

      <section className="products-dashboard-grid">
        <section className="products-panel">
          <div className="products-panel__head">
            <div>
              <span><TrendingUp size={13} /> Yetakchi mahsulotlar</span>
              <h2>Savdo va talab signali</h2>
            </div>
          </div>
          <div className="products-list">
            {topProducts.map((product) => (
              <button type="button" key={product.id} onClick={() => onOpenProduct(product.id)}>
                <strong>{product.name}</strong>
                <span>{product.sku} · {product.sales30d} savdo · {Math.round(product.margin)}% marja</span>
              </button>
            ))}
          </div>
        </section>

        <section className="products-panel">
          <div className="products-panel__head">
            <div>
              <span><Layers3 size={13} /> Tasdiq</span>
              <h2>Narx tasdiqlash navbati</h2>
            </div>
            <button type="button" className="products-mini-button" onClick={() => onNavigate("pricing")}>Narxlar</button>
          </div>
          <div className="products-list">
            {approvalProducts.length ? approvalProducts.map((product) => (
              <button type="button" key={product.id} onClick={() => onNavigate("pricing")}>
                <strong>{product.name}</strong>
                <span>{formatMoney(product.price)} · {labelProductStatus(product.approvalStatus)}</span>
              </button>
            )) : (
              <article className="products-mini-card">
                <strong>Navbat toza</strong>
                <span>Kutilayotgan narx tasdig'i yo'q.</span>
              </article>
            )}
          </div>
        </section>
      </section>
    </div>
  );
};

export default ProductsDashboard;
