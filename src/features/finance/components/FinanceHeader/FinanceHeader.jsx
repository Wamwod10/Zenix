import { Download, Plus, Search, ShieldCheck, Sparkles } from "lucide-react";

import "./FinanceHeader.scss";

const FinanceHeader = ({
  search,
  onSearch,
  role,
  roles,
  onRoleChange,
  onCreate,
  onExport,
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
        Pul oqimi, double-entry, approval, sverka, closing, tax, valyuta va AI
        risk nazorati bitta premium ish maydonida.
      </p>
    </div>

    <div className="finance-header__tools">
      <label className="finance-header__search">
        <Search size={17} />
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="ID, reference, counterparty..."
          aria-label="Moliya bo'yicha qidiruv"
        />
      </label>

      <div className="finance-header__actions">
        <select
          value={role}
          onChange={(event) => onRoleChange(event.target.value)}
          aria-label="Finance roli"
        >
          {roles.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <button type="button" onClick={onCreate}>
          <Plus size={16} />
          Transaction
        </button>
        <button type="button" onClick={onExport}>
          <Download size={16} />
          Export
        </button>
      </div>

      <div className="finance-header__live">
        <span>
          <ShieldCheck size={13} />
          Maker-checker faol
        </span>
        <span>{unreadCount} signal</span>
        <span>Immutable posted records</span>
      </div>
    </div>
  </section>
);

export default FinanceHeader;
