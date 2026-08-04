import { LayoutGrid, PackagePlus, Rows3, Table2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ProductSearch from "../../components/ProductSearch/ProductSearch";
import ProductTable from "../../components/ProductTable/ProductTable";
import BulkActionBar from "../../components/BulkActionBar/BulkActionBar";

const ProductList = ({ controller }) => {
  const navigate = useNavigate();
  const toggleSort = (key) => {
    controller.actions.setSort({
      key,
      direction:
        controller.sort.key === key && controller.sort.direction === "asc" ? "desc" : "asc",
    });
  };
  const toggleAllVisible = (ids, checked) => {
    controller.actions.setSelectedIds((current) => {
      if (!checked) {
        return current.filter((id) => !ids.includes(id));
      }

      return [...new Set([...current, ...ids])];
    });
  };

  return (
    <div className="products-view">
      <ProductSearch
        filters={controller.filters}
        categories={controller.state.categories}
        brands={controller.state.brands}
        savedFilters={controller.savedFilters}
        onFilter={controller.actions.updateFilter}
        onApplySavedFilter={controller.actions.writeFilters}
        onSaveFilter={controller.actions.saveCurrentFilter}
        onRemoveSavedFilter={controller.actions.removeSavedFilter}
        onResetFilters={controller.actions.resetFilters}
      />
      <section className="products-results-toolbar">
        <div>
          <strong>{controller.filteredProducts.length} ta natija</strong>
          <span>
            {controller.filteredProducts.length
              ? `${(controller.page - 1) * controller.pageSize + 1}-${Math.min(controller.page * controller.pageSize, controller.filteredProducts.length)} ko'rsatilmoqda`
              : "Filtrlarni o'zgartiring yoki yangi mahsulot qo'shing"}
          </span>
        </div>
        <div className="products-results-toolbar__actions">
          <label className="products-page-size">
            <span>Sahifa</span>
            <select value={controller.pageSize} onChange={(event) => controller.actions.setPageSize(event.target.value)}>
              {[6, 10, 20, 50].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </label>
          <div className="products-view-toggle" aria-label="Mahsulotlar ko'rinishi">
            {[
              { id: "table", icon: Table2, label: "Jadval" },
              { id: "grid", icon: LayoutGrid, label: "Kataklar" },
              { id: "compact", icon: Rows3, label: "Ixcham" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  type="button"
                  key={item.id}
                  className={controller.viewMode === item.id ? "is-active" : ""}
                  aria-pressed={controller.viewMode === item.id}
                  title={item.label}
                  onClick={() => controller.actions.setViewMode(item.id)}
                >
                  <Icon size={15} />
                </button>
              );
            })}
          </div>
          <button type="button" className="products-mini-button is-primary" onClick={() => navigate("/products/new")}>
            <PackagePlus size={15} />
            Yangi mahsulot
          </button>
        </div>
      </section>
      <ProductTable
        products={controller.visibleProducts}
        totalCount={controller.filteredProducts.length}
        viewMode={controller.viewMode}
        selectedIds={controller.selectedIds}
        canViewCost={controller.permissions.canViewCost}
        sort={controller.sort}
        page={controller.page}
        pageCount={controller.pageCount}
        pageSize={controller.pageSize}
        onSort={toggleSort}
        onPage={controller.actions.setPage}
        onPageSize={controller.actions.setPageSize}
        onToggleSelected={controller.actions.toggleSelected}
        onToggleAll={toggleAllVisible}
        onSelectAllFiltered={controller.actions.selectAllFiltered}
        onResetFilters={controller.actions.resetFilters}
        onOpenQuickView={controller.actions.openQuickView}
        onDuplicate={controller.actions.duplicateProduct}
        onActivate={controller.actions.activateProduct}
        onDeactivate={controller.actions.deactivateProduct}
        onSubmitApproval={controller.actions.submitProductForApproval}
        onArchive={controller.actions.archiveProduct}
        onRestore={controller.actions.restoreProduct}
      />
      <BulkActionBar
        selectedCount={controller.selectedIds.length}
        onArchive={controller.actions.bulkArchive}
        onRestore={controller.actions.bulkRestore}
        onPending={controller.actions.bulkPending}
        onClear={controller.actions.clearSelection}
      />
    </div>
  );
};

export default ProductList;
