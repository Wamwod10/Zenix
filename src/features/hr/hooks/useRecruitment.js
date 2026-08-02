import { useMemo } from "react";

export const recruitmentStages = ["screening", "interview", "offer", "hired", "rejected"];

export const useRecruitment = (state) =>
  useMemo(
    () => ({
      vacancies: state.vacancies,
      candidates: state.candidates,
      pipeline: Object.fromEntries(
        recruitmentStages.map((stage) => [stage, state.candidates.filter((candidate) => candidate.stage === stage)]),
      ),
      openVacancies: state.vacancies.filter((vacancy) => vacancy.status === "open"),
    }),
    [state.candidates, state.vacancies],
  );

export default useRecruitment;
