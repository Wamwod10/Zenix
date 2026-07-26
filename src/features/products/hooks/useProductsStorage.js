import { useCallback, useState } from "react";

import { initialProductsState } from "../data/productsMockData";
import {
  productStorageKeys,
  safeStorageRead,
  safeStorageWrite,
} from "../utils/productStorage";

const cloneInitialState = () => JSON.parse(JSON.stringify(initialProductsState));

const useProductsStorage = () => {
  const [state, setStoredState] = useState(() =>
    safeStorageRead(productStorageKeys.state, cloneInitialState()),
  );

  const setState = useCallback((updater) => {
    setStoredState((current) => {
      const nextState = typeof updater === "function" ? updater(current) : updater;
      safeStorageWrite(productStorageKeys.state, nextState);
      return nextState;
    });
  }, []);

  const resetState = useCallback(() => {
    const nextState = cloneInitialState();
    setStoredState(nextState);
    safeStorageWrite(productStorageKeys.state, nextState);
  }, []);

  return { state, setState, resetState };
};

export default useProductsStorage;
