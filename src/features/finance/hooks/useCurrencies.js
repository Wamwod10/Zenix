const useCurrencies = (controller) => ({
  currencies: controller.state.currencies,
  updateCurrencyRate: controller.actions.updateCurrencyRate,
  runRevaluation: controller.actions.runRevaluation,
  revaluation: controller.revaluation,
});

export default useCurrencies;
