import { useMemo } from "react";
import {
  DEFAULT_BUSINESS_TYPE,
  getBusinessTypeById,
  getBusinessModules,
} from "../config/businessTypes";
import { getModulesByIds } from "../config/modules";

const STORAGE_KEY = "zenix_business_type";

export const getStoredBusinessTypeId = () => {
  if (typeof window === "undefined") return DEFAULT_BUSINESS_TYPE;

  return localStorage.getItem(STORAGE_KEY) || DEFAULT_BUSINESS_TYPE;
};

export const setStoredBusinessTypeId = (businessTypeId) => {
  if (typeof window === "undefined") return;

  localStorage.setItem(STORAGE_KEY, businessTypeId);
};

export const useBusinessType = (businessTypeId) => {
  const activeBusinessTypeId = businessTypeId || getStoredBusinessTypeId();

  return useMemo(() => {
    const businessType = getBusinessTypeById(activeBusinessTypeId);
    const moduleIds = getBusinessModules(activeBusinessTypeId);
    const modules = getModulesByIds(moduleIds);

    return {
      businessType,
      businessTypeId: businessType.id,
      dashboardType: businessType.dashboardType,
      primaryModule: businessType.primaryModule,
      moduleIds,
      modules,
      workspaceLabel: businessType.workspaceLabel,
      setBusinessType: setStoredBusinessTypeId,
    };
  }, [activeBusinessTypeId]);
};
