const useJournals = (controller) => ({
  journals: controller.state.journals,
  createJournal: controller.actions.createJournal,
  approveJournal: controller.actions.approveJournal,
  postJournal: controller.actions.postJournal,
});

export default useJournals;
