import { HeartPulse, ShieldCheck, Target } from "lucide-react";

import { clampNumber } from "../../utils/reportsFormatters";
import "./BusinessHealthCard.scss";

const BusinessHealthCard = ({ score = 86, metrics = [] }) => {
  const signals = metrics.slice(0, 5);
  const normalizedScore = clampNumber(score);

  return (
    <article className="business-health-card">
      <div className="business-health-card__score" aria-label={`Biznes salomatligi ${normalizedScore}%`}>
        <span style={{ "--score": `${normalizedScore}%` }} />
        <div>
          <HeartPulse size={20} />
          <strong>{normalizedScore}%</strong>
          <small>Biznes salomatligi</small>
        </div>
      </div>

      <div className="business-health-card__content">
        <span className="reports-eyebrow">
          <ShieldCheck size={14} />
          Rahbar xulosasi
        </span>
        <h3>Biznes holati sog'lom, ammo expense va stock risk nazoratda.</h3>
        <p>Formula: daromad, foyda, pul oqimi, ombor, mijozlar va xodimlar signallari vaznlangan holda hisoblandi.</p>

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
