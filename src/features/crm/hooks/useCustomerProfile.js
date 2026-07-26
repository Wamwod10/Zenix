import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import * as crmCustomerData from "../data/crmCustomers";

const PROFILE_LOAD_DELAY = 420;
const CRM_CUSTOMERS_STORAGE_KEY =
  "zenix.crm.customers.v1";

const staticCustomers =
  crmCustomerData.crmCustomers ??
  crmCustomerData.customers ??
  [];

const canUseStorage = () =>
  typeof window !== "undefined" &&
  Boolean(window.localStorage);

const readStoredCustomers = () => {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(
      CRM_CUSTOMERS_STORAGE_KEY,
    );

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);

    return Array.isArray(parsedValue)
      ? parsedValue.filter(
        (customer) =>
          customer &&
          typeof customer === "object" &&
          customer.id,
      )
      : [];
  } catch {
    return [];
  }
};

const writeStoredCustomers = (customers) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(
    CRM_CUSTOMERS_STORAGE_KEY,
    JSON.stringify(customers),
  );
};

export const getCRMCustomerRecords = () => {
  const customerMap = new Map();

  staticCustomers.forEach((customer) => {
    customerMap.set(String(customer.id), {
      ...customer,
      tags: [...(customer.tags ?? [])],
    });
  });

  readStoredCustomers().forEach((customer) => {
    const existingCustomer = customerMap.get(
      String(customer.id),
    );

    customerMap.set(String(customer.id), {
      ...(existingCustomer ?? {}),
      ...customer,
      tags: [...(customer.tags ?? [])],
    });
  });

  return [...customerMap.values()];
};

export const getCRMCustomerById = (customerId) => {
  const normalizedId = String(customerId ?? "");

  return (
    getCRMCustomerRecords().find(
      (customer) =>
        String(customer.id) === normalizedId,
    ) ?? null
  );
};

export const saveCRMCustomerRecord = (customer) => {
  if (!customer?.id) {
    throw new Error(
      "Mijoz identifikatori mavjud emas.",
    );
  }

  const storedCustomers = readStoredCustomers();
  const customerIndex = storedCustomers.findIndex(
    (storedCustomer) =>
      String(storedCustomer.id) === String(customer.id),
  );

  const normalizedCustomer = {
    ...customer,
    tags: [...(customer.tags ?? [])],
  };

  if (customerIndex >= 0) {
    const nextCustomers = [...storedCustomers];

    nextCustomers[customerIndex] = normalizedCustomer;
    writeStoredCustomers(nextCustomers);
  } else {
    writeStoredCustomers([
      normalizedCustomer,
      ...storedCustomers,
    ]);
  }

  return normalizedCustomer;
};

const calculateRelationshipDays = (createdAt) => {
  if (!createdAt) {
    return 0;
  }

  const createdDate = new Date(createdAt);

  if (Number.isNaN(createdDate.getTime())) {
    return 0;
  }

  const difference = Date.now() - createdDate.getTime();

  return Math.max(
    0,
    Math.floor(difference / (1000 * 60 * 60 * 24)),
  );
};

const getRelationshipLabel = (days) => {
  if (days < 30) {
    return "Yangi mijoz";
  }

  if (days < 180) {
    return "Rivojlanayotgan aloqa";
  }

  if (days < 365) {
    return "Doimiy mijoz";
  }

  return "Uzoq muddatli mijoz";
};

