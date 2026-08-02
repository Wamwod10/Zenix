import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  businessOSActions,
  selectProductsModuleState,
} from "../../../core/businessOS/businessOSSlice";
import { withProductSchema } from "../utils/productStorage";

const useProductsStorage = () => {
  const dispatch = useDispatch();
  const state = useSelector(selectProductsModuleState);

  const setState = useCallback((updater) => {
    const nextState = typeof updater === "function" ? updater(state) : updater;
    dispatch(businessOSActions.productsModuleCommitted(withProductSchema(nextState)));
  }, [dispatch, state]);

  const resetState = useCallback(() => {
    dispatch(businessOSActions.productsModuleCommitted(withProductSchema({
      categories: [],
      brands: [],
      units: state.units || [],
      products: [],
      notifications: [],
      auditLog: [],
      settings: state.settings || {},
    })));
  }, [dispatch, state.settings, state.units]);

  return { state, setState, resetState };
};

export default useProductsStorage;
