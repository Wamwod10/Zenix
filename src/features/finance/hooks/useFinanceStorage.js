import { useEffect, useState } from "react";

import { initialFinanceState } from "../data/financeMockData";
import {
  financeStorageKeys,
  safeStorageRead,
  safeStorageWrite,
} from "../utils/financeStorage";

const cloneInitialState = () => JSON.parse(JSON.stringify(initialFinanceState));

const useFinanceStorage = () => {
  const [state, setState] = useState(() =>
    safeStorageRead(financeStorageKeys.state, cloneInitialState()),
  );

  useEffect(() => {
    safeStorageWrite(financeStorageKeys.state, state);
  }, [state]);

  return {
    state,
    setState,
    resetState: () => setState(cloneInitialState()),
  };
};

export default useFinanceStorage;
