import { ChevronLeft, ChevronRight } from "lucide-react";

import "./SupplierPagination.scss";

const buildPages = (current, total) => {
  const start = Math.max(1, current - 2);
  const end = Math.min(total, start + 4);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

const SupplierPagination = ({
  page,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}) => {
  if (!totalItems) return null;

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, totalItems);

  return (
    <div className="supplier-pagination">
      <span>
        {first}-{last} / {totalItems}
      </span>
      <label>
        <span>Sahifa hajmi</span>
        <select value={pageSize} onChange={(event) => onPageSizeChange(event.target.value)}>
          {pageSizeOptions.map((size) => (
            <option value={size} key={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
      <div className="supplier-pagination__pages">
        <button
          type="button"
          aria-label="Oldingi sahifa"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={16} />
        </button>
        {buildPages(page, totalPages).map((entry) => (
          <button
            type="button"
            key={entry}
            aria-current={entry === page ? "page" : undefined}
            onClick={() => onPageChange(entry)}
          >
            {entry}
          </button>
        ))}
        <button
          type="button"
          aria-label="Keyingi sahifa"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default SupplierPagination;

