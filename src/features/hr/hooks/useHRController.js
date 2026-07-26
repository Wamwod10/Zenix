import { useMemo, useState } from "react";

import { hrRoles } from "../data/hrPermissions";
import { hrAdapter } from "../utils/hrAdapters";
import {
  buildAIInsights,
  buildHRAnalytics,
  calculateDocumentExpiry,
  calculatePayroll,
} from "../utils/hrCalculations";
import { generateEmployeeId, generateHRId } from "../utils/hrIds";
import { canHR, getHRActionState } from "../utils/hrPermissions";
import useEmployeeFilters from "./useEmployeeFilters";
import useHRStorage from "./useHRStorage";

const now = () => new Date().toISOString();

const addAudit = (state, event, area, by) => ({
  ...state,
  auditLog: [{ id: generateHRId("aud"), at: now(), by, event, area }, ...state.auditLog],
});

const buildNotification = (text, tone = "success") => ({
  id: generateHRId("ntf"),
  tone,
  text,
  read: false,
});

const useHRController = () => {
  const { state, setState, resetState } = useHRStorage();
  const [role, setRole] = useState("hrAdmin");
  const [toast, setToast] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(state.employees[0]?.id || "");
  const [activeModal, setActiveModal] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pageSize: 6 });
  const employeeFilters = useEmployeeFilters(state.employees);

  const currentUser = state.settings.currentUser;
  const summary = useMemo(() => buildHRAnalytics(state), [state]);
  const aiInsights = useMemo(() => buildAIInsights(state), [state]);
  const selectedEmployee =
    state.employees.find((employee) => employee.id === selectedEmployeeId) || state.employees[0];

  const dictionaries = useMemo(() => {
    const departmentById = Object.fromEntries(state.departments.map((item) => [item.id, item]));
    const positionById = Object.fromEntries(state.positions.map((item) => [item.id, item]));
    const branchById = Object.fromEntries(state.branches.map((item) => [item.id, item]));
    const employeeById = Object.fromEntries(state.employees.map((item) => [item.id, item]));
    return { departmentById, positionById, branchById, employeeById };
  }, [state.branches, state.departments, state.employees, state.positions]);

  const addNotification = (text, tone = "success") => {
    setToast(text);
    window.clearTimeout(window.__zenixHrToastTimer);
    window.__zenixHrToastTimer = window.setTimeout(() => setToast(""), 2200);
    setState((current) => ({
      ...current,
      notifications: [buildNotification(text, tone), ...current.notifications],
    }));
  };

  const updateEmployee = (employeeId, updater, auditText) => {
    setState((current) =>
      addAudit(
        {
          ...current,
          employees: current.employees.map((employee) =>
            employee.id === employeeId ? updater(employee) : employee,
          ),
        },
        auditText,
        "employees",
        currentUser,
      ),
    );
  };

  const createEmployee = async (payload) => {
    const errors = validateEmployeePayload(payload, state.employees);
    if (errors.length) {
      addNotification(errors[0], "danger");
      return { ok: false, errors };
    }

    const employee = {
      id: generateEmployeeId(),
      code: `HR-${String(state.employees.length + 1).padStart(3, "0")}`,
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

    await hrAdapter.saveEmployee(employee);
    setState((current) =>
      addAudit(
        {
          ...current,
          employees: [employee, ...current.employees],
          onboarding: [
            {
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
            ...current.onboarding,
          ],
        },
        `${employee.code} employee created`,
        "employees",
        currentUser,
      ),
    );
    setSelectedEmployeeId(employee.id);
    addNotification("Yangi xodim yaratildi.");
    return { ok: true, employee };
  };

  const transferEmployee = (employeeId, branchId) => {
    updateEmployee(employeeId, (employee) => ({ ...employee, branchId }), `${employeeId} transferred`);
    addNotification("Xodim filialga o'tkazildi.");
  };

  const decideProbation = (employeeId, decision, comment) => {
    if (!comment?.trim()) {
      addNotification("Probation qarori uchun izoh majburiy.", "danger");
      return false;
    }
    const statusMap = { confirm: "confirmed", extend: "extended", terminate: "terminated" };
    updateEmployee(
      employeeId,
      (employee) => ({
        ...employee,
        status: decision === "terminate" ? "terminated" : employee.status,
        probation: { ...employee.probation, status: statusMap[decision], decisionComment: comment },
        terminationReason: decision === "terminate" ? comment : employee.terminationReason,
      }),
      `${employeeId} probation ${statusMap[decision]}`,
    );
    addNotification("Probation qarori saqlandi.");
    return true;
  };

  const renewDocument = async (employeeId, documentId, expiryDate) => {
    if (!expiryDate) {
      addNotification("Yangi hujjat muddati majburiy.", "danger");
      return;
    }

    await hrAdapter.uploadDocument({ employeeId, documentId, expiryDate });
    updateEmployee(
      employeeId,
      (employee) => ({
        ...employee,
        documents: employee.documents.map((document) =>
          document.id === documentId
            ? {
                ...document,
                expiryDate,
                status: calculateDocumentExpiry({ ...document, expiryDate }).status,
                history: [`Renewed ${expiryDate}`, ...document.history],
              }
            : document,
        ),
      }),
      `${employeeId} document renewed`,
    );
    addNotification("Hujjat muddati yangilandi.");
  };

  const calculatePayrollEntry = async (payrollId) => {
    const entry = state.payroll.find((item) => item.id === payrollId);
    if (!entry) return;
    const result = calculatePayroll(entry, state.settings.payrollConfig);
    await hrAdapter.calculatePayroll(entry, result);
    setState((current) =>
      addAudit(
        {
          ...current,
          payroll: current.payroll.map((item) =>
            item.id === payrollId ? { ...item, status: "Calculated", result } : item,
          ),
        },
        `${payrollId} payroll calculated`,
        "payroll",
        currentUser,
      ),
    );
    addNotification("Payroll hisoblandi.");
  };

  const transitionPayroll = async (payrollId, status) => {
    if (["Approved", "Paid"].includes(status) && !canHR(role, "payroll.approve")) {
      addNotification("Payroll tasdiqlash uchun ruxsat yo'q.", "danger");
      return;
    }
    const entry = state.payroll.find((item) => item.id === payrollId);
    if (status === "Paid" && entry) {
      await hrAdapter.processPayment(entry);
    }
    setState((current) =>
      addAudit(
        {
          ...current,
          payroll: current.payroll.map((item) =>
            item.id === payrollId ? { ...item, status } : item,
          ),
        },
        `${payrollId} payroll ${status}`,
        "payroll",
        currentUser,
      ),
    );
    addNotification(`Payroll ${status} holatiga o'tdi.`);
  };

  const correctAttendance = (attendanceId, patch, reason) => {
    if (!reason?.trim()) {
      addNotification("Manual correction uchun sabab majburiy.", "danger");
      return false;
    }
    setState((current) =>
      addAudit(
        {
          ...current,
          attendance: current.attendance.map((item) =>
            item.id === attendanceId ? { ...item, ...patch, correctionReason: reason } : item,
          ),
        },
        `${attendanceId} attendance corrected`,
        "attendance",
        currentUser,
      ),
    );
    addNotification("Davomat tuzatildi.");
    return true;
  };

  const approveLeave = (leaveId, status) => {
    setState((current) =>
      addAudit(
        {
          ...current,
          leaves: current.leaves.map((item) =>
            item.id === leaveId
              ? { ...item, status, history: [`${status} by ${currentUser}`, ...item.history] }
              : item,
          ),
        },
        `${leaveId} leave ${status}`,
        "leave",
        currentUser,
      ),
    );
    addNotification(`Leave ${status}.`);
  };

  const createTask = (payload) => {
    if (!payload.title?.trim()) {
      addNotification("Task title majburiy.", "danger");
      return false;
    }
    setState((current) =>
      addAudit(
        {
          ...current,
          tasks: [
            {
              id: generateHRId("task"),
              title: payload.title,
              description: payload.description || "",
              assigneeIds: payload.assigneeIds || [],
              deadline: payload.deadline || new Date().toISOString().slice(0, 10),
              priority: payload.priority || "medium",
              status: "New",
              comments: [],
              attachments: [],
            },
            ...current.tasks,
          ],
        },
        "task created",
        "tasks",
        currentUser,
      ),
    );
    addNotification("Vazifa yaratildi.");
    return true;
  };

  const updateTaskStatus = (taskId, status) => {
    setState((current) =>
      addAudit(
        {
          ...current,
          tasks: current.tasks.map((task) =>
            task.id === taskId ? { ...task, status } : task,
          ),
        },
        `${taskId} task ${status}`,
        "tasks",
        currentUser,
      ),
    );
    addNotification("Task status yangilandi.");
  };

  const sendMessage = async (payload) => {
    if (!payload.text?.trim()) {
      addNotification("Xabar matni majburiy.", "danger");
      return false;
    }
    const message = {
      id: generateHRId("msg"),
      threadId: payload.threadId || "thread-hr",
      from: payload.from || "emp-003",
      to: payload.to || ["all"],
      type: payload.type || "broadcast",
      text: payload.text,
      at: now(),
      readBy: [],
    };
    await hrAdapter.sendMessage(message);
    setState((current) =>
      addAudit(
        { ...current, messages: [message, ...current.messages] },
        "internal message sent",
        "messages",
        currentUser,
      ),
    );
    addNotification("Ichki xabar yuborildi.");
    return true;
  };

  const greetBirthday = (employeeId) => {
    const employee = state.employees.find((item) => item.id === employeeId);
    setState((current) =>
      addAudit(
        {
          ...current,
          birthdayGreetings: [
            { id: generateHRId("bd"), employeeId, sentBy: currentUser, sentAt: now(), channel: "internal" },
            ...current.birthdayGreetings,
          ],
        },
        `${employeeId} birthday greeted`,
        "birthdays",
        currentUser,
      ),
    );
    addNotification(`${employee?.firstName || "Xodim"} uchun tabrik yuborildi.`);
  };

  const updateCandidateStage = (candidateId, stage) => {
    setState((current) =>
      addAudit(
        {
          ...current,
          candidates: current.candidates.map((candidate) =>
            candidate.id === candidateId ? { ...candidate, stage } : candidate,
          ),
        },
        `${candidateId} candidate ${stage}`,
        "recruitment",
        currentUser,
      ),
    );
    addNotification("Candidate stage yangilandi.");
  };

  const runAiAction = (insight, action) => {
    if (action === "create task") {
      createTask({
        title: insight.title,
        description: insight.message,
        assigneeIds: ["emp-003"],
        priority: insight.tone === "danger" ? "urgent" : "high",
      });
      return;
    }
    if (action === "send reminder") {
      sendMessage({ text: insight.message, to: [insight.targetId], type: "personal" });
      return;
    }
    addNotification(`AI tavsiya "${action}" bajarildi.`);
  };

  return {
    state,
    role,
    roles: hrRoles,
    toast,
    summary,
    aiInsights,
    selectedEmployee,
    selectedEmployeeId,
    activeModal,
    pagination,
    employeeFilters,
    dictionaries,
    currentUser,
    actionState: (permission, approvalRequired = false) =>
      getHRActionState({ role, permission, approvalRequired }),
    actions: {
      setRole,
      setSelectedEmployeeId,
      setActiveModal,
      closeModal: () => setActiveModal(""),
      setPagination,
      addNotification,
      createEmployee,
      updateEmployee,
      transferEmployee,
      decideProbation,
      renewDocument,
      calculatePayrollEntry,
      transitionPayroll,
      correctAttendance,
      approveLeave,
      createTask,
      updateTaskStatus,
      sendMessage,
      greetBirthday,
      updateCandidateStage,
      runAiAction,
      resetState,
    },
  };
};

const addDays = (date, days) => {
  if (!date || !days) return "";
  const next = new Date(date);
  next.setDate(next.getDate() + Number(days));
  return next.toISOString().slice(0, 10);
};

const validateEmployeePayload = (payload, employees) => {
  const errors = [];
  const fullName = `${payload.firstName || ""} ${payload.lastName || ""}`.trim();
  if (!fullName) errors.push("F.I.O majburiy.");
  if (!/^\+998\d{9}$/.test(payload.phone || "")) errors.push("Telefon +998XXXXXXXXX formatida bo'lishi kerak.");
  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) errors.push("Email formati noto'g'ri.");
  if (!/^\d{14}$/.test(payload.pinfl || "")) errors.push("PINFL 14 raqam bo'lishi kerak.");
  if (employees.some((employee) => employee.pinfl === payload.pinfl)) errors.push("Duplicate PINFL topildi.");
  if (employees.some((employee) => employee.phone === payload.phone)) errors.push("Duplicate phone topildi.");
  if (Number(payload.salary || 0) <= 0) errors.push("Oylik musbat bo'lishi kerak.");
  if (!payload.branchId) errors.push("Filial majburiy.");
  if (!payload.contractDate || !payload.contractEndDate) errors.push("Contract date majburiy.");
  if (Number(payload.probationDays || 0) > 90) errors.push("Probation 90 kundan oshmasin.");
  if (!payload.login?.trim()) errors.push("Login majburiy.");
  if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(payload.password || "")) errors.push("Password kamida 8 belgi va raqamdan iborat bo'lishi kerak.");
  if (!payload.role) errors.push("Role tanlangan bo'lishi kerak.");
  return errors;
};

export default useHRController;
