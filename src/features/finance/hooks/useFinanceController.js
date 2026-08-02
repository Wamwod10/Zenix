import { useMemo, useState } from "react";

import {
  ACCOUNT_KIND,
  ACCOUNT_STATUS,
  CASH_DIRECTION,
  DEFAULT_CURRENCY,
  FINANCE_ACTION,
  FINANCE_ROLE,
  FINANCE_SOURCE,
  PAYMENT_ORDER_STATUS,
  RECONCILIATION_STATUS,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
  transactionStatusOrder,
} from "../constants/financeConstants";
import { financeRoles } from "../data/financePermissions";
import { financeAdapter } from "../utils/financeAdapters";
import {
  buildPayableFromPurchase,
  buildReceivableFromInvoice,
  buildTransactionFromPosPayment,
  financeIntegrationSources,
} from "../utils/financeIntegrationAdapters";
import {
  buildFinanceSummary,
  calculateCostBreakdown,
  calculateExchangeGainLoss,
  validateDoubleEntry,
} from "../utils/financeCalculations";
import {
  generateAccountId,
  generateAuditId,
  generateBudgetId,
  generateFinanceId,
  generateInvoiceId,
  generateJournalId,
  generateNotificationId,
  generatePaymentOrderId,
  generateTransactionId,
} from "../utils/financeIds";
import {
  canFinance,
  getApprovalRequirement,
  getFinanceActionState,
} from "../utils/financePermissions";
import {
  addMoney,
  hasEnoughBalance,
  isPositiveMoney,
  normalizeMoneyInput,
  subtractMoney,
} from "../utils/financeMoney";
import useFinanceStorage from "./useFinanceStorage";

const statusOrder = transactionStatusOrder;

const now = () => new Date().toISOString();

const auditEvent = ({
  event,
  area = "transaction",
  by = "accountant.zenix",
  role = FINANCE_ROLE.ACCOUNTANT,
  action = FINANCE_ACTION.VIEW,
  oldValue = null,
  newValue = null,
  sourceId = "",
} = {}) => ({
  id: generateAuditId(),
  at: now(),
  by,
  role,
  event,
  action,
  area,
  oldValue,
  newValue,
  sourceId,
  device: typeof navigator === "undefined" ? "server" : navigator.userAgent,
});

const notification = (text, tone = "success") => ({
  id: generateNotificationId(),
  tone,
  text,
  read: false,
});

const requiredText = (value) => String(value || "").trim();

const documentPrefixByType = {
  [TRANSACTION_TYPE.INCOME]: "INC",
  [TRANSACTION_TYPE.EXPENSE]: "EXP",
  [TRANSACTION_TYPE.TRANSFER]: "TRF",
  [TRANSACTION_TYPE.REFUND]: "REF",
  [TRANSACTION_TYPE.ADJUSTMENT]: "ADJ",
  [TRANSACTION_TYPE.OPENING]: "OB",
  [TRANSACTION_TYPE.EXCHANGE]: "FX",
  invoice: "INV",
  "payment-order": "PAY",
};

const createDocumentNumber = (type, transactions = []) => {
  const prefix = documentPrefixByType[type] || "TRX";
  const sequence =
    transactions.filter((item) => String(item.reference || "").startsWith(`${prefix}-`)).length + 1;

  return `${prefix}-${String(sequence).padStart(6, "0")}`;
};

const createAutomaticJournal = (transaction, currentUser) => {
  const amount = normalizeMoneyInput(transaction.amount);
  const isIncome = transaction.type === TRANSACTION_TYPE.INCOME;
  const isExpense = transaction.type === TRANSACTION_TYPE.EXPENSE;
  const rows = isIncome
    ? [
        { accountId: transaction.accountId, debit: amount, credit: 0 },
        { accountId: "4000", debit: 0, credit: amount },
      ]
    : isExpense
      ? [
          { accountId: "5100", debit: amount, credit: 0 },
          { accountId: transaction.accountId, debit: 0, credit: amount },
        ]
      : [];

  if (!rows.length) return null;

  return {
    id: generateJournalId(),
    date: transaction.date,
    reference: transaction.reference,
    source: FINANCE_SOURCE.AUTOMATIC,
    description: transaction.description,
    reason: "Transaction approved",
    attachmentName: transaction.attachmentName || "",
    status: TRANSACTION_STATUS.POSTED,
    createdBy: currentUser,
    approvedBy: currentUser,
    rows,
    audit: [{ at: now(), by: currentUser, event: "Automatic journal created" }],
  };
};

const buildCsv = (rows = []) => rows.map((row) =>
  row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","),
).join("\n");

const addStateEvent = (state, event, area, roleUser, meta = {}) => ({
  ...state,
  auditLog: [
    auditEvent({
      event,
      area,
      by: roleUser,
      role: meta.role,
      action: meta.action,
      oldValue: meta.oldValue,
      newValue: meta.newValue,
      sourceId: meta.sourceId,
    }),
    ...state.auditLog,
  ],
});

