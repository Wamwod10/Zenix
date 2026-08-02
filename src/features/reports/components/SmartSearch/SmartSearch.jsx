import { useMemo, useState } from "react";
import { ArrowRight, Search, Sparkles } from "lucide-react";

import { getSearchIntent } from "../../utils/reportsCalculations";
import { getReportTitle, normalizeSearch } from "../../utils/reportsFormatters";
import "./SmartSearch.scss";

const samples = [
  "Bugungi savdo",
  "Yanvar xarajatlari",
  "Eng foydali mahsulot",
  "Kam sotilgan mahsulotlar",
  "Qarzdor yetkazib beruvchilar",
  "Top 10 mijoz",
  "Oxirgi 30 kun",
  "Daromad prognozi",
  "Xodimlar KPI",
];

const SmartSearch = ({ value, onChange, onRun }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const intent = getSearchIntent(value);
  const suggestions = useMemo(() => {
    const query = normalizeSearch(value);
    if (!query) return samples.slice(0, 5);
    const matched = samples.filter((item) => normalizeSearch(item).includes(query));
    return matched.length ? matched : samples.slice(0, 4);
  }, [value]);

  const runSuggestion = (item) => {
    onChange(item);
    onRun(item);
  };

  return (
    <article className="smart-search-card">
      <div className="smart-search-card__head">
        <span>
          <Sparkles size={15} />
          Aqlli qidiruv
        </span>
        {intent && <strong>{getReportTitle(intent.report)}</strong>}
      </div>
      <label className="smart-search-card__input">
        <Search size={16} />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((current) => Math.min(suggestions.length - 1, current + 1));
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((current) => Math.max(0, current - 1));
            }
            if (event.key === "Escape") onChange("");
            if (event.key === "Enter") onRun(suggestions[activeIndex] || event.currentTarget.value);
          }}
          placeholder="Masalan: bugungi savdo yoki kam sotilgan mahsulotlar"
          aria-label="Hisobotlar bo'yicha aqlli qidiruv"
        />
      </label>

      <div className="smart-search-card__intent">
        {intent?.filters && Object.keys(intent.filters).length
          ? `Qo'llanadi: ${getReportTitle(intent.report)} va ${Object.keys(intent.filters).join(", ")} filterlari`
          : "Boshqa so'z bilan qidiring yoki tayyor so'rovlardan foydalaning."}
      </div>

      <div className="smart-search-card__samples" role="listbox" aria-label="Qidiruv takliflari">
        {suggestions.map((item, index) => (
          <button key={item} type="button" className={activeIndex === index ? "is-active" : ""} onClick={() => runSuggestion(item)}>
            {item}
            <ArrowRight size={13} />
          </button>
        ))}
      </div>
    </article>
  );
};

export default SmartSearch;
