import { BarChart3 } from "lucide-react";

import { formatMargin } from "../../utils/productCalculations";

const ProductAnalytics = ({ products }) => {
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
              <div><strong>{product.name}</strong><span>{product.sales30d} savdo · {formatMargin(product.margin)} marja</span></div>
              <b>{product.sales30d} ta</b>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductAnalytics;
