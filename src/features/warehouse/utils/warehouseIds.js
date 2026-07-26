const prefixes = {
  warehouse: "WH",
  receipt: "GR",
  issue: "GI",
  transfer: "TR",
  count: "IC",
  adjustment: "ADJ",
  writeOff: "WO",
  damage: "DMG",
  reserve: "RSV",
  incoming: "INC",
  audit: "AUD",
  notification: "NTF",
};

export const generateWarehouseId = (type = "warehouse") => {
  const prefix = prefixes[type] || "WMS";
  const time = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `${prefix}-${time}-${random}`;
};
