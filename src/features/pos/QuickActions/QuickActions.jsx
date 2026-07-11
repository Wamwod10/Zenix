import {
  BadgePercent,
  CreditCard,
  FileText,
  PauseCircle,
  RotateCcw,
  Search,
  Settings,
  ShieldX,
} from "lucide-react";

import "./QuickActions.scss";

const actions = [
  {
    icon: Search,
    label: "Search",
    shortcut: "F3",
    action: "search",
  },
  {
    icon: CreditCard,
    label: "Payment",
    shortcut: "F4",
    action: "payment",
  },
  {
    icon: PauseCircle,
    label: "New sale",
    shortcut: "F2",
    action: "new-sale",
  },
  {
    icon: PauseCircle,
    label: "Hold sale",
    shortcut: "F6",
    action: "hold",
  },
  {
    icon: RotateCcw,
    label: "Return",
    shortcut: "",
    action: "return",
  },
  {
    icon: BadgePercent,
    label: "Discount",
    shortcut: "F9",
    action: "discount",
  },
  {
    icon: FileText,
    label: "Order note",
    shortcut: "",
    action: "note",
  },
  {
    icon: ShieldX,
    label: "Void",
    shortcut: "F8",
    action: "void",
  },
  {
    icon: Settings,
    label: "Settings",
    shortcut: "",
    action: "settings",
  },
];

const QuickActions = ({ onAction }) => {
  return (
    <div className="pos-quick-actions">
      {actions.map((item) => {
        const Icon = item.icon;

        return (
          <button
            type="button"
            key={item.action}
            onClick={() => onAction?.(item.action)}
          >
            <Icon size={17} />
            <span>{item.label}</span>
            <kbd>{item.shortcut}</kbd>
          </button>
        );
      })}
    </div>
  );
};

export default QuickActions;
