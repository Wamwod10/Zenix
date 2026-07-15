import {
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  Clock3,
  Gauge,
  LineChart,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import "./AIInsights.scss";

const aiMetrics = [
  { label: "Aniqlik", value: "94%", icon: Gauge },
  { label: "Signal", value: "12 ta", icon: Zap },
  { label: "Yangilandi", value: "2 daq", icon: Clock3 },
];

const forecast = [
  { label: "18:00", value: 46 },
  { label: "19:00", value: 68 },
  { label: "20:00", value: 82 },
  { label: "21:00", value: 74 },
  { label: "22:00", value: 58 },
];

const insights = [
  {
    icon: TrendingUp,
    label: "Yuqori imkoniyat",
    title: "Kechki savdo cho'qqisi",
    text: "18:00-21:00 oralig'ida savdo odatdagidan 24% yuqori bo'lishi kutilmoqda.",
    action: "Hisobotni ochish",
    type: "positive",
  },
  {
    icon: AlertTriangle,
    label: "E'tibor kerak",
    title: "Ombor riski",
    text: "17 ta mahsulot qoldig'i kritik darajaga yaqin. Xarid rejasini bugun yangilash foydali.",
    action: "Buyurtma yaratish",
    type: "warning",
  },
  {
    icon: Target,
    label: "Foyda drayveri",
    title: "Bundle aksiya",
    text: "Eng ko'p sotilayotgan 3 ta mahsulotni bitta taklifga bog'lash marjani oshiradi.",
    action: "Tavsiya qo'llash",
    type: "ai",
  },
];

const AIInsights = () => {
  return (
    <article className="ai-insights">
      <div className="ai-insights__head">
        <div className="ai-insights__brand">
          <span>
            <BrainCircuit size={16} />
          </span>

          <div>
            <strong>ZENIX AI</strong>
            <small>Real-time monitoring</small>
          </div>
        </div>

        <button type="button">
          Ko'rish
          <ArrowRight size={15} />
        </button>
      </div>

      <div className="ai-insights__main">
        <div>
          <span className="ai-insights__eyebrow">
            <Sparkles size={14} />
            Smart tavsiyalar
          </span>

          <h3>AI biznesingizni kuzatmoqda</h3>
        </div>

        <p>
          ZENIX savdo, ombor va mijozlar oqimini tahlil qilib, bugungi eng
          muhim signallarni ustuvorlik bo'yicha ajratdi.
        </p>
      </div>

      <div className="ai-insights__metrics" aria-label="AI monitoring holati">
        {aiMetrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div className="ai-insights__metric" key={metric.label}>
              <span>
                <Icon size={15} />
              </span>
              <small>{metric.label}</small>
              <strong>{metric.value}</strong>
            </div>
          );
        })}
      </div>

      <div className="ai-insights__forecast">
        <div className="ai-insights__forecast-head">
          <span>
            <LineChart size={15} />
            Kechki prognoz
          </span>
          <strong>+24%</strong>
        </div>

        <div className="ai-insights__bars" aria-label="Kechki savdo prognozi">
          {forecast.map((bar) => (
            <span
              className="ai-insights__bar"
              key={bar.label}
              style={{ "--bar-value": `${bar.value}%` }}
            >
              <i />
              <small>{bar.label}</small>
            </span>
          ))}
        </div>
      </div>

      <div className="ai-insights__list">
        {insights.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              className={`ai-insights__item ai-insights__item--${item.type}`}
              key={item.title}
              style={{ "--insight-index": index }}
            >
              <span>
                <Icon size={16} />
              </span>

              <div>
                <small>{item.label}</small>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
                <button className="ai-insights__action" type="button">
                  <ShieldCheck size={13} />
                  {item.action}
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
};

export default AIInsights;
