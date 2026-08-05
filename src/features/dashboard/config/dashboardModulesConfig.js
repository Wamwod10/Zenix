import { MODULE_IDS, getModuleById } from "../../../config/modules";

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

export const createDashboardModulesConfig = () => ({
  id: "dashboard-modules",
  title: "Dashboard",
  description: "Kerakli bo'limni tanlang.",
  sections: [
    {
      id: "main",
      items: DASHBOARD_MODULES.map((card, index) => {
        const module = getModuleById(card.id);

        return {
          ...card,
          icon: module?.icon,
          route: module?.route,
          permission: module?.permission,
          order: index + 1,
        };
      }),
    },
  ],
});