const getFinancialHealth = (customer) => {
  const debt = Number(customer?.debt || 0);
  const debtLimit = Number(customer?.debtLimit || 0);
  const totalSpent = Number(customer?.totalSpent || 0);

  if (debt <= 0) {
    return {
      value: "healthy",
      label: "Barqaror",
      description:
        "Mijozda faol qarzdorlik mavjud emas.",
    };
  }

  if (debtLimit > 0 && debt >= debtLimit) {
    return {
      value: "critical",
      label: "Limitga yetgan",
      description:
        "Qarzdorlik tasdiqlangan limitga yetgan.",
    };
  }

  if (debtLimit > 0 && debt / debtLimit >= 0.7) {
    return {
      value: "warning",
      label: "Nazorat kerak",
      description:
        "Qarzdorlik limitning 70 foizidan yuqori.",
    };
  }

  if (totalSpent > 0 && debt / totalSpent >= 0.25) {
    return {
      value: "warning",
      label: "Nazorat kerak",
      description:
        "Qarzdorlik xarid hajmiga nisbatan yuqori.",
    };
  }

  return {
    value: "attention",
    label: "Faol qarzdorlik",
    description:
      "Mijoz hisobida yopilmagan qarzdorlik mavjud.",
  };
};

const getContactCompleteness = (customer) => {
  const contactFields = [
    customer?.phone,
    customer?.email,
    customer?.birthday,
    customer?.company,
    customer?.assignedManager,
  ];

  const completedFields =
    contactFields.filter(Boolean).length;

  return Math.round(
    (completedFields / contactFields.length) * 100,
  );
};

const useCustomerProfile = (customerId) => {
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let active = true;

    setIsLoading(true);
    setError(null);

    const loadTimer = window.setTimeout(() => {
      if (!active) {
        return;
      }

      if (!customerId) {
        setCustomer(null);
        setError({
          code: "CUSTOMER_ID_REQUIRED",
          title: "Mijoz aniqlanmadi",
          message:
            "Profilni ochish uchun mijoz identifikatori kerak.",
        });
        setIsLoading(false);
        return;
      }

      const matchedCustomer =
        getCRMCustomerById(customerId);

      if (!matchedCustomer) {
        setCustomer(null);
        setError({
          code: "CUSTOMER_NOT_FOUND",
          title: "Mijoz topilmadi",
          message:
            "Bu mijoz o‘chirilgan yoki havola noto‘g‘ri bo‘lishi mumkin.",
        });
        setIsLoading(false);
        return;
      }

      setCustomer({
        ...matchedCustomer,
        tags: [...(matchedCustomer.tags ?? [])],
      });
      setIsLoading(false);
    }, PROFILE_LOAD_DELAY);

    return () => {
      active = false;
      window.clearTimeout(loadTimer);
    };
  }, [customerId, refreshIndex]);

  const metrics = useMemo(() => {
    if (!customer) {
      return null;
    }

    const relationshipDays =
      calculateRelationshipDays(customer.createdAt);

    return {
      relationshipDays,
      relationshipLabel:
        getRelationshipLabel(relationshipDays),
      financialHealth:
        getFinancialHealth(customer),
      contactCompleteness:
        getContactCompleteness(customer),
      churnRisk: Math.min(
        100,
        Math.max(
          0,
          Number(customer.churnRisk || 0),
        ),
      ),
      hasDebt: Number(customer.debt || 0) > 0,
      purchaseCount:
        Number(customer.orderCount || 0),
      averageCheck:
        Number(customer.averageCheck || 0),
      totalSpent:
        Number(customer.totalSpent || 0),
      lifetimeValue: Number(
        customer.LTV ??
        customer.ltv ??
        customer.totalSpent ??
        0,
      ),
    };
  }, [customer]);

  const refresh = useCallback(() => {
    setRefreshIndex(
      (currentIndex) => currentIndex + 1,
    );
  }, []);

  const updateCustomer = useCallback((changes) => {
    setCustomer((currentCustomer) => {
      if (!currentCustomer) {
        return currentCustomer;
      }

      const updatedCustomer = {
        ...currentCustomer,
        ...changes,
        updatedAt: new Date().toISOString(),
      };

      saveCRMCustomerRecord(updatedCustomer);

      return updatedCustomer;
    });
  }, []);

  return {
    customer,
    metrics,
    isLoading,
    isError: Boolean(error),
    error,
    actions: {
      refresh,
      updateCustomer,
    },
  };
};

export default useCustomerProfile;