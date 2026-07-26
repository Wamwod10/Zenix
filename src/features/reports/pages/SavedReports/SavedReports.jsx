import { Clock3, Star } from "lucide-react";

import "./SavedReports.scss";

const SavedReports = ({ controller, mode = "saved" }) => {
  const items = mode === "recent"
    ? controller.state.recentReports.map((item) => ({ ...item, name: item.id, report: item.id, createdAt: item.openedAt }))
    : controller.state.savedReports.filter((item) => mode !== "favorites" || controller.state.favoriteReports.includes(item.id));

  return (
    <section className="saved-reports">
      <div className="reports-simple-view__head">
        <span className="reports-eyebrow">{mode}</span>
        <h2>{mode === "favorites" ? "Favorite Reports" : mode === "recent" ? "Recent Reports" : "Saved Reports"}</h2>
      </div>
      <div className="saved-reports__grid">
        {items.map((item) => (
          <article key={`${item.id}-${item.createdAt}`}>
            <div>
              <strong>{item.name}</strong>
              <span>{item.report} · {item.dateRange || item.createdAt}</span>
              {item.tableColumns && <small>{item.tableColumns.join(", ")}</small>}
            </div>
            <button type="button" onClick={() => controller.actions.openReport(item.report || item.id)}>Ochish</button>
            {mode !== "recent" && (
              <button type="button" aria-label="Toggle favorite report" onClick={() => controller.actions.toggleFavorite(item.id)}>
                <Star size={15} />
              </button>
            )}
            <Clock3 size={15} />
          </article>
        ))}
      </div>
    </section>
  );
};

export default SavedReports;
