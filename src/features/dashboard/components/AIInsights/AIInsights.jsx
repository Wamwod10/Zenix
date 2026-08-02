import {
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  PackageCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { formatMoney, formatPercentChange } from "../../dashboardApi";
import "./AIInsights.scss";

const buildInsights = (stats = {}, currency = "uzs") => {
  const items = [];
  const lowStockCount = Number(stats?.lowStockCount ?? 0);
  const todaySales = Number(stats?.todaySales ?? 0);
  const yesterdaySales = Number(stats?.yesterdaySales ?? 0);
  const salesChange = formatPercentChange(todaySales, yesterdaySales);

  if (lowStockCount > 0) {
    items.push({
      icon: AlertTriangle,
      label: "Ombor riski",
      title: `${lowStockCount} ta mahsulot kam qolgan`,
      text: "Kam qoldiq ro'yxatini tekshirib, xarid buyurtmasini kontekst bilan oching.",
      action: "Qoldiqlarni ko'rish",
      path: "/warehouse/stock",
      type: "warning",
    });
  }

  if (salesChange && todaySales > yesterdaySales) {
    items.push({
      icon: TrendingUp,
      label: "Savdo signali",
      title: `Savdo ${salesChange.label} o'sgan`,
      text: `Bugungi tushum ${formatMoney(todaySales, currency)}. Eng faol mahsulotlarni tekshirish foydali.`,
      action: "Savdo hisobotini ochish",
      path: "/reports/sales",
      type: "positive",
    });
  }

  if (salesChange && todaySales < yesterdaySales) {
    items.push({
      icon: TrendingDown,
      label: "Savdo pasayishi",
      title: `Savdo ${salesChange.label} o'zgargan`,
      text: "Kechagi davr bilan farq bor. Kanal, kassir yoki mahsulot kesimida sababni tekshiring.",
      action: "Hisobotni ochish",
      path: "/reports/sales",
      type: "warning",
    });
  }

  if (!lowStockCount && !items.length) {
    items.push({
      icon: CheckCircle2,
      label: "Operatsion holat",
      title: "Muhim risk ko'rinmadi",
      text: "Real tavsiyalar savdo, ombor va faoliyat ma'lumoti ko'payganda shu yerda chiqadi.",
      action: "Faoliyatni ko'rish",
      path: "/reports",
      type: "positive",
    });
  }

  return items.slice(0, 3);
};

const AIInsights = ({ currency = "uzs", stats = {} }) => {
  const navigate = useNavigate();
  const insights = useMemo(() => buildInsights(stats, currency), [currency, stats]);

  return (
    <article className="ai-insights">
      <div className="ai-insights__head">
        <div className="ai-insights__brand">
          <span>
            <BrainCircuit size={16} />
          </span>

          <div>
            <strong>Muhim tavsiyalar</strong>
            <small>Real summary asosida</small>
          </div>
        </div>

        <button
          type="button"
          aria-label="AI tahlil markazini ochish"
          title="AI tahlil markazini ochish"
          onClick={() => navigate("/reports/ai")}
        >
          Ko'rish
          <ArrowRight size={15} />
        </button>
      </div>

      <div className="ai-insights__list ai-insights__list--compact">
        {insights.map((item, index) => {
          const Icon = item.icon || PackageCheck;

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
                <button
                  className="ai-insights__action"
                  type="button"
                  aria-label={`${item.title}: ${item.action}`}
                  title={`${item.title}: ${item.action}`}
                  onClick={() => navigate(item.path)}
                >
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
