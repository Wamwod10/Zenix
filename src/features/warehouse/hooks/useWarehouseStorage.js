import { useEffect, useState } from "react";

import { initialWarehouseState } from "../data/warehouseMockData";
import {
  safeStorageRead,
  safeStorageWrite,
  warehouseStorageKeys,
} from "../utils/warehouseStorage";

const cloneInitialState = () => JSON.parse(JSON.stringify(initialWarehouseState));

const useWarehouseStorage = () => {
  const [state, setState] = useState(() =>
    safeStorageRead(warehouseStorageKeys.state, cloneInitialState()),
  );

  useEffect(() => {
    safeStorageWrite(warehouseStorageKeys.state, state);
  }, [state]);

  const resetState = () => setState(cloneInitialState());

  return {
    state,
    setState,
    resetState,
  };
};

export default useWarehouseStorage;