const useFinanceController = () => {
  const { state, setState, resetState } = useFinanceStorage();
  const [role, setRole] = useState(FINANCE_ROLE.CHIEF_ACCOUNTANT);
  const [filters, setFilters] = useState({
    search: "",
    date: "",
    dateFrom: "",
    dateTo: "",
    status: "all",
    branch: "all",
    counterparty: "",
    category: "all",
    owner: "",
    amountMin: "",
    amountMax: "",
    account: "all",
    currency: "all",
    type: "all",
  });
  const [activeModal, setActiveModal] = useState("");
  const [selectedTransactionId, setSelectedTransactionId] = useState(state.transactions[0]?.id || "");
  const [toast, setToast] = useState("");
  const [revaluation, setRevaluation] = useState(null);

  const currentUser = state.settings.currentUser || `${role}.zenix`;
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
      const matchesDateFrom = !filters.dateFrom || item.date >= filters.dateFrom;
      const matchesDateTo = !filters.dateTo || item.date <= filters.dateTo;
      const matchesStatus = filters.status === "all" || item.status === filters.status;
      const matchesBranch = filters.branch === "all" || item.branch === filters.branch;
      const matchesCounterparty = !filters.counterparty || item.counterparty?.toLowerCase().includes(filters.counterparty.toLowerCase());
      const matchesCategory = filters.category === "all" || item.category === filters.category;
      const matchesOwner = !filters.owner || item.createdBy?.toLowerCase().includes(filters.owner.toLowerCase());
      const matchesAmountMin = !filters.amountMin || Number(item.amount || 0) >= Number(filters.amountMin);
      const matchesAmountMax = !filters.amountMax || Number(item.amount || 0) <= Number(filters.amountMax);
      const matchesAccount = filters.account === "all" || item.accountId === filters.account;
      const matchesCurrency = filters.currency === "all" || item.currency === filters.currency;
      const matchesType = filters.type === "all" || item.type === filters.type;

      return (
        matchesSearch &&
        matchesDate &&
        matchesDateFrom &&
        matchesDateTo &&
        matchesStatus &&
        matchesBranch &&
        matchesCounterparty &&
        matchesCategory &&
        matchesOwner &&
        matchesAmountMin &&
        matchesAmountMax &&
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
    const amount = normalizeMoneyInput(payload.amount);
    const openPeriod = state.periods.find((period) => period.status === "open");
    const existsAccount = state.accounts.some((account) => account.id === payload.accountId);
    const existsCurrency = state.currencies.some((currency) => currency.code === payload.currency);

    if (!openPeriod) {
      addNotification("Yopiq periodga yozuv qo'shib bo'lmaydi.", "danger");
      return false;
    }

    if (!isPositiveMoney(amount)) {
      addNotification("Tranzaksiya summasi musbat bo'lishi kerak.", "danger");
      return false;
    }

    if (!existsAccount) {
      addNotification("Moliyaviy hisob tanlanmagan yoki mavjud emas.", "danger");
      return false;
    }

    if (!existsCurrency) {
      addNotification("Valyuta tanlanmagan yoki mavjud emas.", "danger");
      return false;
    }

    if (!requiredText(payload.counterparty)) {
      addNotification("Hamkor nomi majburiy.", "danger");
      return false;
    }

    if (!requiredText(payload.description)) {
      addNotification("Tranzaksiya izohi majburiy.", "danger");
      return false;
    }

    if (payload.cashDirection === CASH_DIRECTION.OUT && payload.accountId === "1000") {
      const cash = summary.cash;
      if (!hasEnoughBalance({ balance: cash, amount, currency: payload.currency || DEFAULT_CURRENCY })) {
        addNotification("Negative cash: kassa qoldig'idan ortiq chiqim bloklandi.", "danger");
        return false;
      }
    }

    const created = {
      id: generateTransactionId(),
      date: payload.date || new Date().toISOString().slice(0, 10),
      type: payload.type || TRANSACTION_TYPE.EXPENSE,
      cashDirection: payload.cashDirection || (payload.type === TRANSACTION_TYPE.INCOME ? CASH_DIRECTION.IN : CASH_DIRECTION.OUT),
      amount,
      currency: payload.currency || DEFAULT_CURRENCY,
      accountId: payload.accountId || "1010",
      partnerType: payload.partnerType || "Other",
      counterparty: requiredText(payload.counterparty),
      category: payload.category || "Boshqa",
      reference: payload.reference || createDocumentNumber(payload.type || TRANSACTION_TYPE.EXPENSE, state.transactions),
      source: payload.source || FINANCE_SOURCE.MANUAL,
      description: requiredText(payload.description),
      status: payload.submit ? TRANSACTION_STATUS.PENDING : TRANSACTION_STATUS.DRAFT,
      createdBy: currentUser,
      approvedBy: "",
      branch: payload.branch || state.settings.branch,
      department: payload.department || "",
      project: payload.project || "",
      attachmentName: payload.attachmentName || "",
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
        { role, action: FINANCE_ACTION.CREATE, newValue: created, sourceId: created.id },
      ),
    );
    setSelectedTransactionId(created.id);
    addNotification(payload.submit ? "Tasdiqqa yuborildi." : "Qoralama saqlandi.");
    return true;
  };

  const transitionTransaction = async (transactionId, nextStatus, reason = "") => {
    const transaction = state.transactions.find((item) => item.id === transactionId);
    if (!transaction) return;

    const currentIndex = statusOrder.indexOf(transaction.status);
    const nextIndex = statusOrder.indexOf(nextStatus);
    const forwardAllowed = nextIndex === currentIndex + 1 && nextIndex <= statusOrder.indexOf(TRANSACTION_STATUS.POSTED);
    const specialAllowed =
      (transaction.status !== TRANSACTION_STATUS.POSTED && nextStatus === TRANSACTION_STATUS.CANCELLED) ||
      (transaction.status === TRANSACTION_STATUS.POSTED && nextStatus === TRANSACTION_STATUS.REVERSED) ||
      nextStatus === TRANSACTION_STATUS.ARCHIVED;

    if (!forwardAllowed && !specialAllowed) {
      addNotification(`${transaction.status} -> ${nextStatus} ketma-ketligi bloklandi.`, "danger");
      return;
    }

    const actionByStatus = {
      [TRANSACTION_STATUS.PENDING]: FINANCE_ACTION.SUBMIT,
      [TRANSACTION_STATUS.APPROVED]: FINANCE_ACTION.APPROVE,
      [TRANSACTION_STATUS.POSTED]: FINANCE_ACTION.POST,
      [TRANSACTION_STATUS.REVERSED]: FINANCE_ACTION.REVERSE,
      [TRANSACTION_STATUS.CANCELLED]: FINANCE_ACTION.REJECT,
      [TRANSACTION_STATUS.ARCHIVED]: FINANCE_ACTION.VIEW,
    };
    const action = actionByStatus[nextStatus] || FINANCE_ACTION.VIEW;
    const actionState = getFinanceActionState({ role, action, transaction, currentUser });

    if (!actionState.allowed) {
      addNotification(actionState.reason, "danger");
      return;
    }

    if (nextStatus === TRANSACTION_STATUS.POSTED) {
      await financeAdapter.postTransaction(transaction);
    }

    if (nextStatus === TRANSACTION_STATUS.APPROVED) {
      setState((current) => {
        const currentTransaction = current.transactions.find((item) => item.id === transactionId);
        const approvedTransaction = {
          ...currentTransaction,
          status: TRANSACTION_STATUS.APPROVED,
          approvedBy: currentUser,
          audit: [
            { at: now(), by: currentUser, event: `${transactionId} Approved` },
            ...(currentTransaction.audit || []),
          ],
        };
        const journal = createAutomaticJournal(approvedTransaction, currentUser);
        const amount = normalizeMoneyInput(approvedTransaction.amount);

        return addStateEvent(
          {
            ...current,
            accounts: current.accounts.map((account) => {
              if (account.id !== approvedTransaction.accountId) return account;

              return {
                ...account,
                openingBalance:
                  approvedTransaction.cashDirection === CASH_DIRECTION.IN
                    ? addMoney(account.openingBalance, amount, account.currency)
                    : approvedTransaction.cashDirection === CASH_DIRECTION.OUT
                      ? subtractMoney(account.openingBalance, amount, account.currency)
                      : normalizeMoneyInput(account.openingBalance),
              };
            }),
            transactions: current.transactions.map((item) =>
              item.id === transactionId ? approvedTransaction : item,
            ),
            journals: journal ? [journal, ...current.journals] : current.journals,
          },
          `${transactionId} Approved`,
          "transaction",
          currentUser,
          { role, action: FINANCE_ACTION.APPROVE, oldValue: currentTransaction, newValue: approvedTransaction, sourceId: transactionId },
        );
      });
      addNotification("Tasdiqlandi va buxgalteriya yozuvi yaratildi.");
      return;
    }

    updateTransaction(
      transactionId,
      (item) => ({
        ...item,
        status: nextStatus,
        approvedBy: nextStatus === TRANSACTION_STATUS.APPROVED ? currentUser : item.approvedBy,
        postedBy: nextStatus === TRANSACTION_STATUS.POSTED ? currentUser : item.postedBy,
        reverseReason: nextStatus === TRANSACTION_STATUS.REVERSED ? reason : item.reverseReason,
        cancelReason: nextStatus === TRANSACTION_STATUS.CANCELLED ? reason : item.cancelReason,
        archivedAt: nextStatus === TRANSACTION_STATUS.ARCHIVED ? now() : item.archivedAt,
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
    if (!canFinance(role, FINANCE_ACTION.APPROVE)) {
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
    if (!canFinance(role, FINANCE_ACTION.POST)) {
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

  const importBankStatement = async (payload = {}) => {
    const result = await financeAdapter.importBankStatement(payload);
    const bankAccounts = state.accounts.filter((account) => account.kind === ACCOUNT_KIND.BANK);
    const accountIds = new Set(bankAccounts.map((account) => account.id));
    const system = state.transactions
      .filter((transaction) => accountIds.has(transaction.accountId) && transaction.status === TRANSACTION_STATUS.POSTED)
      .slice(0, 20)
      .map((transaction) => ({
        id: `sys-${transaction.id}`,
        transactionId: transaction.id,
        date: transaction.date,
        reference: transaction.reference,
        counterparty: transaction.counterparty,
        description: transaction.description,
        amount: transaction.amount,
        direction: transaction.cashDirection,
        currency: transaction.currency,
        accountId: transaction.accountId,
        matched: "",
        matchStatus: RECONCILIATION_STATUS.UNMATCHED,
      }));
    const bank = system.map((item, index) => ({
      id: `bnk-${item.transactionId}`,
      date: item.date,
      reference: item.reference,
      counterparty: item.counterparty,
      description: item.description,
      amount: item.amount,
      direction: item.direction,
      currency: item.currency,
      accountId: item.accountId,
      matched: "",
      matchStatus: index === 0 && system.length > 1 ? RECONCILIATION_STATUS.DUPLICATE : RECONCILIATION_STATUS.UNMATCHED,
      sourceFile: result.source || payload.fileName || "bank-statement-preview.csv",
    }));

    setState((current) =>
      addStateEvent(
        {
          ...current,
          reconciliation: {
            ...current.reconciliation,
            status: RECONCILIATION_STATUS.OPEN,
            importFile: result.source || payload.fileName || "bank-statement-preview.csv",
            importedAt: now(),
            system: system.length ? system : current.reconciliation.system,
            bank: bank.length ? bank : current.reconciliation.bank,
            history: [
              {
                at: now(),
                by: currentUser,
                event: `${result.source || "Bank vipiskasi"} import qilindi`,
                file: result.source || payload.fileName || "bank-statement-preview.csv",
                account: payload.accountId || "all",
                matchRate: 0,
                difference: 0,
                status: RECONCILIATION_STATUS.OPEN,
              },
              ...current.reconciliation.history,
            ],
          },
        },
        "Bank vipiskasi import qilindi",
        "reconciliation",
        currentUser,
        { role, action: FINANCE_ACTION.CREATE, sourceId: result.source || "bank-statement" },
      ),
    );
    addNotification(system.length ? "Vipiska import qilindi." : "Import uchun bank tranzaksiyalari topilmadi.", system.length ? "success" : "warning");
    return true;
  };

  const autoMatchReconciliation = async () => {
    if (!state.reconciliation.system.length || !state.reconciliation.bank.length) {
      await importBankStatement();
    }
    setState((current) => {
      const system = current.reconciliation.system.map((sys) => {
        const match = current.reconciliation.bank.find(
          (bank) => !bank.matched && !sys.matched && bank.amount === sys.amount,
        );
        return match ? { ...sys, matched: match.id, matchStatus: RECONCILIATION_STATUS.FULL_MATCH } : { ...sys, matchStatus: RECONCILIATION_STATUS.UNMATCHED };
      });
      const bank = current.reconciliation.bank.map((bankItem) => {
        const match = system.find((sys) => sys.matched === bankItem.id);
        return match ? { ...bankItem, matched: match.id, matchStatus: RECONCILIATION_STATUS.FULL_MATCH } : bankItem;
      });

      return addStateEvent(
        {
          ...current,
          reconciliation: {
            ...current.reconciliation,
            system,
            bank,
            history: [
              { at: now(), by: currentUser, event: "Automatic matching ishga tushdi", matchRate: system.filter((item) => item.matched).length },
              ...current.reconciliation.history,
            ],
          },
        },
        "Bank auto match",
        "reconciliation",
        currentUser,
        { role, action: FINANCE_ACTION.CREATE, sourceId: current.reconciliation.importFile || "auto-match" },
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
              item.id === systemId ? { ...item, matched: bankId, matchStatus: RECONCILIATION_STATUS.MANUAL_MATCH } : item,
            ),
            bank: current.reconciliation.bank.map((item) =>
              item.id === bankId ? { ...item, matched: systemId, matchStatus: RECONCILIATION_STATUS.MANUAL_MATCH } : item,
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
        { role, action: FINANCE_ACTION.CREATE, sourceId: `${systemId}:${bankId}` },
      ),
    );
    addNotification("Manual match saqlandi.");
  };

  const closeReconciliation = () => {
    const unresolved = state.reconciliation.system.some((item) => !item.matched) || state.reconciliation.bank.some((item) => !item.matched && item.matchStatus !== RECONCILIATION_STATUS.DUPLICATE);
    if (unresolved) {
      addNotification("Sverkani yopishdan oldin farqlarni hal qiling.", "danger");
      return;
    }
    setState((current) =>
      addStateEvent(
        {
          ...current,
          reconciliation: {
            ...current.reconciliation,
            status: RECONCILIATION_STATUS.CLOSED,
            closedAt: now(),
            closedBy: currentUser,
            history: [
              { at: now(), by: currentUser, event: "Bank sverkasi yopildi", matchRate: current.reconciliation.system.length, difference: 0, status: RECONCILIATION_STATUS.CLOSED },
              ...current.reconciliation.history,
            ],
          },
        },
        "Bank sverkasi yopildi",
        "reconciliation",
        currentUser,
        { role, action: FINANCE_ACTION.CLOSE, sourceId: current.reconciliation.importFile || "reconciliation" },
      ),
    );
    addNotification("Bank sverkasi yopildi.");
  };

  const closePeriod = () => {
    const checklistOk = state.closingChecklist.length > 0 && state.closingChecklist.every((item) => item.complete);
    if (!canFinance(role, FINANCE_ACTION.CLOSE)) {
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
    if (!canFinance(role, FINANCE_ACTION.REOPEN)) {
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
    if (!canFinance(role, FINANCE_ACTION.COST)) {
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
    if (!canFinance(role, FINANCE_ACTION.TAX) || value < 0) {
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
    if (!canFinance(role, FINANCE_ACTION.CURRENCY) || value <= 0) {
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

  const createInvoice = (payload) => {
    const lineTotal = (payload.items || []).reduce((sum, item) => {
      const quantity = Number(item.quantity || 0);
      const price = Number(item.price || 0);
      const discount = (quantity * price * Number(item.discount || 0)) / 100;
      const tax = ((quantity * price - discount) * Number(item.tax || 0)) / 100;
      return sum + quantity * price - discount + tax;
    }, 0);
    const amount = Number(payload.amount || lineTotal || 0);
    if (!requiredText(payload.customer) || amount <= 0 || !payload.dueDate) {
      addNotification("Invoice uchun mijoz, muddat va musbat summa majburiy.", "danger");
      return false;
    }

    const invoice = {
      id: payload.number || generateInvoiceId(),
      number: payload.number || createDocumentNumber("invoice", state.transactions).replace("TRX", "INV"),
      date: payload.date || new Date().toISOString().slice(0, 10),
      customer: requiredText(payload.customer),
      customerDetails: payload.customerDetails || "",
      amount,
      paid: 0,
      dueDate: payload.dueDate,
      currency: payload.currency || "UZS",
      branch: payload.branch || state.settings.branch,
      owner: payload.owner || currentUser,
      accountId: payload.accountId || "1010",
      items: payload.items || [],
      discount: Number(payload.discount || 0),
      tax: Number(payload.tax || 0),
      status: "draft",
      description: requiredText(payload.description) || "Yangi hisob-faktura",
      attachmentName: payload.attachmentName || "",
    };
    const receivable = {
      id: generateFinanceId("AR"),
      customer: invoice.customer,
      invoice: invoice.id,
      total: amount,
      paid: 0,
      balance: amount,
      dueDate: invoice.dueDate,
      status: new Date(invoice.dueDate) < new Date() ? "overdue" : "open",
      reminders: [],
    };

    setState((current) =>
      addStateEvent(
        {
          ...current,
          invoices: [invoice, ...current.invoices],
          receivables: [receivable, ...current.receivables],
        },
        `${invoice.id} invoice yaratildi`,
        "invoice",
        currentUser,
      ),
    );
    addNotification("Hisob-faktura va debitor yozuvi yaratildi.");
    return true;
  };

  const recordInvoicePayment = (invoiceId, amount, accountId = "1010") => {
    const value = Number(amount || 0);
    const invoice = state.invoices.find((item) => item.id === invoiceId);
    if (!invoice || value <= 0 || value > invoice.amount - invoice.paid) {
      addNotification("To'lov summasi noto'g'ri.", "danger");
      return false;
    }

    const paid = invoice.paid + value;
    const status = paid >= invoice.amount ? "paid" : "partial";
    const transaction = {
      id: generateTransactionId(),
      date: new Date().toISOString().slice(0, 10),
      type: "income",
      cashDirection: "in",
      amount: value,
      currency: "UZS",
      accountId,
      counterparty: invoice.customer,
      reference: invoice.id,
      source: "CRM",
      description: `${invoice.id} bo'yicha to'lov`,
      status: "Posted",
      createdBy: currentUser,
      approvedBy: currentUser,
      postedBy: currentUser,
      branch: state.settings.branch,
      taxGroup: "vat-standard",
      audit: [{ at: now(), by: currentUser, event: "Invoice payment posted" }],
    };

    setState((current) =>
      addStateEvent(
        {
          ...current,
          invoices: current.invoices.map((item) =>
            item.id === invoiceId ? { ...item, paid, status } : item,
          ),
          receivables: current.receivables.map((item) =>
            item.invoice === invoiceId
              ? { ...item, paid, balance: Math.max(item.total - paid, 0), status }
              : item,
          ),
          transactions: [transaction, ...current.transactions],
        },
        `${invoiceId} to'lovi qabul qilindi`,
        "invoice",
        currentUser,
      ),
    );
    addNotification("Invoice to'lovi o'tkazildi.");
    return true;
  };

  const createPaymentOrder = (payload) => {
    const amount = normalizeMoneyInput(payload.amount);
    if (!canFinance(role, FINANCE_ACTION.CREATE)) {
      addNotification("To'lov topshirig'ini yaratish uchun ruxsat yo'q.", "danger");
      return false;
    }

    if (!requiredText(payload.supplier) || !isPositiveMoney(amount) || !payload.accountId) {
      addNotification("To'lov topshirig'i uchun yetkazib beruvchi, hisob va summa majburiy.", "danger");
      return false;
    }

    const order = {
      id: generatePaymentOrderId(),
      number: payload.number || createDocumentNumber("payment-order", state.paymentOrders),
      date: payload.date || new Date().toISOString().slice(0, 10),
      supplier: requiredText(payload.supplier),
      supplierTaxId: requiredText(payload.supplierTaxId),
      supplierAccountNumber: requiredText(payload.supplierAccountNumber),
      supplierBank: requiredText(payload.supplierBank),
      supplierMfo: requiredText(payload.supplierMfo),
      amount,
      accountId: payload.accountId,
      dueDate: payload.dueDate || payload.date || new Date().toISOString().slice(0, 10),
      status: payload.submit ? PAYMENT_ORDER_STATUS.PENDING : PAYMENT_ORDER_STATUS.DRAFT,
      approvedBy: "",
      reason: requiredText(payload.reason) || "Kreditor to'lovi",
      currency: payload.currency || DEFAULT_CURRENCY,
      paymentPurpose: requiredText(payload.paymentPurpose) || requiredText(payload.reason) || "Kreditor to'lovi",
      documentNumber: requiredText(payload.documentNumber),
      contractNumber: requiredText(payload.contractNumber),
      invoiceId: payload.invoiceId || "",
      payableId: payload.payableId || "",
      fee: normalizeMoneyInput(payload.fee),
      budgetCategory: requiredText(payload.budgetCategory),
      expenseCategory: requiredText(payload.expenseCategory),
      approver: requiredText(payload.approver),
      approvalStage: requiredText(payload.approvalStage) || "1-bosqich",
      priority: requiredText(payload.priority) || "normal",
      attachmentName: requiredText(payload.attachmentName),
      createdBy: currentUser,
      audit: [{ at: now(), by: currentUser, event: payload.submit ? "Submitted" : "Draft saved" }],
    };

    setState((current) =>
      addStateEvent(
        { ...current, paymentOrders: [order, ...current.paymentOrders] },
        `${order.id} to'lov topshirig'i yaratildi`,
        "payment-order",
        currentUser,
        { role, action: FINANCE_ACTION.CREATE, newValue: order, sourceId: order.id },
      ),
    );
    addNotification(payload.submit ? "To'lov topshirig'i tasdiqqa yuborildi." : "To'lov topshirig'i qoralama saqlandi.");
    return true;
  };

  const approvePaymentOrder = (orderId) => {
    if (!canFinance(role, FINANCE_ACTION.APPROVE)) {
      addNotification("To'lov topshirig'ini tasdiqlash uchun ruxsat yo'q.", "danger");
      return;
    }

    setState((current) =>
      addStateEvent(
        {
          ...current,
          paymentOrders: current.paymentOrders.map((item) =>
            item.id === orderId ? { ...item, status: PAYMENT_ORDER_STATUS.APPROVED, approvedBy: currentUser } : item,
          ),
        },
        `${orderId} to'lov topshirig'i tasdiqlandi`,
        "payment-order",
        currentUser,
        { role, action: FINANCE_ACTION.APPROVE, sourceId: orderId },
      ),
    );
    addNotification("To'lov topshirig'i tasdiqlandi.");
  };

  const rejectPaymentOrder = (orderId, reason = "") => {
    if (!requiredText(reason)) {
      addNotification("Rad etish sababi majburiy.", "danger");
      return false;
    }

    setState((current) =>
      addStateEvent(
        {
          ...current,
          paymentOrders: current.paymentOrders.map((item) =>
            item.id === orderId
              ? { ...item, status: PAYMENT_ORDER_STATUS.REJECTED, rejectReason: requiredText(reason), rejectedBy: currentUser }
              : item,
          ),
        },
        `${orderId} to'lov topshirig'i rad etildi`,
        "payment-order",
        currentUser,
        { role, action: FINANCE_ACTION.REJECT, sourceId: orderId },
      ),
    );
    addNotification("To'lov topshirig'i rad etildi.", "warning");
    return true;
  };

  const cancelPaymentOrder = (orderId, reason = "") => {
    setState((current) =>
      addStateEvent(
        {
          ...current,
          paymentOrders: current.paymentOrders.map((item) =>
            item.id === orderId
              ? { ...item, status: PAYMENT_ORDER_STATUS.CANCELLED, cancelReason: requiredText(reason), cancelledBy: currentUser }
              : item,
          ),
        },
        `${orderId} to'lov topshirig'i bekor qilindi`,
        "payment-order",
        currentUser,
        { role, action: FINANCE_ACTION.REJECT, sourceId: orderId },
      ),
    );
    addNotification("To'lov topshirig'i bekor qilindi.");
    return true;
  };

  const postPaymentOrder = (orderId) => {
    const order = state.paymentOrders.find((item) => item.id === orderId);
    if (!order || order.status !== PAYMENT_ORDER_STATUS.APPROVED) {
      addNotification("Faqat tasdiqlangan to'lov topshirig'i o'tkaziladi.", "danger");
      return;
    }

    const account = state.accounts.find((item) => item.id === order.accountId);
    if (account && !hasEnoughBalance({ balance: account.openingBalance, amount: order.amount, currency: account.currency })) {
      addNotification("Bank hisobida mablag' yetarli emas.", "danger");
      return;
    }

    const transaction = {
      id: generateTransactionId(),
      date: new Date().toISOString().slice(0, 10),
      type: TRANSACTION_TYPE.EXPENSE,
      cashDirection: CASH_DIRECTION.OUT,
      amount: order.amount,
      currency: order.currency || DEFAULT_CURRENCY,
      accountId: order.accountId,
      counterparty: order.supplier,
      reference: order.id,
      source: FINANCE_SOURCE.MANUAL,
      description: order.reason,
      status: TRANSACTION_STATUS.POSTED,
      createdBy: currentUser,
      approvedBy: order.approvedBy || currentUser,
      postedBy: currentUser,
      branch: state.settings.branch,
      taxGroup: "vat-standard",
      audit: [{ at: now(), by: currentUser, event: "Payment order posted" }],
    };

    setState((current) =>
      addStateEvent(
        {
          ...current,
          paymentOrders: current.paymentOrders.map((item) =>
            item.id === orderId ? { ...item, status: PAYMENT_ORDER_STATUS.PAID, paidAt: now(), postedBy: currentUser } : item,
          ),
          accounts: current.accounts.map((item) =>
            item.id === order.accountId
              ? { ...item, openingBalance: subtractMoney(item.openingBalance, order.amount, item.currency) }
              : item,
          ),
          transactions: [transaction, ...current.transactions],
        },
        `${orderId} to'lov topshirig'i o'tkazildi`,
        "payment-order",
        currentUser,
        { role, action: FINANCE_ACTION.POST, newValue: transaction, sourceId: orderId },
      ),
    );
    addNotification("To'lov topshirig'i tranzaksiyaga o'tkazildi.");
  };

  const createReminder = (receivableId) => {
    const receivable = state.receivables.find((item) => item.id === receivableId);
    if (!receivable) {
      addNotification("Debitor yozuvi topilmadi.", "danger");
      return;
    }

    const reminder = {
      id: generateFinanceId("REM"),
      receivableId,
      customer: receivable.customer,
      invoice: receivable.invoice,
      dueDate: receivable.dueDate,
      channel: "Telefon va SMS",
      status: "sent",
      createdAt: now(),
      createdBy: currentUser,
    };

    setState((current) =>
      addStateEvent(
        {
          ...current,
          reminders: [reminder, ...current.reminders],
          receivables: current.receivables.map((item) =>
            item.id === receivableId
              ? { ...item, reminders: [reminder.id, ...(item.reminders || [])] }
              : item,
          ),
        },
        `${receivableId} uchun eslatma yuborildi`,
        "receivable",
        currentUser,
      ),
    );
    addNotification(`${receivable.customer} uchun eslatma yuborildi.`);
  };

  const transferBetweenAccounts = (payload) => {
    const amount = normalizeMoneyInput(payload.amount);
    if (!canFinance(role, FINANCE_ACTION.CREATE)) {
      addNotification("Hisoblararo o'tkazma yaratish uchun ruxsat yo'q.", "danger");
      return false;
    }

    if (!payload.sourceId || !payload.destinationId || payload.sourceId === payload.destinationId) {
      addNotification("Manba va qabul qiluvchi hisoblar farqli bo'lishi kerak.", "danger");
      return false;
    }
    if (!isPositiveMoney(amount)) {
      addNotification("O'tkazma summasi musbat bo'lishi kerak.", "danger");
      return false;
    }

    const sourceAccount = state.accounts.find((account) => account.id === payload.sourceId);
    const destinationAccount = state.accounts.find((account) => account.id === payload.destinationId);

    if (!sourceAccount || !destinationAccount) {
      addNotification("O'tkazma hisoblari topilmadi.", "danger");
      return false;
    }

    if (sourceAccount.currency !== destinationAccount.currency && !Number(payload.rate || 0)) {
      addNotification("Turli valyutadagi o'tkazma uchun kurs majburiy.", "danger");
      return false;
    }

    if (!hasEnoughBalance({ balance: sourceAccount.openingBalance, amount, currency: sourceAccount.currency })) {
      addNotification("Manba hisobda mablag' yetarli emas.", "danger");
      return false;
    }

    const rate = Number(payload.rate || 1);
    const fee = normalizeMoneyInput(payload.fee || 0);
    const destinationAmount = sourceAccount.currency === destinationAccount.currency ? amount : amount * rate;

    const transfer = {
      id: generateFinanceId("TRF"),
      date: payload.date || new Date().toISOString().slice(0, 10),
      sourceId: payload.sourceId,
      destinationId: payload.destinationId,
      amount,
      destinationAmount,
      currency: sourceAccount.currency,
      destinationCurrency: destinationAccount.currency,
      rate,
      fee,
      documentNumber: payload.documentNumber || createDocumentNumber(TRANSACTION_TYPE.TRANSFER, state.transactions),
      reason: requiredText(payload.reason) || "Hisoblar o'rtasida o'tkazma",
      status: TRANSACTION_STATUS.POSTED,
      createdBy: currentUser,
    };

    setState((current) =>
      addStateEvent(
        {
          ...current,
          accounts: current.accounts.map((account) => {
            if (account.id === payload.sourceId) {
              return { ...account, openingBalance: subtractMoney(account.openingBalance, amount + fee, account.currency) };
            }
            if (account.id === payload.destinationId) {
              return { ...account, openingBalance: addMoney(account.openingBalance, destinationAmount, account.currency) };
            }
            return account;
          }),
          transfers: [transfer, ...current.transfers],
        },
        `${transfer.id} hisoblararo o'tkazma`,
        "transfer",
        currentUser,
        { role, action: FINANCE_ACTION.CREATE, newValue: transfer, sourceId: transfer.id },
      ),
    );
    addNotification("Hisoblar o'rtasida mablag' o'tkazildi.");
    return true;
  };

  const createFinanceAccount = (payload) => {
    if (!canFinance(role, FINANCE_ACTION.CREATE)) {
      addNotification("Hisob yaratish uchun ruxsat yo'q.", "danger");
      return false;
    }

    if (!requiredText(payload.name) || !payload.kind || !payload.currency) {
      addNotification("Hisob nomi, turi va valyutasi majburiy.", "danger");
      return false;
    }

    if (normalizeMoneyInput(payload.openingBalance) < 0) {
      addNotification("Boshlang'ich balans manfiy bo'lmasligi kerak.", "danger");
      return false;
    }

    const code = requiredText(payload.code) || String(9000 + state.accounts.length);
    if (state.accounts.some((account) => account.code === code)) {
      addNotification("Bu hisob kodi allaqachon mavjud.", "danger");
      return false;
    }

    const account = {
      id: generateAccountId(),
      code,
      name: requiredText(payload.name),
      kind: payload.kind,
      type: "asset",
      currency: payload.currency,
      openingBalance: normalizeMoneyInput(payload.openingBalance),
      active: true,
      status: ACCOUNT_STATUS.ACTIVE,
      bankName: requiredText(payload.bankName),
      accountNumber: requiredText(payload.accountNumber),
      mfo: requiredText(payload.mfo),
      branch: requiredText(payload.branch) || state.settings.branch,
      owner: requiredText(payload.owner) || currentUser,
      blockedAmount: normalizeMoneyInput(payload.blockedAmount),
      isMain: Boolean(payload.isMain),
      note: requiredText(payload.note),
      createdAt: now(),
      updatedAt: now(),
    };

    setState((current) =>
      addStateEvent(
        { ...current, accounts: [account, ...current.accounts] },
        `${account.name} hisobi yaratildi`,
        "account",
        currentUser,
        { role, action: FINANCE_ACTION.CREATE, newValue: account, sourceId: account.id },
      ),
    );
    addNotification("Yangi hisob yaratildi.");
    return true;
  };

  const updateFinanceAccount = (accountId, payload) => {
    const account = state.accounts.find((item) => item.id === accountId);

    if (!account) {
      addNotification("Hisob topilmadi.", "danger");
      return false;
    }

    if (!canFinance(role, FINANCE_ACTION.CREATE)) {
      addNotification("Hisobni tahrirlash uchun ruxsat yo'q.", "danger");
      return false;
    }

    if (!requiredText(payload.name) || !requiredText(payload.code) || !payload.currency) {
      addNotification("Hisob nomi, kodi va valyutasi majburiy.", "danger");
      return false;
    }

    if (state.accounts.some((item) => item.id !== accountId && item.code === requiredText(payload.code))) {
      addNotification("Bu hisob kodi allaqachon mavjud.", "danger");
      return false;
    }

    const updated = {
      ...account,
      ...payload,
      code: requiredText(payload.code),
      name: requiredText(payload.name),
      bankName: requiredText(payload.bankName),
      accountNumber: requiredText(payload.accountNumber),
      mfo: requiredText(payload.mfo),
      branch: requiredText(payload.branch) || account.branch,
      owner: requiredText(payload.owner) || account.owner || currentUser,
      blockedAmount: normalizeMoneyInput(payload.blockedAmount),
      note: requiredText(payload.note),
      updatedAt: now(),
    };

    setState((current) =>
      addStateEvent(
        {
          ...current,
          accounts: current.accounts.map((item) => (item.id === accountId ? updated : item)),
        },
        `${updated.name} hisobi tahrirlandi`,
        "account",
        currentUser,
        { role, action: FINANCE_ACTION.CREATE, oldValue: account, newValue: updated, sourceId: accountId },
      ),
    );
    addNotification("Hisob ma'lumotlari yangilandi.");
    return true;
  };

  const toggleFinanceAccount = (accountId) => {
    const account = state.accounts.find((item) => item.id === accountId);
    if (!account) {
      addNotification("Hisob topilmadi.", "danger");
      return;
    }

    setState((current) =>
      addStateEvent(
        {
          ...current,
          accounts: current.accounts.map((account) =>
            account.id === accountId
              ? {
                  ...account,
                  active: account.active === false,
                  status: account.active === false ? ACCOUNT_STATUS.ACTIVE : ACCOUNT_STATUS.INACTIVE,
                  updatedAt: now(),
                }
              : account,
          ),
        },
        `${accountId} hisob holati o'zgartirildi`,
        "account",
        currentUser,
        { role, action: FINANCE_ACTION.CREATE, oldValue: account, sourceId: accountId },
      ),
    );
    addNotification("Hisob holati yangilandi.");
  };

  const archiveFinanceAccount = (accountId) => {
    const account = state.accounts.find((item) => item.id === accountId);
    if (!account) {
      addNotification("Hisob topilmadi.", "danger");
      return false;
    }

    if (!canFinance(role, FINANCE_ACTION.ARCHIVE)) {
      addNotification("Hisobni arxivlash uchun ruxsat yo'q.", "danger");
      return false;
    }

    setState((current) =>
      addStateEvent(
        {
          ...current,
          accounts: current.accounts.map((item) =>
            item.id === accountId
              ? { ...item, active: false, status: ACCOUNT_STATUS.ARCHIVED, archivedAt: now(), updatedAt: now() }
              : item,
          ),
        },
        `${account.name} hisobi arxivlandi`,
        "account",
        currentUser,
        { role, action: FINANCE_ACTION.ARCHIVE, oldValue: account, sourceId: accountId },
      ),
    );
    addNotification("Hisob arxivlandi.");
    return true;
  };

  const openCashSession = (payload) => {
    const account = state.accounts.find((item) => item.id === payload.accountId && item.kind === ACCOUNT_KIND.CASH);

    if (!account) {
      addNotification("Kassa hisobi topilmadi.", "danger");
      return false;
    }

    if (state.cashSessions.some((session) => session.accountId === account.id && session.status === "open")) {
      addNotification("Bu kassa bo'yicha ochiq smena mavjud.", "danger");
      return false;
    }

    if (!canFinance(role, FINANCE_ACTION.CREATE)) {
      addNotification("Kassa smenasini ochish uchun ruxsat yo'q.", "danger");
      return false;
    }

    const openingBalance = normalizeMoneyInput(payload.openingBalance ?? account.openingBalance);
    const session = {
      id: generateFinanceId("CSH"),
      accountId: account.id,
      cashier: requiredText(payload.cashier) || currentUser,
      openedAt: now(),
      closedAt: "",
      openingBalance,
      systemBalance: openingBalance,
      actualBalance: null,
      difference: 0,
      status: "open",
      branch: account.branch || state.settings.branch,
    };

    setState((current) =>
      addStateEvent(
        {
          ...current,
          cashSessions: [session, ...current.cashSessions],
          accounts: current.accounts.map((item) =>
            item.id === account.id ? { ...item, openSessionId: session.id, cashier: session.cashier, shiftStatus: "open" } : item,
          ),
        },
        `${account.name} kassasi ochildi`,
        "cash",
        currentUser,
        { role, action: FINANCE_ACTION.CREATE, newValue: session, sourceId: session.id },
      ),
    );
    addNotification("Kassa smenasi ochildi.");
    return true;
  };

  const closeCashSession = (payload) => {
    const session = state.cashSessions.find((item) => item.accountId === payload.accountId && item.status === "open");
    const account = state.accounts.find((item) => item.id === payload.accountId);

    if (!session || !account) {
      addNotification("Yopiladigan ochiq kassa smenasi topilmadi.", "danger");
      return false;
    }

    const actualBalance = normalizeMoneyInput(payload.actualBalance);
    const systemBalance = normalizeMoneyInput(account.openingBalance);
    const difference = actualBalance - systemBalance;
    const updatedSession = {
      ...session,
      closedAt: now(),
      actualBalance,
      systemBalance,
      difference,
      closeReason: requiredText(payload.reason),
      status: "closed",
      closedBy: currentUser,
    };

    setState((current) =>
      addStateEvent(
        {
          ...current,
          cashSessions: current.cashSessions.map((item) => (item.id === session.id ? updatedSession : item)),
          accounts: current.accounts.map((item) =>
            item.id === account.id ? { ...item, openSessionId: "", shiftStatus: "closed", openingBalance: actualBalance } : item,
          ),
        },
        difference ? `${account.name} kassasi farq bilan yopildi` : `${account.name} kassasi yopildi`,
        "cash",
        currentUser,
        { role, action: FINANCE_ACTION.CLOSE, oldValue: session, newValue: updatedSession, sourceId: session.id },
      ),
    );
    addNotification(difference ? "Kassa smenasi farq bilan yopildi. Audit yozuvi yaratildi." : "Kassa smenasi yopildi.", difference ? "warning" : "success");
    return true;
  };

  const createCashOperation = (payload) => {
    const account = state.accounts.find((item) => item.id === payload.accountId && item.kind === ACCOUNT_KIND.CASH);
    const amount = normalizeMoneyInput(payload.amount);
    const direction = payload.direction === CASH_DIRECTION.OUT ? CASH_DIRECTION.OUT : CASH_DIRECTION.IN;

    if (!account) {
      addNotification("Kassa hisobi topilmadi.", "danger");
      return false;
    }

    if (!state.cashSessions.some((session) => session.accountId === account.id && session.status === "open")) {
      addNotification("Naqd operatsiya uchun avval kassa smenasini oching.", "danger");
      return false;
    }

    if (!isPositiveMoney(amount)) {
      addNotification("Kassa operatsiyasi summasi musbat bo'lishi kerak.", "danger");
      return false;
    }

    if (direction === CASH_DIRECTION.OUT && !hasEnoughBalance({ balance: account.openingBalance, amount, currency: account.currency })) {
      addNotification("Kassa qoldig'i yetarli emas.", "danger");
      return false;
    }

    const transaction = {
      id: generateTransactionId(),
      date: payload.date || new Date().toISOString().slice(0, 10),
      type: direction === CASH_DIRECTION.IN ? TRANSACTION_TYPE.INCOME : TRANSACTION_TYPE.EXPENSE,
      cashDirection: direction,
      amount,
      currency: account.currency,
      accountId: account.id,
      partnerType: "Other",
      counterparty: requiredText(payload.counterparty) || "Kassa operatsiyasi",
      category: payload.category || (direction === CASH_DIRECTION.IN ? "Qo'lda kirim" : "Qo'lda chiqim"),
      reference: payload.reference || createDocumentNumber(direction === CASH_DIRECTION.IN ? TRANSACTION_TYPE.INCOME : TRANSACTION_TYPE.EXPENSE, state.transactions),
      source: payload.source || FINANCE_SOURCE.MANUAL,
      description: requiredText(payload.reason) || "Kassa operatsiyasi",
      status: TRANSACTION_STATUS.POSTED,
      createdBy: currentUser,
      approvedBy: currentUser,
      postedBy: currentUser,
      branch: account.branch || state.settings.branch,
      sourceId: payload.sourceId || "",
      audit: [{ at: now(), by: currentUser, event: "Cash operation posted" }],
    };

    setState((current) =>
      addStateEvent(
        {
          ...current,
          accounts: current.accounts.map((item) =>
            item.id === account.id
              ? {
                  ...item,
                  openingBalance: direction === CASH_DIRECTION.IN
                    ? addMoney(item.openingBalance, amount, item.currency)
                    : subtractMoney(item.openingBalance, amount, item.currency),
                  lastCashOperationAt: now(),
                }
              : item,
          ),
          transactions: [transaction, ...current.transactions],
        },
        `${account.name} kassasida ${direction === CASH_DIRECTION.IN ? "kirim" : "chiqim"} saqlandi`,
        "cash",
        currentUser,
        { role, action: FINANCE_ACTION.POST, newValue: transaction, sourceId: transaction.id },
      ),
    );
    addNotification(direction === CASH_DIRECTION.IN ? "Kassa kirimi saqlandi." : "Kassa chiqimi saqlandi.");
    return true;
  };

  const ingestExternalFinanceEvent = (event = {}) => {
    if (!event.type) {
      addNotification("Integratsiya turi ko'rsatilmagan.", "danger");
      return false;
    }

    if (event.type === financeIntegrationSources.posCashSale || event.type === financeIntegrationSources.posCardSale) {
      return createTransaction(buildTransactionFromPosPayment({
        payment: event.payload,
        accountId: event.accountId,
        branch: event.branch || state.settings.branch,
        currentUser,
      }));
    }

    if (event.type === financeIntegrationSources.purchasePayable) {
      const payable = buildPayableFromPurchase(event.payload);
      if (!payable.id || !payable.supplier) {
        addNotification("Xarid integratsiyasi uchun supplier va hujjat ma'lumotlari yetarli emas.", "danger");
        return false;
      }

      setState((current) =>
        addStateEvent(
          {
            ...current,
            payables: current.payables.some((item) => item.sourceId === payable.sourceId)
              ? current.payables.map((item) => (item.sourceId === payable.sourceId ? { ...item, ...payable } : item))
              : [payable, ...current.payables],
          },
          `${payable.bill || payable.id} xarid kreditor qarzdorlikka bog'landi`,
          "integration",
          currentUser,
          { role, action: FINANCE_ACTION.CREATE, newValue: payable, sourceId: payable.sourceId },
        ),
      );
      addNotification("Xarid kreditor qarzdorlikka bog'landi.");
      return true;
    }

    if (event.type === financeIntegrationSources.invoiceReceivable) {
      const receivable = buildReceivableFromInvoice(event.payload);
      if (!receivable.id || !receivable.customer) {
        addNotification("Invoice integratsiyasi uchun mijoz va hujjat ma'lumotlari yetarli emas.", "danger");
        return false;
      }

      setState((current) =>
        addStateEvent(
          {
            ...current,
            receivables: current.receivables.some((item) => item.sourceId === receivable.sourceId)
              ? current.receivables.map((item) => (item.sourceId === receivable.sourceId ? { ...item, ...receivable } : item))
              : [receivable, ...current.receivables],
          },
          `${receivable.invoice} debitor qarzdorlikka bog'landi`,
          "integration",
          currentUser,
          { role, action: FINANCE_ACTION.CREATE, newValue: receivable, sourceId: receivable.sourceId },
        ),
      );
      addNotification("Invoice debitor qarzdorlikka bog'landi.");
      return true;
    }

    addNotification("Bu integratsiya turi hali qo'llab-quvvatlanmaydi.", "danger");
    return false;
  };

  const runCurrencyExchange = (payload) => {
    const amount = normalizeMoneyInput(payload.amount);
    const rate = Number(payload.rate || 0);
    if (!payload.fromAccountId || !payload.toAccountId || payload.fromAccountId === payload.toAccountId || !isPositiveMoney(amount) || rate <= 0) {
      addNotification("Valyuta almashtirish ma'lumotlari to'liq emas.", "danger");
      return false;
    }

    const sourceAccount = state.accounts.find((account) => account.id === payload.fromAccountId);
    if (sourceAccount && !hasEnoughBalance({ balance: sourceAccount.openingBalance, amount, currency: sourceAccount.currency })) {
      addNotification("Manba hisobda valyuta yetarli emas.", "danger");
      return false;
    }

    const converted = amount * rate;
    setState((current) =>
      addStateEvent(
        {
          ...current,
          accounts: current.accounts.map((account) => {
            if (account.id === payload.fromAccountId) {
              return { ...account, openingBalance: subtractMoney(account.openingBalance, amount, account.currency) };
            }
            if (account.id === payload.toAccountId) {
              return { ...account, openingBalance: addMoney(account.openingBalance, converted, account.currency) };
            }
            return account;
          }),
          transfers: [
            {
              id: generateFinanceId("FX"),
              date: new Date().toISOString().slice(0, 10),
              sourceId: payload.fromAccountId,
              destinationId: payload.toAccountId,
              amount,
              converted,
              rate,
              reason: "Valyuta almashtirish",
              status: TRANSACTION_STATUS.POSTED,
              createdBy: currentUser,
            },
            ...current.transfers,
          ],
        },
        "Valyuta almashtirish o'tkazildi",
        "currency",
        currentUser,
        { role, action: FINANCE_ACTION.CURRENCY, sourceId: payload.fromAccountId },
      ),
    );
    addNotification("Valyuta almashtirish bajarildi.");
    return true;
  };

  const updateIntegrationStatus = (integrationId) => {
    setState((current) =>
      addStateEvent(
        {
          ...current,
          settings: {
            ...current.settings,
            integrations: current.settings.integrations.map((integration) =>
              integration.id === integrationId
                ? { ...integration, status: "connected", lastCheckedAt: now(), checkedBy: currentUser }
                : integration,
            ),
          },
        },
        `${integrationId} integratsiyasi tekshirildi`,
        "settings",
        currentUser,
      ),
    );
    addNotification("Integratsiya tekshiruvi yakunlandi.");
  };

  const reviewTaxRates = () => {
    setState((current) =>
      addStateEvent(
        {
          ...current,
          settings: {
            ...current.settings,
            taxRates: current.settings.taxRates.map((tax) => ({ ...tax, status: "review" })),
          },
        },
        "Soliq stavkalari reviewga yuborildi",
        "tax",
        currentUser,
      ),
    );
    addNotification("Soliq sozlamalari ko'rib chiqishga yuborildi.", "warning");
  };

  const approveTaxRates = () => {
    if (!canFinance(role, FINANCE_ACTION.TAX)) {
      addNotification("Soliq sozlamalarini tasdiqlash uchun ruxsat yo'q.", "danger");
      return;
    }

    setState((current) =>
      addStateEvent(
        {
          ...current,
          settings: {
            ...current.settings,
            taxRates: current.settings.taxRates.map((tax) => ({ ...tax, status: "valid" })),
          },
        },
        "Soliq stavkalari tasdiqlandi",
        "tax",
        currentUser,
      ),
    );
    addNotification("Soliq sozlamalari tasdiqlandi.");
  };

  const createBudget = (payload) => {
    if (!requiredText(payload.category) || Number(payload.planned || 0) <= 0) {
      addNotification("Budget uchun kategoriya va reja summasi majburiy.", "danger");
      return false;
    }

    const budget = {
      id: generateBudgetId(),
      category: requiredText(payload.category),
      period: payload.period || state.settings.currentPeriodId,
      planned: Number(payload.planned || 0),
      actual: 0,
      owner: requiredText(payload.owner) || currentUser,
      status: payload.submit ? "Pending" : "Draft",
    };

    setState((current) =>
      addStateEvent(
        { ...current, budgets: [budget, ...current.budgets] },
        `${budget.id} budget yaratildi`,
        "budget",
        currentUser,
      ),
    );
    addNotification("Budget workflow yaratildi.");
    return true;
  };

  const approveBudget = (budgetId) => {
    setState((current) =>
      addStateEvent(
        {
          ...current,
          budgets: current.budgets.map((budget) =>
            budget.id === budgetId ? { ...budget, status: "Approved", approvedBy: currentUser } : budget,
          ),
        },
        `${budgetId} budget tasdiqlandi`,
        "budget",
        currentUser,
      ),
    );
    addNotification("Budget tasdiqlandi.");
  };

  const exportFinanceCsv = (name, rows) => {
    if (typeof window === "undefined") {
      addNotification(`${name} eksportga tayyorlandi.`);
      return;
    }

    const blob = new Blob([buildCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    addNotification(`${name} CSV eksport qilindi.`);
  };

  const costBreakdown = useMemo(
    () => calculateCostBreakdown(state.costAccounting),
    [state.costAccounting],
  );
  const liveAiInsights = useMemo(() => {
    if (state.aiInsights.length) return state.aiInsights;

    return [
      summary.expenses > summary.income && {
        id: "ai-expense-growth",
        type: "xarajat",
        severity: "danger",
        title: "Xarajat daromaddan yuqori",
        message: "So'nggi tasdiqlangan operatsiyalarda sof foyda manfiy. Xarajat kategoriyalarini ko'rib chiqing.",
        action: "review transaction",
        status: "open",
      },
      summary.overdue > 0 && {
        id: "ai-overdue-debt",
        type: "qarzdorlik",
        severity: "warning",
        title: "Debitor qarzdorlik muddati o'tgan",
        message: `${summary.overdue.toLocaleString("uz-UZ")} UZS muddati o'tgan qarzdorlik mavjud.`,
        action: "open approval",
        status: "open",
      },
      summary.cashFlow < 0 && {
        id: "ai-cashflow-drop",
        type: "pul oqimi",
        severity: "warning",
        title: "Pul oqimi kamaymoqda",
        message: "Chiqimlar kirimlardan yuqori. 7-30 kunlik prognozni tekshirish tavsiya qilinadi.",
        action: "review transaction",
        status: "open",
      },
      {
        id: "ai-finance-advice",
        type: "tavsiya",
        severity: "success",
        title: "Moliyaviy nazorat tavsiyasi",
        message: "Daromad, xarajat va qarzdorlikni haftalik kesimda tasdiqlash orqali cash flow aniqligi oshadi.",
        action: "review transaction",
        status: "open",
      },
    ].filter(Boolean);
  }, [state.aiInsights, summary]);

  return {
    state: { ...state, aiInsights: liveAiInsights },
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
      submitTransaction: (id) => transitionTransaction(id, TRANSACTION_STATUS.PENDING),
      approveTransaction: (id) => transitionTransaction(id, TRANSACTION_STATUS.APPROVED),
      postTransaction: (id) => transitionTransaction(id, TRANSACTION_STATUS.POSTED),
      reverseTransaction: (id, reason) => transitionTransaction(id, TRANSACTION_STATUS.REVERSED, reason),
      cancelTransaction: (id, reason) => transitionTransaction(id, TRANSACTION_STATUS.CANCELLED, reason),
      archiveTransaction: (id) => transitionTransaction(id, TRANSACTION_STATUS.ARCHIVED),
      rejectTransaction,
      createJournal,
      approveJournal,
      postJournal,
      importBankStatement,
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
      createInvoice,
      recordInvoicePayment,
      createPaymentOrder,
      approvePaymentOrder,
      rejectPaymentOrder,
      cancelPaymentOrder,
      postPaymentOrder,
      createReminder,
      transferBetweenAccounts,
      createFinanceAccount,
      updateFinanceAccount,
      toggleFinanceAccount,
      archiveFinanceAccount,
      openCashSession,
      closeCashSession,
      createCashOperation,
      ingestExternalFinanceEvent,
      runCurrencyExchange,
      updateIntegrationStatus,
      reviewTaxRates,
      approveTaxRates,
      createBudget,
      approveBudget,
      exportFinanceCsv,
      resetState,
      addNotification,
    },
  };
};

export default useFinanceController;
