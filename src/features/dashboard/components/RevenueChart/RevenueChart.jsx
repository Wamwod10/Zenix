import "./RevenueChart.scss";
import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  TrendingUp,
} from "lucide-react";
const chartData = [
  { label: "Yan", revenue: 42, target: 38, orders: 184 },
  { label: "Fev", revenue: 58, target: 46, orders: 211 },
  { label: "Mar", revenue: 51, target: 52, orders: 198 },
  { label: "Apr", revenue: 74, target: 60, orders: 246 },
  { label: "May", revenue: 68, target: 66, orders: 231 },
  { label: "Iyn", revenue: 86, target: 72, orders: 284 },
  { label: "Iyl", revenue: 79, target: 76, orders: 269 },
  { label: "Avg", revenue: 94, target: 82, orders: 318 },
  { label: "Sen", revenue: 83, target: 86, orders: 296 },
  { label: "Okt", revenue: 99, target: 90, orders: 342 },
  { label: "Noy", revenue: 108, target: 94, orders: 368 },
  { label: "Dek", revenue: 102, target: 98, orders: 351 },
];

const summaryItems = [
  {
    label: "Umumiy tushum",
    value: "1.28 mlrd",
    detail: "+24.8%",
    icon: CircleDollarSign,
  },
  {
    label: "O'rtacha chek",
    value: "428 ming",
    detail: "+8.2%",
    icon: TrendingUp,
  },
  {
    label: "Buyurtmalar",
    value: "3 298",
    detail: "+312",
    icon: BarChart3,
  },
];

const RevenueChart = () => {
  return (
    <article className="revenue-atelier">
      <div className="revenue-atelier__header">
        <div>
          <span className="revenue-atelier__eyebrow">
            <CircleDollarSign size={14} />
            Revenue cockpit
          </span>
          <h3>Daromad holati</h3>
          <p>Bugungi biznes ritmi, tushum sifati va target bosimi.</p>
        </div>

        <div className="revenue-atelier__actions" aria-label="Revenue timeframe">
          <button className="is-active" type="button">
            12 oy
          </button>
          <button type="button">Kvartal</button>
          <button type="button" aria-label="Sana tanlash">
            <CalendarDays size={15} />
          </button>
        </div>
      </div>

      <div className="revenue-atelier__body">
        <div className="revenue-atelier__orb" aria-label="Revenue health 86%">
          <span className="revenue-atelier__orb-ring" />
          <span className="revenue-atelier__orb-glow" />
          <div>
            <small>Revenue health</small>
            <strong>86%</strong>
            <em>premium momentum</em>
          </div>
        </div>

        <div className="revenue-atelier__metrics">
          {summaryItems.map((item) => {
            const Icon = item.icon;

            return (
              <div className="revenue-atelier__metric" key={item.label}>
                <span className="revenue-atelier__metric-icon">
                  <Icon size={17} />
                </span>
                <div>
                  <small>{item.label}</small>
                  <strong>{item.value}</strong>
                  <em>
                    <ArrowUpRight size={13} />
                    {item.detail}
                  </em>
                </div>
              </div>
            );
          })}
        </div>

        <div className="revenue-atelier__signals">
          {chartData.slice(-6).map((item, index) => (
            <span
              className={item.revenue >= item.target ? "is-hot" : "is-soft"}
              key={item.label}
              style={{ "--signal-level": `${Math.max(24, item.revenue)}%`, "--signal-index": index }}
            >
              <i />
              <small>{item.label}</small>
              <strong>{item.revenue}m</strong>
            </span>
          ))}
        </div>
      </div>

      <div className="revenue-atelier__footer">
        <div className="revenue-atelier__legend">
          <span>
            <i className="is-hot" />
            Targetdan yuqori
          </span>
          <span>
            <i className="is-soft" />
            Kuzatuvda
          </span>
        </div>

        <p>
          Noyabr cho'qqisi saqlanmoqda. Keyingi o'sish: premium mijoz segmenti.
        </p>
      </div>
    </article>
  );
};

export default RevenueChart;
