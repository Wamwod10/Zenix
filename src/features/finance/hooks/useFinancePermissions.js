import { canFinance, getFinanceActionState } from "../utils/financePermissions";

const useFinancePermissions = (role, currentUser) => ({
  can: (action) => canFinance(role, action),
  getActionState: (action, transaction) =>
    getFinanceActionState({ role, action, transaction, currentUser }),
});

export default useFinancePermissions;
