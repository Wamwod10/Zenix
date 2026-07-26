const ProductsNavigation = ({ groups, activeView, onNavigate }) => (
  <nav className="products-navigation" aria-label="Mahsulotlar navigatsiyasi">
    {groups.map((group) => (
      <section className="products-navigation__group" key={group.id}>
        <span>{group.title}</span>
        <div>
          {group.items.map((item) => {
            const Icon = item.icon;

            return (
              <button
                type="button"
                key={item.id}
                className={activeView === item.id ? "is-active" : ""}
                aria-selected={activeView === item.id}
                onClick={() => onNavigate(item.id)}
              >
                <Icon size={15} />
                {item.label}
              </button>
            );
          })}
        </div>
      </section>
    ))}
  </nav>
);

export default ProductsNavigation;
