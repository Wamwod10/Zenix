export const sumBy = (items = [], selector = (item) => item) =>
  items.reduce((total, item) => total + Number(selector(item) || 0), 0);

export const calculateProfit = (transactions = []) => {
  const income = sumBy(
    transactions.filter((item) => item.type === "income"),
    (item) => item.amount,
  );
  const expenses = sumBy(
    transactions.filter((item) => item.type === "expense"),
    (item) => item.amount,
  );

  return income - expenses;
};

export const calculateCashFlow = (transactions = []) => {
  const inflow = sumBy(
    transactions.filter((item) => item.cashDirection === "in"),
    (item) => item.amount,
  );
  const outflow = sumBy(
    transactions.filter((item) => item.cashDirection === "out"),
    (item) => item.amount,
  );

  return inflow - outflow;
};

export const calculateBalance = (accounts = [], transactions = []) => {
  const opening = sumBy(accounts, (account) => account.openingBalance);
  const movement = calculateCashFlow(
    transactions.filter((item) => item.status === "Posted"),
  );

  return opening + movement;
};

export const calculateTax = (amount = 0, rate = 0) =>
  Math.round(Number(amount || 0) * (Number(rate || 0) / 100));

export const calculateExchangeGainLoss = ({
  foreignAmount = 0,
  oldRate = 0,
  newRate = 0,
  direction = "asset",
} = {}) => {
  const difference =
    Number(foreignAmount || 0) * (Number(newRate || 0) - Number(oldRate || 0));

  return direction === "liability" ? -difference : difference;
};

export const calculateCostBreakdown = ({
  purchaseCost = 0,
  transport = 0,
  customs = 0,
  additionalExpenses = 0,
  quantity = 1,
} = {}) => {
  const finalCost =
    Number(purchaseCost || 0) +
    Number(transport || 0) +
    Number(customs || 0) +
    Number(additionalExpenses || 0);

  return {
    purchaseCost: Number(purchaseCost || 0),
    landedCost:
      Number(transport || 0) +
      Number(customs || 0) +
      Number(additionalExpenses || 0),
    finalCost,
    unitCost: finalCost / Math.max(Number(quantity || 1), 1),
  };
};

export const validateDoubleEntry = (rows = [], accounts = [], periods = []) => {
  const debit = sumBy(rows, (row) => row.debit);
  const credit = sumBy(rows, (row) => row.credit);
  const accountIds = new Set(accounts.map((account) => account.id));
  const openPeriod = periods.find((period) => period.status === "open");
  const errors = [];

  if (!rows.length) {
    errors.push("Kamida bitta debit/kredit qatori kerak.");
  }

  if (Math.round(debit) !== Math.round(credit)) {
    errors.push("Debit va kredit summalari teng bo'lishi kerak.");
  }

  rows.forEach((row) => {
    if (!accountIds.has(row.accountId)) {
      errors.push(`${row.accountId || "Hisob"} mavjud emas.`);
    }

    if (Number(row.debit || 0) < 0 || Number(row.credit || 0) < 0) {
      errors.push("Summa manfiy bo'lmasligi kerak.");
    }
  });

  if (!openPeriod) {
    errors.push("Ochiq moliyaviy period mavjud emas.");
  }

  return {
    ok: errors.length === 0,
    errors,
    debit,
    credit,
  };
};

export const buildFinanceSummary = (state) => {
  const posted = state.transactions.filter((item) => item.status === "Posted");
  const income = sumBy(
    posted.filter((item) => item.type === "income"),
    (item) => item.amount,
  );
  const expenses = sumBy(
    posted.filter((item) => item.type === "expense"),
    (item) => item.amount,
  );
  const receivable = sumBy(state.receivables, (item) => item.balance);
  const payable = sumBy(state.payables, (item) => item.balance);
  const overdue = sumBy(
    state.receivables.filter((item) => item.status === "overdue"),
    (item) => item.balance,
  );
  const bank = sumBy(
    state.accounts.filter((item) => item.kind === "bank"),
    (item) => item.openingBalance,
  );
  const cash = sumBy(
    state.accounts.filter((item) => item.kind === "cash"),
    (item) => item.openingBalance,
  );

  return {
    totalBalance: calculateBalance(state.accounts, posted),
    income,
    expenses,
    netProfit: income - expenses,
    cashFlow: calculateCashFlow(posted),
    receivable,
    payable,
    overdue,
    bank,
    cash,
    taxPayable: sumBy(state.taxReports, (item) => item.payable),
    pendingApprovals: state.transactions.filter((item) => item.status === "Pending").length,
    unreconciled: state.reconciliation.system.filter((item) => !item.matched).length,
    healthScore: Math.max(
      40,
      Math.min(96, 78 + Math.round((income - expenses - overdue * 0.2) / 10000000)),
    ),
  };
};
