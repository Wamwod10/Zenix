import { GlassSelect } from "@/components/ui";
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
        ZENIX biznes tahlili
      </span>
      <h1>Hisobotlar markazi</h1>
      <p>
        POS, ombor, CRM, moliya va HR ko'rsatkichlarini yagona hisobot workspace ichida
        kuzating, solishtiring va ulashing.
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
          aria-label="Hisobotlar bo'yicha aqlli qidiruv"
        />
      </label>

      <div className="reports-header__actions">
        <GlassSelect value={role} onChange={(event) => onRoleChange(event.target.value)} aria-label="Reports roli">
          {roles.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </GlassSelect>
        <button type="button" onClick={onOpenFilters}>
          <SlidersHorizontal size={16} />
          Filter
        </button>
        <button type="button" onClick={onOpenExport} disabled={!canExport}>
          <Download size={16} />
          Eksport
        </button>
        <button type="button" onClick={onOpenSettings} aria-label="Dashboard sozlamalari" title="Dashboard sozlamalari">
          <PanelTopOpen size={16} />
        </button>
      </div>

      <div className="reports-header__live" aria-label="Reports system status">
        <span>
          <ShieldCheck size={13} />
          Ruxsat nazoratida
        </span>
        <span>{unreadCount} signal</span>
        <span>Mahalliy BI holati</span>
      </div>
    </div>
  </section>
);

export default ReportsHeader;
