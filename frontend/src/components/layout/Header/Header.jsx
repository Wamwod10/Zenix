import {
  Bell,
  ChevronDown,
  Command,
  Moon,
  Search,
  Sparkles,
} from "lucide-react";
import { useBusinessType } from "../../../hooks/useBusinessType";
import "./Header.scss";

const Header = () => {
  const { businessType, workspaceLabel } = useBusinessType();

  return (
    <div className="zenix-header">
      <div className="zenix-header__workspace">
        <span className="zenix-header__workspace-kicker">
          <i />
          {workspaceLabel}
        </span>
        <h1>{businessType.title}</h1>
      </div>

      <button className="zenix-header__search" type="button">
        <Search size={18} />
        <span className="zenix-header__search-copy">
          Qidirish: mahsulot, mijoz, buyurtma, chek...
        </span>
        <span className="zenix-header__search-modules">
          <small>POS</small>
          <small>CRM</small>
          <small>Ombor</small>
        </span>
        <span className="zenix-header__search-ai">
          <Sparkles size={12} />
          AI
        </span>
        <kbd>
          <Command size={13} /> K
        </kbd>
      </button>

      <div className="zenix-header__actions">
        <div className="zenix-header__status" aria-label="Workspace status">
          <i />
          <span>Live</span>
        </div>

        <button className="zenix-header__ai" type="button">
          <Sparkles size={17} />
          <span>AI</span>
        </button>

        <button className="zenix-header__circle" type="button">
          <Moon size={18} />
        </button>

        <button
          className="zenix-header__circle zenix-header__circle--notify"
          type="button"
        >
          <Bell size={18} />
          <i />
        </button>

        <button className="zenix-header__profile" type="button">
          <span className="zenix-header__avatar">S</span>

          <span className="zenix-header__user">
            <strong>Shamshod</strong>
            <small>Owner</small>
          </span>

          <ChevronDown size={16} />
        </button>
      </div>
    </div>
  );
};

export default Header;
