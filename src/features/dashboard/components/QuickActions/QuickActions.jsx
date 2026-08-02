import { PackagePlus, ShoppingCart, UserPlus, WalletCards } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./QuickActions.scss";

const actions = [
  {
    icon: ShoppingCart,
    title: "Yangi savdo",
    text: "POS oynasini ochish",
    tone: "green",
    path: "/pos",
  },
  {
    icon: PackagePlus,
    title: "Mahsulot qo'shish",
    text: "Yangi mahsulot yaratish",
    tone: "blue",
    path: "/products/new",
  },
  {
    icon: WalletCards,
    title: "Xarid yaratish",
    text: "Yangi xarid buyurtmasi",
    tone: "gold",
    path: "/purchases/orders/new",
  },
  {
    icon: UserPlus,
    title: "Mijoz qo'shish",
    text: "CRM profil yaratish",
    tone: "purple",
    path: "/crm/customers/new",
  },
];

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <section className="quick-actions" aria-label="Tezkor amallar">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <button
            className={`quick-actions__card quick-actions__card--${action.tone}`}
            key={action.title}
            type="button"
            aria-label={`${action.title}: ${action.text}`}
            title={`${action.title}: ${action.text}`}
            onClick={() => navigate(action.path)}
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
