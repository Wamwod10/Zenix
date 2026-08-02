import { useMemo, useState } from "react";
import { Bell, ChevronDown, Plus, RotateCcw, Search, Sparkles } from "lucide-react";

import { formatEmployeeName } from "../../utils/hrFormatters";
import "./HRHeader.scss";

const isDev = import.meta.env.DEV;

const HRHeader = ({
  search,
  onSearch,
  employees = [],
  dictionaries,
  role,
  roles,
  onRoleChange,
  onCreate,
  onReset,
  notifications = [],
  unreadCount,
  onNavigate,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [roleOpen, setRoleOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const suggestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return [
        { id: "create", label: "Yangi xodim yaratish", meta: "Amal", type: "action", view: "employee-create" },
        { id: "attendance", label: "Davomatni ko'rish", meta: "Bo'lim", type: "action", view: "attendance" },
      ];
    }

    return employees
      .filter((employee) => {
        const haystack = `${employee.firstName} ${employee.lastName} ${employee.phone} ${employee.email}`.toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, 6)
      .map((employee) => ({
        id: employee.id,
        label: formatEmployeeName(employee),
        meta: `${dictionaries?.positionById[employee.positionId]?.title || "Lavozim"} - ${dictionaries?.branchById[employee.branchId]?.name || "Filial"}`,
        type: "employee",
        employeeId: employee.id,
      }));
  }, [dictionaries, employees, search]);

  const chooseSuggestion = (item = suggestions[activeSuggestion]) => {
    if (!item) return;
    setSearchOpen(false);
    if (item.type === "employee") onNavigate("employee-details", item.employeeId);
    else onNavigate(item.view);
  };

  const onSearchKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSearchOpen(true);
      setActiveSuggestion((current) => Math.min(current + 1, suggestions.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestion((current) => Math.max(current - 1, 0));
    }
    if (event.key === "Enter" && searchOpen) {
      event.preventDefault();
      chooseSuggestion();
    }
    if (event.key === "Escape") {
      setSearchOpen(false);
    }
  };

  const confirmReset = () => {
    if (window.confirm("HR ma'lumotlarini boshlang'ich holatga qaytarishni tasdiqlaysizmi?")) {
      onReset();
    }
  };

  return (
    <header className="hr-header">
      <div className="hr-header__content">
        <span className="hr-header__eyebrow">
          <Sparkles size={13} />
          Aqlli HR boshqaruvi
        </span>
        <h1>ZENIX HR</h1>
        <div className="hr-header__live" aria-label="HR holati">
          <span className="is-success">Ma'lumotlar saqlangan</span>
          <span>Oylik davri nazoratda</span>
          <span className="is-ai">Tavsiya va ogohlantirishlar faol</span>
        </div>
      </div>

      <div className="hr-header__tools">
        <label className="hr-header__search">
          <Search size={16} />
          <input
            value={search}
            onChange={(event) => {
              onSearch(event.target.value);
              setSearchOpen(true);
              setActiveSuggestion(0);
            }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={onSearchKeyDown}
            placeholder="Xodim, telefon, email..."
            aria-label="HR global qidiruv"
            aria-expanded={searchOpen}
          />
          {searchOpen && (
            <div className="hr-header__suggestions" role="listbox">
              {suggestions.length ? (
                suggestions.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={activeSuggestion === index}
                    className={activeSuggestion === index ? "is-active" : ""}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => chooseSuggestion(item)}
                  >
                    <strong>{item.label}</strong>
                    <span>{item.meta}</span>
                  </button>
                ))
              ) : (
                <span className="hr-header__no-results">Natija topilmadi</span>
              )}
            </div>
          )}
        </label>

        {isDev && (
          <div className="hr-header__role">
            <button type="button" onClick={() => setRoleOpen((current) => !current)} aria-expanded={roleOpen}>
              {roles.find((item) => item.id === role)?.label || "Rol"} <ChevronDown size={14} />
            </button>
            {roleOpen && (
              <div className="hr-header__role-menu">
                {roles.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={item.id === role ? "is-active" : ""}
                    onClick={() => {
                      onRoleChange(item.id);
                      setRoleOpen(false);
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button type="button" onClick={onCreate}>
          <Plus size={16} />
          Yangi xodim
        </button>
        <button type="button" onClick={confirmReset} aria-label="HR ma'lumotlarini tiklash" title="Boshlang'ich HR ma'lumotlariga qaytarish">
          <RotateCcw size={16} />
        </button>
        <div className="hr-header__notifications">
          <button
            type="button"
            className="hr-header__bell"
            onClick={() => setNotificationsOpen((current) => !current)}
            aria-label={`${unreadCount} ta o'qilmagan bildirishnoma`}
            aria-expanded={notificationsOpen}
          >
            <Bell size={16} />
            {unreadCount > 0 && <span>{unreadCount}</span>}
          </button>
          {notificationsOpen && (
            <div className="hr-header__notification-panel">
              {notifications.slice(0, 5).map((item) => (
                <article key={item.id} className={`is-${item.tone}`}>
                  {item.text}
                </article>
              ))}
              {!notifications.length && <article>Yangi bildirishnoma yo'q.</article>}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HRHeader;
