import { MODULE_CATEGORIES, getSidebarModules } from "./modules";
import { DEFAULT_BUSINESS_TYPE, getBusinessTypeById } from "./businessTypes";

export const NAVIGATION_GROUPS = [
  {
    id: "main",
    title: "Asosiy",
    categories: [MODULE_CATEGORIES.core, MODULE_CATEGORIES.commerce],
  },
  {
    id: "operations",
    title: "Operatsiyalar",
    categories: [MODULE_CATEGORIES.operations],
  },
  {
    id: "finance",
    title: "Moliya",
    categories: [MODULE_CATEGORIES.finance],
  },
  {
    id: "team",
    title: "Jamoa",
    categories: [MODULE_CATEGORIES.people],
  },
  {
    id: "ai",
    title: "AI",
    categories: [MODULE_CATEGORIES.intelligence],
  },
  {
    id: "system",
    title: "Tizim",
    categories: [MODULE_CATEGORIES.system],
  },
];

export const buildNavigation = ({
  businessTypeId = DEFAULT_BUSINESS_TYPE,
  permissions = [],
} = {}) => {
  const businessType = getBusinessTypeById(businessTypeId);
  const sidebarModules = getSidebarModules(businessType.modules);

  const allowedModules = sidebarModules.filter((module) => {
    if (!module.permission) return true;
    if (!permissions.length) return true;

    return permissions.includes(module.permission);
  });

  const groups = NAVIGATION_GROUPS.map((group) => {
    const items = allowedModules.filter((module) =>
      group.categories.includes(module.category)
    );

    return {
      ...group,
      items,
    };
  }).filter((group) => group.items.length > 0);

  return {
    businessType,
    groups,
    items: allowedModules,
  };
};

export const getNavigationItems = (businessTypeId = DEFAULT_BUSINESS_TYPE) =>
  buildNavigation({ businessTypeId }).items;

export const getNavigationGroups = (businessTypeId = DEFAULT_BUSINESS_TYPE) =>
  buildNavigation({ businessTypeId }).groups;