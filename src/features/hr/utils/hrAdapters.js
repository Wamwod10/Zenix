export const hrAdapter = {
  async saveEmployee(payload) {
    return { ok: true, payload };
  },
  async calculatePayroll(entry, result) {
    return { ok: true, entryId: entry.id, result };
  },
  async processPayment(entry) {
    return { ok: true, entryId: entry.id, provider: "mock-payment" };
  },
  async sendMessage(message) {
    return { ok: true, message };
  },
  async uploadDocument(document) {
    return { ok: true, document };
  },
};
