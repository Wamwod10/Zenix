import "./ModuleHubSkeleton.scss";

const ModuleHubSkeleton = ({ title = "Module hub" }) => (
  <main className="module-hub-skeleton" aria-label={`${title} yuklanmoqda`} aria-busy="true">
    <div className="module-hub-skeleton__header" />
    <div className="module-hub-skeleton__grid">
      {Array.from({ length: 6 }, (_, index) => (
        <div className="module-hub-skeleton__card" key={index} />
      ))}
    </div>
  </main>
);

export default ModuleHubSkeleton;
