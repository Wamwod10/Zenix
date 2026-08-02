import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { businessOSActions } from "../../../core/businessOS/businessOSSlice";
import { initialFinanceState } from "../data/financeMockData";
import {
  financeStorageKeys,
  safeStorageRead,
  safeStorageWrite,
} from "../utils/financeStorage";

const cloneInitialState = () => JSON.parse(JSON.stringify(initialFinanceState));

const currentMonth = () => new Date().toISOString().slice(0, 7);

const defaultOpenPeriod = () => ({
  id: currentMonth(),
  label: currentMonth(),
  status: "open",
});

const defaultClosingChecklist = () => [
  { id: "pos-shifts", label: "Barcha POS smenalari yopilgan", complete: false, issues: 0, target: "/pos" },
  { id: "cash-balance", label: "Kassa qoldiqlari tekshirilgan", complete: false, issues: 0, target: "/finance/cash-accounts" },
  { id: "bank-reconciliation", label: "Bank sverkasi yakunlangan", complete: false, issues: 0, target: "/finance/reconciliation" },
  { id: "pending-drafts", label: "Qoralama tranzaksiyalar tekshirilgan", complete: false, issues: 0, target: "/finance/transactions" },
  { id: "inventory-cost", label: "Tannarx hisoblangan", complete: false, issues: 0, target: "/finance/cost" },
  { id: "tax", label: "Soliq majburiyatlari hisoblangan", complete: false, issues: 0, target: "/finance/tax-reports" },
  { id: "double-entry", label: "Ikkiyoqlama yozuv balansda", complete: false, issues: 0, target: "/finance/trial-balance" },
];

const mergeFinanceState = (savedState) => {
  const fallback = cloneInitialState();
  const periods = savedState?.periods?.length ? savedState.periods : [defaultOpenPeriod()];

  return {
    ...fallback,
    ...savedState,
    settings: {
      ...fallback.settings,
      ...(savedState?.settings || {}),
      currentPeriodId: savedState?.settings?.currentPeriodId || periods[0]?.id || "",
      integrations: savedState?.settings?.integrations || fallback.settings.integrations,
      taxRates: savedState?.settings?.taxRates || fallback.settings.taxRates,
    },
    reconciliation: {
      ...fallback.reconciliation,
      ...(savedState?.reconciliation || {}),
      system: savedState?.reconciliation?.system || fallback.reconciliation.system,
      bank: savedState?.reconciliation?.bank || fallback.reconciliation.bank,
      history: savedState?.reconciliation?.history || fallback.reconciliation.history,
    },
    transactions: savedState?.transactions || fallback.transactions,
    accounts: savedState?.accounts || fallback.accounts,
    currencies: savedState?.currencies || fallback.currencies,
    journals: savedState?.journals || fallback.journals,
    receivables: savedState?.receivables || fallback.receivables,
    payables: savedState?.payables || fallback.payables,
    invoices: savedState?.invoices || fallback.invoices,
    paymentOrders: savedState?.paymentOrders || fallback.paymentOrders,
    cashSessions: savedState?.cashSessions || fallback.cashSessions,
    periods,
    closingChecklist: savedState?.closingChecklist?.length ? savedState.closingChecklist : defaultClosingChecklist(),
    budgets: savedState?.budgets || fallback.budgets,
    transfers: savedState?.transfers || fallback.transfers,
    reminders: savedState?.reminders || fallback.reminders,
    notifications: savedState?.notifications || fallback.notifications,
    auditLog: savedState?.auditLog || fallback.auditLog,
  };
};

const useFinanceStorage = () => {
  const dispatch = useDispatch();
  const [state, setState] = useState(() =>
    mergeFinanceState(safeStorageRead(financeStorageKeys.state, cloneInitialState())),
  );

  useEffect(() => {
    safeStorageWrite(financeStorageKeys.state, state);
    dispatch(businessOSActions.financeModuleCommitted(state));
  }, [dispatch, state]);

  return {
    state,
    setState,
    resetState: () => setState(cloneInitialState()),
  };
};

export default useFinanceStorage;
