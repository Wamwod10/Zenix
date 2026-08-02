import { Copy, Pencil, Search, Star, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import ReportsEmptyState from "../../components/ReportsEmptyState/ReportsEmptyState";
import { getReportTitle, normalizeSearch } from "../../utils/reportsFormatters";
import "./SavedReports.scss";

const pageCopy = {
  saved: ["Saqlangan hisobotlar", "Saqlangan dashboard snapshotlari va custom reportlar"],
  favorites: ["Saralangan hisobotlar", "Tez-tez ochiladigan muhim hisobotlar"],
  recent: ["Oxirgi ochilgan hisobotlar", "Yaqinda ko'rilgan reportlar tarixi"],
  templates: ["Hisobot andozalari", "Tez start uchun tayyor report shakllari"],
  sharing: ["Ulashilgan hisobotlar", "Yuborilgan report linklari va ruxsatlar tarixi"],
};

const SavedReports = ({ controller, mode = "saved" }) => {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const sourceItems = useMemo(() => {
    if (mode === "recent") return controller.state.recentReports.map((item) => ({ ...item, name: item.name || getReportTitle(item.id), report: item.id, createdAt: item.openedAt }));
    if (mode === "templates") return controller.state.templates.map((item) => ({ ...item, report: item.module.toLowerCase(), createdAt: "Andoza" }));
    if (mode === "sharing") return controller.state.shareHistory.map((item) => ({ ...item, name: getReportTitle(item.reportName), report: item.reportName, createdAt: item.sharedAt, dateRange: `${item.channel} / ${item.permission}` }));
    return controller.state.savedReports.filter((item) => mode !== "favorites" || controller.state.favoriteReports.includes(item.id));
  }, [controller.state.favoriteReports, controller.state.recentReports, controller.state.savedReports, controller.state.shareHistory, controller.state.templates, mode]);

  const items = useMemo(() => {
    const filtered = sourceItems.filter((item) => normalizeSearch(`${item.name} ${item.report}`).includes(normalizeSearch(query)));
    return [...filtered].sort((a, b) => {
      if (sort === "name") return String(a.name).localeCompare(String(b.name), "uz");
      if (sort === "type") return String(a.report).localeCompare(String(b.report), "uz");
      return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
    });
  }, [query, sort, sourceItems]);

  const [title, description] = pageCopy[mode] || pageCopy.saved;

  return (
    <section className="saved-reports">
      <div className="reports-simple-view__head">
        <span className="reports-eyebrow">{title}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="saved-reports__toolbar">
        <label>
          <Search size={14} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Hisobot nomi bo'yicha qidirish" />
        </label>
        <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Saralash">
          <option value="newest">Yangi birinchi</option>
          <option value="name">Nomi bo'yicha</option>
          <option value="type">Turi bo'yicha</option>
        </select>
      </div>
      {items.length ? (
        <div className="saved-reports__grid">
          {items.map((item) => (
            <article key={`${item.id}-${item.createdAt}`}>
              <div>
                <strong>{item.name || getReportTitle(item.report)}</strong>
                <span>{getReportTitle(item.report)} / {item.dateRange || item.createdAt}</span>
                {item.tableColumns && <small>{item.tableColumns.join(", ")}</small>}
              </div>
              <button type="button" onClick={() => controller.actions.openReport(item.report || item.id)}>Ochish</button>
              {mode !== "recent" && mode !== "sharing" && (
                <>
                  {mode !== "templates" && (
                    <button type="button" title="Saralangan holatini almashtirish" aria-label="Saralangan holatini almashtirish" onClick={() => controller.actions.toggleFavorite(item.id)}>
                      <Star size={15} fill={controller.state.favoriteReports.includes(item.id) ? "currentColor" : "none"} />
                    </button>
                  )}
                  <button type="button" title="Nusxa olish" aria-label="Hisobot nusxasini yaratish" onClick={() => controller.actions.duplicateSavedReport(item)}>
                    <Copy size={15} />
                  </button>
                  {mode !== "templates" && (
                    <>
                      <button type="button" title="Tahrirlash" aria-label="Hisobotni tahrirlash" onClick={() => controller.actions.openReport("builder")}>
                        <Pencil size={15} />
                      </button>
                      <button type="button" title="O'chirish" aria-label="Hisobotni o'chirish" onClick={() => controller.actions.removeSavedReport(item.id)}>
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </>
              )}
            </article>
          ))}
        </div>
      ) : (
        <ReportsEmptyState
          title={`${title} yo'q`}
          text="Report Builder orqali yangi hisobot yaratishingiz mumkin."
          actionLabel="Konstruktorni ochish"
          onAction={() => controller.actions.openReport("builder")}
        />
      )}
    </section>
  );
};

export default SavedReports;
