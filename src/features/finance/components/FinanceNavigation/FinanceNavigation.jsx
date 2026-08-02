import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import "./FinanceNavigation.scss";

const FinanceNavigation = ({ groups, activeView, onNavigate }) => {
  const initialGroup = useMemo(
    () => groups.find((group) => group.items.some((item) => item.id === activeView))?.id || groups[0]?.id,
    [activeView, groups],
  );
  const [openGroup, setOpenGroup] = useState(initialGroup);

  useEffect(() => {
    setOpenGroup(initialGroup);
  }, [initialGroup]);

  return (
    <nav className="finance-navigation" aria-label="Moliya ichki navigatsiyasi">
      {groups.map((group) => {
        const isOpen = openGroup === group.id;
        const hasActive = group.items.some((item) => item.id === activeView);

        return (
          <section className={`finance-navigation__group ${isOpen ? "is-open" : ""}`} key={group.id}>
            <button
              type="button"
              className={`finance-navigation__group-trigger ${hasActive ? "is-active" : ""}`}
              aria-expanded={isOpen}
              onClick={() => setOpenGroup(isOpen ? "" : group.id)}
            >
              <span>{group.title}</span>
              <ChevronDown size={15} />
            </button>

            {isOpen && (
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
            )}
          </section>
        );
      })}
    </nav>
  );
};

export default FinanceNavigation;
