import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  businessOSActions,
  selectWarehouseModuleState,
} from "../../../core/businessOS/businessOSSlice";

const useWarehouseStorage = () => {
  const dispatch = useDispatch();
  const state = useSelector(selectWarehouseModuleState);
  const setState = useCallback((updater) => {
    const nextState = typeof updater === "function" ? updater(state) : updater;
    dispatch(businessOSActions.warehouseModuleCommitted(nextState));
  }, [dispatch, state]);

  const resetState = useCallback(() => {
    dispatch(businessOSActions.warehouseModuleCommitted({
      warehouses: [],
      products: [],
      movements: [],
    }));
  }, [dispatch]);

  return {
    state,
    setState,
    resetState,
  };
};

export default useWarehouseStorage;
