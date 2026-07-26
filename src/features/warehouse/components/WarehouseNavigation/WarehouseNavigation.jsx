import "./WarehouseNavigation.scss";

const WarehouseNavigation = ({ groups, activeView, onNavigate }) => (
  <nav className="warehouse-navigation" aria-label="Warehouse secondary navigation">
    {groups.map((group) => (
      <section className="warehouse-navigation__group" key={group.id}>
        <span>{group.title}</span>
        <div>
          {group.items.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={activeView === item.id ? "is-active" : ""}
                type="button"
                aria-selected={activeView === item.id}
                onClick={() => onNavigate(item.id)}
              >
                {Icon && <Icon size={15} />}
                {item.label}
              </button>
            );
          })}
        </div>
      </section>
    ))}
  </nav>
);

export default WarehouseNavigation;
