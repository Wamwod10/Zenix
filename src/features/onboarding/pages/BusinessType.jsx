import {
  ArrowRight,
  Building2,
  Check,
  Factory,
  GraduationCap,
  ShoppingBag,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../../components/ui";
import "./BusinessType.scss";

const businessCategories = [
  {
    id: "retail",
    title: "Savdo",
    description: "Mahsulotni sotib olib, sotasiz.",
    icon: ShoppingBag,
    tone: "blue",
    modules: ["Products", "Warehouse", "POS", "Customers", "Reports", "AI"],
  },
  {
    id: "food",
    title: "Ovqatlanish",
    description: "Kafe, restoran va fast food.",
    icon: UtensilsCrossed,
    tone: "orange",
    modules: ["Menu", "Tables", "Kitchen", "Orders", "Delivery", "AI"],
  },
  {
    id: "education",
    title: "Ta'lim",
    description: "O'quv markazi, kurslar va bog'cha.",
    icon: GraduationCap,
    tone: "violet",
    modules: ["Students", "Groups", "Schedule", "Payments", "Attendance", "AI"],
  },
  {
    id: "production",
    title: "Ishlab chiqarish",
    description: "Mahsulot ishlab chiqaruvchi korxonalar.",
    icon: Factory,
    tone: "teal",
    modules: ["Materials", "Production", "Warehouse", "Orders", "Costs", "AI"],
  },
  {
    id: "service",
    title: "Xizmat",
    description: "Salon, servis va boshqa xizmatlar.",
    icon: Wrench,
    tone: "green",
    modules: ["Bookings", "Clients", "Services", "Staff", "Payments", "AI"],
  },
  {
    id: "construction",
    title: "Qurilish",
    description: "Qurilish va ko'chmas mulk.",
    icon: Building2,
    tone: "amber",
    modules: ["Projects", "Materials", "Teams", "Budget", "Timeline", "AI"],
  },
];

const defaultModules = ["Products", "Warehouse", "POS", "Customers", "Reports", "AI"];
const previewSwapDelay = 340;

export default function BusinessType() {
  const [selected, setSelected] = useState(null);
  const [previewCategory, setPreviewCategory] = useState(null);
  const [previewStatus, setPreviewStatus] = useState("idle");

  const selectedCategory = businessCategories.find(
    (item) => item.id === selected,
  );
  const previewModules = previewCategory?.modules || defaultModules;
  const previewContentClasses = [
    "business-type__preview-content",
    previewStatus !== "idle"
      ? `business-type__preview-content--${previewStatus}`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    if (selectedCategory?.id === previewCategory?.id) {
      return undefined;
    }

    setPreviewStatus("leaving");

    const swapTimer = window.setTimeout(() => {
      setPreviewCategory(selectedCategory || null);
      setPreviewStatus("entering");

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPreviewStatus("idle");
        });
      });
    }, previewSwapDelay);

    return () => window.clearTimeout(swapTimer);
  }, [previewCategory?.id, selectedCategory]);

  return (
    <main className="business-type">
      <section className="business-type__left">
        <div className="business-type__header">
          <span className="business-type__step">STEP 2 OF 5</span>

          <h1>Biznesingizni tanlang.</h1>

          <p>
            Tanlovingiz asosida ZENIX sizga mos modullar, maydonlar va AI
            imkoniyatlarini avtomatik tayyorlaydi.
          </p>
        </div>

        <div className="business-type__grid">
          {businessCategories.map((item) => {
            const Icon = item.icon;
            const isActive = selected === item.id;

            return (
              <button
                key={item.id}
                type="button"
                className={`business-type__card business-type__card--${item.tone} ${
                  isActive ? "business-type__card--active" : ""
                }`}
                onClick={() => setSelected(item.id)}
              >
                <div className="business-type__icon">
                  <Icon size={24} />
                </div>

                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>

                {isActive && (
                  <span className="business-type__check">
                    <Check size={16} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="business-type__footer">
          <Button rightIcon={<ArrowRight size={18} />} disabled={!selected}>
            Davom etish
          </Button>
        </div>
      </section>

      <aside className="business-type__right">
        <div className="business-type__setup-card">
          <div className="business-type__setup-top">
            <span>STEP 2 / 5</span>
            <strong>Workspace setup</strong>
          </div>

          <div className="business-type__progress">
            <div className="business-type__progress-item business-type__progress-item--done">
              <span>1</span>
              <p>Account</p>
            </div>

            <div className="business-type__rope business-type__rope--active" />

            <div className="business-type__progress-item business-type__progress-item--active">
              <span>2</span>
              <p>Business</p>
            </div>

            <div className="business-type__rope" />

            <div className="business-type__progress-item">
              <span>3</span>
              <p>Workspace</p>
            </div>

            <div className="business-type__rope" />

            <div className="business-type__progress-item">
              <span>4</span>
              <p>AI Ready</p>
            </div>
          </div>

          <div className="business-type__preview">
            <span>ZENIX WILL ENABLE</span>

            <div className={previewContentClasses}>
              <h2>
                {previewCategory ? previewCategory.title : "Business modules"}
              </h2>

              <div className="business-type__modules">
                {previewModules.map((module, index) => (
                  <div
                    key={module}
                    style={{ "--module-index": index }}
                  >
                    <Check size={15} />
                    {module}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </main>
  );
}
