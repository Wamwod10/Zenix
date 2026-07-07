import { NavLink } from "react-router-dom";
import { ChevronLeft, Sparkles } from "lucide-react";
import { useNavigation } from "../../../hooks/useNavigation";
import "./Sidebar.scss";

const Sidebar = ({ collapsed = false, onToggle }) => {
  const { businessType, groups } = useNavigation();

  return (
    <div
      className={`zenix-sidebar ${collapsed ? "zenix-sidebar--collapsed" : ""}`}
    >
      <div className="zenix-sidebar__top">
        <div className="zenix-sidebar__brand">
          <div className="zenix-sidebar__logo">
            <span>Z</span>
          </div>

          {!collapsed && (
            <div className="zenix-sidebar__brand-copy">
              <strong>ZENIX</strong>
              <p>{businessType.workspaceLabel}</p>
            </div>
          )}
        </div>

        <button
          className={`zenix-sidebar__collapse ${
            collapsed ? "zenix-sidebar__collapse--collapsed" : ""
          }`}
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Sidebarni ochish" : "Sidebarni yopish"}
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      <nav className="zenix-sidebar__nav" aria-label="Dashboard navigation">
        {groups.map((group) => (
          <section className="zenix-sidebar__group" key={group.id}>
            {!collapsed && (
              <span className="zenix-sidebar__group-title">{group.title}</span>
            )}

            <div className="zenix-sidebar__items">
              {group.items.map((item, index) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.id}
                    to={item.route}
                    title={collapsed ? item.title : undefined}
                    style={{ "--item-index": index }}
                    className={({ isActive }) =>
                      [
                        "zenix-sidebar__item",
                        isActive ? "zenix-sidebar__item--active" : "",
                        item.premium ? "zenix-sidebar__item--premium" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")
                    }
                  >
                    <span className="zenix-sidebar__item-icon">
                      <Icon size={18} />
                    </span>

                    {!collapsed && (
                      <>
                        <span className="zenix-sidebar__item-text">
                          {item.title}
                        </span>

                        {item.premium && (
                          <span className="zenix-sidebar__item-badge">
                            <Sparkles size={12} />
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </section>
        ))}
      </nav>

      <div className="zenix-sidebar__bottom">
        <div className="zenix-sidebar__ai-card">
          <Sparkles size={18} />

          {!collapsed && (
            <div>
              <strong>ZENIX AI</strong>
              <p>Biznesingizni real vaqtda tahlil qiladi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
