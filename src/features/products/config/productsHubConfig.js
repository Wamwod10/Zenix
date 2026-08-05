import {
  BarChart3,
  CircleDollarSign,
  Factory,
  FolderTree,
  Import,
  PackageSearch,
  Settings,
  Tags,
} from "lucide-react";

export const productsHubConfig = {
  id: "products",
  title: "Mahsulotlar",
  description: "Mahsulot katalogi, narxlar, tasniflar va operatsion nazorat uchun yo'nalishlar.",
  sections: [
    {
      id: "catalog",
      title: "Katalog",
      items: [
        {
          id: "products-list",
          title: "Mahsulotlar ro'yxati",
          description: "Barcha mahsulotlarni ko'rish, qidirish va boshqarish.",
          icon: PackageSearch,
          route: "/products/list",
          order: 1,
        },
        {
          id: "products-categories",
          title: "Kategoriyalar",
          description: "Katalog tuzilmasi va mahsulot guruhlarini boshqarish.",
          icon: FolderTree,
          route: "/products/categories",
          order: 2,
        },
        {
          id: "products-brands",
          title: "Brendlar va birliklar",
          description: "Brendlar, ishlab chiqaruvchilar va o'lchov birliklari.",
          icon: Factory,
          route: "/products/brands",
          order: 3,
        },
      ],
    },
    {
      id: "commerce",
      title: "Narx va ta'minot",
      items: [
        {
          id: "products-pricing",
          title: "Narxlar",
          description: "Sotuv narxlari, price list va marjalarni boshqarish.",
          icon: CircleDollarSign,
          route: "/products/pricing",
          permission: { key: "canViewSellingPrice", fallback: "disabled" },
          order: 1,
        },
        {
          id: "products-suppliers",
          title: "Supplier narxlari",
          description: "Mahsulot bo'yicha yetkazib beruvchi bog'lanishlari.",
          icon: Tags,
          route: "/suppliers/list",
          permission: { key: "canCreateSupplierRelation", fallback: "disabled" },
          order: 2,
        },
      ],
    },
    {
      id: "management",
      title: "Boshqaruv",
      items: [
        {
          id: "products-import-export",
          title: "Import va eksport",
          description: "Mahsulotlarni fayl orqali kiritish yoki chiqarish.",
          icon: Import,
          route: "/products/import-export",
          permission: { key: "canImport", fallback: "disabled" },
          order: 1,
        },
        {
          id: "products-analytics",
          title: "Mahsulotlar tahlili",
          description: "Savdo, qoldiq, marja va talab bo'yicha tahlil.",
          icon: BarChart3,
          route: "/products/analytics",
          order: 2,
        },
        {
          id: "products-settings",
          title: "Product settings",
          description: "Katalog sozlamalari, ruxsatlar va xabarnomalar.",
          icon: Settings,
          route: "/products/settings",
          permission: { key: "canSettings", fallback: "disabled" },
          order: 3,
        },
      ],
    },
  ],
};
