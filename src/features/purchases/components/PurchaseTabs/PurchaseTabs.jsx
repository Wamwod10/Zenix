import "./PurchaseTabs.scss";

const PurchaseTabs = ({ tabs, activeTab, onChange, className = "" }) => (
  <div
    className={["purchase-tabs", className].filter(Boolean).join(" ")}
    role="tablist"
  >
    {tabs.map((tab) => {
      const Icon = tab.icon;
      const isActive = tab.id === activeTab;

      return (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={isActive}
          className={[
            "purchase-tabs__tab",
            isActive ? "purchase-tabs__tab--active" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onChange(tab.id)}
        >
          {Icon && <Icon size={14} />}
          <span>{tab.label}</span>
          {typeof tab.count === "number" && tab.count > 0 && (
            <span className="purchase-tabs__count">{tab.count}</span>
          )}
        </button>
      );
    })}
  </div>
);

export default PurchaseTabs;
