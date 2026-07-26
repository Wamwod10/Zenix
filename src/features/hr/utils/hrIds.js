const stamp = () =>
  new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);

export const generateEmployeeId = () => `emp-${stamp()}-${Math.random().toString(16).slice(2, 6)}`;
export const generateHRId = (prefix) => `${prefix}-${stamp()}-${Math.random().toString(16).slice(2, 6)}`;
