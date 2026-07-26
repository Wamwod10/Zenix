import { NavLink } from "react-router-dom";
import * as Icons from "lucide-react";

import "./SettingsNavigation.scss";

const SettingsNavigation = ({ groups, mobileOpen, onClose }) => (
  <aside className={`settings-navigation ${mobileOpen ? "is-open" : ""}`}>
    <button
      className="settings-navigation__backdrop"
      type="button"
      aria-label="Settings navigatsiyasini yopish"
      onClick={onClose}
    />
    <nav className="settings-navigation__panel" aria-label="Settings secondary navigation">
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

export default SettingsNavigation;
