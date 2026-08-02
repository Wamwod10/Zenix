import { NavLink } from "react-router-dom";

import "./HRNavigation.scss";

const HRNavigation = ({ groups, activeView }) => (
  <nav className="hr-navigation" aria-label="HR ichki navigatsiya">
    {groups.map((group) => (
      <section className="hr-navigation__group" key={group.id}>
        <h2>{group.title}</h2>
        <div aria-label={group.title}>
          {group.items.map((item) => {
            const Icon = item.icon;
            const selected = activeView === item.id;

            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.path === "/hr"}
                aria-current={selected ? "page" : undefined}
                className={selected ? "is-active" : ""}
              >
                {Icon && <Icon size={15} />}
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </section>
    ))}
  </nav>
);

export default HRNavigation;
