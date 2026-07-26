import { Search, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./SettingsSearch.scss";

const SettingsSearch = ({ search, onNavigate, compact = false }) => {
  const navigate = useNavigate();

  const openResult = (result) => {
    navigate(result.path);
    onNavigate?.(result.id);
  };

  return (
    <section className={`settings-search ${compact ? "settings-search--compact" : ""}`}>
      <div className="settings-search__box">
        <Search size={18} />
        <input
          value={search.query}
          placeholder="Valyutani o'zgartirish, Telegram botni ulash, backup yaratish..."
          aria-label="Settings qidiruv"
          onChange={(event) => search.setQuery(event.target.value)}
        />
      </div>
      {search.query && (
        <div className="settings-search__results" role="listbox">
          {search.results.map((result) => (
            <button
              key={result.id}
              type="button"
              role="option"
              aria-selected="false"
              onClick={() => openResult(result)}
            >
              <Star size={14} />
              <span>
                <strong>{result.label}</strong>
                <small>{result.group} · {result.description}</small>
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default SettingsSearch;
