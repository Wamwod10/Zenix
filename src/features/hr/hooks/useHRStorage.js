import { useEffect, useState } from "react";

import { initialHRState } from "../data/hrMockData";
import { hrStorageKeys, safeStorageRead, safeStorageWrite } from "../utils/hrStorage";

const useHRStorage = () => {
  const [state, setState] = useState(() =>
    safeStorageRead(hrStorageKeys.state, initialHRState),
  );

  useEffect(() => {
    safeStorageWrite(hrStorageKeys.state, state);
  }, [state]);

  return {
    state,
    setState,
    resetState: () => setState(initialHRState),
  };
};

export default useHRStorage;
