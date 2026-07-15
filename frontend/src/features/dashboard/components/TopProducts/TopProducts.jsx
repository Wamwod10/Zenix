import { PackageCheck, Sparkles } from "lucide-react";
import "./TopProducts.scss";

const fallbackProducts = [
  { name: "Premium kofe", value: "3.2m", progress: 88, tone: "green" },
  { name: "Smart sensor", value: "2.7m", progress: 74, tone: "blue" },
  { name: "Office set", value: "1.9m", progress: 58, tone: "gold" },
  { name: "Cloud tarif", value: "1.4m", progress: 46, tone: "cyan" },
];

const toProducts = (products) => {
  if (!products?.length) {
    return fallbackProducts;
  }

  const maxTotal = Math.max(...products.map((product) => Number(product.total || 0)), 1);

  return products.map((product, index) => ({
    name: product.name,
    value: `${Number(product.total || 0).toLocaleString("ru-RU")} so'm`,
    progress: Math.max(12, Math.round((Number(product.total || 0) / maxTotal) * 100)),
    tone: ["green", "blue", "gold", "cyan"][index % 4],
  }));
};

const TopProducts = ({ products }) => {
  const items = toProducts(products);

  return (
    <article className="zenix-dashboard__panel top-products">
      <div className="zenix-dashboard__panel-head">
        <div className="zenix-dashboard__panel-title">
          <span>
            <Sparkles size={14} />
            Top products
          </span>
          <h3>Eng faol mahsulotlar</h3>
        </div>

        <span className="zenix-dashboard__panel-icon">
          <PackageCheck size={18} />
        </span>
      </div>

      <div className="top-products__list">
        {items.map((product, index) => (
          <div
            className={`top-products__item top-products__item--${product.tone}`}
            key={product.name}
            style={{
              "--item-index": index,
              "--product-progress": `${product.progress}%`,
            }}
          >
            <div>
              <strong>{product.name}</strong>
              <small>{product.value}</small>
            </div>
            <span>
              <i />
            </span>
          </div>
        ))}
      </div>
    </article>
  );
};

export default TopProducts;
