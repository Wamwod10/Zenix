import {
  ArrowRight,
  Building2,
  Check,
  Factory,
  GraduationCap,
  Hotel,
  Pill,
  ShoppingBag,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui";
import { useGlassFollow } from "../../../shared/hooks/useGlassFollow";
import "./BusinessType.scss";

const businessCategories = [
  {
    id: "retail",
    title: "Savdo",
    description: "Do‘kon, market va mahsulot savdosi.",
    icon: ShoppingBag,
    tone: "blue",
    types: [
      "Telefon do‘koni",
      "Maishiy texnika",
      "Kompyuter do‘koni",
      "Mini market",
      "Supermarket",
      "Kiyim do‘koni",
      "Poyabzal do‘koni",
      "Kosmetika",
      "Zargarlik",
      "Kitob do‘koni",
      "O‘yinchoqlar",
      "Sport anjomlari",
      "Gul do‘koni",
      "Avto ehtiyot qismlar",
      "Qurilish materiallari",
      "Mebel",
      "Elektronika",
      "Optika",
    ],
    modules: [
      "Mahsulotlar",
      "Ombor",
      "Kassa",
      "Mijozlar",
      "Yetkazuvchilar",
      "Shtrix-kod",
    ],
  },
  {
    id: "food",
    title: "Ovqatlanish",
    description: "Restoran, kafe, fast food va oshxona.",
    icon: UtensilsCrossed,
    tone: "orange",
    types: [
      "Restoran",
      "Kafe",
      "Fast food",
      "Milliy taomlar",
      "Burger",
      "Pitseriya",
      "Sushi",
      "Choyxona",
      "Kofe shop",
      "Nonvoyxona",
      "Qandolat",
      "Oshxona",
      "Catering",
    ],
    modules: [
      "Menyu",
      "Stollar",
      "Oshxona",
      "Buyurtmalar",
      "Yetkazish",
      "To‘lovlar",
    ],
  },
  {
    id: "medical",
    title: "Apteka va tibbiyot",
    description: "Dorixona, klinika va tibbiy xizmatlar.",
    icon: Pill,
    tone: "rose",
    types: [
      "Dorixona",
      "Klinika",
      "Stomatologiya",
      "Diagnostika markazi",
      "Laboratoriya",
      "Veterinariya klinikasi",
      "Tibbiy buyumlar do‘koni",
    ],
    modules: [
      "Dorilar",
      "Partiyalar",
      "Yaroqlilik",
      "Bemorlar",
      "Qabullar",
      "Ombor",
    ],
  },
  {
    id: "education",
    title: "Ta’lim",
    description: "O‘quv markazi, kurslar va bog‘cha.",
    icon: GraduationCap,
    tone: "violet",
    types: [
      "O‘quv markazi",
      "IT akademiya",
      "Til markazi",
      "Maktab",
      "Bog‘cha",
      "Universitet",
      "O‘quv kurslari",
      "Haydovchilik maktabi",
    ],
    modules: [
      "O‘quvchilar",
      "Guruhlar",
      "Dars jadvali",
      "To‘lovlar",
      "Davomat",
      "Ustozlar",
    ],
  },
  {
    id: "service",
    title: "Xizmat ko‘rsatish",
    description: "Salon, servis va xizmat bizneslari.",
    icon: Wrench,
    tone: "green",
    types: [
      "Telefon ta’mirlash",
      "Kompyuter servisi",
      "Avtoservis",
      "Go‘zallik saloni",
      "Barbershop",
      "Kimyoviy tozalash",
      "Kir yuvish",
      "Foto studio",
      "Reklama agentligi",
      "Turizm agentligi",
    ],
    modules: [
      "Bronlar",
      "Xizmatlar",
      "Mijozlar",
      "Jamoa",
      "To‘lovlar",
      "Vazifalar",
    ],
  },
  {
    id: "production",
    title: "Ishlab chiqarish",
    description: "Mahsulot ishlab chiqaruvchi korxonalar.",
    icon: Factory,
    tone: "teal",
    types: [
      "Tikuvchilik",
      "Mebel ishlab chiqarish",
      "Metall ishlab chiqarish",
      "Plastik mahsulotlar",
      "Poligrafiya",
      "Oziq-ovqat ishlab chiqarish",
      "Ichimlik ishlab chiqarish",
    ],
    modules: [
      "Xomashyo",
      "Ishlab chiqarish",
      "Ombor",
      "Buyurtmalar",
      "Xarajatlar",
      "Sifat nazorati",
    ],
  },
  {
    id: "hospitality",
    title: "Mehmonxona",
    description: "Hotel, hostel va dam olish maskanlari.",
    icon: Hotel,
    tone: "sky",
    types: [
      "Mehmonxona",
      "Hostel",
      "Kapsula hotel",
      "Dam olish maskani",
      "Mehmon uyi",
      "Resort",
      "Sanatoriya",
    ],
    modules: [
      "Xonalar",
      "Bronlash",
      "Kirish",
      "Chiqish",
      "Tozalash",
      "Mehmonlar",
    ],
  },
  {
    id: "construction",
    title: "Qurilish",
    description: "Qurilish, ta’mirlash va developerlik.",
    icon: Building2,
    tone: "amber",
    types: [
      "Qurilish kompaniyasi",
      "Ta’mirlash xizmati",
      "Arxitektura",
      "Dizayn studiyasi",
      "Qurilish materiallari ishlab chiqarish",
      "Developer kompaniyalari",
    ],
    modules: [
      "Loyihalar",
      "Materiallar",
      "Jamoalar",
      "Budjet",
      "Muddatlar",
      "Hujjatlar",
    ],
  },
];

const defaultModules = [
  "Mahsulotlar",
  "Ombor",
  "Kassa",
  "CRM",
  "Hisobotlar",
  "AI",
];
const previewSwapDelay = 340;
const selectedBusinessStorageKey = "zenix:selectedBusinessType";

export default function BusinessType() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(() =>
    window.localStorage.getItem(selectedBusinessStorageKey),
  );
  const [previewCategory, setPreviewCategory] = useState(null);
  const [previewStatus, setPreviewStatus] = useState("idle");
  const glassFollowRef = useGlassFollow();

  const selectedCategory = businessCategories.find(
    (item) => item.id === selected,
  );

  const previewModules = previewCategory
    ? previewCategory.modules.slice(0, 6)
    : defaultModules;

  const previewContentClasses = [
    "business-type__preview-content",
    previewStatus !== "idle"
      ? `business-type__preview-content--${previewStatus}`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    if (selectedCategory?.id === previewCategory?.id) return undefined;

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

  const handleSelect = (businessTypeId) => {
    setSelected(businessTypeId);
    window.localStorage.setItem(selectedBusinessStorageKey, businessTypeId);
  };

  const handleContinue = () => {
    if (!selectedCategory) return;

    navigate("/business-setup", {
      state: {
        businessTypeId: selectedCategory.id,
      },
    });
  };

  return (
    <main className="business-type">
      <section className="business-type__left">
        <div className="business-type__header">
          <span className="business-type__step">2 / 5-qadam</span>

          <h1>Biznes turini tanlang.</h1>

          <p>
            Tanlovingiz asosida ZENIX ish maydonini biznesingizga moslaydi:
            modullar, maydonlar, atamalar va AI imkoniyatlari avtomatik
            tayyorlanadi.
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
                onClick={() => handleSelect(item.id)}
              >
                <div className="business-type__icon">
                  <Icon size={23} />
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
          <Button
            rightIcon={<ArrowRight size={18} />}
            disabled={!selected}
            onClick={handleContinue}
          >
            Davom etish
          </Button>
        </div>
      </section>

      <aside className="business-type__right">
        <div className="business-type__follow" ref={glassFollowRef}>
          <div className="business-type__setup-card">
            <div className="business-type__setup-top">
              <span>2 / 5-qadam</span>
              <strong>Ish maydonini sozlash</strong>
            </div>

            <div className="business-type__progress">
              <div className="business-type__progress-item business-type__progress-item--done">
                <span>1</span>
                <p>Akkaunt</p>
              </div>

              <div className="business-type__rope business-type__rope--active" />

              <div className="business-type__progress-item business-type__progress-item--active">
                <span>2</span>
                <p>Biznes</p>
              </div>

              <div className="business-type__rope" />

              <div className="business-type__progress-item">
                <span>3</span>
                <p>Ish maydoni</p>
              </div>

              <div className="business-type__rope" />

              <div className="business-type__progress-item">
                <span>4</span>
                <p>Tariflar</p>
              </div>

              <div className="business-type__rope" />

              <div className="business-type__progress-item">
                <span>5</span>
                <p>AI tayyor</p>
              </div>
            </div>

            <div className="business-type__preview">
              <span>ZENIX FAOLLASHTIRADI</span>

              <div className={previewContentClasses}>
                <h2>
                  {previewCategory ? previewCategory.title : "Biznes modullari"}
                </h2>

                <div className="business-type__modules">
                  {previewModules.map((module, index) => (
                    <div
                      key={`${module}-${index}`}
                      style={{ "--module-index": index }}
                    >
                      <Check size={15} />
                      {module}
                    </div>
                  ))}
                </div>

                {previewCategory?.types?.length > 0 && (
                  <div className="business-type__types-preview">
                    <span>Ichki turlar</span>
                    <p>{previewCategory.types.join(", ")}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </main>
  );
}
