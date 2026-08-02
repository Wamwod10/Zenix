import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { useSelector } from "react-redux";

import {
    deleteCRMCustomerRecord,
    getCRMCustomerRecords,
    saveCRMCustomerRecord,
} from "./useCustomerProfile";

const BULK_ACTION_DELAY = 550;
const FEEDBACK_DURATION = 4200;

const createFeedback = (type, title, message) => ({
    id: `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
    type,
    title,
    message,
});

const mergeCustomerRecords = (initialCustomers = []) => {
    const customerMap = new Map();

    initialCustomers.forEach((customer) => {
        if (!customer?.id) {
            return;
        }

        customerMap.set(String(customer.id), {
            ...customer,
            tags: [...(customer.tags ?? [])],
        });
    });

    getCRMCustomerRecords().forEach((customer) => {
        if (!customer?.id) {
            return;
        }

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

const useCustomerSelection = (initialCustomers = []) => {
    const customerRevision = useSelector((state) =>
        (state.businessOS?.entities?.customers?.allIds || [])
            .map((id) => {
                const customer = state.businessOS.entities.customers.byId[id];
                return `${id}:${customer?.updatedAt || ""}:${customer?.totalSpent || 0}:${customer?.archived || false}`;
            })
            .join("|"),
    );
    const initialRecordsRef = useRef(
        mergeCustomerRecords(initialCustomers),
    );

    const [customers, setCustomers] = useState(
        initialRecordsRef.current,
    );
    const [selectedCustomerIds, setSelectedCustomerIds] =
        useState([]);
    const [bulkActionLoading, setBulkActionLoading] =
        useState(false);
    const [feedback, setFeedback] = useState(null);

    const customersRef = useRef(initialRecordsRef.current);
    const bulkActionTimerRef = useRef(null);
    const feedbackTimerRef = useRef(null);
    const mountedRef = useRef(true);

    const replaceCustomers = useCallback(
        (nextCustomers) => {
            customersRef.current = nextCustomers;
            setCustomers(nextCustomers);
        },
        [],
    );

    const refreshCustomers = useCallback(() => {
        const nextCustomers = mergeCustomerRecords(
            customersRef.current,
        );

        replaceCustomers(nextCustomers);
    }, [replaceCustomers]);

    useEffect(() => {
        mountedRef.current = true;
        refreshCustomers();

        const handleStorageChange = () => {
            if (mountedRef.current) {
                refreshCustomers();
            }
        };

        window.addEventListener(
            "storage",
            handleStorageChange,
        );

        return () => {
            mountedRef.current = false;

            window.removeEventListener(
                "storage",
                handleStorageChange,
            );

            if (bulkActionTimerRef.current) {
                window.clearTimeout(
                    bulkActionTimerRef.current,
                );
            }

            if (feedbackTimerRef.current) {
                window.clearTimeout(
                    feedbackTimerRef.current,
                );
            }
        };
    }, [customerRevision, refreshCustomers]);

    useEffect(() => {
        if (!feedback) {
            return undefined;
        }

        if (feedbackTimerRef.current) {
            window.clearTimeout(
                feedbackTimerRef.current,
            );
        }

        feedbackTimerRef.current = window.setTimeout(() => {
            if (mountedRef.current) {
                setFeedback(null);
            }
        }, FEEDBACK_DURATION);

        return () => {
            if (feedbackTimerRef.current) {
                window.clearTimeout(
                    feedbackTimerRef.current,
                );
            }
        };
    }, [feedback]);

    useEffect(() => {
        const availableIds = new Set(
            customers.map((customer) => customer.id),
        );

        setSelectedCustomerIds((currentIds) =>
            currentIds.filter((id) =>
                availableIds.has(id),
            ),
        );
    }, [customers]);

    const dismissFeedback = useCallback(() => {
        setFeedback(null);
    }, []);

    const clearSelection = useCallback(() => {
        if (bulkActionLoading) {
            return;
        }

        setSelectedCustomerIds([]);
    }, [bulkActionLoading]);

    const handleSelectionChange = useCallback(
        (nextSelection) => {
            setSelectedCustomerIds([
                ...new Set(nextSelection),
            ]);
        },
        [],
    );

    const performBulkUpdate = useCallback(
        ({
            customerIds,
            changes,
            successTitle,
            successMessage,
        }) => {
            const normalizedIds = [
                ...new Set(customerIds),
            ];

            if (normalizedIds.length === 0) {
                setFeedback(
                    createFeedback(
                        "error",
                        "Mijoz tanlanmagan",
                        "Amalni bajarish uchun kamida bitta mijozni tanlang.",
                    ),
                );
                return;
            }

            if (bulkActionTimerRef.current) {
                window.clearTimeout(
                    bulkActionTimerRef.current,
                );
            }

            setBulkActionLoading(true);
            setFeedback(null);

            bulkActionTimerRef.current = window.setTimeout(
                () => {
                    if (!mountedRef.current) {
                        return;
                    }

                    try {
                        const selectedIdSet = new Set(
                            normalizedIds,
                        );

                        const updatedAt =
                            new Date().toISOString();

                        const nextCustomers =
                            customersRef.current.map(
                                (customer) => {
                                    if (
                                        !selectedIdSet.has(customer.id)
                                    ) {
                                        return customer;
                                    }

                                    return {
                                        ...customer,
                                        ...changes,
                                        updatedAt,
                                    };
                                },
                            );

                        const changedCustomers =
                            nextCustomers.filter((customer) =>
                                selectedIdSet.has(customer.id),
                            );

                        changedCustomers.forEach(
                            (changedCustomer) => {
                                saveCRMCustomerRecord(
                                    changedCustomer,
                                );
                            },
                        );

                        replaceCustomers(nextCustomers);

                        setSelectedCustomerIds(
                            (currentIds) =>
                                currentIds.filter(
                                    (id) =>
                                        !selectedIdSet.has(id),
                                ),
                        );

                        setBulkActionLoading(false);

                        setFeedback(
                            createFeedback(
                                "success",
                                successTitle,
                                successMessage,
                            ),
                        );
                    } catch {
                        setBulkActionLoading(false);

                        setFeedback(
                            createFeedback(
                                "error",
                                "O‘zgarishlar saqlanmadi",
                                "Browser xotirasiga yozishda xatolik yuz berdi. Qayta urinib ko‘ring.",
                            ),
                        );
                    }
                },
                BULK_ACTION_DELAY,
            );
        },
        [replaceCustomers],
    );

    const changeSelectedGroup = useCallback(
        (customerIds, group) => {
            if (!group) {
                setFeedback(
                    createFeedback(
                        "error",
                        "Guruh tanlanmagan",
                        "Mijozlar o‘tkaziladigan guruhni tanlang.",
                    ),
                );
                return;
            }

            performBulkUpdate({
                customerIds,
                changes: {
                    group,
                },
                successTitle:
                    "Mijozlar guruhi yangilandi",
                successMessage: `${customerIds.length} ta mijoz “${group}” guruhiga o‘tkazildi.`,
            });
        },
        [performBulkUpdate],
    );

    const changeSelectedStatus = useCallback(
        (customerIds, status) => {
            if (!status) {
                setFeedback(
                    createFeedback(
                        "error",
                        "Holat tanlanmagan",
                        "Mijozlarga qo‘llanadigan holatni tanlang.",
                    ),
                );
                return;
            }

            performBulkUpdate({
                customerIds,
                changes: {
                    status,
                },
                successTitle:
                    "Mijozlar holati yangilandi",
                successMessage: `${customerIds.length} ta mijoz holati muvaffaqiyatli o‘zgartirildi.`,
            });
        },
        [performBulkUpdate],
    );

    const deleteCustomer = useCallback(
        (customerId) => {
            const customer = customersRef.current.find(
                (item) => item.id === customerId,
            );

            if (!customer) {
                return;
            }

            const confirmed = window.confirm(
                `${customer.fullName} mijozini o'chirishni tasdiqlaysizmi?`,
            );

            if (!confirmed) {
                return;
            }

            deleteCRMCustomerRecord(customerId);
            const nextCustomers = customersRef.current.filter(
                (item) => item.id !== customerId,
            );

            replaceCustomers(nextCustomers);
            setSelectedCustomerIds((currentIds) =>
                currentIds.filter((id) => id !== customerId),
            );
            setFeedback(
                createFeedback(
                    "success",
                    "Mijoz o'chirildi",
                    `${customer.fullName} ro'yxatdan olib tashlandi.`,
                ),
            );
        },
        [replaceCustomers],
    );

    return {
        customers,
        selectedCustomerIds,
        selectedCount:
            selectedCustomerIds.length,
        bulkActionLoading,
        feedback,
        actions: {
            replaceCustomers,
            refreshCustomers,
            handleSelectionChange,
            clearSelection,
            changeSelectedGroup,
            changeSelectedStatus,
            deleteCustomer,
            dismissFeedback,
        },
    };
};

export default useCustomerSelection;
