import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  RefreshCw,
  ShieldAlert,
  UserPlus,
  UserRoundPen,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import CRMPageHeader from "../../components/CRMPageHeader/CRMPageHeader";
import CRMStateView from "../../components/CRMStateView/CRMStateView";
import CustomerFormFields from "../../components/CustomerForm/CustomerForm";
import {
  getCRMCustomerById,
  getCRMCustomerRecords,
  saveCRMCustomerRecord,
} from "../../hooks/useCustomerProfile";
import { getCustomerDetailsPath } from "../../config/crmNavigation";

import "./CustomerForm.scss";

const EDIT_LOAD_DELAY = 380;
const SAVE_DELAY = 720;

const CustomerForm = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const loadTimerRef = useRef(null);
  const saveTimerRef = useRef(null);

  const editMode = Boolean(customerId);

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(editMode);
  const [loadError, setLoadError] = useState(null);
  const [reloadIndex, setReloadIndex] = useState(0);

  const availableCustomers = getCRMCustomerRecords();

  useEffect(() => {
    if (loadTimerRef.current) {
      window.clearTimeout(loadTimerRef.current);
    }

    if (!editMode) {
      setCustomer(null);
      setLoadError(null);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setLoadError(null);

    loadTimerRef.current = window.setTimeout(() => {
      const matchedCustomer = getCRMCustomerById(customerId);

      if (!matchedCustomer) {
        setCustomer(null);
        setLoadError({
          title: "Mijoz topilmadi",
          message:
            "Tahrirlanadigan mijoz o‘chirilgan yoki havola noto‘g‘ri bo‘lishi mumkin.",
        });
        setLoading(false);
        return;
      }

      setCustomer(matchedCustomer);
      setLoading(false);
    }, EDIT_LOAD_DELAY);

    return () => {
      if (loadTimerRef.current) {
        window.clearTimeout(loadTimerRef.current);
      }
    };
  }, [customerId, editMode, reloadIndex]);

  useEffect(
    () => () => {
      if (loadTimerRef.current) {
        window.clearTimeout(loadTimerRef.current);
      }

      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    },
    [],
  );

  const handleSubmit = (payload) =>
    new Promise((resolve, reject) => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }

      saveTimerRef.current = window.setTimeout(() => {
        try {
          const now = new Date().toISOString();

          const savedCustomer = saveCRMCustomerRecord({
            ...(customer ?? {}),
            ...payload,
            id: customer?.id ?? `crm-customer-${Date.now()}`,
            avatar: customer?.avatar ?? null,
            orderCount: customer?.orderCount ?? 0,
            totalSpent: customer?.totalSpent ?? 0,
            averageCheck: customer?.averageCheck ?? 0,
            LTV: customer?.LTV ?? customer?.ltv ?? customer?.totalSpent ?? 0,
            churnRisk: customer?.churnRisk ?? 0,
            lastPurchase: customer?.lastPurchase ?? null,
            createdAt: customer?.createdAt ?? now,
            updatedAt: now,
          });

          resolve(savedCustomer);

          navigate(getCustomerDetailsPath(savedCustomer.id), {
            replace: !editMode,
            state: {
              crmFeedback: {
                type: "success",
                title: editMode
                  ? "Mijoz ma’lumotlari yangilandi"
                  : "Yangi mijoz yaratildi",
                message: editMode
                  ? "Kiritilgan o‘zgarishlar muvaffaqiyatli saqlandi."
                  : "Yangi mijoz CRM bazasiga muvaffaqiyatli qo‘shildi.",
              },
            },
          });
        } catch (error) {
          reject(error);
        }
      }, SAVE_DELAY);
    });

  const handleCancel = () => {
    if (editMode && customer) {
      navigate(getCustomerDetailsPath(customer.id));
      return;
    }

    navigate("/crm/customers");
  };

  const backAction = (
    <Link
      className="crm-customer-form-page__back"
      to={
        editMode && customer
          ? getCustomerDetailsPath(customer.id)
          : "/crm/customers"
      }
    >
      <ArrowLeft aria-hidden="true" />

      <span>{editMode ? "Mijoz profiliga qaytish" : "Mijozlarga qaytish"}</span>
    </Link>
  );

  if (loading) {
    return (
      <main
        className="crm-customer-form-page"
        aria-busy="true"
        aria-label="Mijoz ma’lumotlari yuklanmoqda"
      >
        <div className="crm-customer-form-page__loading">
          <div className="crm-customer-form-page__skeleton crm-customer-form-page__skeleton--header" />
          <div className="crm-customer-form-page__skeleton crm-customer-form-page__skeleton--content" />
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="crm-customer-form-page">
        <CRMStateView
          variant="error"
          icon={ShieldAlert}
          title={loadError.title}
          description={loadError.message}
          action={
            <div className="crm-customer-form-page__state-actions">
              <button
                type="button"
                onClick={() =>
                  setReloadIndex((currentIndex) => currentIndex + 1)
                }
              >
                <RefreshCw aria-hidden="true" />
                <span>Qayta urinish</span>
              </button>

              <Link to="/crm/customers">Mijozlarga qaytish</Link>
            </div>
          }
        />
      </main>
    );
  }

  return (
    <main className="crm-customer-form-page">
      <CRMPageHeader
        eyebrow={editMode ? "CRM · Mijozni tahrirlash" : "CRM · Yangi mijoz"}
        title={
          editMode
            ? `${customer.fullName} ma’lumotlarini tahrirlash`
            : "Yangi mijoz yaratish"
        }
        description={
          editMode
            ? "Mijozning aloqa, CRM, sodiqlik va moliyaviy sozlamalarini yangilang."
            : "Mijozni CRM bazasiga qo‘shish uchun asosiy ma’lumotlarni kiriting."
        }
        icon={editMode ? UserRoundPen : UserPlus}
        action={backAction}
        actions={backAction}
      />

      <CustomerFormFields
        customer={customer}
        customers={availableCustomers}
        submitLabel={editMode ? "O‘zgarishlarni saqlash" : "Mijozni yaratish"}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </main>
  );
};

export default CustomerForm;
