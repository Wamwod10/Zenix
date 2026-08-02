import { NavLink } from "react-router-dom";

import "./ProductsNavigation.scss";

const resolvePath = (path) => `/products/${path}`.replace(/\/$/, "");

const ProductsNavigation = ({ groups }) => (
  <nav className="products-navigation" aria-label="Mahsulotlar navigatsiyasi">
    {groups.map((group) => (
      <section className="products-navigation__group" key={group.id}>
        <span>{group.title}</span>
        <div>
          {group.items.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.id}
                className={({ isActive }) => (isActive ? "is-active" : "")}
                end={item.end}
                to={resolvePath(item.path)}
              >
                <Icon size={15} />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </section>
    ))}
  </nav>
);

export default ProductsNavigation;
