import { useCallback } from 'react';

export const useCRMCustomers = () => {
  const getCustomers = useCallback(() => {
    // Fetch customers logic
  }, []);

  return { getCustomers };
};
