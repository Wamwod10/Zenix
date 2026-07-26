export const hrRoles = [
  { id: "owner", label: "Owner" },
  { id: "hrAdmin", label: "HR admin" },
  { id: "hrManager", label: "HR manager" },
  { id: "branchManager", label: "Branch manager" },
  { id: "accountant", label: "Accountant" },
  { id: "employee", label: "Employee" },
  { id: "viewer", label: "Viewer" },
];

export const hrPermissionMatrix = {
  owner: ["*"],
  hrAdmin: [
    "salary.view",
    "salary.edit",
    "payroll.approve",
    "employee.edit",
    "employee.terminate",
    "document.view",
    "bank.view",
    "role.assign",
    "permission.change",
    "attendance.correct",
    "leave.approve",
  ],
  hrManager: [
    "employee.edit",
    "document.view",
    "attendance.correct",
    "leave.approve",
  ],
  branchManager: [
    "employee.edit",
    "attendance.correct",
    "leave.approve",
  ],
  accountant: ["salary.view", "salary.edit", "payroll.approve", "bank.view"],
  employee: [],
  viewer: [],
};

export const sensitiveActions = [
  { id: "salary.view", label: "Salary view", area: "Payroll" },
  { id: "salary.edit", label: "Salary edit", area: "Payroll" },
  { id: "payroll.approve", label: "Payroll approval", area: "Payroll" },
  { id: "employee.edit", label: "Employee edit", area: "Employees" },
  { id: "employee.terminate", label: "Termination", area: "Offboarding" },
  { id: "document.view", label: "Document access", area: "Documents" },
  { id: "bank.view", label: "Bank card access", area: "Personal data" },
  { id: "role.assign", label: "Role assignment", area: "Permissions" },
  { id: "permission.change", label: "Permission change", area: "Permissions" },
];
