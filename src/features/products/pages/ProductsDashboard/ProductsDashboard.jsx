import { AlertTriangle, Boxes, CircleDollarSign, Layers3, PackageCheck, TrendingUp } from "lucide-react";

import AIProductAssistant from "../../components/AIProductAssistant/AIProductAssistant";
import ProductKpiCard from "../../components/ProductKpiCard/ProductKpiCard";
import { formatMoney } from "../../utils/productCalculations";
import { labelProductStatus } from "../../utils/productCalculations";

const ProductsDashboard = ({ metrics, products, aiInsights, onNavigate, onRunAiAction }) => {
  const topProducts = [...products].sort((a, b) => b.sales30d - a.sales30d).slice(0, 5);
  const approvalProducts = products.filter((item) => item.approvalStatus === "pending").slice(0, 4);

  return (
    <div className="products-view">
      <div className="products-kpi-grid">
        <ProductKpiCard icon={PackageCheck} label="Faol artikul" value={metrics.active} meta={`${metrics.total} jami`} />
        <ProductKpiCard icon={CircleDollarSign} label="Katalog qiymati" value={formatMoney(metrics.value)} meta="Faqat qoldiq xulosasi" tone="green" />
        <ProductKpiCard icon={TrendingUp} label="O'rtacha marja" value={`${Math.round(metrics.averageMargin)}%`} meta={`${metrics.sales} savdo / 30 kun`} tone="violet" />
        <ProductKpiCard icon={AlertTriangle} label="E'tibor kerak" value={metrics.low + metrics.pending} meta={`${metrics.pending} tasdiq`} tone="amber" />
      </div>

      <section className="products-dashboard-grid">
        <section className="products-panel">
          <div className="products-panel__head">
            <div>
              <span><Boxes size={13} /> Katalog salomatligi</span>
              <h2>Mahsulotlar bosh sahifasi</h2>
            </div>
            <button type="button" className="products-mini-button" onClick={() => onNavigate("list")}>Listga o'tish</button>
          </div>
          <div className="products-health-grid">
            {[
              ["Asosiy ma'lumotlar", 92],
              ["Savdoga tayyorlik", 88],
              ["Narx nazorati", 76],
              ["Rasm qamrovi", 64],
              ["Ombor mosligi", 84],
            ].map(([label, value]) => (
              <article key={label}>
                <div><strong>{label}</strong><span>{value}%</span></div>
                <meter min="0" max="100" value={value} />
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
              <button type="button" key={product.id} onClick={() => onNavigate("list")}>
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
                <strong>Queue toza</strong>
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
