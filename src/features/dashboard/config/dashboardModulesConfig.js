import { MODULE_IDS, getModuleById } from "../../../config/modules";

const ROUTES_AVAILABLE_IN_APP = new Set([
  "/pos",
  "/products",
  "/crm",
  "/warehouse",
  "/purchases",
  "/suppliers",
  "/finance",
  "/reports",
  "/hr",
  "/settings",
]);

const PRIORITY_MODULES_BY_BUSINESS_TYPE = {
  retail: [MODULE_IDS.pos, MODULE_IDS.inventory, MODULE_IDS.finance, MODULE_IDS.purchases],
  food: [MODULE_IDS.pos, MODULE_IDS.inventory, MODULE_IDS.purchases, MODULE_IDS.finance],
  restaurant: [MODULE_IDS.pos, MODULE_IDS.inventory, MODULE_IDS.purchases, MODULE_IDS.finance],
  production: [MODULE_IDS.inventory, MODULE_IDS.purchases, MODULE_IDS.finance, MODULE_IDS.reports],
  services: [MODULE_IDS.crm, MODULE_IDS.finance, MODULE_IDS.reports, MODULE_IDS.hr],
  default: [MODULE_IDS.pos, MODULE_IDS.inventory, MODULE_IDS.finance, MODULE_IDS.purchases],
};

const DASHBOARD_MODULES = [
  {
    id: MODULE_IDS.pos,
    title: "Savdo kassasi",
    description: "Savdo, smena va to'lovlar.",
  },
  {
    id: MODULE_IDS.products,
    title: "Mahsulotlar",
    description: "Katalog, kategoriyalar va narxlar.",
  },
  {
    id: MODULE_IDS.crm,
    title: "Mijozlar",
    description: "Mijozlar bazasi va segmentlar.",
  },
  {
    id: MODULE_IDS.inventory,
    title: "Ombor",
    description: "Qoldiq, harakatlar va inventarizatsiya.",
  },
  {
    id: MODULE_IDS.purchases,
    title: "Xaridlar",
    description: "Buyurtmalar va qabul jarayonlari.",
  },
  {
    id: MODULE_IDS.suppliers,
    title: "Yetkazib beruvchilar",
    description: "Supplierlar va mahsulot bog'lanishlari.",
  },
  {
    id: MODULE_IDS.finance,
    title: "Moliya",
    description: "Pul harakati va hisoblar.",
  },
  {
    id: MODULE_IDS.reports,
    title: "Hisobotlar",
    description: "Operatsion va moliyaviy hisobotlar.",
  },
  {
    id: MODULE_IDS.hr,
    title: "Xodimlar HR",
    description: "Xodimlar, davomat va payroll.",
  },
  {
    id: MODULE_IDS.settings,
    title: "Sozlamalar",
    description: "Kompaniya va tizim parametrlari.",
  },
];

const orderDashboardModules = (businessTypeId) => {
  const priority =
    PRIORITY_MODULES_BY_BUSINESS_TYPE[businessTypeId] ||
    PRIORITY_MODULES_BY_BUSINESS_TYPE.default;
  const priorityScore = new Map(priority.map((id, index) => [id, index]));

  return [...DASHBOARD_MODULES].sort((first, second) => {
    const firstPriority = priorityScore.has(first.id) ? priorityScore.get(first.id) : 100;
    const secondPriority = priorityScore.has(second.id) ? priorityScore.get(second.id) : 100;

    if (firstPriority !== secondPriority) return firstPriority - secondPriority;

    return (
      DASHBOARD_MODULES.findIndex((item) => item.id === first.id) -
      DASHBOARD_MODULES.findIndex((item) => item.id === second.id)
    );
  });
};

export const createDashboardModulesConfig = ({ businessTypeId } = {}) => ({
  id: "dashboard-modules",
  title: "Bo'limlar",
  description: "Asosiy modullarga tezkor kirish.",
  sections: [
    {
      id: "main",
      items: orderDashboardModules(businessTypeId).flatMap((card, index) => {
        const module = getModuleById(card.id);
        const route = module?.route;

        if (!route || !ROUTES_AVAILABLE_IN_APP.has(route)) {
          return [];
        }

        return [{
          ...card,
          icon: module?.icon,
          route,
          permission: module?.permission,
          order: index + 1,
        }];
      }),
    },
  ],
});
