import {
  ArrowUpRight,
  BarChart3,
  CircleDollarSign,
  CreditCard,
  ShoppingBag,
} from "lucide-react";
import "./SalesChart.scss";

const revenueBars = [42, 58, 46, 72, 66, 84, 78, 92, 74, 88, 96, 90];

const salesMetrics = [
  {
    label: "Tushum",
    value: "14.28m",
    change: "+23.5%",
    icon: CircleDollarSign,
  },
  {
    label: "Buyurtma",
    value: "248",
    change: "+34",
    icon: ShoppingBag,
  },
  {
    label: "Karta to'lov",
    value: "68%",
    change: "+9%",
    icon: CreditCard,
  },
];

const SalesChart = () => {
  return (
    <article className="zenix-dashboard__panel zenix-dashboard__panel--wide sales-chart">
      <div className="zenix-dashboard__panel-head">
        <div className="zenix-dashboard__panel-title">
          <span>
            <BarChart3 size={14} />
            Savdo oqimi
          </span>
          <h3>Bugungi savdo ritmi</h3>
          <p>Soatlar bo'yicha tushum va buyurtma bosimi.</p>
        </div>

        <strong className="zenix-dashboard__panel-pill">
          <ArrowUpRight size={14} />
          +23.5%
        </strong>
      </div>

      <div className="sales-chart__board">
        <div className="sales-chart__metrics">
          {salesMetrics.map((item) => {
            const Icon = item.icon;

            return (
              <div className="sales-chart__metric" key={item.label}>
                <span>
                  <Icon size={16} />
                </span>
                <div>
                  <small>{item.label}</small>
                  <strong>{item.value}</strong>
                </div>
                <em>{item.change}</em>
              </div>
            );
          })}
        </div>

        <div className="sales-chart__bars" aria-label="Bugungi savdo charti">
          {revenueBars.map((height, index) => (
            <span
              className="sales-chart__bar"
              key={index}
              style={{
                "--bar-height": `${height}%`,
                "--bar-index": index,
              }}
            >
              <i />
            </span>
          ))}
        </div>
      </div>
    </article>
  );
};

export default SalesChart;
