import { GlassSelect } from "@/components/ui";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowDownAZ,
  ArrowDownUp,
  Grid2X2,
  List,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import "./CustomerFilters.scss";

const loyaltyOptions = [
  {
    value: "all",
    label: "Barcha darajalar",
  },
  {
    value: "bronze",
    label: "Bronza",
  },
  {
    value: "silver",
    label: "Kumush",
  },
  {
    value: "gold",
    label: "Oltin",
  },
  {
    value: "platinum",
    label: "Platina",
  },
];

const sourceOptions = [
  {
    value: "all",
    label: "Barcha manbalar",
  },
  {
    value: "pos",
    label: "POS",
  },
  {
    value: "telegram",
    label: "Telegram",
  },
  {
    value: "website",
    label: "Veb-sayt",
  },
  {
    value: "referral",
    label: "Tavsiya",
  },
  {
    value: "import",
    label: "Import",
  },
  {
    value: "manual",
    label: "Qo‘lda kiritilgan",
  },
];

const debtOptions = [
  {
    value: "all",
    label: "Barcha qarz holatlari",
  },
  {
    value: "with-debt",
    label: "Qarzi mavjud",
  },
  {
    value: "no-debt",
    label: "Qarzi yo‘q",
  },
  {
    value: "over-limit",
    label: "Limitdan oshgan",
  },
];

const churnOptions = [
  {
    value: "all",
    label: "Barcha xavf darajalari",
  },
  {
    value: "high",
    label: "Yuqori xavf",
  },
  {
    value: "medium",
    label: "O‘rta xavf",
  },
  {
    value: "low",
    label: "Past xavf",
  },
];

const sortOptions = [
  {
    value: "lastPurchase",
    label: "Oxirgi xarid",
  },
  {
    value: "createdAt",
    label: "Qo‘shilgan sana",
  },
  {
    value: "name",
    label: "Mijoz nomi",
  },
  {
    value: "totalSpent",
    label: "Jami xarid",
  },
  {
    value: "orderCount",
    label: "Xaridlar soni",
  },
  {
    value: "debt",
    label: "Qarz miqdori",
  },
  {
    value: "ltv",
    label: "Mijoz qiymati",
  },
  {
    value: "churnRisk",
    label: "Yo'qotish xavfi",
  },
];

const filterTitles = {
  query: "Qidiruv",
  status: "Holat",
  group: "Guruh",
  loyalty: "Sodiqlik",
  source: "Manba",
  debt: "Qarz",
  churn: "Yo'qotish xavfi",
  tag: "Teg",
};

const findOptionLabel = (options, value) =>
  options.find((option) => option.value === value)?.label ||
  value;

