import {
  BadgePercent,
  Clock3,
  CreditCard,
  History,
  MonitorPlay,
  ReceiptText,
  RotateCcw,
} from "lucide-react";

export const POS_LOCAL_STORAGE_KEYS = {
  heldOrders: "zenix.sales.heldOrders.v2",
  recentSales: "zenix.sales.recentSales.v2",
};

export const posHubConfig = {
  id: "pos",
  title: "Savdo kassasi",
  description: "Savdoni boshlash, saqlangan cheklar, tarix va smena holatini tez boshqarish.",
  sections: [
    {
      id: "sales",
      title: "Savdo",
      items: [
        {
          id: "pos-terminal",
          title: "Savdo kassasi",
          description: "Mahsulotlarni sotish va to'lovni yakunlash.",
          icon: MonitorPlay,
          route: "/pos/terminal",
          permission: { key: "pos.sell", fallback: "enabled" },
          order: 1,
        },
        {
          id: "pos-held",
          title: "Saqlangan savdolar",
          description: "Vaqtincha saqlangan savdolarni davom ettirish.",
          icon: ReceiptText,
          route: "/pos/held",
          permission: { key: "pos.sell", fallback: "enabled" },
          order: 2,
        },
        {
          id: "pos-history",
          title: "So'nggi savdolar",
          description: "Cheklar va yakunlangan savdolar tarixini ko'rish.",
          icon: History,
          route: "/pos/history",
          permission: { key: "pos.view", fallback: "enabled" },
          order: 3,
        },
      ],
    },
    {
      id: "cash",
      title: "Smena va kassa",
      items: [
        {
          id: "pos-shift",
          title: "Smenani boshqarish",
          description: "Terminal smenasi va kassa holatini ko'rish.",
          icon: Clock3,
          route: "/pos/shift",
          permission: { key: "pos.shift", fallback: "enabled" },
          order: 1,
        },
        {
          id: "pos-payments",
          title: "To'lov turlari",
          description: "Naqd, karta va boshqa to'lovlarni terminalda qabul qilish.",
          icon: CreditCard,
          route: "/pos/terminal",
          permission: { key: "pos.sell", fallback: "enabled" },
          order: 2,
        },
      ],
    },
    {
      id: "management",
      title: "Boshqaruv",
      items: [
        {
          id: "pos-returns",
          title: "Qaytarish",
          description: "Chek asosida qaytarish jarayoniga tayyor yo'nalish.",
          icon: RotateCcw,
          route: "/pos/returns",
          permission: { key: "pos.return", fallback: "enabled" },
          order: 1,
        },
        {
          id: "pos-discounts",
          title: "Chegirmalar",
          description: "Chegirma va kuponlar terminal ichida qo'llanadi.",
          icon: BadgePercent,
          route: "/pos/terminal",
          permission: { key: "pos.sell", fallback: "enabled" },
          order: 2,
        },
      ],
    },
  ],
};
