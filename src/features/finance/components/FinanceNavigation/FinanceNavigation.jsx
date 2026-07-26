import "./FinanceNavigation.scss";

const FinanceNavigation = ({ groups, activeView, onNavigate }) => (
  <nav className="finance-navigation" aria-label="Finance ichki navigatsiya">
    {groups.map((group) => (
      <section className="finance-navigation__group" key={group.id}>
        <h2>{group.title}</h2>
        <div role="tablist" aria-label={group.title}>
          {group.items.map((item) => {
            const Icon = item.icon;
            const selected = activeView === item.id;

            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                className={selected ? "is-active" : ""}
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

export default FinanceNavigation;
