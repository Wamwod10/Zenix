import { ArrowRight, Search, Sparkles } from "lucide-react";

import { getSearchIntent } from "../../utils/reportsCalculations";
import "./SmartSearch.scss";

const samples = [
  "Bugungi savdo",
  "Yanvar xarajatlari",
  "Eng foydali mahsulot",
  "Kam sotilgan mahsulotlar",
  "Qarzdor supplierlar",
  "Top 10 mijoz",
  "Oxirgi 30 kun",
  "Profit",
  "Revenue",
];

const SmartSearch = ({ value, onChange, onRun }) => {
  const intent = getSearchIntent(value);

  return (
    <article className="smart-search-card">
      <div className="smart-search-card__head">
        <span>
          <Sparkles size={15} />
          Smart Search
        </span>
        {intent && <strong>{intent.report}</strong>}
      </div>
      <label className="smart-search-card__input">
        <Search size={16} />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onRun(event.currentTarget.value);
          }}
          placeholder="Natural so'rov yozing"
          aria-label="Universal reports search"
        />
      </label>
      <div className="smart-search-card__samples">
        {samples.map((item) => (
          <button key={item} type="button" onClick={() => onRun(item)}>
            {item}
            <ArrowRight size={13} />
          </button>
        ))}
      </div>
    </article>
  );
};

export default SmartSearch;
