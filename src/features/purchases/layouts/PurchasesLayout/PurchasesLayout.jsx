// Xaridlar moduli ichki navigatsiyasi (PDF ierarxiyasi bo'yicha):
// Dashboard · Buyurtmalar · Qabul · Qaytarishlar · Invoyslar va to'lovlar.

import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  BarChart3,
  ClipboardCheck,
  ClipboardList,
  Grid2X2,
  LayoutDashboard,
  PackageCheck,
  Receipt,
  Undo2,
} from "lucide-react";

import NotificationBell from "../../notifications/components/NotificationBell/NotificationBell";

import "./PurchasesLayout.scss";

const PURCHASES_TABS = [
  { to: "/purchases", label: "Hub", icon: Grid2X2, end: true },
  { to: "/purchases/overview", label: "Dashboard", icon: LayoutDashboard },
  { to: "/purchases/orders", label: "Buyurtmalar", icon: ClipboardList },
  { to: "/purchases/receiving", label: "Qabul", icon: PackageCheck },
  { to: "/purchases/quality-inspection", label: "Sifat tekshiruvi", icon: ClipboardCheck },
  { to: "/purchases/returns", label: "Qaytarishlar", icon: Undo2 },
  { to: "/purchases/invoices", label: "Invoyslar va to'lovlar", icon: Receipt },
  { to: "/purchases/reports", label: "Hisobotlar", icon: BarChart3 },
];

const PurchasesLayout = () => {
  const location = useLocation();
  const isHubRoute = location.pathname.replace(/\/$/, "") === "/purchases";

  return (
    <main className="zenix-purchases">
      {!isHubRoute ? (
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
      ) : null}

      <section className="zenix-purchases__content">
        <Outlet />
      </section>
    </main>
  );
};

export default PurchasesLayout;
