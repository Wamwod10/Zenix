import { useEffect, useMemo, useState } from "react";
import { Search, Star, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./SettingsSearch.scss";

const SettingsSearch = ({ search, onNavigate, compact = false }) => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const listId = useMemo(() => `settings-search-${compact ? "compact" : "main"}-results`, [compact]);

  useEffect(() => {
    setActiveIndex(0);
  }, [search.query, search.results.length]);

  const openResult = (result) => {
    navigate(result.path);
    onNavigate?.(result.id);
    search.setQuery("");
  };

  const onKeyDown = (event) => {
    if (!search.query) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, Math.max(0, search.results.length - 1)));
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    }

    if (event.key === "Enter" && search.results[activeIndex]) {
      event.preventDefault();
      openResult(search.results[activeIndex]);
    }

    if (event.key === "Escape") {
      search.setQuery("");
    }
  };

  return (
    <section className={`settings-search ${compact ? "settings-search--compact" : ""}`}>
      <div className="settings-search__box">
        <Search size={18} />
        <input
          value={search.query}
          placeholder="Valyutani o'zgartirish, Telegram botni ulash, backup yaratish..."
          aria-label="Sozlamalar qidiruvi"
          aria-controls={search.query ? listId : undefined}
          aria-activedescendant={search.results[activeIndex] ? `${listId}-${search.results[activeIndex].id}` : undefined}
          aria-expanded={Boolean(search.query)}
          role="combobox"
          onChange={(event) => search.setQuery(event.target.value)}
          onKeyDown={onKeyDown}
        />
        {search.query && (
          <button type="button" aria-label="Qidiruvni tozalash" onClick={() => search.setQuery("")}>
            <X size={15} />
          </button>
        )}
      </div>
      {search.query && (
        <div className="settings-search__results" id={listId} role="listbox">
          {search.results.length ? search.results.map((result, index) => (
            <button
              id={`${listId}-${result.id}`}
              key={result.id}
              type="button"
              role="option"
              className={index === activeIndex ? "is-active" : ""}
              aria-selected={index === activeIndex}
              onClick={() => openResult(result)}
            >
              <Star size={14} />
              <span>
                <strong>{result.label}</strong>
                <small>{result.group} - {result.description}</small>
              </span>
            </button>
          )) : (
            <div className="settings-search__empty">
              <strong>Sozlama topilmadi</strong>
              <button type="button" onClick={() => search.setQuery("")}>Qidiruvni tozalash</button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default SettingsSearch;
