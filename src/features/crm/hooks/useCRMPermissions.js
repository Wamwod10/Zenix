import { useCallback } from 'react';

export const useCRMPermissions = () => {
  const hasPermission = useCallback((permission) => {
    // Check permission logic
    return true;
  }, []);

  return { hasPermission };
};
