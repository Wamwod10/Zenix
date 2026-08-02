export const actionStates = ["allowed", "disabled", "hidden", "approval"];

export const canAccessSettingsPage = (role, pageId) => {
  if (role === "owner") return true;
  if (pageId === "advanced") return false;
  if (["cashier", "viewer"].includes(role) && ["api", "backup", "security", "permissions"].includes(pageId)) {
    return false;
  }
  return true;
};

export const canEditSettingsPage = (role, pageId) =>
  !["viewer", "cashier"].includes(role) && canAccessSettingsPage(role, pageId);

export const canRunSettingsAction = (role, pageId, action = "edit") => {
  if (role === "owner") return true;
  if (!canAccessSettingsPage(role, pageId)) return false;
  if (["delete", "restore", "reset", "rotateSecret", "revokeSecret"].includes(action)) {
    return ["admin", "ceo"].includes(role);
  }
  if (["create", "edit", "import", "share", "export"].includes(action)) {
    return canEditSettingsPage(role, pageId);
  }
  return true;
};

export const getActionState = (matrix, moduleId, action) =>
  matrix?.[moduleId]?.[action] || "disabled";
