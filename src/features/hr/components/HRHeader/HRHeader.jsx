import { Bell, Plus, RotateCcw, Search, Sparkles } from "lucide-react";

import "./HRHeader.scss";

const HRHeader = ({
  search,
  onSearch,
  role,
  roles,
  onRoleChange,
  onCreate,
  onReset,
  unreadCount,
}) => (
  <header className="hr-header">
    <div className="hr-header__content">
      <span className="hr-header__eyebrow">
        <Sparkles size={13} />
        AI native HR workspace
      </span>
      <h1>ZENIX HR</h1>
      <div className="hr-header__live" aria-label="HR holati">
        <span className="is-success">LocalStorage persistence</span>
        <span>Payroll config based</span>
        <span className="is-ai">AI recommendations</span>
      </div>
    </div>

    <div className="hr-header__tools">
      <label className="hr-header__search">
        <Search size={16} />
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Xodim, telefon, email..."
          aria-label="HR global search"
        />
      </label>

      <select value={role} onChange={(event) => onRoleChange(event.target.value)} aria-label="HR role">
        {roles.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>

      <button type="button" onClick={onCreate}>
        <Plus size={16} />
        Yangi xodim
      </button>
      <button type="button" onClick={onReset} aria-label="HR mock state reset">
        <RotateCcw size={16} />
      </button>
      <span className="hr-header__bell" aria-label={`${unreadCount} unread notifications`}>
        <Bell size={16} />
        {unreadCount}
      </span>
    </div>
  </header>
);

export default HRHeader;
