import "./CategoryTabs.scss";

const CategoryTabs = ({
  categories = [],
  activeCategory,
  onSelectCategory,
}) => {
  return (
    <div
      className="pos-category-tabs"
      role="tablist"
      aria-label="POS kategoriyalar"
    >
      {categories.map((category) => {
        const isActive = category === activeCategory;

        return (
          <button
            className={isActive ? "is-active" : ""}
            type="button"
            role="tab"
            key={category}
            aria-selected={isActive}
            onClick={() => onSelectCategory?.(category)}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryTabs;
