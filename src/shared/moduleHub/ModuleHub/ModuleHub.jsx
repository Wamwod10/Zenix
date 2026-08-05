import ModuleHubEmptyState from "../ModuleHubEmptyState/ModuleHubEmptyState";
import ModuleHubGrid from "../ModuleHubGrid/ModuleHubGrid";
import ModuleHubHeader from "../ModuleHubHeader/ModuleHubHeader";
import ModuleHubSkeleton from "../ModuleHubSkeleton/ModuleHubSkeleton";
import { normalizeHubSections } from "../moduleHub.utils";
import "./ModuleHub.scss";

const ModuleHub = ({
  config,
  permissions,
  loading = false,
  error = null,
  onRetry,
}) => {
  if (loading) {
    return <ModuleHubSkeleton title={config?.title || "Module hub"} />;
  }

  const sections = normalizeHubSections(config?.sections || [], permissions);
  const items = sections.flatMap((section) => section.items);

  return (
    <main className="module-hub" aria-labelledby={`${config.id}-module-hub-title`}>
      <ModuleHubHeader
        id={`${config.id}-module-hub-title`}
        title={config.title}
        description={config.description}
      />

      {error ? (
        <ModuleHubEmptyState
          title="Hub ma'lumotlari yuklanmadi"
          description="Yo'nalishlar ro'yxatini ko'rsatishda xatolik yuz berdi. Ichki sahifalar alohida ishlashda davom etadi."
          actionLabel="Qayta urinish"
          onAction={onRetry}
        />
      ) : null}

      {items.length ? (
        <ModuleHubGrid items={items} />
      ) : (
        <ModuleHubEmptyState
          title="Yo'nalishlar mavjud emas"
          description="Bu modul uchun ko'rinadigan hub cardlar topilmadi."
        />
      )}
    </main>
  );
};

export default ModuleHub;
