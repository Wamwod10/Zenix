export const useFinanceFilters = (controller) => ({
  filters: controller.filters,
  updateFilter: controller.actions.updateFilter,
  resetFilters: () =>
    controller.actions.setFilters({
      search: "",
      date: "",
      branch: "all",
      account: "all",
      currency: "all",
      type: "all",
    }),
});

export default useFinanceFilters;
