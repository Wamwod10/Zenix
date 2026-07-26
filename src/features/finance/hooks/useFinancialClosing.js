const useFinancialClosing = (controller) => ({
  periods: controller.state.periods,
  checklist: controller.state.closingChecklist,
  closePeriod: controller.actions.closePeriod,
  reopenPeriod: controller.actions.reopenPeriod,
  toggleChecklist: controller.actions.toggleChecklist,
});

export default useFinancialClosing;
