// Task 4: Supplier tafsilotlari sahifasi — profil, tahrirlash, Purchases
// xarid tarixi (o'qish uchun, faqat ko'rsatish).

import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Archive, ArchiveRestore, ArrowLeft, PencilLine, Users } from "lucide-react";

import PageHeader from "../../../components/layout/PageHeader/PageHeader";
import { Button } from "../../../components/ui/Button/Button";
import { EmptyState } from "../../../components/ui/EmptyState/EmptyState";
import { Modal } from "../../../components/ui/Modal/Modal";
import { useNotification } from "../../../components/ui/Notification/NotificationContext";
import usePurchasesStore from "../../purchases/hooks/usePurchasesStore";
import { getSupplierOutstandingDebt } from "../../purchases/utils/purchaseCalculations";
import SupplierConfirmDialog from "../components/SupplierConfirmDialog/SupplierConfirmDialog";
import SupplierForm from "../components/SupplierForm/SupplierForm";
import SupplierProfile, {
  SUPPLIER_PROFILE_TABS,
} from "../components/SupplierProfile/SupplierProfile";
import {
  hasSupplierPermission,
  SUPPLIER_PERMISSIONS,
  supplierCurrentUser,
  useSuppliers,
} from "../suppliersApi";
import NotificationBell from "../../purchases/notifications/components/NotificationBell/NotificationBell";

import "./SupplierDetails.scss";

const DEFAULT_TAB = SUPPLIER_PROFILE_TABS[0].id;

