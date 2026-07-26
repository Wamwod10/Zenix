const useReconciliation = (controller) => ({
  reconciliation: controller.state.reconciliation,
  autoMatch: controller.actions.autoMatchReconciliation,
  manualMatch: controller.actions.manualMatch,
  closeReconciliation: controller.actions.closeReconciliation,
});

export default useReconciliation;
