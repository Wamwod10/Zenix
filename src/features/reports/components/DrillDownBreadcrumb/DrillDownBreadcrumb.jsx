import { ChevronRight } from "lucide-react";

import { drillPath } from "../../utils/reportsCalculations";
import "./DrillDownBreadcrumb.scss";

const DrillDownBreadcrumb = ({ level, onLevel }) => (
  <nav className="drill-breadcrumb" aria-label="Drill down breadcrumb">
    {drillPath.slice(0, level + 1).map((item, index) => (
      <span key={item}>
        <button type="button" onClick={() => onLevel(index)} aria-current={index === level ? "page" : undefined}>
          {item}
        </button>
        {index < level && <ChevronRight size={13} />}
      </span>
    ))}
  </nav>
);

export default DrillDownBreadcrumb;
