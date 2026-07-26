import ProductSearch from "../../components/ProductSearch/ProductSearch";
import ProductTable from "../../components/ProductTable/ProductTable";
import BulkActionBar from "../../components/BulkActionBar/BulkActionBar";

const ProductList = ({ controller }) => {
  const toggleSort = (key) => {
    controller.actions.setSort({
      key,
      direction:
        controller.sort.key === key && controller.sort.direction === "asc" ? "desc" : "asc",
    });
  };

  return (
    <div className="products-view">
      <ProductSearch
        filters={controller.filters}
        categories={controller.state.categories}
        brands={controller.state.brands}
        savedFilters={controller.savedFilters}
        viewMode={controller.viewMode}
        onFilter={controller.actions.updateFilter}
        onApplySavedFilter={controller.actions.writeFilters}
        onSaveFilter={controller.actions.saveCurrentFilter}
        onRemoveSavedFilter={controller.actions.removeSavedFilter}
        onViewMode={controller.actions.setViewMode}
      />
      <ProductTable
        products={controller.visibleProducts}
        viewMode={controller.viewMode}
        selectedIds={controller.selectedIds}
        canViewCost={controller.permissions.canViewCost}
        sort={controller.sort}
        page={controller.page}
        pageCount={controller.pageCount}
        onSort={toggleSort}
        onPage={controller.actions.setPage}
        onToggleSelected={controller.actions.toggleSelected}
        onOpenQuickView={controller.actions.openQuickView}
        onDuplicate={controller.actions.duplicateProduct}
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
