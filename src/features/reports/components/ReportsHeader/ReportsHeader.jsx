import { Download, PanelTopOpen, Search, ShieldCheck, SlidersHorizontal, Sparkles } from "lucide-react";

import "./ReportsHeader.scss";

const ReportsHeader = ({
  search,
  role,
  roles,
  unreadCount,
  canExport,
  onSearch,
  onRoleChange,
  onOpenFilters,
  onOpenExport,
  onOpenSettings,
}) => (
  <section className="reports-header">
    <div className="reports-header__copy">
      <span className="reports-header__eyebrow">
        <Sparkles size={14} />
        ZENIX Business Intelligence
      </span>
      <h1>Hisobotlar markazi</h1>
      <p>
        POS, Warehouse, CRM, Finance va HR signallarini yagona AI-ready BI workspace ichida
        kuzating, solishtiring va saqlang.
      </p>
    </div>

    <div className="reports-header__tools">
      <label className="reports-header__search">
        <Search size={17} />
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onSearch(event.currentTarget.value, true);
          }}
          placeholder="Bugungi savdo, profit, top 10 mijoz..."
          aria-label="Reports smart search"
        />
      </label>

      <div className="reports-header__actions">
        <select value={role} onChange={(event) => onRoleChange(event.target.value)} aria-label="Reports roli">
          {roles.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <button type="button" onClick={onOpenFilters}>
          <SlidersHorizontal size={16} />
          Filter
        </button>
        <button type="button" onClick={onOpenExport} disabled={!canExport}>
          <Download size={16} />
          Export
        </button>
        <button type="button" onClick={onOpenSettings} aria-label="Dashboard settings">
          <PanelTopOpen size={16} />
        </button>
      </div>

      <div className="reports-header__live" aria-label="Reports system status">
        <span>
          <ShieldCheck size={13} />
          Permission-aware
        </span>
        <span>{unreadCount} signal</span>
        <span>Local BI state</span>
      </div>
    </div>
  </section>
);

export default ReportsHeader;
