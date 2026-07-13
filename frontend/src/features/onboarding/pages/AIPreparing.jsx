import {
  BrainCircuit,
  Check,
  CircleDot,
  Cpu,
  DatabaseZap,
  LayoutDashboard,
  Loader2,
  Rocket,
  Settings2,
  Sparkles,
  Workflow,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AIPreparing.scss";

const phases = [
  {
    id: "core",
    start: 0,
    title: "ZENIX AI yadrosi uyg'onmoqda",
    description:
      "Kompaniya profilingiz, tanlangan tarif va onboarding javoblari yagona ish modeliga jamlanmoqda.",
    timeline: "AI core initialization",
  },
  {
    id: "profile",
    start: 16,
    title: "Biznes konteksti tahlil qilinmoqda",
    description:
      "Faoliyat turi, filiallar va boshlang'ich ehtiyojlar asosida ish maydoni sozlanmoqda.",
    timeline: "Business context mapping",
  },
  {
    id: "workspace",
    start: 32,
    title: "Workspace arxitekturasi qurilmoqda",
    description:
      "Dashboard, ombor, CRM va hisobot modullari o'zaro bog'langan struktura sifatida tayyorlanmoqda.",
    timeline: "Workspace structure",
  },
  {
    id: "data",
    start: 50,
    title: "Boshlang'ich ma'lumotlar joylanmoqda",
    description:
      "Kategoriya, valyuta, rollar va tizim sozlamalari biznesingizga mos holatga keltirilmoqda.",
    timeline: "System data layer",
  },
  {
    id: "ai",
    start: 68,
    title: "AI tavsiyalar shaxsiylashtirilmoqda",
    description:
      "ZENIX ish jarayonlaringiz uchun birinchi optimallashtirish tavsiyalarini tayyorlamoqda.",
    timeline: "AI personalization",
  },
  {
    id: "launch",
    start: 86,
    title: "Oxirgi tekshiruvlar bajarilmoqda",
    description:
      "Modullar sinxronlashmoqda, ruxsatlar tekshirilmoqda va dashboard ochishga tayyorlanmoqda.",
    timeline: "Launch verification",
  },
  {
    id: "ready",
    start: 100,
    title: "Hammasi tayyor",
    description:
      "ZENIX biznesingizga moslashtirildi. Siz uchun dashboard ochilmoqda.",
    timeline: "Workspace ready",
  },
];

const modules = [
  { name: "Dashboard", icon: LayoutDashboard, threshold: 36 },
  { name: "Ombor", icon: DatabaseZap, threshold: 44 },
  { name: "CRM", icon: Workflow, threshold: 52 },
  { name: "Hisobotlar", icon: CircleDot, threshold: 60 },
  { name: "Sozlamalar", icon: Settings2, threshold: 68 },
  { name: "AI", icon: BrainCircuit, threshold: 76 },
];

const loadingDuration = 19600;
const welcomeDelay = 6000;

export default function AIPreparing() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);

  const activePhaseIndex = useMemo(() => {
    let activeIndex = 0;

    phases.forEach((phase, index) => {
      if (progress >= phase.start) {
        activeIndex = index;
      }
    });

    return activeIndex;
  }, [progress]);

  const activePhase = phases[activePhaseIndex];
  const roundedProgress = Math.min(100, Math.round(progress));
  const completedModules = modules.filter(
    (module) => progress >= module.threshold,
  ).length;

  useEffect(() => {
    let frameId;
    let welcomeTimer;
    let redirectTimer;
    const startedAt = performance.now();

    const tick = (time) => {
      const elapsed = time - startedAt;
      const nextProgress = Math.min((elapsed / loadingDuration) * 100, 100);

      setProgress(nextProgress);

      if (nextProgress < 100) {
        frameId = window.requestAnimationFrame(tick);
        return;
      }

      welcomeTimer = window.setTimeout(() => {
        setShowWelcome(true);
        redirectTimer = window.setTimeout(() => {
          navigate("/dashboard");
        }, welcomeDelay);
      }, 350);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(welcomeTimer);
      window.clearTimeout(redirectTimer);
    };
  }, [navigate]);

  return (
    <main className="ai-preparing">
      <div className="ai-preparing__aurora ai-preparing__aurora--left" />
      <div className="ai-preparing__aurora ai-preparing__aurora--right" />
      <div className="ai-preparing__mesh" />

      <section className="ai-preparing__layout" aria-live="polite">
        <article className="ai-preparing__card ai-preparing__card--core">
          <div className="ai-preparing__card-top">
            <span>
              <Sparkles size={15} />
              ZENIX AI
            </span>
            <strong>Live generation</strong>
          </div>

          <div className="ai-preparing__orb-scene">
            <div className="ai-preparing__orbit ai-preparing__orbit--one" />
            <div className="ai-preparing__orbit ai-preparing__orbit--two" />
            <div className="ai-preparing__orbit ai-preparing__orbit--three" />

            <span className="ai-preparing__particle ai-preparing__particle--one" />
            <span className="ai-preparing__particle ai-preparing__particle--two" />
            <span className="ai-preparing__particle ai-preparing__particle--three" />
            <span className="ai-preparing__particle ai-preparing__particle--four" />

            <div className="ai-preparing__orb">
              <div className="ai-preparing__orb-glass" />
              <BrainCircuit size={46} />
            </div>
          </div>

          <div className="ai-preparing__progress-number">
            <span>{roundedProgress}</span>
            <small>%</small>
          </div>

          <div className="ai-preparing__copy" key={activePhase.id}>
            <h1>{activePhase.title}</h1>
            <p>{activePhase.description}</p>
          </div>

          <div className="ai-preparing__progress" aria-label="AI progress">
            <div className="ai-preparing__progress-track">
              <div
                className="ai-preparing__progress-fill"
                style={{ width: `${roundedProgress}%` }}
              >
                <span />
              </div>
            </div>
          </div>
        </article>

        <article className="ai-preparing__card ai-preparing__card--system">
          <div className="ai-preparing__card-top">
            <span>
              <Cpu size={15} />
              Workspace generation
            </span>
            <strong>{roundedProgress === 100 ? "Ready" : "Preparing"}</strong>
          </div>

          <div className="ai-preparing__timeline">
            {phases.slice(0, -1).map((phase, index) => {
              const isDone = index < activePhaseIndex || roundedProgress === 100;
              const isActive = index === activePhaseIndex && roundedProgress < 100;

              return (
                <div
                  className={`ai-preparing__timeline-item ${
                    isActive ? "ai-preparing__timeline-item--active" : ""
                  } ${isDone ? "ai-preparing__timeline-item--done" : ""}`}
                  key={phase.id}
                >
                  <span>
                    {isDone ? (
                      <Check size={14} />
                    ) : isActive ? (
                      <Loader2 size={14} />
                    ) : (
                      <CircleDot size={13} />
                    )}
                  </span>
                  <div>
                    <strong>{phase.timeline}</strong>
                    <small>
                      {isDone ? "Completed" : isActive ? "Running" : "Queued"}
                    </small>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="ai-preparing__modules">
            <div className="ai-preparing__modules-head">
              <span>Modules</span>
              <strong>{completedModules}/6</strong>
            </div>

            <div className="ai-preparing__module-list">
              {modules.map((module, index) => {
                const ModuleIcon = module.icon;
                const isVisible = progress >= module.threshold;

                return (
                  <div
                    className={`ai-preparing__module ${
                      isVisible ? "ai-preparing__module--visible" : ""
                    }`}
                    key={module.name}
                    style={{ "--module-index": index }}
                  >
                    <span>
                      <ModuleIcon size={16} />
                    </span>
                    <p>{module.name}</p>
                    <Check size={15} />
                  </div>
                );
              })}
            </div>
          </div>
        </article>
      </section>

      <div
        className={`ai-preparing__welcome ${
          showWelcome ? "ai-preparing__welcome--visible" : ""
        }`}
      >
        <Rocket size={20} />
        <span>
          Xush kelibsiz! Endi biznesingizni bitta platforma orqali
          boshqarishingiz mumkin.
        </span>
      </div>
    </main>
  );
}
