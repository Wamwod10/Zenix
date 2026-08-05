import ModuleHubCard from "../ModuleHubCard/ModuleHubCard";
import "./ModuleHubGrid.scss";

const ModuleHubGrid = ({ items = [] }) => (
  <div className="module-hub-grid">
    {items.map((item) => (
      <ModuleHubCard key={item.id} item={item} />
    ))}
  </div>
);

export default ModuleHubGrid;
