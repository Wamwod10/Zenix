import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { businessOSActions } from "../../../core/businessOS/businessOSSlice";
import { initialHRState } from "../data/hrMockData";
import { hrStorageKeys, safeStorageRead, safeStorageWrite } from "../utils/hrStorage";

const mergeHRState = (state = {}) => ({
  ...initialHRState,
  ...state,
  settings: {
    ...initialHRState.settings,
    ...(state.settings || {}),
    payrollConfig: {
      ...initialHRState.settings.payrollConfig,
      ...(state.settings?.payrollConfig || {}),
    },
  },
});

const useHRStorage = () => {
  const dispatch = useDispatch();
  const [state, setState] = useState(() =>
    mergeHRState(safeStorageRead(hrStorageKeys.state, initialHRState)),
  );

  useEffect(() => {
    safeStorageWrite(hrStorageKeys.state, state);
    dispatch(businessOSActions.hrModuleCommitted(state));
  }, [dispatch, state]);

  return {
    state,
    setState,
    resetState: () => setState(initialHRState),
  };
};

export default useHRStorage;
