import { Badge } from "../../../../components/ui/Badge/Badge";
import { getCategoryLabel } from "../../suppliersApi";

import "./SupplierCategoryBadges.scss";

// Task 3: har supplier bir yoki bir necha kategoriyaga tegishli bo'lishi
// mumkin — ro'yxat, profil, karta va Purchases supplier tanlagichida
// bir xil ko'rinishda ishlatiladi.
const SupplierCategoryBadges = ({ categoryIds = [], max }) => {
  const visible = max ? categoryIds.slice(0, max) : categoryIds;
  const hidden = max ? categoryIds.length - visible.length : 0;

  if (!categoryIds.length) {
    return <span className="supplier-category-badges__empty">—</span>;
  }

  return (
    <span className="supplier-category-badges">
      {visible.map((categoryId) => (
        <Badge key={categoryId} tone="primary" size="sm">
          {getCategoryLabel(categoryId)}
        </Badge>
      ))}

      {hidden > 0 && (
        <Badge tone="neutral" size="sm">
          +{hidden}
        </Badge>
      )}
    </span>
  );
};

export default SupplierCategoryBadges;
