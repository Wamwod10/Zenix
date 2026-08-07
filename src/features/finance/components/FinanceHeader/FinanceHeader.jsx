import { GlassSelect } from "@/components/ui";
import { Download, FileText, MoveRight, Plus, Search, ShieldCheck, Sparkles, TrendingDown, TrendingUp } from "lucide-react";

import "./FinanceHeader.scss";

const FinanceHeader = ({
  search,
  onSearch,
  role,
  roles,
  onRoleChange,
  onCreate,
  onExport,
  onQuickAction,
  summary,
  aiInsights = [],
  unreadCount,
}) => (
  <section className="finance-header">
    <div className="finance-header__copy">
      <span className="finance-header__eyebrow">
        <Sparkles size={14} />
        ZENIX AI Moliya
      </span>
      <h1>Moliya boshqaruv markazi</h1>
      <p>
        Kompaniyaning pul qoldig'i, daromad, xarajat, qarzdorlik va AI risk signallari birinchi ekranda.
      </p>
      <div className="finance-header__quick">
        <button type="button" onClick={() => onQuickAction?.("income")}>
          <TrendingUp size={15} />
          Daromad qo'shish
        </button>
        <button type="button" onClick={() => onQuickAction?.("expense")}>
          <TrendingDown size={15} />
          Xarajat qo'shish
        </button>
        <button type="button" onClick={() => onQuickAction?.("transfer")}>
          <MoveRight size={15} />
          Pul o'tkazish
        </button>
        <button type="button" onClick={() => onQuickAction?.("invoice")}>
          <FileText size={15} />
          Invoice yaratish
        </button>
      </div>
    </div>

    <aside className="finance-header__insight" aria-label="Bugungi moliyaviy xulosa">
      <span>Today's summary</span>
      <strong>{summary?.netProfit >= 0 ? "Foyda ijobiy" : "Xarajat daromaddan yuqori"}</strong>
      <p>
        Pul qoldig'i {summary?.totalBalance?.toLocaleString("uz-UZ") || 0} UZS.
        {aiInsights[0]?.message ? ` ${aiInsights[0].message}` : " Pul oqimi va qarzdorlik nazoratda."}
      </p>
    </aside>

    <div className="finance-header__tools">
      <label className="finance-header__search">
        <Search size={17} />
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="ID, hujjat yoki hamkor..."
          aria-label="Moliya bo'yicha qidiruv"
        />
      </label>

      <div className="finance-header__actions">
        <GlassSelect
          value={role}
          onChange={(event) => onRoleChange(event.target.value)}
          aria-label="Moliya roli"
        >
          {roles.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </GlassSelect>
        <button type="button" onClick={onCreate}>
          <Plus size={16} />
          Tranzaksiya
        </button>
        <button type="button" onClick={onExport}>
          <Download size={16} />
          Eksport
        </button>
      </div>

      <div className="finance-header__live">
        <span>
          <ShieldCheck size={13} />
          Maker-checker faol
        </span>
        <span>{unreadCount} signal</span>
        <span>O'zgarmas o'tkazilgan yozuvlar</span>
      </div>
    </div>
  </section>
);

export default FinanceHeader;
