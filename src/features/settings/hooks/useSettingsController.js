import { useCallback, useMemo, useState } from "react";

import { settingsMockAdapter } from "../utils/settingsAdapters";
import { generateSettingsId } from "../utils/settingsIds";
import { validateSettingPatch } from "../utils/settingsValidation";
import { safeSettingsRead, safeSettingsWrite, settingsStorageKeys } from "../utils/settingsStorage";
import useRecentSettings from "./useRecentSettings";
import useSettingsAutosave from "./useSettingsAutosave";
import useSettingsFavorites from "./useSettingsFavorites";
import useSettingsHistory from "./useSettingsHistory";
import useSettingsSearch from "./useSettingsSearch";
import useSettingsStorage from "./useSettingsStorage";

const now = () => new Date().toISOString();

const useSettingsController = (pageId) => {
  const { state, setState, resetState } = useSettingsStorage();
  const { favorites, toggleFavorite } = useSettingsFavorites();
  const { recent, touchRecent } = useRecentSettings();
  const search = useSettingsSearch();
  const history = useSettingsHistory();
  const [role, setRoleValue] = useState(() => safeSettingsRead(settingsStorageKeys.role, "owner"));
  const [toast, setToast] = useState("");
  const [errors, setErrors] = useState({});
  const [activeModal, setActiveModal] = useState(null);
  const [progress, setProgress] = useState(null);
  const [dirtyCount, setDirtyCount] = useState(0);

  const addAudit = useCallback(
    ({ action, oldValue = "-", newValue = "-", reason = "Settings update", branch = "Toshkent HQ" }) => {
      setState((current) => ({
        ...current,
        auditLog: [
          {
            id: generateSettingsId("audit"),
            action,
            user: role,
            time: now(),
            device: "Codex Browser",
            ip: "192.168.1.77",
            branch,
            oldValue,
            newValue,
            reason,
          },
          ...current.auditLog,
        ],
      }));
    },
    [role, setState],
  );

  const showToast = useCallback((message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }, []);

  const saveSnapshot = useCallback(
    async () => settingsMockAdapter.save(pageId, state[pageId] || {}),
    [pageId, state],
  );

  const { autosaveStatus, setAutosaveStatus } = useSettingsAutosave({
    dirtyKey: dirtyCount,
    enabled: pageId !== "backup" && pageId !== "advanced",
    onSave: saveSnapshot,
  });

  const setRole = useCallback((nextRole) => {
    setRoleValue(nextRole);
    safeSettingsWrite(settingsStorageKeys.role, nextRole);
  }, []);

  const updatePageObject = useCallback(
    (targetPage, patch, options = {}) => {
      const validationErrors = validateSettingPatch(targetPage, patch);
      setErrors(validationErrors);
      if (Object.keys(validationErrors).length) {
        setAutosaveStatus("error");
        return false;
      }

      setState((current) => {
        const previous = current[targetPage] || {};
        const nextValue = { ...previous, ...patch };
        history.pushHistory({ pageId: targetPage, oldValue: previous, newValue: nextValue });

        return {
          ...current,
          [targetPage]: nextValue,
          versions: [
            {
              id: generateSettingsId("version"),
              pageId: targetPage,
              label: `${Object.keys(patch).join(", ")} updated`,
              time: now(),
              user: role,
            },
            ...current.versions,
          ],
        };
      });

      setDirtyCount((value) => value + 1);
      addAudit({
        action: options.action || "setting changed",
        oldValue: options.oldValue || "Previous settings",
        newValue: Object.keys(patch).join(", "),
        reason: options.reason || "Autosave flow",
      });
      return true;
    },
    [addAudit, history, role, setAutosaveStatus, setState],
  );

  const updateCollectionItem = useCallback(
    (collection, itemId, patch, action = "setting changed") => {
      setState((current) => ({
        ...current,
        [collection]: current[collection].map((item) =>
          item.id === itemId ? { ...item, ...patch } : item,
        ),
      }));
      setDirtyCount((value) => value + 1);
      addAudit({ action, oldValue: itemId, newValue: Object.keys(patch).join(", ") });
    },
    [addAudit, setState],
  );

  const createCollectionItem = useCallback(
    (collection, item, action = "item created") => {
      const next = { id: generateSettingsId(collection), status: "active", ...item };
      setState((current) => ({ ...current, [collection]: [next, ...current[collection]] }));
      setDirtyCount((value) => value + 1);
      addAudit({ action, oldValue: "-", newValue: next.name || next.code || next.id });
      showToast("Yangi yozuv yaratildi.");
    },
    [addAudit, setState, showToast],
  );

  const deleteCollectionItem = useCallback(
    (collection, itemId, action = "item deleted") => {
      setState((current) => ({
        ...current,
        [collection]: current[collection].filter((item) => item.id !== itemId),
      }));
      setDirtyCount((value) => value + 1);
      addAudit({ action, oldValue: itemId, newValue: "deleted" });
      showToast("Yozuv o'chirildi.");
    },
    [addAudit, setState, showToast],
  );

  const cyclePermission = useCallback(
    (moduleId, action) => {
      const order = ["allowed", "disabled", "hidden", "approval"];
      setState((current) => {
        const currentState = current.permissions[moduleId][action];
        const nextState = order[(order.indexOf(currentState) + 1) % order.length];
        return {
          ...current,
          permissions: {
            ...current.permissions,
            [moduleId]: {
              ...current.permissions[moduleId],
              [action]: nextState,
            },
          },
        };
      });
      addAudit({ action: "permission changed", oldValue: `${moduleId}.${action}`, newValue: "cycled" });
      showToast("Permission matrix yangilandi.");
    },
    [addAudit, setState, showToast],
  );

  const toggleIntegration = useCallback(
    async (integrationId) => {
      updateCollectionItem("integrations", integrationId, { status: "checking" }, "integration checking");
      const integration = state.integrations.find((item) => item.id === integrationId);
      const result = await settingsMockAdapter.testIntegration(integration?.name || integrationId);
      updateCollectionItem(
        "integrations",
        integrationId,
        { status: result.status, health: 97, lastSync: `${now().slice(0, 10)} ${now().slice(11, 16)}` },
        "integration connected",
      );
      showToast(`${result.name} test ${result.latency}ms.`);
    },
    [showToast, state.integrations, updateCollectionItem],
  );

  const runBackup = useCallback(async () => {
    setProgress({ label: "Backup yaratilmoqda", value: 18 });
    window.setTimeout(() => setProgress({ label: "Encrypting snapshot", value: 58 }), 380);
    window.setTimeout(() => setProgress({ label: "Sync simulation", value: 86 }), 760);
    const backup = await settingsMockAdapter.runBackup();
    setState((current) => ({
      ...current,
      backup: {
        ...current.backup,
        lastStatus: backup.status,
        history: [backup, ...current.backup.history],
      },
    }));
    setProgress(null);
    addAudit({ action: "backup created", newValue: backup.version, reason: "Manual backup" });
    showToast("Backup simulation yakunlandi.");
  }, [addAudit, setState, showToast]);

  const restoreBackup = useCallback((reason) => {
    if (!reason.trim()) {
      showToast("Restore uchun reason majburiy.");
      return;
    }
    setProgress({ label: "Restore approval simulation", value: 34 });
    window.setTimeout(() => setProgress(null), 1300);
    addAudit({ action: "restore started", oldValue: "current", newValue: "selected backup", reason });
    showToast("Restore simulation approvalga yuborildi.");
    setActiveModal(null);
  }, [addAudit, showToast]);

  const applyHistoryEntry = useCallback(
    (entry, mode) => {
      setState((current) => ({
        ...current,
        [entry.pageId]: mode === "undo" ? entry.oldValue : entry.newValue,
      }));
      addAudit({ action: mode === "undo" ? "setting undo" : "setting redo", newValue: entry.pageId });
      setDirtyCount((value) => value + 1);
    },
    [addAudit, setState],
  );

  const visibleMetrics = useMemo(
    () => ({
      users: state.users.filter((item) => item.status === "active").length,
      branches: state.branches.filter((item) => item.status === "active").length,
      warehouses: state.warehouses.filter((item) => item.status === "active").length,
      integrations: state.integrations.filter((item) => item.status === "connected").length,
      warnings:
        state.integrations.filter((item) => ["error", "checking"].includes(item.status)).length +
        (state.security.twoFactor ? 0 : 1),
      securityScore:
        72 +
        (state.security.twoFactor ? 10 : 0) +
        (state.security.minPasswordLength >= 12 ? 8 : 0) +
        (state.backup.encryption ? 6 : 0),
    }),
    [state],
  );

  return {
    state,
    role,
    errors,
    toast,
    progress,
    autosaveStatus,
    activeModal,
    favorites,
    recent,
    search,
    history,
    metrics: visibleMetrics,
    actions: {
      setRole,
      setActiveModal,
      touchRecent,
      toggleFavorite,
      updatePageObject,
      updateCollectionItem,
      createCollectionItem,
      deleteCollectionItem,
      cyclePermission,
      toggleIntegration,
      runBackup,
      restoreBackup,
      undo: () => history.undo(applyHistoryEntry),
      redo: () => history.redo(applyHistoryEntry),
      resetState,
      addAudit,
      showToast,
    },
  };
};

export default useSettingsController;
