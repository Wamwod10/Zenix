import {
  BarChart3,
  Gem,
  GitBranch,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  Settings,
  Tags,
  Users,
} from "lucide-react";

export const CRM_PATHS = Object.freeze({
  root: "/crm",
  dashboard: "/crm/dashboard",

  customers: "/crm/customers",
  customerCreate: "/crm/customers/new",
  customerDetails: "/crm/customers/:customerId",
  customerEdit: "/crm/customers/:customerId/edit",

  pipeline: "/crm/pipeline",
  activities: "/crm/activities",
  loyalty: "/crm/loyalty",

  segments: "/crm/marketing/segments",
  campaigns: "/crm/marketing/campaigns",

  analytics: "/crm/analytics",
  settings: "/crm/settings",
});

export const getCustomerDetailsPath = (customerId) =>
  `/crm/customers/${encodeURIComponent(customerId)}`;

export const getCustomerEditPath = (customerId) =>
  `/crm/customers/${encodeURIComponent(customerId)}/edit`;

export const crmNavigationGroups = [
  {
    id: "management",
    label: "Boshqaruv",
    items: [
      {
        id: "overview",
        label: "Hub",
        description: "CRM ko‘rsatkichlari va AI signallari",
        path: CRM_PATHS.root,
        icon: LayoutDashboard,
        permission: "crm.view",
        exact: true,
      },
      {
        id: "dashboard",
        label: "Dashboard",
        description: "CRM ko'rsatkichlari va AI signallari",
        path: CRM_PATHS.dashboard,
        icon: LayoutDashboard,
        permission: "crm.view",
      },
      {
        id: "customers",
        label: "Mijozlar",
        description: "Mijozlar bazasi va profillari",
        path: CRM_PATHS.customers,
        icon: Users,
        permission: "crm.customers.view",
      },
      {
        id: "pipeline",
        label: "Savdo voronkasi",
        description: "Lead, taklif va savdo bosqichlari",
        path: CRM_PATHS.pipeline,
        icon: GitBranch,
        permission: "crm.pipeline.view",
      },
    ],
  },
  {
    id: "relationships",
    label: "Mijozlar bilan ishlash",
    items: [
      {
        id: "activities",
        label: "Vazifalar",
        description: "Qo‘ng‘iroq, uchrashuv va eslatmalar",
        path: CRM_PATHS.activities,
        icon: ListChecks,
        permission: "crm.activities.view",
      },
      {
        id: "loyalty",
        label: "Sodiqlik",
        description: "Bonus, keshbek va darajalar",
        path: CRM_PATHS.loyalty,
        icon: Gem,
        permission: "crm.loyalty.view",
      },
    ],
  },
  {
    id: "growth",
    label: "O‘sish",
    items: [
      {
        id: "segments",
        label: "Segmentlar",
        description: "Shartli va AI segmentatsiya",
        path: CRM_PATHS.segments,
        icon: Tags,
        permission: "crm.segments.view",
      },
      {
        id: "campaigns",
        label: "Kampaniyalar",
        description: "Maqsadli marketing kampaniyalari",
        path: CRM_PATHS.campaigns,
        icon: Megaphone,
        permission: "crm.campaigns.view",
      },
      {
        id: "analytics",
        label: "Tahlillar",
        description: "LTV, retention, churn va qarz",
        path: CRM_PATHS.analytics,
        icon: BarChart3,
        permission: "crm.analytics.view",
      },
    ],
  },
  {
    id: "system",
    label: "Tizim",
    items: [
      {
        id: "settings",
        label: "Sozlamalar",
        description: "CRM qoidalari va ruxsatlari",
        path: CRM_PATHS.settings,
        icon: Settings,
        permission: "crm.settings.view",
      },
    ],
  },
];

export const crmNavigation = crmNavigationGroups.flatMap(
  (group) => group.items,
);

export const isCrmNavigationItemActive = (item, pathname) => {
  if (!item?.path || !pathname) {
    return false;
  }

  if (item.exact) {
    return pathname === item.path;
  }

  return pathname === item.path || pathname.startsWith(`${item.path}/`);
};

export const getAllowedCrmNavigationGroups = (permissions = []) => {
  if (!permissions.length) {
    return crmNavigationGroups;
  }

  return crmNavigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.permission || permissions.includes(item.permission),
      ),
    }))
    .filter((group) => group.items.length > 0);
};

export default crmNavigationGroups;
