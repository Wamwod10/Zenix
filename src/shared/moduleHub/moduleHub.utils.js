export const MODULE_HUB_PERMISSION_STATES = Object.freeze({
  enabled: "enabled",
  disabled: "disabled",
  hidden: "hidden",
  approvalRequired: "approvalRequired",
});

const normalizePermissions = (permissions) => {
  if (!permissions) return null;
  if (Array.isArray(permissions)) return new Set(permissions);
  if (permissions instanceof Set) return permissions;
  return permissions;
};

export const resolveHubPermission = (item = {}, permissions) => {
  if (!item.permission) {
    return { state: MODULE_HUB_PERMISSION_STATES.enabled };
  }

  if (typeof permissions === "function") {
    const result = permissions(item.permission, item);
    if (typeof result === "string") return { state: result };
    return result || { state: MODULE_HUB_PERMISSION_STATES.enabled };
  }

  const normalizedPermissions = normalizePermissions(permissions);
  const permissionKey =
    typeof item.permission === "string" ? item.permission : item.permission.key;
  const fallback =
    typeof item.permission === "object"
      ? item.permission.fallback
      : MODULE_HUB_PERMISSION_STATES.enabled;

  if (!permissionKey) {
    return { state: MODULE_HUB_PERMISSION_STATES.enabled };
  }

  if (!normalizedPermissions) {
    return { state: fallback || MODULE_HUB_PERMISSION_STATES.enabled };
  }

  if (normalizedPermissions instanceof Set) {
    return {
      state: normalizedPermissions.has(permissionKey)
        ? MODULE_HUB_PERMISSION_STATES.enabled
        : fallback || MODULE_HUB_PERMISSION_STATES.disabled,
    };
  }

  const rule = normalizedPermissions[permissionKey];

  if (rule === true || rule === MODULE_HUB_PERMISSION_STATES.enabled) {
    return { state: MODULE_HUB_PERMISSION_STATES.enabled };
  }

  if (
    rule === MODULE_HUB_PERMISSION_STATES.hidden ||
    rule === MODULE_HUB_PERMISSION_STATES.disabled ||
    rule === MODULE_HUB_PERMISSION_STATES.approvalRequired
  ) {
    return {
      state: rule,
      reason: item.permission.reason,
    };
  }

  return {
    state: fallback || MODULE_HUB_PERMISSION_STATES.disabled,
    reason: item.permission.reason,
  };
};

export const resolveHubItemState = (item = {}, permissions) => {
  if (item.hidden) {
    return { hidden: true, disabled: true, reason: "" };
  }

  const permission = resolveHubPermission(item, permissions);

  if (permission.state === MODULE_HUB_PERMISSION_STATES.hidden) {
    return { hidden: true, disabled: true, reason: permission.reason || "" };
  }

  if (item.comingSoon) {
    return {
      hidden: false,
      disabled: true,
      reason: item.disabledReason || "Bu yo'nalish tez orada ishga tushadi.",
      statusText: "Tez orada",
    };
  }

  if (item.disabled) {
    return {
      hidden: false,
      disabled: true,
      reason: item.disabledReason || "Bu yo'nalish hozircha ochilmagan.",
      statusText: item.disabledLabel || "O'chirilgan",
    };
  }

  if (permission.state === MODULE_HUB_PERMISSION_STATES.approvalRequired) {
    return {
      hidden: false,
      disabled: false,
      reason: "",
    };
  }

  if (permission.state === MODULE_HUB_PERMISSION_STATES.disabled) {
    return {
      hidden: false,
      disabled: false,
      reason: "",
    };
  }

  return { hidden: false, disabled: false, reason: "" };
};

export const sortHubItems = (items = []) =>
  [...items].sort((first, second) => (first.order || 0) - (second.order || 0));

export const normalizeHubSections = (sections = [], permissions) =>
  sortHubItems(sections)
    .map((section) => ({
      ...section,
      items: sortHubItems(section.items || [])
        .map((item) => ({
          ...item,
          state: resolveHubItemState(item, permissions),
        }))
        .filter((item) => !item.state.hidden),
    }))
    .filter((section) => section.items.length > 0);
