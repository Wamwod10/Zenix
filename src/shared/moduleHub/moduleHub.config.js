export const hydrateHubConfig = (config) => ({
  ...config,
  sections: (config.sections || []).map((section) => ({
    ...section,
    items: (section.items || []).map((item) => {
      const navigationItem = { ...item };

      delete navigationItem.metric;
      delete navigationItem.secondaryMetric;
      delete navigationItem.status;
      delete navigationItem.badge;

      return navigationItem;
    }),
  })),
});
