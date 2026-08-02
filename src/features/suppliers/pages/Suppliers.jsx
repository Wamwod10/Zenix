import { useNavigate } from "react-router-dom";
import { Plus, RotateCcw, Upload } from "lucide-react";

import PageHeader from "../../../components/layout/PageHeader/PageHeader";
import { Button } from "../../../components/ui/Button/Button";
import { Loading } from "../../../components/ui/Loading/Loading";
import { Modal } from "../../../components/ui/Modal/Modal";
import { useNotification } from "../../../components/ui/Notification/NotificationContext";
import AIWorkspace from "../../purchases/ai/components/AIWorkspace/AIWorkspace";
import ReportExportMenu from "../../purchases/components/ReportExportMenu/ReportExportMenu";
import NotificationBell from "../../purchases/notifications/components/NotificationBell/NotificationBell";
import SupplierBulkActions from "../components/SupplierBulkActions/SupplierBulkActions";
import SupplierConfirmDialog from "../components/SupplierConfirmDialog/SupplierConfirmDialog";
import SupplierFilters from "../components/SupplierFilters/SupplierFilters";
import SupplierForm from "../components/SupplierForm/SupplierForm";
import SupplierImportResultModal from "../components/SupplierImportResultModal/SupplierImportResultModal";
import SupplierKpiGrid from "../components/SupplierKpiGrid/SupplierKpiGrid";
import SupplierPagination from "../components/SupplierPagination/SupplierPagination";
import SupplierTable from "../components/SupplierTable/SupplierTable";
import { useSuppliersController } from "../hooks/useSuppliersController";

import "./Suppliers.scss";

const Suppliers = () => {
  const navigate = useNavigate();
  const notify = useNotification();
  const controller = useSuppliersController({ navigate, notify });

  return (
    <div className="suppliers-page">
      <PageHeader
        title="Yetkazib beruvchilar"
        description="Barcha yetkazib beruvchilarni qidiring, filtrlang va boshqaring."
        actions={
          <>
            <NotificationBell />
            {controller.busy && <Loading label="Bajarilmoqda..." />}

            {controller.permissions.canImport && (
              <>
                <input
                  ref={controller.importInputRef}
                  type="file"
                  accept=".csv,.txt,text/csv"
                  hidden
                  onChange={controller.handleImportFile}
                />
                <Button
                  variant="secondary"
                  leftIcon={<Upload size={15} />}
                  disabled={controller.busy}
                  onClick={() => controller.importInputRef.current?.click()}
                >
                  Import
                </Button>
              </>
            )}

            {controller.permissions.canExport && (
              <ReportExportMenu
                getExportPayload={controller.buildExportPayload}
                disabled={controller.busy}
              />
            )}

            {controller.permissions.canCreate && (
              <Button
                variant="primary"
                leftIcon={<Plus size={16} />}
                onClick={() => controller.setCreateOpen(true)}
              >
                Yangi yetkazib beruvchi
              </Button>
            )}
          </>
        }
      />

      <SupplierKpiGrid
        items={controller.kpis}
        activeId={controller.quickFilter}
        onSelect={controller.applyQuickFilter}
      />

      {controller.filterSummary.length > 0 && (
        <div className="suppliers-page__filter-summary" aria-live="polite">
          {controller.filterSummary.map((chip) => (
            <span key={chip}>{chip}</span>
          ))}
          <button type="button" onClick={controller.resetFilters}>
            <RotateCcw size={14} />
            Filtrni bekor qilish
          </button>
        </div>
      )}

      <AIWorkspace
        title="AI tavsiya - yetkazib beruvchilar"
        compact
        hideSummary
        maxItems={3}
        scopeFilter={(insight) => insight.category === "supplier"}
        emptyText="Hozircha yetkazib beruvchilar bo'yicha AI tavsiyasi yo'q."
      />

      <SupplierFilters
        filters={controller.filters}
        onChange={controller.setFilter}
        onReset={controller.resetFilters}
      />

      <SupplierBulkActions
        selectedCount={controller.selectedIds.length}
        filteredCount={controller.filteredCount}
        busy={controller.busy}
        canExport={controller.permissions.canExport}
        canArchive={controller.permissions.canArchive}
        onExport={controller.exportSelectedCsv}
        onArchive={() => controller.setBulkArchiveRequest(true)}
        onClear={controller.clearSelection}
        onSelectAllFiltered={controller.selectAllFiltered}
      />

      <SupplierTable
        suppliers={controller.pagedSuppliers}
        totalFiltered={controller.filteredCount}
        getDebt={controller.getDebt}
        getScore={controller.getScore}
        formatMoney={controller.formatMoney}
        onView={(supplier) => navigate(`/suppliers/${supplier.id}`)}
        onEdit={(supplier) => navigate(`/suppliers/${supplier.id}?edit=1`)}
        selectable={controller.permissions.canBulk}
        selectedIds={controller.selectedIds}
        sortBy={controller.filters.sortBy}
        sortDirection={controller.filters.sortDirection}
        onSort={controller.handleSort}
        onToggleSelect={controller.toggleSelect}
        onToggleSelectAll={controller.toggleSelectPage}
        canArchive={controller.permissions.canArchive}
        canRestore={controller.permissions.canRestore}
        onArchive={controller.setArchiveRequest}
        onRestore={controller.restoreSupplier}
        onClearFilters={controller.resetFilters}
        onCreate={
          controller.permissions.canCreate
            ? () => controller.setCreateOpen(true)
            : undefined
        }
      />

      <SupplierPagination
        page={controller.page}
        totalPages={controller.totalPages}
        totalItems={controller.filteredCount}
        pageSize={controller.pageSize}
        pageSizeOptions={controller.pageSizeOptions}
        onPageChange={controller.setPage}
        onPageSizeChange={controller.setPageSize}
      />

      <Modal
        open={controller.createOpen}
        title="Yangi yetkazib beruvchi"
        description="Asosiy rekvizitlar. Kategoriya, mahsulot, kredit va boshqa sozlamalar profil sahifasida boshqariladi."
        onClose={() => controller.setCreateOpen(false)}
      >
        <SupplierForm
          suppliers={controller.suppliers}
          onSubmit={controller.handleCreate}
          onCancel={() => controller.setCreateOpen(false)}
          submitting={controller.busy}
        />
      </Modal>

      <SupplierConfirmDialog
        open={!!controller.archiveRequest}
        tone="warning"
        title="Yetkazib beruvchini arxivlash"
        description={`"${controller.archiveRequest?.name || ""}" arxivlanadi. Ro'yxatda standart ko'rinmaydi va yangi xarid buyurtmalarida tanlanmaydi.`}
        confirmLabel="Ha, arxivlash"
        reasonLabel="Arxivlash sababi"
        reasonRequired
        onConfirm={(reason) => controller.archiveSupplier(controller.archiveRequest, reason)}
        onClose={() => controller.setArchiveRequest(null)}
      />

      <SupplierConfirmDialog
        open={controller.bulkArchiveRequest}
        tone="warning"
        title="Tanlanganlarni arxivlash"
        description={`${controller.selectedIds.length} ta yetkazib beruvchi arxivlanadi. Sabab barcha tanlangan yozuvlar auditiga yoziladi.`}
        confirmLabel="Ha, arxivlash"
        reasonLabel="Umumiy arxivlash sababi"
        reasonRequired
        onConfirm={controller.runBulkArchive}
        onClose={() => controller.setBulkArchiveRequest(false)}
      />

      <SupplierImportResultModal
        result={controller.importResult}
        onClose={() => controller.setImportResult(null)}
      />
    </div>
  );
};

export default Suppliers;
