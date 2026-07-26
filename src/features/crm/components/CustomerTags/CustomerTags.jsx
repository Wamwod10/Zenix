import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

import "./CustomerTags.scss";

const tagTones = ["plum", "forest", "cobalt", "rust", "gold", "slate"];

const getTagTone = (tag, index) => {
  if (tag && typeof tag === "object" && tag.tone) {
    return tag.tone;
  }

  const label = typeof tag === "string" ? tag : tag?.label || "";

  const characterTotal = Array.from(label).reduce(
    (total, character) => total + character.charCodeAt(0),
    index,
  );

  return tagTones[characterTotal % tagTones.length];
};

const normalizeTag = (tag, index) => {
  if (typeof tag === "string") {
    return {
      id: `${tag}-${index}`,
      label: tag,
      tone: getTagTone(tag, index),
      originalValue: tag,
    };
  }

  return {
    id: tag.id || `${tag.label}-${index}`,
    label: tag.label,
    tone: getTagTone(tag, index),
    originalValue: tag,
  };
};

const CustomerTags = ({
  tags = [],
  maxVisible = 3,
  removable = false,
  onRemove,
  onAdd,
  addLabel = "Teg qo‘shish",
  size = "md",
  className = "",
  emptyLabel,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const normalizedTags = useMemo(
    () => tags.map(normalizeTag).filter((tag) => Boolean(tag.label)),
    [tags],
  );

  const safeMaxVisible = Math.max(Number(maxVisible) || 1, 1);

  const hasHiddenTags = normalizedTags.length > safeMaxVisible;

  const visibleTags = isExpanded
    ? normalizedTags
    : normalizedTags.slice(0, safeMaxVisible);

  const hiddenCount = Math.max(normalizedTags.length - safeMaxVisible, 0);

  const classes = ["crm-customer-tags", `crm-customer-tags--${size}`, className]
    .filter(Boolean)
    .join(" ");

  if (normalizedTags.length === 0 && !onAdd && !emptyLabel) {
    return null;
  }

  return (
    <div className={classes}>
      {normalizedTags.length === 0 && emptyLabel && (
        <span className="crm-customer-tags__empty">{emptyLabel}</span>
      )}

      {visibleTags.map((tag) => (
        <span
          className={`crm-customer-tags__tag crm-customer-tags__tag--${tag.tone}`}
          key={tag.id}
        >
          <span>{tag.label}</span>

          {removable && onRemove && (
            <button
              type="button"
              aria-label={`${tag.label} tegini olib tashlash`}
              onClick={(event) => {
                event.stopPropagation();
                onRemove(tag.originalValue);
              }}
            >
              <X size={11} strokeWidth={2.2} aria-hidden="true" />
            </button>
          )}
        </span>
      ))}

      {hasHiddenTags && (
        <button
          className="crm-customer-tags__more"
          type="button"
          aria-expanded={isExpanded}
          onClick={(event) => {
            event.stopPropagation();
            setIsExpanded((currentValue) => !currentValue);
          }}
        >
          {isExpanded ? "Yopish" : `+${hiddenCount}`}
        </button>
      )}

      {onAdd && (
        <button
          className="crm-customer-tags__add"
          type="button"
          aria-label={addLabel}
          onClick={(event) => {
            event.stopPropagation();
            onAdd();
          }}
        >
          <Plus size={12} strokeWidth={2} aria-hidden="true" />
          <span>{addLabel}</span>
        </button>
      )}
    </div>
  );
};

export default CustomerTags;
