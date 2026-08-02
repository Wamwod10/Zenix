import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import * as Icons from "lucide-react";

import "./SettingsNavigation.scss";

const SettingsNavigation = ({ groups, mobileOpen, onClose }) => {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector("a")?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
      if (event.key !== "Tab" || !panelRef.current) return;
      const links = [...panelRef.current.querySelectorAll("a")];
      const first = links[0];
      const last = links[links.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus?.();
    };
  }, [mobileOpen, onClose]);

  return (
    <aside className={`settings-navigation ${mobileOpen ? "is-open" : ""}`}>
      <button
        className="settings-navigation__backdrop"
        type="button"
        aria-label="Settings navigatsiyasini yopish"
        onClick={onClose}
      />
      <nav className="settings-navigation__panel" ref={panelRef} aria-label="Settings secondary navigation">
        {groups.map((group) => (
          <section key={group.id} className="settings-navigation__group">
            <h2>{group.title}</h2>
            <div>
              {group.items.map((item) => {
                const Icon = Icons[item.icon] || Icons.Settings;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    end={item.id === "home"}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `settings-navigation__item ${isActive ? "is-active" : ""}`
                    }
                  >
                    <Icon size={15} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </section>
        ))}
      </nav>
    </aside>
  );
};

export default SettingsNavigation;
