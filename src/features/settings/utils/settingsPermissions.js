export const actionStates = ["allowed", "disabled", "hidden", "approval"];

export const canAccessSettingsPage = (role, pageId) => {
  if (role === "owner") return true;
  if (pageId === "advanced") return false;
  if (["cashier", "viewer"].includes(role) && ["api", "backup", "security", "permissions"].includes(pageId)) {
    return false;
  }
  return true;
};

export const getActionState = (matrix, moduleId, action) =>
  matrix?.[moduleId]?.[action] || "disabled";
