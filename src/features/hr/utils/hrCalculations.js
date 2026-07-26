const DAY = 24 * 60 * 60 * 1000;

export const daysBetween = (from, to = new Date()) => {
  if (!from) return 0;
  const start = new Date(from);
  const end = new Date(to);
  return Math.ceil((end.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0)) / DAY);
};

export const calculatePayroll = (entry, config) => {
  const baseSalary = Number(entry.baseSalary || 0);
  const workedDays = Number(entry.workedDays || 0);
  const standardDays = Number(config.standardDays || 22);
  const proratedBase = standardDays > 0 ? (baseSalary / standardDays) * workedDays : baseSalary;
  const gross =
    proratedBase +
    Number(entry.bonus || 0) +
    Number(entry.overtime || 0) +
    Number(entry.compensation || 0);
  const tax = Math.round(gross * Number(config.taxRate || 0));
  const inps = Math.round(gross * Number(config.inpsRate || 0));
  const reductions =
    Number(entry.advance || 0) +
    Number(entry.penalty || 0) +
    Number(entry.deductions || 0) +
    tax +
    inps;
  const net = Math.max(0, Math.round(gross - reductions));

  return {
    baseSalary,
    proratedBase: Math.round(proratedBase),
    gross: Math.round(gross),
    tax,
    inps,
    reductions,
    net,
  };
};

export const calculateAttendanceRate = (attendance, employeeId) => {
  const rows = attendance.filter((item) => item.employeeId === employeeId);
  if (!rows.length) return 0;
  const present = rows.filter((item) => ["present", "late", "remote"].includes(item.status)).length;
  return Math.round((present / rows.length) * 100);
};

export const calculateLeaveBalance = (leaves, employeeId, annualLimit = 21) => {
  const used = leaves
    .filter((item) => item.employeeId === employeeId && item.status === "Approved")
    .reduce((sum, item) => sum + Number(item.days || 0), 0);
  return Math.max(0, annualLimit - used);
};

export const calculateProbationDays = (probation) => {
  if (!probation?.endDate) return { remaining: 0, progress: 0 };
  const total = Math.max(1, daysBetween(probation.startDate, probation.endDate));
  const elapsed = Math.min(total, Math.max(0, daysBetween(probation.startDate)));
  return {
    remaining: Math.max(0, daysBetween(new Date(), probation.endDate)),
    progress: Math.round((elapsed / total) * 100),
  };
};

export const calculateDocumentExpiry = (document) => {
  const remaining = daysBetween(new Date(), document.expiryDate);
  let status = "normal";
  if (document.status === "archived") status = "archived";
  else if (remaining < 0) status = "expired";
  else if (remaining <= 14) status = "critical";
  else if (remaining <= 45) status = "warning";
  return { remaining, status };
};

export const buildHRAnalytics = (state) => {
  const activeEmployees = state.employees.filter((item) => item.status !== "terminated");
  const todayPresent = state.attendance.filter((item) =>
    ["present", "late", "remote"].includes(item.status),
  ).length;
  const leavesToday = state.employees.filter((item) => item.status === "leave").length;
  const sickToday = state.employees.filter((item) => item.status === "sick").length;
  const lateToday = state.employees.filter((item) => item.status === "late").length;
  const newHires = state.employees.filter((item) => item.hireDate?.startsWith("2026-07")).length;
  const terminated = state.employees.filter((item) => item.terminationDate?.startsWith("2026-07")).length;
  const payrollFund = activeEmployees.reduce((sum, item) => sum + Number(item.salary || 0), 0);
  const attendanceRate = activeEmployees.length
    ? Math.round(activeEmployees.reduce((sum, item) => sum + Number(item.attendanceRate || 0), 0) / activeEmployees.length)
    : 0;

  return {
    totalActive: activeEmployees.length,
    todayPresent,
    leavesToday,
    sickToday,
    lateToday,
    newHires,
    terminated,
    attendanceRate,
    payrollFund,
    pendingApprovals: state.approvals.filter((item) => item.status === "Pending").length,
    openVacancies: state.vacancies.filter((item) => item.status === "open").length,
  };
};

export const buildAIInsights = (state) => {
  const riskyEmployees = state.employees.filter(
    (employee) => employee.status !== "terminated" && (employee.attendanceRate < 85 || employee.kpiScore < 75),
  );
  const expiringDocs = state.employees.flatMap((employee) =>
    employee.documents
      .map((document) => ({ employee, document, expiry: calculateDocumentExpiry(document) }))
      .filter((item) => ["critical", "expired"].includes(item.expiry.status)),
  );
  const probation = state.employees.filter((employee) =>
    ["ending-soon", "decision-pending"].includes(employee.probation?.status),
  );

  return [
    ...riskyEmployees.map((employee) => ({
      id: `ai-risk-${employee.id}`,
      tone: "danger",
      title: "Attrition yoki performance xavfi",
      message: `${employee.firstName} uchun attendance ${employee.attendanceRate}% va KPI ${employee.kpiScore}%. Manager review tavsiya qilinadi.`,
      targetId: employee.id,
      action: "start review",
      status: "open",
    })),
    ...expiringDocs.map(({ employee, document, expiry }) => ({
      id: `ai-doc-${employee.id}-${document.id}`,
      tone: expiry.status === "expired" ? "danger" : "warning",
      title: "Hujjat muddati xavfi",
      message: `${employee.firstName} ${document.type} hujjati ${expiry.remaining} kun ichida yakunlanadi.`,
      targetId: employee.id,
      action: "send reminder",
      status: "open",
    })),
    ...probation.map((employee) => ({
      id: `ai-prob-${employee.id}`,
      tone: "warning",
      title: "Probation qarori kerak",
      message: `${employee.firstName} sinov muddati bo'yicha inson qarori talab qilinadi.`,
      targetId: employee.id,
      action: "open employee",
      status: "open",
    })),
    {
      id: "ai-staffing-imbalance",
      tone: "info",
      title: "Branch staffing imbalance",
      message: "Farg'ona filialida attendance 88%, ochiq vakansiya va sick leave bir vaqtda. Smena optimizatsiyasi tavsiya qilinadi.",
      targetId: "br-fergana",
      action: "create task",
      status: "open",
    },
  ];
};