const CustomerFilters = ({
  filters,
  actions,
  activeFilters = [],
  groups = [],
  statuses = [],
  tags = [],
  totalResults = 0,
}) => {
  const [isFilterPanelOpen, setIsFilterPanelOpen] =
    useState(false);

  const [searchValue, setSearchValue] = useState(
    filters.query || "",
  );
  const isSearching = searchValue.trim() !== (filters.query || "");

  useEffect(() => {
    setSearchValue(filters.query || "");
  }, [filters.query]);

  useEffect(() => {
    if (searchValue === filters.query) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      actions.setSearchQuery(searchValue.trim());
    }, 280);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    actions,
    filters.query,
    searchValue,
  ]);

  const statusOptions = useMemo(
    () => [
      {
        value: "all",
        label: "Barcha holatlar",
      },
      ...statuses.map((status) => ({
        value: status.id,
        label: status.label,
      })),
    ],
    [statuses],
  );

  const groupOptions = useMemo(
    () => [
      {
        value: "all",
        label: "Barcha guruhlar",
      },
      ...groups.map((group) => ({
        value: group.label,
        label: group.label,
      })),
    ],
    [groups],
  );

  const tagOptions = useMemo(
    () => [
      {
        value: "all",
        label: "Barcha teglar",
      },
      ...tags.map((tag) => ({
        value: tag,
        label: tag,
      })),
    ],
    [tags],
  );

  const getActiveFilterValue = (filter) => {
    const optionGroups = {
      status: statusOptions,
      group: groupOptions,
      loyalty: loyaltyOptions,
      source: sourceOptions,
      debt: debtOptions,
      churn: churnOptions,
      tag: tagOptions,
    };

    if (filter.id === "query") {
      return `“${filter.value}”`;
    }

    return findOptionLabel(
      optionGroups[filter.id] || [],
      filter.value,
    );
  };

  const handleClearSearch = () => {
    setSearchValue("");
    actions.setSearchQuery("");
  };

  const handleSortChange = (event) => {
    actions.setSort(
      event.target.value,
      filters.sortDirection,
    );
  };
  const visibleActiveFilters = activeFilters.slice(0, 4);
  const hiddenActiveFilterCount = Math.max(activeFilters.length - 4, 0);

  return (
    <section
      className="crm-customer-filters"
      aria-label="Mijozlarni qidirish va filtrlash"
    >
      <div className="crm-customer-filters__toolbar">
        <label className="crm-customer-filters__search">
          <Search
            size={17}
            strokeWidth={1.9}
            aria-hidden="true"
          />

          <span className="crm-customer-filters__sr-only">
            Mijoz qidirish
          </span>

          <input
            type="search"
            value={searchValue}
            placeholder="Ism, telefon, kompaniya yoki teg..."
            autoComplete="off"
            onChange={(event) =>
              setSearchValue(event.target.value)
            }
          />

          {searchValue && (
            <button
              type="button"
              aria-label="Qidiruv matnini tozalash"
              onClick={handleClearSearch}
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}

          {isSearching ? (
            <span className="crm-customer-filters__searching">
              Qidirilmoqda
            </span>
          ) : null}
        </label>

        <div className="crm-customer-filters__sort">
          <ArrowDownAZ
            size={15}
            strokeWidth={1.9}
            aria-hidden="true"
          />

          <label htmlFor="crm-customer-sort">
            Saralash
          </label>

          <GlassSelect
            id="crm-customer-sort"
            value={filters.sortBy}
            onChange={handleSortChange}
          >
            {sortOptions.map((option) => (
              <option
                value={option.value}
                key={option.value}
              >
                {option.label}
              </option>
            ))}
          </GlassSelect>

          <button
            type="button"
            aria-label={
              filters.sortDirection === "desc"
                ? "Kamayish tartibida. O‘sish tartibiga almashtirish"
                : "O‘sish tartibida. Kamayish tartibiga almashtirish"
            }
            aria-pressed={
              filters.sortDirection === "asc"
            }
            onClick={() =>
              actions.toggleSort(filters.sortBy)
            }
          >
            <ArrowDownUp
              size={15}
              strokeWidth={1.9}
              aria-hidden="true"
            />
          </button>
        </div>

        <button
          className={`crm-customer-filters__filter-toggle ${
            isFilterPanelOpen ? "is-active" : ""
          }`}
          type="button"
          aria-expanded={isFilterPanelOpen}
          aria-controls="crm-customer-filter-panel"
          onClick={() =>
            setIsFilterPanelOpen((current) => !current)
          }
        >
          <SlidersHorizontal
            size={16}
            strokeWidth={1.9}
            aria-hidden="true"
          />

          <span>Filtrlar</span>

          {activeFilters.length > 0 && (
            <strong>{activeFilters.length}</strong>
          )}
        </button>

        <div
          className="crm-customer-filters__view"
          role="group"
          aria-label="Mijozlar ko‘rinishi"
        >
          <button
            className={
              filters.view === "table" ? "is-active" : ""
            }
            type="button"
            aria-label="Jadval ko‘rinishi"
            aria-pressed={filters.view === "table"}
            onClick={() => actions.setView("table")}
          >
            <List size={16} aria-hidden="true" />
          </button>

          <button
            className={
              filters.view === "cards" ? "is-active" : ""
            }
            type="button"
            aria-label="Kartalar ko‘rinishi"
            aria-pressed={filters.view === "cards"}
            onClick={() => actions.setView("cards")}
          >
            <Grid2X2 size={15} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="crm-customer-filters__result-line">
        <span>
          <strong>
            {totalResults.toLocaleString("uz-UZ")}
          </strong>{" "}
          ta mijoz topildi
        </span>

        {activeFilters.length > 0 && (
          <button
            type="button"
            onClick={actions.clearFilters}
          >
            <RotateCcw size={13} aria-hidden="true" />
            Barcha filtrlarni tozalash
          </button>
        )}
      </div>

      {isFilterPanelOpen && (
        <div
          className="crm-customer-filters__panel"
          id="crm-customer-filter-panel"
        >
          <label>
            <span>Mijoz holati</span>

            <GlassSelect
              value={filters.status}
              onChange={(event) =>
                actions.setFilter(
                  "status",
                  event.target.value,
                )
              }
            >
              {statusOptions.map((option) => (
                <option
                  value={option.value}
                  key={option.value}
                >
                  {option.label}
                </option>
              ))}
            </GlassSelect>
          </label>

          <label>
            <span>Mijoz guruhi</span>

            <GlassSelect
              value={filters.group}
              onChange={(event) =>
                actions.setFilter(
                  "group",
                  event.target.value,
                )
              }
            >
              {groupOptions.map((option) => (
                <option
                  value={option.value}
                  key={option.value}
                >
                  {option.label}
                </option>
              ))}
            </GlassSelect>
          </label>

          <label>
            <span>Sodiqlik darajasi</span>

            <GlassSelect
              value={filters.loyalty}
              onChange={(event) =>
                actions.setFilter(
                  "loyalty",
                  event.target.value,
                )
              }
            >
              {loyaltyOptions.map((option) => (
                <option
                  value={option.value}
                  key={option.value}
                >
                  {option.label}
                </option>
              ))}
            </GlassSelect>
          </label>

          <label>
            <span>Kelgan manba</span>

            <GlassSelect
              value={filters.source}
              onChange={(event) =>
                actions.setFilter(
                  "source",
                  event.target.value,
                )
              }
            >
              {sourceOptions.map((option) => (
                <option
                  value={option.value}
                  key={option.value}
                >
                  {option.label}
                </option>
              ))}
            </GlassSelect>
          </label>

          <label>
            <span>Qarz holati</span>

            <GlassSelect
              value={filters.debt}
              onChange={(event) =>
                actions.setFilter(
                  "debt",
                  event.target.value,
                )
              }
            >
              {debtOptions.map((option) => (
                <option
                  value={option.value}
                  key={option.value}
                >
                  {option.label}
                </option>
              ))}
            </GlassSelect>
          </label>

          <label>
            <span>Mijozni yo'qotish xavfi</span>

            <GlassSelect
              value={filters.churn}
              onChange={(event) =>
                actions.setFilter(
                  "churn",
                  event.target.value,
                )
              }
            >
              {churnOptions.map((option) => (
                <option
                  value={option.value}
                  key={option.value}
                >
                  {option.label}
                </option>
              ))}
            </GlassSelect>
          </label>

          <label>
            <span>Mijoz tegi</span>

            <GlassSelect
              value={filters.tag}
              onChange={(event) =>
                actions.setFilter(
                  "tag",
                  event.target.value,
                )
              }
            >
              {tagOptions.map((option) => (
                <option
                  value={option.value}
                  key={option.value}
                >
                  {option.label}
                </option>
              ))}
            </GlassSelect>
          </label>
        </div>
      )}

      {activeFilters.length > 0 && (
        <div
          className="crm-customer-filters__chips"
          aria-label="Faol filtrlar"
        >
          {visibleActiveFilters.map((filter) => (
            <span key={filter.id}>
              <small>
                {filterTitles[filter.id] || filter.id}
              </small>

              <strong>
                {getActiveFilterValue(filter)}
              </strong>

              <button
                type="button"
                aria-label={`${
                  filterTitles[filter.id] || filter.id
                } filtrini olib tashlash`}
                onClick={() =>
                  actions.removeFilter(filter.id)
                }
              >
                <X size={11} aria-hidden="true" />
              </button>
            </span>
          ))}

          {hiddenActiveFilterCount > 0 ? (
            <span className="crm-customer-filters__chips-more">
              +{hiddenActiveFilterCount} filtr
            </span>
          ) : null}
        </div>
      )}
    </section>
  );
};

export default CustomerFilters;
