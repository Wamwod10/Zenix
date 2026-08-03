import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";

import { businessOSActions } from "../../../core/businessOS/businessOSSlice";
import { settingsMockAdapter } from "../utils/settingsAdapters";
import { generateSettingsId } from "../utils/settingsIds";
import { canRunSettingsAction } from "../utils/settingsPermissions";
import { validateCollectionPatch, validateSettingPatch } from "../utils/settingsValidation";
import { safeSettingsRead, safeSettingsWrite, settingsStorageKeys } from "../utils/settingsStorage";
import useRecentSettings from "./useRecentSettings";
import useSettingsAutosave from "./useSettingsAutosave";
import useSettingsFavorites from "./useSettingsFavorites";
import useSettingsHistory from "./useSettingsHistory";
import useSettingsSearch from "./useSettingsSearch";
import useSettingsStorage from "./useSettingsStorage";

const now = () => new Date().toISOString();

const useSettingsController = (pageId) => {
  const dispatch = useDispatch();
  const { state, setState, persistState, resetState } = useSettingsStorage();
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
  const [selectedBackup, setSelectedBackup] = useState(null);
  const toastTimer = useRef(null);
  const backupTimers = useRef([]);

  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
      backupTimers.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  const addAudit = useCallback(
    ({ action, oldValue = "-", newValue = "-", reason = "Sozlama yangilandi", branch = "" }) => {
      setState((current) => ({
        ...current,
        auditLog: [
          {
            id: generateSettingsId("audit"),
            action,
            user: "Tizim",
            role,
            time: now(),
            device: "Joriy sessiya",
            ip: "",
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
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(""), 2200);
  }, []);

  const saveSnapshot = useCallback(
    async () => {
      const result = await settingsMockAdapter.save(pageId, state[pageId] || {});
      persistState(state);
      return result;
    },
    [pageId, persistState, state],
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

  const requireAction = useCallback(
    (targetPage, action) => {
      if (canRunSettingsAction(role, targetPage, action)) return true;
      showToast("Bu amal uchun ruxsat yo'q.");
      addAudit({
        action: "ruxsat rad etildi",
        oldValue: `${targetPage}.${action}`,
        newValue: role,
        reason: "Action-level permission tekshiruvi",
      });
      return false;
    },
    [addAudit, role, showToast],
  );

  const recordVersion = useCallback(
    (current, targetPage, label, userRole = role) => ({
      ...current,
      versions: [
        {
          id: generateSettingsId("version"),
          pageId: targetPage,
          label,
          time: now(),
          user: userRole,
        },
        ...current.versions,
      ],
    }),
    [role],
  );

  const updatePageObject = useCallback(
    (targetPage, patch, options = {}) => {
      if (!requireAction(targetPage, "edit")) return false;
      const validationErrors = validateSettingPatch(targetPage, patch);
      setErrors((current) => {
        const next = { ...current };
        Object.keys(patch).forEach((key) => delete next[key]);
        return { ...next, ...validationErrors };
      });
      if (Object.keys(validationErrors).length) {
        setAutosaveStatus("error");
        return false;
      }

      setState((current) => {
        const previous = current[targetPage] || {};
        const nextValue = { ...previous, ...patch };
        history.pushHistory({ pageId: targetPage, oldValue: previous, newValue: nextValue });

        return recordVersion({
          ...current,
          [targetPage]: nextValue,
        }, targetPage, `${Object.keys(patch).join(", ")} maydonlari yangilandi`);
      });

      setDirtyCount((value) => value + 1);
      if (targetPage === "currencies" || targetPage === "finance" || targetPage === "localization" || targetPage === "business" || targetPage === "notifications") {
        dispatch(
          businessOSActions.settingsChanged({
            ...(["finance", "currencies"].includes(targetPage) && patch.baseCurrency ? { baseCurrency: patch.baseCurrency } : {}),
            ...(targetPage === "localization" && patch.dateFormat ? { dateFormat: patch.dateFormat } : {}),
            ...(targetPage === "business" && patch.defaultBranch ? { defaultBranchId: patch.defaultBranch } : {}),
            ...(targetPage === "notifications" ? { notificationSettings: patch } : {}),
          }),
        );
      }
      addAudit({
        action: options.action || "sozlama o'zgartirildi",
        oldValue: options.oldValue || "Oldingi qiymat",
        newValue: Object.keys(patch).join(", "),
        reason: options.reason || "Autosave oqimi",
      });
      return true;
    },
    [addAudit, dispatch, history, recordVersion, requireAction, setAutosaveStatus, setState],
  );

  const updateCollectionItem = useCallback(
    (collection, itemId, patch, action = "yozuv o'zgartirildi") => {
      if (!requireAction(collection, "edit")) return false;
      const validationErrors = validateCollectionPatch(collection, patch, state[collection], itemId);
      setErrors((current) => {
        const next = { ...current };
        Object.keys(patch).forEach((key) => delete next[`${itemId}.${key}`]);
        return {
          ...next,
          ...Object.fromEntries(Object.entries(validationErrors).map(([key, value]) => [`${itemId}.${key}`, value])),
        };
      });
      if (Object.keys(validationErrors).length) {
        setAutosaveStatus("error");
        return false;
      }
      setState((current) => {
        const previous = current[collection].find((item) => item.id === itemId);
        const nextRows = current[collection].map((item) =>
          item.id === itemId ? { ...item, ...patch } : item,
        );
        history.pushHistory({ pageId: collection, oldValue: current[collection], newValue: nextRows });
        return recordVersion({ ...current, [collection]: nextRows }, collection, `${previous?.name || previous?.code || itemId} yangilandi`);
      });
      setDirtyCount((value) => value + 1);
      if (collection === "branches" || collection === "warehouses" || collection === "users") {
        dispatch(businessOSActions.settingsCollectionItemUpdated({ collection, itemId, patch }));
      }
      addAudit({ action, oldValue: itemId, newValue: Object.keys(patch).join(", ") });
      return true;
    },
    [addAudit, dispatch, history, recordVersion, requireAction, setAutosaveStatus, setState, state],
  );

  const createCollectionItem = useCallback(
    (collection, item, action = "yozuv yaratildi") => {
      if (!requireAction(collection, "create")) return false;
      const validationErrors = validateCollectionPatch(collection, item, state[collection]);
      setErrors((current) => ({ ...current, ...validationErrors }));
      if (Object.keys(validationErrors).length) {
        setAutosaveStatus("error");
        return false;
      }
      const next = { id: generateSettingsId(collection), status: "active", ...item };
      setState((current) => {
        const nextRows = [next, ...current[collection]];
        history.pushHistory({ pageId: collection, oldValue: current[collection], newValue: nextRows });
        return recordVersion({ ...current, [collection]: nextRows }, collection, `${next.name || next.code || next.id} yaratildi`);
      });
      setDirtyCount((value) => value + 1);
      if (collection === "branches" || collection === "warehouses" || collection === "users") {
        dispatch(businessOSActions.settingsCollectionItemCreated({ collection, item: next }));
      }
      addAudit({ action, oldValue: "-", newValue: next.name || next.code || next.id });
      showToast("Yangi yozuv yaratildi.");
      return true;
    },
    [addAudit, dispatch, history, recordVersion, requireAction, setAutosaveStatus, setState, showToast, state],
  );

  const deleteCollectionItem = useCallback(
    (collection, itemId, action = "yozuv o'chirildi") => {
      if (!requireAction(collection, "delete")) return false;
      const target = state[collection]?.find((item) => item.id === itemId);
      if (!window.confirm(`${target?.name || itemId} yozuvini arxivlashni tasdiqlaysizmi?`)) return false;
      setState((current) => {
        const nextRows = current[collection].map((item) =>
          item.id === itemId ? { ...item, status: "archived", active: false } : item,
        );
        history.pushHistory({ pageId: collection, oldValue: current[collection], newValue: nextRows });
        return recordVersion({ ...current, [collection]: nextRows }, collection, `${target?.name || itemId} arxivlandi`);
      });
      setDirtyCount((value) => value + 1);
      addAudit({ action, oldValue: itemId, newValue: "archived" });
      showToast("Yozuv arxivlandi.");
      return true;
    },
    [addAudit, history, recordVersion, requireAction, setState, showToast, state],
  );

  const cyclePermission = useCallback(
    (moduleId, action) => {
      if (!requireAction("permissions", "edit")) return;
      const order = ["allowed", "disabled", "hidden", "approval"];
      let auditOld = "disabled";
      let auditNext = "allowed";
      setState((current) => {
        const currentModule = current.permissions[moduleId] || {};
        const currentState = currentModule[action] || "disabled";
        const nextState = order[(order.indexOf(currentState) + 1) % order.length];
        auditOld = currentState;
        auditNext = nextState;
        const nextPermissions = {
          ...current.permissions,
          [moduleId]: {
            ...currentModule,
            [action]: nextState,
          },
        };
        history.pushHistory({ pageId: "permissions", oldValue: current.permissions, newValue: nextPermissions });
        return recordVersion({
          ...current,
          permissions: nextPermissions,
        }, "permissions", `${moduleId}.${action} ruxsati yangilandi`);
      });
      addAudit({ action: "ruxsat o'zgartirildi", oldValue: `${moduleId}.${action}: ${auditOld}`, newValue: auditNext });
      setDirtyCount((value) => value + 1);
      showToast("Ruxsatlar matritsasi yangilandi.");
    },
    [addAudit, history, recordVersion, requireAction, setState, showToast],
  );

  const toggleIntegration = useCallback(
    async (integrationId) => {
      if (!requireAction("integrations", "edit")) return;
      const integration = state.integrations.find((item) => item.id === integrationId);
      if (integration?.status === "checking") return;
      updateCollectionItem("integrations", integrationId, { status: "checking" }, "integration checking");
      const result = await settingsMockAdapter.testIntegration(integration?.name || integrationId);
      updateCollectionItem(
        "integrations",
        integrationId,
        {
          status: result.status,
          health: result.status === "connected" ? 97 : 42,
          lastSync: `${now().slice(0, 10)} ${now().slice(11, 16)}`,
          lastError: result.status === "error" ? result.message : "",
        },
        result.status === "connected" ? "integratsiya ulandi" : "integratsiya xatosi",
      );
      showToast(`${result.name}: ${result.message} (${result.latency}ms)`);
    },
    [requireAction, showToast, state.integrations, updateCollectionItem],
  );

  const runBackup = useCallback(async () => {
    if (!requireAction("backup", "create")) return;
    backupTimers.current.forEach((timer) => window.clearTimeout(timer));
    setProgress({ label: "Backup yaratilmoqda", value: 18 });
    backupTimers.current = [
      window.setTimeout(() => setProgress({ label: "Zaxira nusxa shifrlanmoqda", value: 58 }), 380),
      window.setTimeout(() => setProgress({ label: "Bulutga sinxronlanmoqda", value: 86 }), 760),
    ];
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
    addAudit({ action: "backup yaratildi", newValue: backup.version, reason: "Qo'lda backup" });
    setDirtyCount((value) => value + 1);
    showToast("Backup yaratildi.");
  }, [addAudit, requireAction, setState, showToast]);

  const restoreBackup = useCallback((reason) => {
    if (!requireAction("backup", "restore")) return false;
    if (!reason.trim()) {
      showToast("Tiklash sababini kiriting.");
      return false;
    }
    setProgress({ label: "Tiklash tasdiqlashga yuborildi", value: 34 });
    backupTimers.current.push(window.setTimeout(() => setProgress(null), 1300));
    addAudit({ action: "tiklash boshlandi", oldValue: "joriy holat", newValue: selectedBackup?.version || "tanlangan backup", reason });
    showToast("Tiklash so'rovi tasdiqlashga yuborildi.");
    setActiveModal(null);
    setSelectedBackup(null);
    return true;
  }, [addAudit, requireAction, selectedBackup, showToast]);

  const saveNow = useCallback(async () => {
    if (!requireAction(pageId, "edit")) return false;
    setAutosaveStatus("saving");
    try {
      await saveSnapshot();
      addAudit({ action: "qo'lda saqlandi", newValue: pageId, reason: "Saqlash tugmasi" });
      setAutosaveStatus("saved");
      showToast("Sozlamalar saqlandi.");
      return true;
    } catch {
      setAutosaveStatus("error");
      showToast("Saqlashda xatolik yuz berdi.");
      return false;
    }
  }, [addAudit, pageId, requireAction, saveSnapshot, setAutosaveStatus, showToast]);

  const applyHistoryEntry = useCallback(
    (entry, mode) => {
      setState((current) => ({
        ...current,
        [entry.pageId]: mode === "undo" ? entry.oldValue : entry.newValue,
        versions: [
          {
            id: generateSettingsId("version"),
            pageId: entry.pageId,
            label: mode === "undo" ? "Undo bajarildi" : "Redo bajarildi",
            time: now(),
            user: role,
          },
          ...current.versions,
        ],
      }));
      addAudit({ action: mode === "undo" ? "setting undo" : "setting redo", newValue: entry.pageId });
      setDirtyCount((value) => value + 1);
    },
    [addAudit, role, setState],
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
      storageUsage: state.advanced.storageUsage || state.monitoring.storage || 0,
      activeSessions: state.security.activeSessions || state.users.reduce((sum, user) => sum + (Number(user.activeSessions) || 0), 0),
      apiUsage: state.api.usage?.requestsToday || 0,
      aiUsage: state.ai.tokenUsage || 0,
      pendingApprovals: state.versions.filter((item) => ["backup", "permissions", "security"].includes(item.pageId)).length,
      securityScore: Math.max(0, Math.min(100,
        62 +
        (state.security.twoFactor ? 10 : 0) +
        (state.security.minPasswordLength >= 12 ? 8 : 0) +
        (state.backup.encryption ? 6 : 0) -
        (state.security.ipRestriction ? 0 : 6) -
        (state.security.passwordExpiration ? 0 : 4) -
        (state.security.emergencyLocked ? 12 : 0),
      )),
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
    selectedBackup,
    favorites,
    recent,
    search,
    history,
    metrics: visibleMetrics,
    actions: {
      setRole,
      setActiveModal,
      setSelectedBackup,
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
      saveNow,
      undo: () => history.undo(applyHistoryEntry),
      redo: () => history.redo(applyHistoryEntry),
      resetState,
      addAudit,
      showToast,
    },
  };
};

export default useSettingsController;
