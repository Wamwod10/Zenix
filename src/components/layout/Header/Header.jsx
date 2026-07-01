import { Bell, Search, Sparkles } from "lucide-react";
import "./Header.scss";

export function Header() {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <div className="app-header__logo">
          <Sparkles size={18} />
        </div>

        <div>
          <p className="app-header__eyebrow">AI Business OS</p>
          <strong className="app-header__title">ZENIX</strong>
        </div>
      </div>

      <div className="app-header__search">
        <Search size={18} />
        <input type="text" placeholder="Search products, sales, customers..." />
      </div>

      <button className="app-header__icon-btn" type="button" aria-label="Notifications">
        <Bell size={18} />
      </button>
    </header>
  );
}