import { GlassSelect } from "@/components/ui";
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Download,
  Layers3,
  LoaderCircle,
  UserRoundCheck,
  X,
} from "lucide-react";

import "./BulkActionBar.scss";

const normalizeOptions = (options = []) =>
  options.map((option) => {
    if (typeof option === "string") {
      return {
        value: option,
        label: option,
      };
    }

    return {
      value: option.value ?? option.id ?? "",
      label: option.label ?? option.name ?? option.title ?? "",
    };
  });

const BulkActionBar = ({
  selectedCount = 0,
  groupOptions = [],
  statusOptions = [],
  loading = false,
  onClear,
  onExport,
  onGroupChange,
  onStatusChange,
}) => {
  const [actionType, setActionType] = useState("");
  const [actionValue, setActionValue] = useState("");

  const normalizedGroups = useMemo(
    () => normalizeOptions(groupOptions),
    [groupOptions],
  );

  const normalizedStatuses = useMemo(
    () => normalizeOptions(statusOptions),
    [statusOptions],
  );

  const availableActions = useMemo(() => {
    const actions = [];

    if (typeof onGroupChange === "function" && normalizedGroups.length > 0) {
      actions.push({
        value: "group",
        label: "Guruhga o‘tkazish",
        icon: Layers3,
        options: normalizedGroups,
      });
    }

    if (typeof onStatusChange === "function" && normalizedStatuses.length > 0) {
      actions.push({
        value: "status",
        label: "Holatni o‘zgartirish",
        icon: UserRoundCheck,
        options: normalizedStatuses,
      });
    }

    return actions;
  }, [normalizedGroups, normalizedStatuses, onGroupChange, onStatusChange]);

  const activeAction = availableActions.find(
    (action) => action.value === actionType,
  );

  useEffect(() => {
    if (
      actionType &&
      !availableActions.some((action) => action.value === actionType)
    ) {
      setActionType("");
      setActionValue("");
    }
  }, [actionType, availableActions]);

  useEffect(() => {
    setActionValue("");
  }, [actionType]);

  if (selectedCount <= 0) {
    return null;
  }

  const handleApply = () => {
    if (!actionType || !actionValue || loading) {
      return;
    }

    if (actionType === "group" && typeof onGroupChange === "function") {
      onGroupChange(actionValue);
    }

    if (actionType === "status" && typeof onStatusChange === "function") {
      onStatusChange(actionValue);
    }

    setActionType("");
    setActionValue("");
  };

  const handleClear = () => {
    if (loading || typeof onClear !== "function") {
      return;
    }

    onClear();
  };

  const handleExport = () => {
    if (loading || typeof onExport !== "function") {
      return;
    }

    onExport();
  };

  const ActiveIcon = activeAction?.icon;

  return (
    <aside
      className="crm-bulk-action-bar"
      aria-label="Tanlangan mijozlar uchun amallar"
    >
      <div className="crm-bulk-action-bar__selection">
        <span className="crm-bulk-action-bar__selection-icon">
          <Check aria-hidden="true" />
        </span>

        <div className="crm-bulk-action-bar__selection-copy">
          <strong>{selectedCount} ta mijoz tanlandi</strong>
          <span>Amal faqat tanlangan mijozlarga qo‘llanadi</span>
        </div>
      </div>

      <div className="crm-bulk-action-bar__controls">
        {availableActions.length > 0 ? (
          <div className="crm-bulk-action-bar__action-fields">
            <div className="crm-bulk-action-bar__field">
              <label htmlFor="crm-bulk-action-type">Amal</label>

              <GlassSelect
                id="crm-bulk-action-type"
                value={actionType}
                disabled={loading}
                onChange={(event) => setActionType(event.target.value)}
              >
                <option value="">Amalni tanlang</option>

                {availableActions.map((action) => (
                  <option key={action.value} value={action.value}>
                    {action.label}
                  </option>
                ))}
              </GlassSelect>
            </div>

            {activeAction ? (
              <div className="crm-bulk-action-bar__field">
                <label htmlFor="crm-bulk-action-value">
                  {activeAction.label}
                </label>

                <div className="crm-bulk-action-bar__value-control">
                  {ActiveIcon ? <ActiveIcon aria-hidden="true" /> : null}

                  <GlassSelect
                    id="crm-bulk-action-value"
                    value={actionValue}
                    disabled={loading}
                    onChange={(event) => setActionValue(event.target.value)}
                  >
                    <option value="">Qiymatni tanlang</option>

                    {activeAction.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </GlassSelect>
                </div>
              </div>
            ) : null}

            <button
              className="crm-bulk-action-bar__apply"
              type="button"
              disabled={!actionType || !actionValue || loading}
              onClick={handleApply}
            >
              {loading ? (
                <LoaderCircle
                  className="crm-bulk-action-bar__spinner"
                  aria-hidden="true"
                />
              ) : (
                <Check aria-hidden="true" />
              )}

              <span>{loading ? "Saqlanmoqda" : "Qo‘llash"}</span>
            </button>
          </div>
        ) : null}

        <div className="crm-bulk-action-bar__secondary-actions">
          <button
            className="crm-bulk-action-bar__export"
            type="button"
            disabled={loading || typeof onExport !== "function"}
            onClick={handleExport}
          >
            <Download aria-hidden="true" />
            <span>CSV eksport</span>
          </button>

          <button
            className="crm-bulk-action-bar__clear"
            type="button"
            disabled={loading}
            aria-label="Barcha tanlovni bekor qilish"
            onClick={handleClear}
          >
            <X aria-hidden="true" />
            <span>Bekor qilish</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default BulkActionBar;
