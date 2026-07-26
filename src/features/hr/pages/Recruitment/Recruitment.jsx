import { UserPlus } from "lucide-react";

import { formatMoney } from "../../utils/hrFormatters";

const stages = ["applied", "interview", "offer", "hired", "rejected"];

const Recruitment = ({ controller, onNavigate }) => {
  const { state, dictionaries } = controller;

  return (
    <div className="hr-view">
      <section className="hr-grid">
        <article className="hr-panel">
          <div className="hr-panel__head"><div><span>Vacancies</span><h2>Ochiq vakansiyalar</h2></div></div>
          <div className="hr-list">
            {state.vacancies.map((vacancy) => (
              <article key={vacancy.id}>
                <strong>{vacancy.title}</strong>
                <span>{dictionaries.departmentById[vacancy.departmentId]?.name} · {dictionaries.branchById[vacancy.branchId]?.name}</span>
                <span>{formatMoney(vacancy.salaryMin)} - {formatMoney(vacancy.salaryMax)} · {vacancy.candidates} candidate</span>
              </article>
            ))}
          </div>
        </article>
        <article className="hr-panel">
          <div className="hr-panel__head"><div><span>Candidates</span><h2>Hiring pipeline</h2></div></div>
          <div className="hr-list">
            {state.candidates.map((candidate) => (
              <article key={candidate.id}>
                <strong>{candidate.fullName}</strong>
                <span>{candidate.source} · score {candidate.score} · interview {candidate.interviewDate}</span>
                <select value={candidate.stage} onChange={(event) => controller.actions.updateCandidateStage(candidate.id, event.target.value)} aria-label="Candidate stage">
                  {stages.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
                </select>
                <button type="button" onClick={() => onNavigate("employee-create")}>
                  <UserPlus size={15} /> Employee formga o'tkazish
                </button>
              </article>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
};

export default Recruitment;
