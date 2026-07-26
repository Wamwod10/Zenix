import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Award,
  Banknote,
  Bell,
  Bot,
  BriefcaseBusiness,
  CalendarClock,
  Cake,
  ClipboardCheck,
  FileClock,
  FileText,
  GitBranch,
  LayoutDashboard,
  ListChecks,
  MessageCircle,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";

import HRHeader from "../components/HRHeader/HRHeader";
import HRNavigation from "../components/HRNavigation/HRNavigation";
import useHRController from "../hooks/useHRController";
import Attendance from "./Attendance/Attendance";
import Branches from "./Branches/Branches";
import Departments from "./Departments/Departments";
import EmployeeCreate from "./EmployeeCreate/EmployeeCreate";
import EmployeeDetails from "./EmployeeDetails/EmployeeDetails";
import Employees from "./Employees/Employees";
import HRDashboard from "./HRDashboard/HRDashboard";
import HRSettings from "./HRSettings/HRSettings";
import LeaveManagement from "./LeaveManagement/LeaveManagement";
import Messages from "./Messages/Messages";
import Payroll from "./Payroll/Payroll";
import Performance from "./Performance/Performance";
import Positions from "./Positions/Positions";
import Recruitment from "./Recruitment/Recruitment";
import Reports from "./Reports/Reports";
import Shifts from "./Shifts/Shifts";
import Tasks from "./Tasks/Tasks";

import "./HR.scss";

const navigationGroups = [
  { id: "management", title: "Boshqaruv", items: [{ id: "dashboard", label: "HR Dashboard", icon: LayoutDashboard }] },
  {
    id: "employees",
    title: "Xodimlar",
    items: [
      { id: "employees", label: "Xodimlar", icon: Users },
      { id: "departments", label: "Bo'limlar", icon: GitBranch },
      { id: "positions", label: "Lavozimlar", icon: BriefcaseBusiness },
      { id: "branches", label: "Filiallar", icon: GitBranch },
      { id: "employee-create", label: "Yangi xodim", icon: UserPlus },
    ],
  },
  {
    id: "payroll",
    title: "Payroll",
    items: [
      { id: "payroll", label: "Oylik", icon: Banknote },
      { id: "payroll", label: "Payslip", icon: FileText },
      { id: "payroll", label: "Payroll analytics", icon: ListChecks },
    ],
  },
  {
    id: "attendance",
    title: "Davomat",
    items: [
      { id: "attendance", label: "Davomat", icon: CalendarClock },
      { id: "shifts", label: "Smenalar", icon: CalendarClock },
      { id: "shifts", label: "Work schedule", icon: ClipboardCheck },
    ],
  },
  {
    id: "requests",
    title: "Ta'til va so'rovlar",
    items: [{ id: "leaves", label: "Leave management", icon: FileClock }],
  },
  {
    id: "performance",
    title: "Samaradorlik",
    items: [{ id: "performance", label: "KPI / Reviews", icon: Award }],
  },
  {
    id: "recruitment",
    title: "Recruitment",
    items: [{ id: "recruitment", label: "Hiring pipeline", icon: UserPlus }],
  },
  {
    id: "collaboration",
    title: "Hamkorlik",
    items: [
      { id: "tasks", label: "Vazifalar", icon: ClipboardCheck },
      { id: "messages", label: "Ichki xabarlar", icon: MessageCircle },
      { id: "dashboard", label: "Tug'ilgan kunlar", icon: Cake },
    ],
  },
  {
    id: "control",
    title: "Nazorat",
    items: [
      { id: "reports", label: "Reports / Audit", icon: ShieldCheck },
      { id: "settings", label: "Permissions", icon: Settings },
      { id: "dashboard", label: "AI HR", icon: Bot },
      { id: "reports", label: "Notifications", icon: Bell },
    ],
  },
];

const segmentToView = {
  "": "dashboard",
  dashboard: "dashboard",
  employees: "employees",
  "employee-create": "employee-create",
  create: "employee-create",
  departments: "departments",
  positions: "positions",
  branches: "branches",
  probation: "dashboard",
  documents: "dashboard",
  payroll: "payroll",
  payslip: "payroll",
  attendance: "attendance",
  shifts: "shifts",
  schedules: "shifts",
  leaves: "leaves",
  leave: "leaves",
  performance: "performance",
  kpi: "performance",
  recruitment: "recruitment",
  tasks: "tasks",
  messages: "messages",
  reports: "reports",
  approvals: "reports",
  audit: "reports",
  notifications: "reports",
  settings: "settings",
  permissions: "settings",
  ai: "dashboard",
};

const viewToPath = {
  dashboard: "",
  employees: "employees",
  "employee-details": "employees",
  "employee-create": "employee-create",
  departments: "departments",
  positions: "positions",
  branches: "branches",
  payroll: "payroll",
  attendance: "attendance",
  shifts: "shifts",
  leaves: "leaves",
  performance: "performance",
  recruitment: "recruitment",
  tasks: "tasks",
  messages: "messages",
  reports: "reports",
  settings: "settings",
};

const HR = () => {
  const controller = useHRController();
  const location = useLocation();
  const navigate = useNavigate();
  const segments = location.pathname.replace(/^\/hr\/?/, "").split("/").filter(Boolean);
  const segment = segments[0] || "";
  const employeeId = segments[1] || "";
  const activeView = employeeId && segment === "employees" ? "employee-details" : segmentToView[segment] || "dashboard";

  useEffect(() => {
    if (employeeId && controller.selectedEmployeeId !== employeeId) {
      controller.actions.setSelectedEmployeeId(employeeId);
    }
  }, [controller.actions, controller.selectedEmployeeId, employeeId]);

  const navigateView = (view, id = "") => {
    const path = view === "employee-details" && id ? `employees/${id}` : viewToPath[view] || "";
    navigate(`/hr/${path}`.replace(/\/$/, ""));
  };

  const props = { controller, onNavigate: navigateView };
  const views = {
    dashboard: <HRDashboard {...props} />,
    employees: <Employees {...props} />,
    "employee-details": <EmployeeDetails {...props} />,
    "employee-create": <EmployeeCreate {...props} />,
    departments: <Departments {...props} />,
    positions: <Positions {...props} />,
    branches: <Branches {...props} />,
    payroll: <Payroll {...props} />,
    attendance: <Attendance {...props} />,
    shifts: <Shifts {...props} />,
    leaves: <LeaveManagement {...props} />,
    performance: <Performance {...props} />,
    recruitment: <Recruitment {...props} />,
    tasks: <Tasks {...props} />,
    messages: <Messages {...props} />,
    reports: <Reports {...props} />,
    settings: <HRSettings {...props} />,
  };

  return (
    <main className="zenix-hr">
      <HRHeader
        search={controller.employeeFilters.filters.search}
        onSearch={(value) => controller.employeeFilters.updateFilter("search", value)}
        role={controller.role}
        roles={controller.roles}
        onRoleChange={controller.actions.setRole}
        onCreate={() => navigateView("employee-create")}
        onReset={controller.actions.resetState}
        unreadCount={controller.state.notifications.filter((item) => !item.read).length}
      />

      <HRNavigation groups={navigationGroups} activeView={activeView === "employee-details" ? "employees" : activeView} onNavigate={navigateView} />

      {views[activeView] || views.dashboard}

      {controller.toast && (
        <div className="zenix-hr__toast" role="status">
          {controller.toast}
        </div>
      )}
    </main>
  );
};

export default HR;
