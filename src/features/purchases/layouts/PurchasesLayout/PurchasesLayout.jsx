// Xaridlar moduli ichki navigatsiyasi (PDF ierarxiyasi bo'yicha):
// Dashboard · Buyurtmalar · Qabul · Qaytarishlar · Invoyslar va to'lovlar.

import { NavLink, Outlet } from "react-router-dom";
import {
  BarChart3,
  ClipboardCheck,
  ClipboardList,
  LayoutDashboard,
  PackageCheck,
  Receipt,
  Undo2,
} from "lucide-react";

import NotificationBell from "../../notifications/components/NotificationBell/NotificationBell";

import "./PurchasesLayout.scss";

const PURCHASES_TABS = [
  { to: "/purchases", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/purchases/orders", label: "Buyurtmalar", icon: ClipboardList },
  { to: "/purchases/receiving", label: "Qabul", icon: PackageCheck },
  { to: "/purchases/quality-inspection", label: "Sifat tekshiruvi", icon: ClipboardCheck },
  { to: "/purchases/returns", label: "Qaytarishlar", icon: Undo2 },
  { to: "/purchases/invoices", label: "Invoyslar va to'lovlar", icon: Receipt },
  { to: "/purchases/reports", label: "Hisobotlar", icon: BarChart3 },
];

const PurchasesLayout = () => (
  <main className="zenix-purchases">
    <nav className="zenix-purchases__tabs" aria-label="Xaridlar bo'limlari">
      {PURCHASES_TABS.map((tab) => {
        const Icon = tab.icon;

        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              [
                "zenix-purchases__tab",
                isActive ? "zenix-purchases__tab--active" : "",
              ]
                .filter(Boolean)
                .join(" ")
            }
          >
            <Icon size={16} />
            <span>{tab.label}</span>
          </NavLink>
        );
      })}

      <div className="zenix-purchases__tabs-spacer" />
      <NotificationBell />
    </nav>

    <section className="zenix-purchases__content">
      <Outlet />
    </section>
  </main>
);

export default PurchasesLayout;
