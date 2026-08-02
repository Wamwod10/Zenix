import { Navigate, Outlet, Route, Routes, useLocation, useNavigate, useOutletContext } from "react-router-dom";
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
  { id: "management", title: "Boshqaruv", items: [{ id: "dashboard", path: "/hr", label: "HR boshqaruv paneli", icon: LayoutDashboard }] },
  {
    id: "employees",
    title: "Xodimlar",
    items: [
      { id: "employees", path: "/hr/employees", label: "Xodimlar", icon: Users },
      { id: "departments", path: "/hr/departments", label: "Bo'limlar", icon: GitBranch },
      { id: "positions", path: "/hr/positions", label: "Lavozimlar", icon: BriefcaseBusiness },
      { id: "branches", path: "/hr/branches", label: "Filiallar", icon: GitBranch },
      { id: "employee-create", path: "/hr/employee-create", label: "Yangi xodim", icon: UserPlus },
    ],
  },
  {
    id: "payroll",
    title: "Oylik",
    items: [
      { id: "payroll", path: "/hr/payroll", label: "Oylik hisobi", icon: Banknote },
      { id: "payslip", path: "/hr/payroll?view=payslip", label: "Payslip", icon: FileText },
      { id: "payroll-analytics", path: "/hr/payroll?view=analytics", label: "Analitika", icon: ListChecks },
    ],
  },
  {
    id: "attendance",
    title: "Davomat",
    items: [
      { id: "attendance", path: "/hr/attendance", label: "Davomat", icon: CalendarClock },
      { id: "shifts", path: "/hr/shifts", label: "Smenalar", icon: CalendarClock },
      { id: "schedules", path: "/hr/shifts?view=schedules", label: "Ish jadvali", icon: ClipboardCheck },
    ],
  },
  { id: "requests", title: "Ta'til", items: [{ id: "leaves", path: "/hr/leaves", label: "Ta'til boshqaruvi", icon: FileClock }] },
  { id: "performance", title: "Samaradorlik", items: [{ id: "performance", path: "/hr/performance", label: "KPI va baholash", icon: Award }] },
  { id: "recruitment", title: "Ishga olish", items: [{ id: "recruitment", path: "/hr/recruitment", label: "Nomzodlar pipeline", icon: UserPlus }] },
  {
    id: "collaboration",
    title: "Hamkorlik",
    items: [
      { id: "tasks", path: "/hr/tasks", label: "Vazifalar", icon: ClipboardCheck },
      { id: "messages", path: "/hr/messages", label: "Ichki xabarlar", icon: MessageCircle },
      { id: "birthdays", path: "/hr?focus=birthdays", label: "Tug'ilgan kunlar", icon: Cake },
    ],
  },
  {
    id: "control",
    title: "Nazorat",
    items: [
      { id: "reports", path: "/hr/reports", label: "Hisobot va audit", icon: ShieldCheck },
      { id: "settings", path: "/hr/settings", label: "Ruxsatlar", icon: Settings },
      { id: "ai", path: "/hr?focus=ai", label: "AI tavsiyalar", icon: Bot },
      { id: "notifications", path: "/hr/reports?view=notifications", label: "Bildirishnomalar", icon: Bell },
    ],
  },
];

const pathToView = {
  "": "dashboard",
  employees: "employees",
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

const useHRRouteContext = () => useOutletContext();

const HRRoute = ({ element: Element }) => {
  const context = useHRRouteContext();
  return <Element {...context} />;
};

const HRShell = ({ controller, navigateView }) => {
  const location = useLocation();
  const segment = location.pathname.replace(/^\/hr\/?/, "").split("/").filter(Boolean)[0] || "";
  const activeView = pathToView[segment] || "dashboard";
  const unreadCount = controller.state.notifications.filter((item) => !item.read).length;

  return (
    <main className="zenix-hr">
      <HRHeader
        search={controller.employeeFilters.filters.search}
        onSearch={(value) => controller.employeeFilters.updateFilter("search", value)}
        employees={controller.state.employees}
        dictionaries={controller.dictionaries}
        role={controller.role}
        roles={controller.roles}
        onRoleChange={controller.actions.setRole}
        onCreate={() => navigateView("employee-create")}
        onReset={controller.actions.resetState}
        notifications={controller.state.notifications}
        unreadCount={unreadCount}
        onNavigate={navigateView}
      />

      <HRNavigation groups={navigationGroups} activeView={segment === "employees" ? "employees" : activeView} />

      <Outlet context={{ controller, onNavigate: navigateView }} />

      {controller.toast && (
        <div className="zenix-hr__toast" role="status">
          {controller.toast}
        </div>
      )}
    </main>
  );
};

const HR = () => {
  const controller = useHRController();
  const navigate = useNavigate();

  const navigateView = (view, id = "") => {
    const path = view === "employee-details" && id ? `employees/${id}` : viewToPath[view] || "";
    navigate(`/hr/${path}`.replace(/\/$/, ""));
  };

  return (
    <Routes>
      <Route element={<HRShell controller={controller} navigateView={navigateView} />}>
        <Route index element={<HRRoute element={HRDashboard} />} />
        <Route path="employees" element={<HRRoute element={Employees} />} />
        <Route path="employees/:employeeId" element={<HRRoute element={EmployeeDetails} />} />
        <Route path="employee-create" element={<HRRoute element={EmployeeCreate} />} />
        <Route path="create" element={<Navigate to="/hr/employee-create" replace />} />
        <Route path="departments" element={<HRRoute element={Departments} />} />
        <Route path="positions" element={<HRRoute element={Positions} />} />
        <Route path="branches" element={<HRRoute element={Branches} />} />
        <Route path="payroll" element={<HRRoute element={Payroll} />} />
        <Route path="attendance" element={<HRRoute element={Attendance} />} />
        <Route path="shifts" element={<HRRoute element={Shifts} />} />
        <Route path="leaves" element={<HRRoute element={LeaveManagement} />} />
        <Route path="leave" element={<Navigate to="/hr/leaves" replace />} />
        <Route path="performance" element={<HRRoute element={Performance} />} />
        <Route path="recruitment" element={<HRRoute element={Recruitment} />} />
        <Route path="tasks" element={<HRRoute element={Tasks} />} />
        <Route path="messages" element={<HRRoute element={Messages} />} />
        <Route path="reports" element={<HRRoute element={Reports} />} />
        <Route path="settings" element={<HRRoute element={HRSettings} />} />
        <Route path="*" element={<Navigate to="/hr" replace />} />
      </Route>
    </Routes>
  );
};

export default HR;
