import { useRef } from "react";

import "./CustomerProfileTabs.scss";

const CustomerProfileTabs = ({
  tabs = [],
  activeTab,
  onChange,
  ariaLabel = "Mijoz profili bo‘limlari",
}) => {
  const tabRefs = useRef([]);

  const enabledTabs = tabs.filter((tab) => !tab.disabled);

  const focusTab = (tabId) => {
    const tabIndex = tabs.findIndex((tab) => tab.id === tabId);

    if (tabIndex >= 0) {
      tabRefs.current[tabIndex]?.focus();
    }
  };

  const handleKeyDown = (event, currentTab) => {
    const currentEnabledIndex = enabledTabs.findIndex(
      (tab) => tab.id === currentTab.id,
    );

    if (currentEnabledIndex < 0) {
      return;
    }

    let nextTab;

    if (event.key === "ArrowRight") {
      event.preventDefault();
      nextTab = enabledTabs[(currentEnabledIndex + 1) % enabledTabs.length];
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      nextTab =
        enabledTabs[
          (currentEnabledIndex - 1 + enabledTabs.length) % enabledTabs.length
        ];
    }

    if (event.key === "Home") {
      event.preventDefault();
      nextTab = enabledTabs[0];
    }

    if (event.key === "End") {
      event.preventDefault();
      nextTab = enabledTabs[enabledTabs.length - 1];
    }

    if (nextTab) {
      onChange(nextTab.id);
      focusTab(nextTab.id);
    }
  };

  return (
    <nav className="crm-customer-profile-tabs" aria-label={ariaLabel}>
      <div
        className="crm-customer-profile-tabs__scroll"
        role="tablist"
        aria-orientation="horizontal"
      >
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const selected = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              className={`crm-customer-profile-tabs__tab ${
                selected ? "crm-customer-profile-tabs__tab--active" : ""
              }`}
              id={`crm-customer-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`crm-customer-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, tab)}
            >
              {Icon ? <Icon aria-hidden="true" /> : null}

              <span>{tab.label}</span>

              {tab.badge !== undefined && tab.badge !== null ? (
                <small aria-label={`${tab.badge} ta`}>{tab.badge}</small>
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default CustomerProfileTabs;
