import { useMemo } from "react";
import { buildNavigation } from "../config/navigation";
import { useBusinessType } from "./useBusinessType";

export const useNavigation = ({ businessTypeId, permissions = [] } = {}) => {
  const { businessType } = useBusinessType(businessTypeId);

  return useMemo(() => {
    const navigation = buildNavigation({
      businessTypeId: businessType.id,
      permissions,
    });

    return {
      businessType: navigation.businessType,
      groups: navigation.groups,
      items: navigation.items,
      hasItems: navigation.items.length > 0,
    };
  }, [businessType.id, permissions]);
};
