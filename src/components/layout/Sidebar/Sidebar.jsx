import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  Users,
  Wallet,
  BarChart3,
  Settings,
  Sparkles,
} from "lucide-react";
import "./Sidebar.scss";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Products", icon: Boxes, path: "/products" },
  { label: "Sales", icon: ShoppingCart, path: "/sales" },
  { label: "Customers", icon: Users, path: "/customers" },
  { label: "Finance", icon: Wallet, path: "/finance" },
  { label: "Reports", icon: BarChart3, path: "/reports" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__top">
        <div className="sidebar__logo">
          <Sparkles size={18} />
        </div>

        <div>
          <p>AI Business OS</p>
          <strong>ZENIX</strong>
        </div>
      </div>

      <nav className="sidebar__nav">
        {navItems.map(({ label, icon: Icon, path }) => (
          <a key={path} className="sidebar__link" href={path}>
            <Icon size={18} />
            <span>{label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}