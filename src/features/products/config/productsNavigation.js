import {
  BarChart3,
  CircleDollarSign,
  Factory,
  FolderTree,
  Import,
  PackageSearch,
  Settings,
  Sparkles,
} from "lucide-react";

export const productNavigationGroups = [
  {
    id: "catalog",
    title: "Katalog",
    items: [
      { id: "dashboard", label: "Bosh sahifa", path: "", icon: Sparkles, end: true },
      { id: "list", label: "Mahsulotlar ro'yxati", path: "list", icon: PackageSearch },
      { id: "categories", label: "Kategoriyalar", path: "categories", icon: FolderTree },
      { id: "brands", label: "Brendlar va birliklar", path: "brands", icon: Factory },
    ],
  },
  {
    id: "commerce",
    title: "Savdo",
    items: [
      { id: "pricing", label: "Narxlar", path: "pricing", icon: CircleDollarSign },
      { id: "import-export", label: "Import va eksport", path: "import-export", icon: Import },
      { id: "analytics", label: "Mahsulotlar tahlili", path: "analytics", icon: BarChart3 },
      { id: "settings", label: "Sozlamalar", path: "settings", icon: Settings },
    ],
  },
];

export const productNavigationItems = productNavigationGroups.flatMap((group) => group.items);

export const productPathByView = productNavigationItems.reduce(
  (map, item) => ({ ...map, [item.id]: item.path }),
  { new: "new" },
);
