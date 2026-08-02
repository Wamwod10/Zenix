import { generateHRId } from "../utils/hrIds";
import { generateEmployeeId } from "../utils/hrIds";

export const payrollTransitions = {
  Draft: ["Calculated"],
  Calculated: ["Approved"],
  Approved: ["Paid"],
  Paid: [],
};

export const now = () => new Date().toISOString();

export const addAudit = (state, event, area, by) => ({
  ...state,
  auditLog: [{ id: generateHRId("aud"), at: now(), by, event, area }, ...state.auditLog],
});

export const buildNotification = (text, tone = "success") => ({
  id: generateHRId("ntf"),
  tone,
  text,
  read: false,
});

export const addDays = (date, days) => {
  if (!date || !days) return "";
  const next = new Date(date);
  next.setDate(next.getDate() + Number(days));
  return next.toISOString().slice(0, 10);
};

export const validateEmployeePayload = (payload, employees) => {
  const errors = [];
  const fullName = `${payload.firstName || ""} ${payload.lastName || ""}`.trim();
  if (!fullName) errors.push("F.I.O majburiy.");
  if (!/^\+998\d{9}$/.test(payload.phone || "")) errors.push("Telefon +998XXXXXXXXX formatida bo'lishi kerak.");
  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) errors.push("Email formati noto'g'ri.");
  if (!/^\d{14}$/.test(payload.pinfl || "")) errors.push("PINFL 14 raqam bo'lishi kerak.");
  if (employees.some((employee) => employee.pinfl === payload.pinfl)) errors.push("Duplicate PINFL topildi.");
  if (employees.some((employee) => employee.phone === payload.phone)) errors.push("Duplicate phone topildi.");
  if (payload.email && employees.some((employee) => employee.email.toLowerCase() === payload.email.toLowerCase())) errors.push("Duplicate email topildi.");
  if (Number(payload.salary || 0) <= 0) errors.push("Oylik musbat bo'lishi kerak.");
  if (Number(payload.salary || 0) > 100000000) errors.push("Oylik diapazoni qayta tekshirilishi kerak.");
  if (!payload.branchId) errors.push("Filial majburiy.");
  if (!payload.contractDate || !payload.contractEndDate) errors.push("Contract date majburiy.");
  if (payload.contractDate && payload.hireDate && payload.contractDate < payload.hireDate) errors.push("Shartnoma sanasi ishga qabul sanasidan oldin bo'lishi mumkin emas.");
  if (payload.contractEndDate && payload.contractDate && payload.contractEndDate <= payload.contractDate) errors.push("Shartnoma tugash sanasi boshlanish sanasidan keyin bo'lishi kerak.");
  if (Number(payload.probationDays || 0) > 90) errors.push("Probation 90 kundan oshmasin.");
  if (!payload.login?.trim()) errors.push("Login majburiy.");
  if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(payload.password || "")) errors.push("Password kamida 8 belgi va raqamdan iborat bo'lishi kerak.");
  if (!payload.role) errors.push("Role tanlangan bo'lishi kerak.");
  return errors;
};

export const buildEmployeeRecords = (payload, employeeCount) => {
  const employee = {
    id: generateEmployeeId(),
    code: `HR-${String(employeeCount + 1).padStart(3, "0")}`,
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    phone: payload.phone.trim(),
    email: payload.email.trim(),
    pinfl: payload.pinfl.trim(),
    passport: payload.passport.trim(),
    birthDate: payload.birthDate,
    photo: `${payload.firstName[0] || "H"}${payload.lastName[0] || "R"}`.toUpperCase(),
    positionId: payload.positionId,
    departmentId: payload.departmentId,
    branchId: payload.branchId,
    status: "active",
    hireDate: payload.hireDate,
    salary: Number(payload.salary),
    bankCard: payload.bankCard || "",
    role: payload.role,
    attendanceRate: 100,
    kpiScore: 80,
    probation: {
      status: payload.probationDays ? "active" : "confirmed",
      startDate: payload.hireDate,
      endDate: addDays(payload.hireDate, Number(payload.probationDays || 0)),
      managerId: payload.managerId || "",
    },
    documents: [
      {
        id: generateHRId("doc"),
        type: "contract",
        issueDate: payload.contractDate,
        expiryDate: payload.contractEndDate,
        status: "normal",
        history: ["Created"],
      },
    ],
    assets: [],
    notes: [],
  };

  return {
    employee,
    onboarding: {
      id: generateHRId("onb"),
      employeeId: employee.id,
      progress: 35,
      checks: {
        personal: true,
        documents: false,
        contract: true,
        equipment: false,
        training: false,
        systemAccount: Boolean(payload.login),
        role: Boolean(payload.role),
        schedule: false,
        probation: Boolean(payload.probationDays),
        mentor: false,
      },
    },
  };
};
