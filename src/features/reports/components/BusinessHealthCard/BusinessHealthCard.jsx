import { HeartPulse, ShieldCheck, Target } from "lucide-react";

import "./BusinessHealthCard.scss";

const BusinessHealthCard = ({ score = 86, metrics = [] }) => {
  const signals = metrics.slice(0, 5);

  return (
    <article className="business-health-card">
      <div className="business-health-card__score" aria-label={`Business health ${score}%`}>
        <span style={{ "--score": `${score}%` }} />
        <div>
          <HeartPulse size={20} />
          <strong>{score}%</strong>
          <small>Business Health</small>
        </div>
      </div>

      <div className="business-health-card__content">
        <span className="reports-eyebrow">
          <ShieldCheck size={14} />
          Executive pulse
        </span>
        <h3>Biznes holati sog'lom, ammo expense va stock risk nazoratda.</h3>
        <p>Weighted score revenue, profit, cash flow, inventory, CRM va HR signallaridan hisoblandi.</p>

        <div className="business-health-card__signals">
          {signals.map((item) => (
            <span key={item.id}>
              <Target size={13} />
              {item.title}
              <i>{item.progress}%</i>
            </span>
          ))}
        </div>
      </div>
    </article>
  );
};

export default BusinessHealthCard;
