import { useMemo, useState } from "react";

import { financeRoles } from "../data/financePermissions";
import { financeAdapter } from "../utils/financeAdapters";
import {
  buildFinanceSummary,
  calculateCostBreakdown,
  calculateExchangeGainLoss,
  validateDoubleEntry,
} from "../utils/financeCalculations";
import {
  generateAuditId,
  generateJournalId,
  generateNotificationId,
  generateTransactionId,
} from "../utils/financeIds";
import {
  canFinance,
  getApprovalRequirement,
  getFinanceActionState,
} from "../utils/financePermissions";
import useFinanceStorage from "./useFinanceStorage";

const statusOrder = ["Draft", "Pending", "Approved", "Posted", "Reversed", "Cancelled", "Archived"];

const now = () => new Date().toISOString();

const auditEvent = (event, area = "transaction", by = "accountant.zenix") => ({
  id: generateAuditId(),
  at: now(),
  by,
  event,
  area,
});

const notification = (text, tone = "success") => ({
  id: generateNotificationId(),
  tone,
  text,
  read: false,
});

const addStateEvent = (state, event, area, roleUser) => ({
  ...state,
  auditLog: [auditEvent(event, area, roleUser), ...state.auditLog],
});

const useFinanceController = () => {
  const { state, setState, resetState } = useFinanceStorage();
  const [role, setRole] = useState("chiefAccountant");
  const [filters, setFilters] = useState({
    search: "",
    date: "",
    branch: "all",
    account: "all",
    currency: "all",
    type: "all",
  });
  const [activeModal, setActiveModal] = useState("");
  const [selectedTransactionId, setSelectedTransactionId] = useState(state.transactions[0]?.id || "");
  const [toast, setToast] = useState("");
  const [revaluation, setRevaluation] = useState(null);

  const currentUser = state.settings.currentUser;
  const selectedTransaction =
    state.transactions.find((item) => item.id === selectedTransactionId) ||
    state.transactions[0];

  const summary = useMemo(() => buildFinanceSummary(state), [state]);

  const filteredTransactions = useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    return state.transactions.filter((item) => {
      const haystack = `${item.id} ${item.reference} ${item.counterparty} ${item.description}`.toLowerCase();
      const matchesSearch = !query || haystack.includes(query);
      const matchesDate = !filters.date || item.date === filters.date;
      const matchesBranch = filters.branch === "all" || item.branch === filters.branch;
      const matchesAccount = filters.account === "all" || item.accountId === filters.account;
      const matchesCurrency = filters.currency === "all" || item.currency === filters.currency;
      const matchesType = filters.type === "all" || item.type === filters.type;

      return (
        matchesSearch &&
        matchesDate &&
        matchesBranch &&
        matchesAccount &&
        matchesCurrency &&
        matchesType
      );
    });
  }, [filters, state.transactions]);

  const addNotification = (text, tone = "success") => {
    setToast(text);
    setState((current) => ({
      ...current,
      notifications: [notification(text, tone), ...current.notifications],
    }));
  };

  const updateTransaction = (transactionId, updater, auditText) => {
    setState((current) => {
      const next = {
        ...current,
        transactions: current.transactions.map((item) => {
          if (item.id !== transactionId) {
            return item;
          }

          const updated = updater(item);
          return {
            ...updated,
            audit: [
              { at: now(), by: currentUser, event: auditText },
              ...(updated.audit || []),
            ],
          };
        }),
      };

      return addStateEvent(next, auditText, "transaction", currentUser);
    });
  };

  const createTransaction = (payload) => {
    const amount = Number(payload.amount || 0);
    const openPeriod = state.periods.find((period) => period.status === "open");

    if (!openPeriod) {
      addNotification("Yopiq periodga yozuv qo'shib bo'lmaydi.", "danger");
      return false;
    }

    if (amount <= 0) {
      addNotification("Tranzaksiya summasi musbat bo'lishi kerak.", "danger");
      return false;
    }

    if (payload.cashDirection === "out" && payload.accountId === "1000") {
      const cash = summary.cash;
      if (amount > cash) {
        addNotification("Negative cash: kassa qoldig'idan ortiq chiqim bloklandi.", "danger");
        return false;
      }
    }

    const created = {
      id: generateTransactionId(),
      date: payload.date || new Date().toISOString().slice(0, 10),
      type: payload.type || "expense",
      cashDirection: payload.cashDirection || (payload.type === "income" ? "in" : "out"),
      amount,
      currency: payload.currency || "UZS",
      accountId: payload.accountId || "1010",
      counterparty: payload.counterparty || "Yangi counterparty",
      reference: payload.reference || generateTransactionId().replace("TRX", "REF"),
      source: payload.source || "Manual",
      description: payload.description || "Manual finance transaction",
      status: payload.submit ? "Pending" : "Draft",
      createdBy: currentUser,
      approvedBy: "",
      branch: payload.branch || state.settings.branch,
      taxGroup: payload.taxGroup || "vat-standard",
      audit: [{ at: now(), by: currentUser, event: payload.submit ? "Submitted" : "Draft saved" }],
    };

    setState((current) =>
      addStateEvent(
        {
          ...current,
          transactions: [created, ...current.transactions],
        },
        `${created.id} yaratildi`,
        "transaction",
        currentUser,
      ),
    );
    setSelectedTransactionId(created.id);
    addNotification(payload.submit ? "Tasdiqqa yuborildi." : "Draft saqlandi.");
    return true;
  };

  const transitionTransaction = async (transactionId, nextStatus, reason = "") => {
    const transaction = state.transactions.find((item) => item.id === transactionId);
    if (!transaction) return;

    const currentIndex = statusOrder.indexOf(transaction.status);
    const nextIndex = statusOrder.indexOf(nextStatus);
    const forwardAllowed = nextIndex === currentIndex + 1 && nextIndex <= statusOrder.indexOf("Posted");
    const specialAllowed =
      (transaction.status !== "Posted" && nextStatus === "Cancelled") ||
      (transaction.status === "Posted" && nextStatus === "Reversed") ||
      nextStatus === "Archived";

    if (!forwardAllowed && !specialAllowed) {
      addNotification(`${transaction.status} -> ${nextStatus} ketma-ketligi bloklandi.`, "danger");
      return;
    }

    const actionByStatus = {
      Pending: "submit",
      Approved: "approve",
      Posted: "post",
      Reversed: "reverse",
      Cancelled: "reject",
      Archived: "view",
    };
    const action = actionByStatus[nextStatus] || "view";
    const actionState = getFinanceActionState({ role, action, transaction, currentUser });

    if (!actionState.allowed) {
      addNotification(actionState.reason, "danger");
      return;
    }

    if (nextStatus === "Posted") {
      await financeAdapter.postTransaction(transaction);
    }

    updateTransaction(
      transactionId,
      (item) => ({
        ...item,
        status: nextStatus,
        approvedBy: nextStatus === "Approved" ? currentUser : item.approvedBy,
        postedBy: nextStatus === "Posted" ? currentUser : item.postedBy,
        reverseReason: nextStatus === "Reversed" ? reason : item.reverseReason,
      }),
      `${transactionId} ${nextStatus}${reason ? `: ${reason}` : ""}`,
    );
    addNotification(`${nextStatus} holatiga o'tkazildi.`);
  };

  const rejectTransaction = (transactionId, reason) => {
    if (!reason) {
      addNotification("Reject uchun sabab majburiy.", "danger");
      return;
    }

    updateTransaction(
      transactionId,
      (item) => ({ ...item, status: "Cancelled", rejectionReason: reason }),
      `${transactionId} rejected: ${reason}`,
    );
    addNotification("Tranzaksiya bekor qilindi.", "warning");
  };

  const createJournal = (payload) => {
    const validation = validateDoubleEntry(payload.rows, state.accounts, state.periods);

    if (!validation.ok) {
      addNotification(validation.errors[0], "danger");
      return false;
    }

    const journal = {
      id: generateJournalId(),
      date: payload.date || new Date().toISOString().slice(0, 10),
      reference: payload.reference || "MANUAL",
      source: "Manual",
      description: payload.description,
      reason: payload.reason,
      attachmentName: payload.attachmentName,
      status: payload.submit ? "Pending" : "Draft",
      createdBy: currentUser,
      approvedBy: "",
      rows: payload.rows.map((row) => ({
        ...row,
        debit: Number(row.debit || 0),
        credit: Number(row.credit || 0),
      })),
      audit: [{ at: now(), by: currentUser, event: "Manual journal created" }],
    };

    setState((current) =>
      addStateEvent(
        { ...current, journals: [journal, ...current.journals] },
        `${journal.id} manual journal yaratildi`,
        "journal",
        currentUser,
      ),
    );
    addNotification("Manual journal saqlandi.");
    return true;
  };

  const approveJournal = (journalId) => {
    if (!canFinance(role, "approve")) {
      addNotification("Journal approve uchun ruxsat yo'q.", "danger");
      return;
    }

    setState((current) =>
      addStateEvent(
        {
          ...current,
          journals: current.journals.map((item) =>
            item.id === journalId
              ? { ...item, status: "Approved", approvedBy: currentUser }
              : item,
          ),
        },
        `${journalId} approved`,
        "journal",
        currentUser,
      ),
    );
    addNotification("Journal tasdiqlandi.");
  };

  const postJournal = (journalId) => {
    if (!canFinance(role, "post")) {
      addNotification("Journal post uchun ruxsat yo'q.", "danger");
      return;
    }

    setState((current) =>
      addStateEvent(
        {
          ...current,
          journals: current.journals.map((item) =>
            item.id === journalId ? { ...item, status: "Posted" } : item,
          ),
        },
        `${journalId} posted`,
        "journal",
        currentUser,
      ),
    );
    addNotification("Journal posted.");
  };

  const autoMatchReconciliation = async () => {
    await financeAdapter.importBankStatement();
    setState((current) => {
      const system = current.reconciliation.system.map((sys) => {
        const match = current.reconciliation.bank.find(
          (bank) => !bank.matched && !sys.matched && bank.amount === sys.amount,
        );
        return match ? { ...sys, matched: match.id } : sys;
      });
      const bank = current.reconciliation.bank.map((bankItem) => {
        const match = system.find((sys) => sys.matched === bankItem.id);
        return match ? { ...bankItem, matched: match.id } : bankItem;
      });

      return addStateEvent(
        {
          ...current,
          reconciliation: {
            ...current.reconciliation,
            system,
            bank,
            history: [
              { at: now(), by: currentUser, event: "Automatic matching ishga tushdi" },
              ...current.reconciliation.history,
            ],
          },
        },
        "Bank auto match",
        "reconciliation",
        currentUser,
      );
    });
    addNotification("Bank statement import va auto match bajarildi.");
  };

  const manualMatch = (systemId, bankId) => {
    setState((current) =>
      addStateEvent(
        {
          ...current,
          reconciliation: {
            ...current.reconciliation,
            system: current.reconciliation.system.map((item) =>
              item.id === systemId ? { ...item, matched: bankId } : item,
            ),
            bank: current.reconciliation.bank.map((item) =>
              item.id === bankId ? { ...item, matched: systemId } : item,
            ),
            history: [
              { at: now(), by: currentUser, event: `${systemId} -> ${bankId} manual match` },
              ...current.reconciliation.history,
            ],
          },
        },
        "Manual bank match",
        "reconciliation",
        currentUser,
      ),
    );
    addNotification("Manual match saqlandi.");
  };

  const closeReconciliation = () => {
    const unresolved = state.reconciliation.system.some((item) => !item.matched);
    if (unresolved) {
      addNotification("Unmatched transaction bor, sverka yopilmadi.", "danger");
      return;
    }
    addNotification("Bank reconciliation yopildi.");
  };

  const closePeriod = () => {
    const checklistOk = state.closingChecklist.every((item) => item.complete);
    if (!canFinance(role, "close")) {
      addNotification("Period yopish uchun ruxsat yo'q.", "danger");
      return;
    }
    if (!checklistOk) {
      addNotification("Checklist tugamaguncha period yopilmaydi.", "danger");
      return;
    }

    setState((current) =>
      addStateEvent(
        {
          ...current,
          periods: current.periods.map((period) =>
            period.id === current.settings.currentPeriodId
              ? { ...period, status: "closed", lockedBy: currentUser, closedAt: now() }
              : period,
          ),
        },
        `${current.settings.currentPeriodId} period locked`,
        "closing",
        currentUser,
      ),
    );
    addNotification("Financial period locked.");
  };

  const toggleChecklist = (checkId) => {
    setState((current) => ({
      ...current,
      closingChecklist: current.closingChecklist.map((item) =>
        item.id === checkId ? { ...item, complete: !item.complete } : item,
      ),
    }));
  };

  const reopenPeriod = (periodId, reason) => {
    if (!canFinance(role, "reopen")) {
      addNotification("Reopen faqat owner yoki chief accountant uchun.", "danger");
      return;
    }
    if (!reason?.trim()) {
      addNotification("Reopen uchun sabab majburiy.", "danger");
      return;
    }

    setState((current) =>
      addStateEvent(
        {
          ...current,
          periods: current.periods.map((period) =>
            period.id === periodId
              ? { ...period, status: "open", reopenReason: reason, lockedBy: "", closedAt: "" }
              : period,
          ),
        },
        `${periodId} reopened: ${reason}`,
        "closing",
        currentUser,
      ),
    );
    addNotification("Period qayta ochildi.", "warning");
  };

  const updateCostMethod = (method) => {
    if (!canFinance(role, "cost")) {
      addNotification("Tannarx usulini o'zgartirish uchun ruxsat yo'q.", "danger");
      return;
    }

    setState((current) =>
      addStateEvent(
        { ...current, costAccounting: { ...current.costAccounting, method } },
        `Cost method changed to ${method}`,
        "cost",
        currentUser,
      ),
    );
    addNotification("Tannarx usuli yangilandi.");
  };

  const updateTaxRate = (taxId, rate) => {
    const value = Number(rate);
    if (!canFinance(role, "tax") || value < 0) {
      addNotification("Tax rate noto'g'ri yoki ruxsat yo'q.", "danger");
      return;
    }

    setState((current) =>
      addStateEvent(
        {
          ...current,
          settings: {
            ...current.settings,
            taxRates: current.settings.taxRates.map((tax) =>
              tax.id === taxId ? { ...tax, rate: value, status: "review" } : tax,
            ),
          },
        },
        `${taxId} tax rate updated to ${value}`,
        "tax",
        currentUser,
      ),
    );
    addNotification("Tax stavka review holatida yangilandi.", "warning");
  };

  const updateCurrencyRate = (code, rate) => {
    const value = Number(rate);
    if (!canFinance(role, "currency") || value <= 0) {
      addNotification("Kurs musbat bo'lishi va ruxsat bo'lishi kerak.", "danger");
      return;
    }

    setState((current) =>
      addStateEvent(
        {
          ...current,
          currencies: current.currencies.map((currency) =>
            currency.code === code
              ? {
                  ...currency,
                  rate: value,
                  manualRate: value,
                  history: [...currency.history.slice(-5), value],
                  lastUpdated: now(),
                  updatedBy: currentUser,
                }
              : currency,
          ),
        },
        `${code} currency rate updated`,
        "currency",
        currentUser,
      ),
    );
    addNotification(`${code} kursi yangilandi.`);
  };

  const runRevaluation = (code, foreignAmount, newRate) => {
    const currency = state.currencies.find((item) => item.code === code);
    const result = calculateExchangeGainLoss({
      foreignAmount: Number(foreignAmount),
      oldRate: currency?.rate,
      newRate: Number(newRate),
      direction: "asset",
    });
    setRevaluation({ code, foreignAmount: Number(foreignAmount), newRate: Number(newRate), result });
    addNotification("Revaluation hisoblandi.");
  };

  const runAiAction = (insightId, action) => {
    const insight = state.aiInsights.find((item) => item.id === insightId);
    setState((current) =>
      addStateEvent(
        {
          ...current,
          aiInsights: current.aiInsights.map((item) =>
            item.id === insightId
              ? { ...item, status: action === "dismiss" ? "dismissed" : "resolved" }
              : item,
          ),
        },
        `${insight?.title || insightId}: ${action}`,
        "ai",
        currentUser,
      ),
    );

    if (action === "review transaction" && insight?.targetId) {
      setSelectedTransactionId(insight.targetId);
      setActiveModal("transaction-details");
    }
    if (action === "open approval") {
      setActiveModal("approvals");
    }
    addNotification("AI insight action bajarildi.");
  };

  const resolveEdgeCase = (edgeCaseId) => {
    setState((current) =>
      addStateEvent(
        {
          ...current,
          edgeCases: current.edgeCases.map((item) =>
            item.id === edgeCaseId ? { ...item, status: "resolved" } : item,
          ),
        },
        `${edgeCaseId} edge case resolved`,
        "edge-case",
        currentUser,
      ),
    );
    addNotification("Edge case resolution auditga yozildi.");
  };

  const markNotificationRead = (id) => {
    setState((current) => ({
      ...current,
      notifications: current.notifications.map((item) =>
        item.id === id ? { ...item, read: true } : item,
      ),
    }));
  };

  const costBreakdown = useMemo(
    () => calculateCostBreakdown(state.costAccounting),
    [state.costAccounting],
  );

  return {
    state,
    role,
    roles: financeRoles,
    filters,
    selectedTransaction,
    selectedTransactionId,
    filteredTransactions,
    summary,
    activeModal,
    toast,
    revaluation,
    currentUser,
    costBreakdown,
    approvalForSelected: selectedTransaction
      ? getApprovalRequirement(selectedTransaction.amount)
      : null,
    actionState: (action, transaction = selectedTransaction) =>
      getFinanceActionState({ role, action, transaction, currentUser }),
    actions: {
      setRole,
      setFilters,
      updateFilter: (key, value) =>
        setFilters((current) => ({ ...current, [key]: value })),
      setActiveModal,
      closeModal: () => setActiveModal(""),
      setSelectedTransactionId,
      createTransaction,
      submitTransaction: (id) => transitionTransaction(id, "Pending"),
      approveTransaction: (id) => transitionTransaction(id, "Approved"),
      postTransaction: (id) => transitionTransaction(id, "Posted"),
      reverseTransaction: (id, reason) => transitionTransaction(id, "Reversed", reason),
      rejectTransaction,
      createJournal,
      approveJournal,
      postJournal,
      autoMatchReconciliation,
      manualMatch,
      closeReconciliation,
      closePeriod,
      toggleChecklist,
      reopenPeriod,
      updateCostMethod,
      updateTaxRate,
      updateCurrencyRate,
      runRevaluation,
      runAiAction,
      resolveEdgeCase,
      markNotificationRead,
      resetState,
      addNotification,
    },
  };
};

export default useFinanceController;
