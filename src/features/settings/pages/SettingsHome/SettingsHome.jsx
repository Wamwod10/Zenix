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
    { label: "Xavfsizlik bahosi", value: `${metrics.securityScore}%`, meta: "2FA, backup, parol siyosati", icon: ShieldCheck, tone: "green", pageId: "security" },
    { label: "Ulangan integratsiyalar", value: metrics.integrations, meta: `${state.integrations.length} adapter`, icon: PlugZap, tone: "blue", pageId: "integrations" },
    { label: "Faol foydalanuvchilar", value: metrics.users, meta: "Rol asosidagi kirish", icon: UsersRound, tone: "purple", pageId: "users" },
    { label: "Faol filiallar", value: metrics.branches, meta: `${metrics.warehouses} ombor`, icon: GitBranch, tone: "orange", pageId: "branches" },
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

      <div className="settings-home__kpis">
        {kpis.map((item) => {
          const Icon = item.icon;
          return (
            <button type="button" className={`settings-home__kpi is-${item.tone}`} key={item.label} onClick={() => openPage(item.pageId)}>
              <span><Icon size={20} /></span>
              <strong>{item.value}</strong>
              <p>{item.label}</p>
              <small>{item.meta}</small>
            </button>
          );
        })}
      </div>

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
    </div>
  );
};

export default SettingsHome;
