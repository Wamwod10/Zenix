import { PackageCheck, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatMoney } from "../../dashboardApi";
import "./TopProducts.scss";

const toProducts = (products = [], currency = "uzs") => {
  if (!products.length) return [];

  const maxTotal = Math.max(
    ...products.map((product) => Number(product.total ?? product.value ?? 0)),
    1,
  );

  return products.map((product, index) => {
    const total = Number(product.total ?? product.value ?? 0);

    return {
      id: product.id,
      name: product.name || "Nomsiz mahsulot",
      value: formatMoney(total, currency),
      progress: Math.round((total / maxTotal) * 100),
      tone: ["green", "blue", "gold", "cyan"][index % 4],
    };
  });
};

const TopProducts = ({ currency = "uzs", products }) => {
  const navigate = useNavigate();
  const items = toProducts(products, currency);

  return (
    <article className="zenix-dashboard__panel top-products">
      <div className="zenix-dashboard__panel-head">
        <div className="zenix-dashboard__panel-title">
          <span>
            <Sparkles size={14} />
            Eng ko'p sotilganlar
          </span>
          <h3>Eng faol mahsulotlar</h3>
        </div>

        <span className="zenix-dashboard__panel-icon">
          <PackageCheck size={18} />
        </span>
      </div>

      {items.length ? (
        <div className="top-products__list">
          {items.map((product, index) => (
            <button
              className={`top-products__item top-products__item--${product.tone}`}
              key={`${product.id || product.name}-${index}`}
              style={{
                "--item-index": index,
                "--product-progress": `${product.progress}%`,
              }}
              type="button"
              aria-label={`${product.name} mahsulotini ochish`}
              title={`${product.name}: eng yuqori savdoga nisbatan ${product.progress}%`}
              onClick={() =>
                navigate(product.id ? `/products/${product.id}` : "/products")
              }
            >
              <div>
                <strong>{product.name}</strong>
                <small>{product.value}</small>
              </div>
              <span aria-hidden="true">
                <i />
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="top-products__empty">
          <PackageCheck size={18} />
          <strong>Top mahsulotlar hali yo'q</strong>
          <span>Savdo ma'lumotlari yig'ilgach ro'yxat ko'rinadi.</span>
        </div>
      )}
    </article>
  );
};

export default TopProducts;
