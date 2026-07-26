const useApprovals = (controller) => ({
  pending: controller.state.transactions.filter((item) => item.status === "Pending"),
  approveTransaction: controller.actions.approveTransaction,
  rejectTransaction: controller.actions.rejectTransaction,
  actionState: controller.actionState,
});

export default useApprovals;
