import { Outlet } from "react-router-dom";
import { Header } from "../Header";
import { Sidebar } from "../Sidebar";
import "./AppShell.scss";

export function AppShell() {
  return (
    <div className="app-shell">
      <Sidebar />

      <div className="app-shell__workspace">
        <Header />

        <main className="app-shell__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}