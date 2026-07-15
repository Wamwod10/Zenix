import { PackagePlus, ShoppingCart, UserPlus, WalletCards } from "lucide-react";
import "./QuickActions.scss";

const actions = [
  {
    icon: ShoppingCart,
    title: "Yangi Savdo",
    text: "POS oynasini ochish",
    tone: "green",
  },
  {
    icon: PackagePlus,
    title: "Mahsulot Qo'shish",
    text: "Omborga yangi SKU",
    tone: "blue",
  },
  {
    icon: WalletCards,
    title: "Xarid Yaratish",
    text: "Ta'minot rejasini boshlash",
    tone: "gold",
  },
  {
    icon: UserPlus,
    title: "Mijoz Qo'shish",
    text: "CRM profil yaratish",
    tone: "purple",
  },
];

const QuickActions = () => {
  return (
    <section className="quick-actions" aria-label="Tezkor amallar">
      {actions.map((action, index) => {
        const Icon = action.icon;

        return (
          <button
            className={`quick-actions__card quick-actions__card--${action.tone}`}
            key={action.title}
            style={{ "--action-index": index }}
            type="button"
          >
            <span>
              <Icon size={18} />
            </span>
            <div>
              <strong>{action.title}</strong>
              <small>{action.text}</small>
            </div>
          </button>
        );
      })}
    </section>
  );
};

export default QuickActions;
