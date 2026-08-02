import { useMemo, useState } from "react";

import { hrRoles } from "../data/hrPermissions";
import {
  addAudit,
  buildEmployeeRecords,
  buildNotification,
  now,
  payrollTransitions,
  validateEmployeePayload,
} from "../services/hrWorkflowService";
import { hrAdapter } from "../utils/hrAdapters";
import {
  buildAIInsights,
  buildHRAnalytics,
  calculateDocumentExpiry,
  calculatePayroll,
} from "../utils/hrCalculations";
import { generateHRId } from "../utils/hrIds";
import { canHR, getHRActionState } from "../utils/hrPermissions";
import useEmployeeFilters from "./useEmployeeFilters";
import useHRStorage from "./useHRStorage";

const useHRController = () => {
  const { state, setState, resetState } = useHRStorage();
  const [role, setRole] = useState("hrAdmin");
  const [toast, setToast] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(state.employees[0]?.id || "");
  const [activeModal, setActiveModal] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pageSize: 6 });
  const [mutationStatus, setMutationStatus] = useState({});
  const employeeFilters = useEmployeeFilters(state.employees);

  const currentUser = state.settings.currentUser;
  const summary = useMemo(() => buildHRAnalytics(state), [state]);
  const aiInsights = useMemo(() => buildAIInsights(state), [state]);
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

  const runMutation = async (key, operation) => {
    setMutationStatus((current) => ({ ...current, [key]: { pending: true, error: "", success: false } }));
    try {
      const result = await operation();
      setMutationStatus((current) => ({ ...current, [key]: { pending: false, error: "", success: true } }));
      return result;
    } catch (error) {
      const message = error?.message || "Amal bajarilmadi. Qayta urinib ko'ring.";
      setMutationStatus((current) => ({ ...current, [key]: { pending: false, error: message, success: false } }));
      addNotification(message, "danger");
      return { ok: false, errors: [message] };
    }
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

  const createEmployee = async (payload) => runMutation("employee.create", async () => {
    const errors = validateEmployeePayload(payload, state.employees);
    if (errors.length) {
      addNotification(errors[0], "danger");
      return { ok: false, errors };
    }

    const { employee, onboarding } = buildEmployeeRecords(payload, state.employees.length);

    await hrAdapter.saveEmployee(employee);
    setState((current) =>
      addAudit(
        {
          ...current,
          employees: [employee, ...current.employees],
          onboarding: [onboarding, ...current.onboarding],
        },
        `${employee.code} employee created`,
        "employees",
        currentUser,
      ),
    );
    setSelectedEmployeeId(employee.id);
    addNotification("Yangi xodim yaratildi.");
    return { ok: true, employee };
  });

  const transferEmployee = (employeeId, branchId, effectiveDate = new Date().toISOString().slice(0, 10)) => {
    if (!canHR(role, "employee.transfer")) {
      addNotification("Xodimni filialga o'tkazish uchun ruxsat yo'q.", "danger");
      return false;
    }
    const employee = state.employees.find((item) => item.id === employeeId);
    if (!employee || !branchId || employee.branchId === branchId) {
      addNotification("Yangi filialni tanlang va ma'lumotlarni tekshiring.", "danger");
      return false;
    }
    updateEmployee(employeeId, (employee) => ({ ...employee, branchId }), `${employeeId} transferred`);
    addNotification(`Xodim ${effectiveDate} sanasidan filialga o'tkazildi.`);
    return true;
  };

  const decideProbation = (employeeId, decision, comment) => {
    if (!canHR(role, "probation.decide")) {
      addNotification("Sinov muddati qarori uchun ruxsat yo'q.", "danger");
      return false;
    }
    if (!comment?.trim()) {
      addNotification("Sinov muddati qarori uchun izoh majburiy.", "danger");
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
    addNotification("Sinov muddati qarori saqlandi.");
    return true;
  };

  const renewDocument = async (employeeId, documentId, expiryDate) => {
    if (!canHR(role, "document.edit")) {
      addNotification("Hujjatni yangilash uchun ruxsat yo'q.", "danger");
      return false;
    }
    const employee = state.employees.find((item) => item.id === employeeId);
    const currentDocument = employee?.documents.find((item) => item.id === documentId);
    if (!expiryDate) {
      addNotification("Yangi hujjat muddati majburiy.", "danger");
      return false;
    }
    if (expiryDate <= new Date().toISOString().slice(0, 10)) {
      addNotification("Yangi muddat kelajak sanasi bo'lishi kerak.", "danger");
      return false;
    }
    if (currentDocument && expiryDate <= currentDocument.expiryDate) {
      addNotification("Yangi muddat hozirgi muddatdan keyin bo'lishi kerak.", "danger");
      return false;
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
    return true;
  };

  const calculatePayrollEntry = async (payrollId) => runMutation(`payroll.${payrollId}.calculate`, async () => {
    const entry = state.payroll.find((item) => item.id === payrollId);
    if (!entry) return { ok: false };
    const result = calculatePayroll(entry, state.settings.payrollConfig);
    if (result.validationErrors.length) {
      addNotification(result.validationErrors[0], "danger");
      return { ok: false, errors: result.validationErrors };
    }
    await hrAdapter.calculatePayroll(entry, result);
    setState((current) =>
      addAudit(
        {
          ...current,
          payroll: current.payroll.map((item) =>
            item.id === payrollId ? { ...item, status: "Calculated", result, calculatedBy: currentUser } : item,
          ),
        },
        `${payrollId} payroll calculated`,
        "payroll",
        currentUser,
      ),
    );
    addNotification("Payroll hisoblandi.");
    return { ok: true };
  });

  const transitionPayroll = async (payrollId, status) => {
    if (["Approved", "Paid"].includes(status) && !canHR(role, "payroll.approve")) {
      addNotification("Payroll tasdiqlash uchun ruxsat yo'q.", "danger");
      return;
    }
    const entry = state.payroll.find((item) => item.id === payrollId);
    if (!entry) return;
    if (!payrollTransitions[entry.status]?.includes(status)) {
      addNotification(`${entry.status} holatidan ${status} holatiga o'tib bo'lmaydi.`, "danger");
      return;
    }
    if (status === "Approved" && entry.calculatedBy === currentUser) {
      addNotification("Hisoblagan foydalanuvchi o'zi tasdiqlay olmaydi.", "danger");
      return;
    }
    if (status === "Paid" && entry) {
      await hrAdapter.processPayment(entry);
    }
    setState((current) =>
      addAudit(
        {
          ...current,
          payroll: current.payroll.map((item) =>
            item.id === payrollId
              ? {
                  ...item,
                  status,
                  approvedBy: status === "Approved" ? currentUser : item.approvedBy,
                  paidAt: status === "Paid" ? now() : item.paidAt,
                }
              : item,
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
    if (!canHR(role, "attendance.correct")) {
      addNotification("Davomatni tuzatish uchun ruxsat yo'q.", "danger");
      return false;
    }
    if (!reason?.trim()) {
      addNotification("Qo'lda tuzatish uchun sabab majburiy.", "danger");
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

  const approveLeave = (leaveId, status, comment = "") => {
    if (!canHR(role, "leave.approve")) {
      addNotification("Ta'til so'rovini tasdiqlash uchun ruxsat yo'q.", "danger");
      return false;
    }
    if (!comment.trim()) {
      addNotification("Ta'til qarori uchun izoh majburiy.", "danger");
      return false;
    }
    const leave = state.leaves.find((item) => item.id === leaveId);
    const hasConflict = state.leaves.some(
      (item) =>
        item.id !== leaveId &&
        item.employeeId === leave?.employeeId &&
        item.status === "Approved" &&
        item.from <= leave.to &&
        item.to >= leave.from,
    );
    if (status === "Approved" && hasConflict) {
      addNotification("Tanlangan davr boshqa tasdiqlangan ta'til bilan kesishyapti.", "danger");
      return false;
    }
    setState((current) =>
      addAudit(
        {
          ...current,
          leaves: current.leaves.map((item) =>
            item.id === leaveId
              ? { ...item, status, decisionComment: comment, history: [`${status} by ${currentUser}: ${comment}`, ...item.history] }
              : item,
          ),
        },
        `${leaveId} leave ${status}`,
        "leave",
        currentUser,
      ),
    );
    addNotification(status === "Approved" ? "Ta'til tasdiqlandi." : "Ta'til rad etildi.");
    return true;
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
    selectedEmployeeId,
    activeModal,
    pagination,
    mutationStatus,
    employeeFilters,
    dictionaries,
    currentUser,
    actionState: (permission, approvalRequired = false) => getHRActionState({ role, permission, approvalRequired }),
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

export default useHRController;
