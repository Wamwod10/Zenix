import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  BellRing,
  Building2,
  Cpu,
  DatabaseBackup,
  GitBranch,
  GripVertical,
  HardDrive,
  KeyRound,
  Layers3,
  PlugZap,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
  Warehouse,
} from "lucide-react";

import { settingsGroups, settingsPageMeta, settingsPathById } from "../../data/settingsNavigation";
import SettingsSearch from "../../components/SettingsSearch/SettingsSearch";
import SettingsSectionCard from "../../components/SettingsSectionCard/SettingsSectionCard";
import { safeSettingsRead, safeSettingsWrite, settingsStorageKeys } from "../../utils/settingsStorage";

import "./SettingsHome.scss";

const flattenPages = () => settingsGroups.flatMap((group) => group.items.map((item) => ({ ...item, group: group.title })));

const SettingsHome = ({ controller }) => {
  const navigate = useNavigate();
  const [securityOpen, setSecurityOpen] = useState(false);
  const [layout, setLayout] = useState(() =>
    safeSettingsRead(settingsStorageKeys.dashboardLayout, {
      hidden: [],
      sizes: {},
      order: [
        "systemHealth",
        "database",
        "redis",
        "queue",
        "storage",
        "license",
        "subscription",
        "backup",
        "sessions",
        "api",
        "ai",
        "integrations",
        "notifications",
        "approvals",
        "activities",
      ],
    }),
  );
  const pages = flattenPages();
  const pageById = pages.reduce((map, item) => ({ ...map, [item.id]: item }), {});
  const { metrics, state, favorites, recent, search, actions } = controller;

  const openPage = (pageId) => {
    actions.touchRecent(pageId);
    navigate(settingsPathById[pageId] || "/settings");
  };

  const persistLayout = (nextLayout) => {
    setLayout(nextLayout);
    safeSettingsWrite(settingsStorageKeys.dashboardLayout, nextLayout);
  };

  const widgetCatalog = {
    systemHealth: { label: "System Health", value: `${state.advanced.systemHealth}%`, meta: state.advanced.healthCheck, icon: Activity, tone: "green", pageId: "monitoring" },
    database: { label: "Database Status", value: state.monitoring.database, meta: "Primary DB adapter", icon: DatabaseBackup, tone: "blue", pageId: "monitoring" },
    redis: { label: "Redis Status", value: state.monitoring.redis, meta: state.advanced.redis, icon: Layers3, tone: "purple", pageId: "advanced" },
    queue: { label: "Queue Status", value: state.monitoring.queue, meta: `${state.advanced.backgroundJobs} jobs`, icon: RefreshCw, tone: "orange", pageId: "monitoring" },
    storage: { label: "Storage Usage", value: `${metrics.storageUsage}%`, meta: `${state.monitoring.disk}% disk`, icon: HardDrive, tone: "blue", pageId: "monitoring" },
    license: { label: "License Status", value: state.advanced.license, meta: "Owner controlled", icon: ShieldCheck, tone: "green", pageId: "advanced" },
    subscription: { label: "Subscription", value: state.billing.subscription, meta: state.billing.upcomingPayment, icon: Star, tone: "purple", pageId: "billing" },
    backup: { label: "Last Backup", value: state.backup.lastStatus, meta: state.backup.history[0]?.version || "No backup", icon: DatabaseBackup, tone: "green", pageId: "backup" },
    sessions: { label: "Active Sessions", value: metrics.activeSessions, meta: "Device revoke ready", icon: UsersRound, tone: "orange", pageId: "security" },
    api: { label: "API Usage", value: metrics.apiUsage, meta: `${state.api.usage?.averageLatency || 0}ms avg`, icon: KeyRound, tone: "blue", pageId: "api" },
    ai: { label: "AI Usage", value: metrics.aiUsage, meta: state.ai.costAnalytics, icon: Sparkles, tone: "purple", pageId: "ai" },
    integrations: { label: "Integration Health", value: `${metrics.integrations}/${state.integrations.length}`, meta: `${metrics.warnings} warning`, icon: PlugZap, tone: "blue", pageId: "integrations" },
    notifications: { label: "Notification Status", value: state.notifications.channels.filter((item) => item.enabled).length, meta: "enabled channels", icon: BellRing, tone: "green", pageId: "notifications" },
    approvals: { label: "Pending Approvals", value: metrics.pendingApprovals, meta: "Security, backup, permissions", icon: AlertTriangle, tone: "orange", pageId: "audit" },
    activities: { label: "Recent Activities", value: state.auditLog.length, meta: state.auditLog[0]?.action || "No activity", icon: Activity, tone: "blue", pageId: "audit" },
  };

  const orderedWidgets = layout.order.filter((id) => widgetCatalog[id] && !layout.hidden.includes(id));
  const moveWidget = (id, direction) => {
    const currentIndex = layout.order.indexOf(id);
    const nextIndex = Math.max(0, Math.min(layout.order.length - 1, currentIndex + direction));
    const nextOrder = [...layout.order];
    nextOrder.splice(currentIndex, 1);
    nextOrder.splice(nextIndex, 0, id);
    persistLayout({ ...layout, order: nextOrder });
  };
  const toggleWidget = (id) => {
    const hidden = layout.hidden.includes(id)
      ? layout.hidden.filter((item) => item !== id)
      : [...layout.hidden, id];
    persistLayout({ ...layout, hidden });
  };
  const resizeWidget = (id) => {
    const current = layout.sizes[id] || "normal";
    const next = current === "normal" ? "wide" : current === "wide" ? "compact" : "normal";
    persistLayout({ ...layout, sizes: { ...layout.sizes, [id]: next } });
  };
  const resetLayout = () => persistLayout({ hidden: [], sizes: {}, order: Object.keys(widgetCatalog) });

  const securityRisks = [
    ["2FA", state.security.twoFactor, "Admin va ownerlar uchun 2FA majburiy bo'lsin."],
    ["Password", state.security.minPasswordLength >= 12, "Minimal parol uzunligi 12+ belgiga ko'tarilsin."],
    ["IP restriction", state.security.ipRestriction, "Admin access IP va country bo'yicha cheklansin."],
    ["Backup", state.backup.encryption, "Backup encryption doim yoqilgan bo'lsin."],
  ];

  return (
    <div className="settings-home">
      <SettingsSectionCard
        eyebrow="Qidiruv"
        title="Sozlamani so'z bilan toping"
        description="Valyuta, Telegram bot, chek logo, backup, yangi rol, printer va xavfsizlik so'rovlari kerakli sahifani ochadi."
      >
        <SettingsSearch search={search} onNavigate={actions.touchRecent} />
      </SettingsSectionCard>

      <div className="settings-home__dashboard-tools">
        <strong>Dashboard layout</strong>
        <button type="button" onClick={resetLayout}><RefreshCw size={15} /> Reset layout</button>
      </div>

      <div className="settings-home__kpis">
        <button type="button" className="settings-home__kpi is-green" onClick={() => setSecurityOpen(true)}>
          <span><ShieldCheck size={20} /></span>
          <strong>{metrics.securityScore}%</strong>
          <p>Security Recommendations</p>
          <small>Risk va tavsiyalarni ochish</small>
        </button>
        {orderedWidgets.map((id) => {
          const item = widgetCatalog[id];
          const Icon = item.icon;
          return (
            <article className={`settings-home__kpi is-${item.tone} is-${layout.sizes[id] || "normal"}`} key={item.label}>
              <button type="button" className="settings-home__kpi-main" onClick={() => openPage(item.pageId)}>
                <span><Icon size={20} /></span>
                <strong>{item.value}</strong>
                <p>{item.label}</p>
                <small>{item.meta}</small>
              </button>
              <div className="settings-home__widget-actions">
                <button type="button" aria-label={`${item.label} yuqoriga`} onClick={() => moveWidget(id, -1)}><GripVertical size={14} /></button>
                <button type="button" onClick={() => resizeWidget(id)}>Size</button>
                <button type="button" onClick={() => toggleWidget(id)}>Hide</button>
              </div>
            </article>
          );
        })}
      </div>

      {layout.hidden.length > 0 && (
        <SettingsSectionCard eyebrow="Yashirilgan widgetlar" title="Widgetlarni qaytarish">
          <div className="settings-home__hidden">
            {layout.hidden.map((id) => (
              <button key={id} type="button" onClick={() => toggleWidget(id)}>
                {widgetCatalog[id]?.label || id}
              </button>
            ))}
          </div>
        </SettingsSectionCard>
      )}

      <div className="settings-home__grid">
        <SettingsSectionCard eyebrow="Sevimlilar" title="Sevimli sozlamalar">
          <div className="settings-home__list">
            {favorites.length ? favorites.map((pageId) => (
              <button key={pageId} type="button" onClick={() => openPage(pageId)}>
                <Star size={15} fill="currentColor" />
                <span>
                  <strong>{pageById[pageId]?.label || pageId}</strong>
                  <small>{settingsPageMeta[pageId]?.description}</small>
                </span>
              </button>
            )) : (
              <div className="settings-home__empty">
                <strong>Sevimli sozlama yo'q</strong>
                <small>Kerakli sahifani qidirib, yulduzcha orqali sevimliga qo'shing.</small>
              </div>
            )}
          </div>
        </SettingsSectionCard>

        <SettingsSectionCard eyebrow="Oxirgi" title="Oxirgi ko'rilgan sozlamalar">
          <div className="settings-home__list">
            {recent.length ? recent.map((pageId) => (
              <button key={pageId} type="button" onClick={() => openPage(pageId)}>
                <AlertTriangle size={15} />
                <span>
                  <strong>{pageById[pageId]?.label || pageId}</strong>
                  <small>Oxirgi ochilgan detail sahifa.</small>
                </span>
              </button>
            )) : (
              <div className="settings-home__empty">
                <strong>Oxirgi ko'rilgan sahifa yo'q</strong>
                <small>Sozlama ochilgandan keyin bu yerda ko'rinadi.</small>
              </div>
            )}
          </div>
        </SettingsSectionCard>
      </div>

      <div className="settings-home__grid">
        <SettingsSectionCard eyebrow="Umumiy ko'rinish" title="Kompaniya nazorati">
          <div className="settings-home__overview">
            <article><Building2 size={17} /><strong>{state.company.companyName}</strong><small>{state.company.legalType} - {state.company.stir}</small></article>
            <article><Warehouse size={17} /><strong>{metrics.warehouses} ombor</strong><small>Manfiy zaxira himoyalangan</small></article>
            <article><DatabaseBackup size={17} /><strong>{state.backup.lastStatus}</strong><small>{state.backup.schedule}</small></article>
          </div>
        </SettingsSectionCard>

        <SettingsSectionCard eyebrow="Tezkor amallar" title="Tez sozlamalar">
          <div className="settings-home__quick">
            {[
              ["Xavfsizlikni kuchaytirish", "security", "2FA va sessiya siyosatini tekshirish"],
              ["Backup sozlamalari", "backup", "Shifrlangan backup siyosatini ko'rish"],
              ["Telegram ulash", "integrations", "Telegram bot monitoringi"],
              ["Rol yaratish", "roles", "Custom rol shabloni"],
            ].map(([title, pageId, copy]) => (
              <button key={title} type="button" onClick={() => openPage(pageId)}>
                <Sparkles size={15} />
                <span><strong>{title}</strong><small>{copy}</small></span>
              </button>
            ))}
          </div>
        </SettingsSectionCard>
      </div>

      {securityOpen && (
        <div className="settings-home__drawer" role="dialog" aria-modal="true" aria-labelledby="settings-security-drawer-title">
          <button type="button" aria-label="Security drawer yopish" onClick={() => setSecurityOpen(false)} />
          <section>
            <header>
              <span>Xavfsizlik</span>
              <h2 id="settings-security-drawer-title">Security Score nima uchun {metrics.securityScore}%?</h2>
            </header>
            <div>
              {securityRisks.map(([label, passed, recommendation]) => (
                <article key={label} className={passed ? "is-pass" : "is-risk"}>
                  {passed ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
                  <strong>{label}</strong>
                  <span>{passed ? "Yaxshi" : "Risk"}</span>
                  <small>{recommendation}</small>
                </article>
              ))}
            </div>
            <footer>
              <button type="button" onClick={() => openPage("security")}>Security sahifasiga o'tish</button>
              <button type="button" onClick={() => setSecurityOpen(false)}>Yopish</button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
};

export default SettingsHome;
