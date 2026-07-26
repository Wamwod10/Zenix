import { BarChart3 } from "lucide-react";

const ProductAnalytics = ({ products }) => {
  const maxSales = Math.max(1, ...products.map((item) => item.sales30d));

  return (
    <div className="products-view">
      <section className="products-panel">
        <div className="products-panel__head">
          <div>
            <span><BarChart3 size={13} /> Mahsulotlar tahlili</span>
            <h2>Talab, marja, hayot sikli va katalog sifati</h2>
          </div>
        </div>
        <div className="products-analytics-bars">
          {products.map((product) => (
            <article key={product.id}>
              <div><strong>{product.name}</strong><span>{product.sales30d} savdo · {Math.round(product.margin)}% marja</span></div>
              <meter min="0" max={maxSales} value={product.sales30d} />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductAnalytics;