const SupplierDetails = () => {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const notify = useNotification();
  const { suppliers, getSupplier, actions } = useSuppliers();
  const {
    orders,
    invoices,
    receipts,
    returns,
    products,
    actions: purchasesActions,
  } = usePurchasesStore();

  const supplier = getSupplier(supplierId);
  const [editOpen, setEditOpen] = useState(searchParams.get("edit") === "1");
  const [archiveRequest, setArchiveRequest] = useState(false);

  const can = (permission) => hasSupplierPermission(supplierCurrentUser.role, permission);

  // Deep Linking (Task 5): "tab" query-parametri profil ichidagi faol
  // bo'limni URL bilan sinxronlaydi (masalan /suppliers/:id?tab=documents
  // to'g'ridan-to'g'ri Hujjatlar bo'limini ochadi) — noto'g'ri/eskirgan
  // qiymat jimgina standart bo'limga tushadi (SUPPLIER_PROFILE_TABS —
  // yagona manba, SupplierProfile'dagi haqiqiy tab ro'yxati bilan bir xil).
  const tabParam = searchParams.get("tab");
  const activeTab = SUPPLIER_PROFILE_TABS.some((tab) => tab.id === tabParam)
    ? tabParam
    : DEFAULT_TAB;

  const handleTabChange = (tabId) => {
    const next = new URLSearchParams(searchParams);

    if (tabId === DEFAULT_TAB) next.delete("tab");
    else next.set("tab", tabId);

    setSearchParams(next, { replace: true });
  };

  const supplierOrders = useMemo(
    () =>
      orders
        .filter((order) => order.supplierId === supplierId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [orders, supplierId],
  );

  const supplierInvoices = useMemo(
    () =>
      invoices
        .filter((invoice) => invoice.supplierId === supplierId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [invoices, supplierId],
  );

  // Supplier Score (Enterprise): qaytarish darajasi shu ro'yxatdan
  // hisoblanadi — computeSupplierOperationalMetrics ichida qayta ishlatiladi.
  const supplierReturns = useMemo(
    () => returns.filter((entry) => entry.supplierId === supplierId),
    [returns, supplierId],
  );

  const debt = supplier
    ? getSupplierOutstandingDebt(invoices, supplier.id)
    : 0;

  const closeEdit = () => {
    setEditOpen(false);
    searchParams.delete("edit");
    setSearchParams(searchParams, { replace: true });
  };

  if (!supplier) {
    return (
      <EmptyState
        icon={Users}
        title="Yetkazib beruvchi topilmadi"
        description="Bu yetkazib beruvchi o'chirilgan yoki havola noto'g'ri bo'lishi mumkin."
        action={
          <Button
            variant="ghost"
            leftIcon={<ArrowLeft size={15} />}
            onClick={() => navigate("/suppliers")}
          >
            Ro'yxatga qaytish
          </Button>
        }
      />
    );
  }

  return (
    <div className="supplier-details-page">
      <PageHeader
        title={supplier.name}
        actions={
          <>
            <Button variant="ghost" onClick={() => navigate("/suppliers")} className="supplier-details__back-button">
              <ArrowLeft size={18} />
              Ro'yxatga qaytish
            </Button>
            <NotificationBell />

            {supplier.archived
              ? can(SUPPLIER_PERMISSIONS.restore) && (
                  <Button
                    variant="secondary"
                    leftIcon={<ArchiveRestore size={15} />}
                    onClick={() => {
                      actions.restoreSupplier(supplier.id);
                      notify.success(`"${supplier.name}" arxivdan tiklandi.`);
                    }}
                  >
                    Tiklash
                  </Button>
                )
              : can(SUPPLIER_PERMISSIONS.archive) && (
                  <Button
                    variant="secondary"
                    leftIcon={<Archive size={15} />}
                    onClick={() => setArchiveRequest(true)}
                  >
                    Arxivlash
                  </Button>
                )}

            {can(SUPPLIER_PERMISSIONS.edit) && (
              <Button
                variant="primary"
                leftIcon={<PencilLine size={15} />}
                onClick={() => setEditOpen(true)}
              >
                Tahrirlash
              </Button>
            )}
          </>
        }
      />

      <SupplierProfile
        key={supplier.id}
        supplier={supplier}
        debt={debt}
        orders={supplierOrders}
        invoices={supplierInvoices}
        receipts={receipts}
        returns={supplierReturns}
        products={products}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onAddNote={(text, isIssue) =>
          actions.addSupplierNote(supplier.id, {
            text,
            type: isIssue ? "issue" : "general",
          })
        }
        onUpdateClaimStatus={(noteId, nextStatus) =>
          actions.updateSupplierClaimStatus(supplier.id, noteId, nextStatus)
        }
        onAddDocument={(file) => actions.addSupplierDocument(supplier.id, file)}
        onRemoveDocument={(file) =>
          actions.removeSupplierDocument(supplier.id, file.id)
        }
        onSetDocumentExpiry={(file, expiryDate) =>
          actions.updateSupplierDocumentExpiry(supplier.id, file.id, expiryDate)
        }
        onUpdateSupplier={(payload) => actions.updateSupplier(supplier.id, payload)}
        onChangeStatus={(status) => actions.setSupplierStatus(supplier.id, status)}
        onCreateProduct={(payload) => purchasesActions.createProduct(payload)}
        permissions={{
          canEdit: can(SUPPLIER_PERMISSIONS.edit),
          canStatusChange: can(SUPPLIER_PERMISSIONS.statusChange),
          canClaimManage: can(SUPPLIER_PERMISSIONS.claimManage),
        }}
      />

      <SupplierConfirmDialog
        open={archiveRequest}
        tone="warning"
        title="Yetkazib beruvchini arxivlash"
        description={`"${supplier.name}" arxivlanadi — ro'yxatda ko'rinmay qoladi va yangi xarid buyurtmalarida tanlanmaydi. Istalgan vaqt tiklashingiz mumkin.`}
        confirmLabel="Ha, arxivlash"
        onConfirm={() => {
          actions.archiveSupplier(supplier.id);
          notify.success(`"${supplier.name}" arxivlandi.`);
          setArchiveRequest(false);
        }}
        onClose={() => setArchiveRequest(false)}
      />

      <Modal
        open={editOpen}
        title="Asosiy rekvizitni tahrirlash"
        description="Kompaniya ma'lumotlari. Kategoriya, mahsulot, kredit va holat — profil sahifasida."
        onClose={closeEdit}
      >
        <SupplierForm
          supplier={supplier}
          suppliers={suppliers}
          onSubmit={(payload) => {
            actions.updateSupplier(supplier.id, payload);
            notify.success("Yetkazib beruvchi ma'lumotlari yangilandi.");
            closeEdit();
          }}
          onCancel={closeEdit}
        />
      </Modal>
    </div>
  );
};

export default SupplierDetails;
