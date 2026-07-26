import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Building2,
  DatabaseBackup,
  GitBranch,
  PlugZap,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
  Warehouse,
} from "lucide-react";

import { settingsGroups, settingsPageMeta, settingsPathById } from "../../data/settingsNavigation";
import SettingsSearch from "../../components/SettingsSearch/SettingsSearch";
import SettingsSectionCard from "../../components/SettingsSectionCard/SettingsSectionCard";

import "./SettingsHome.scss";

const flattenPages = () => settingsGroups.flatMap((group) => group.items.map((item) => ({ ...item, group: group.title })));

const SettingsHome = ({ controller }) => {
  const navigate = useNavigate();
  const pages = flattenPages();
  const pageById = pages.reduce((map, item) => ({ ...map, [item.id]: item }), {});
  const { metrics, state, favorites, recent, search, actions } = controller;

  const openPage = (pageId) => {
    actions.touchRecent(pageId);
    navigate(settingsPathById[pageId] || "/settings");
  };

  const kpis = [
    { label: "Security score", value: `${metrics.securityScore}%`, meta: "2FA, backup, password", icon: ShieldCheck, tone: "green" },
    { label: "Connected integrations", value: metrics.integrations, meta: `${state.integrations.length} total adapter`, icon: PlugZap, tone: "blue" },
    { label: "Active users", value: metrics.users, meta: "role-aware access", icon: UsersRound, tone: "purple" },
    { label: "Active branches", value: metrics.branches, meta: `${metrics.warehouses} warehouses`, icon: GitBranch, tone: "orange" },
  ];

  return (
    <div className="settings-home">
      <SettingsSectionCard
        eyebrow="Natural Search"
        title="Sozlamani so'z bilan toping"
        description="Deterministic keyword mapping: valyuta, Telegram bot, chek logo, backup, yangi rol, printer va security so'rovlari kerakli sahifani ochadi."
      >
        <SettingsSearch search={search} onNavigate={actions.touchRecent} />
      </SettingsSectionCard>

      <div className="settings-home__kpis">
        {kpis.map((item) => {
          const Icon = item.icon;
          return (
            <article className={`settings-home__kpi is-${item.tone}`} key={item.label}>
              <span><Icon size={20} /></span>
              <strong>{item.value}</strong>
              <p>{item.label}</p>
              <small>{item.meta}</small>
            </article>
          );
        })}
      </div>

      <div className="settings-home__grid">
        <SettingsSectionCard eyebrow="Favorites" title="Favorite settings">
          <div className="settings-home__list">
            {favorites.map((pageId) => (
              <button key={pageId} type="button" onClick={() => openPage(pageId)}>
                <Star size={15} fill="currentColor" />
                <span>
                  <strong>{pageById[pageId]?.label || pageId}</strong>
                  <small>{settingsPageMeta[pageId]?.description}</small>
                </span>
              </button>
            ))}
          </div>
        </SettingsSectionCard>

        <SettingsSectionCard eyebrow="Recent" title="Recent settings">
          <div className="settings-home__list">
            {recent.map((pageId) => (
              <button key={pageId} type="button" onClick={() => openPage(pageId)}>
                <AlertTriangle size={15} />
                <span>
                  <strong>{pageById[pageId]?.label || pageId}</strong>
                  <small>Oxirgi ko'rilgan va localStorage'da saqlangan.</small>
                </span>
              </button>
            ))}
          </div>
        </SettingsSectionCard>
      </div>

      <div className="settings-home__grid">
        <SettingsSectionCard eyebrow="Overview" title="Company control">
          <div className="settings-home__overview">
            <article><Building2 size={17} /><strong>{state.company.companyName}</strong><small>{state.company.legalType} · {state.company.stir}</small></article>
            <article><Warehouse size={17} /><strong>{metrics.warehouses} ombor</strong><small>Negative stock protected</small></article>
            <article><DatabaseBackup size={17} /><strong>{state.backup.lastStatus}</strong><small>{state.backup.schedule}</small></article>
          </div>
        </SettingsSectionCard>

        <SettingsSectionCard eyebrow="AI Recommendations" title="Quick settings">
          <div className="settings-home__quick">
            {[
              ["Security hardening", "security", "2FA va session policy tekshirish"],
              ["Backup now", "backup", "Manual encrypted backup yaratish"],
              ["Connect Telegram", "integrations", "Telegram bot monitoring"],
              ["Create role", "roles", "Custom role template"],
            ].map(([title, pageId, copy]) => (
              <button key={title} type="button" onClick={() => openPage(pageId)}>
                <Sparkles size={15} />
                <span><strong>{title}</strong><small>{copy}</small></span>
              </button>
            ))}
          </div>
        </SettingsSectionCard>
      </div>
    </div>
  );
};

export default SettingsHome;
