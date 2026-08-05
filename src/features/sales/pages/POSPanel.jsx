import { Link } from "react-router-dom";
import { ArrowRight, MonitorPlay } from "lucide-react";

import "./POS.scss";

const panelContent = {
  held: {
    title: "Saqlangan savdolar",
    description: "Saqlangan cheklar POS terminal ichida davom ettiriladi.",
    action: "Terminalda ochish",
  },
  history: {
    title: "So'nggi savdolar",
    description: "So'nggi savdolar tarixi checkout terminaldagi history panel orqali ko'riladi.",
    action: "Tarixni terminalda ko'rish",
  },
  shift: {
    title: "Smena holati",
    description: "Smena va to'lov jarayonlari terminal ekranida boshqariladi.",
    action: "Savdoni boshlash",
  },
  returns: {
    title: "Qaytarish",
    description: "Qaytarish jarayoni hozir terminaldagi chek amallari orqali bajariladi.",
    action: "Terminalga o'tish",
  },
};

const POSPanel = ({ type }) => {
  const content = panelContent[type] || panelContent.shift;

  return (
    <main className="sales-pos">
      <section className="pos-empty-state">
        <MonitorPlay size={28} aria-hidden="true" />
        <strong>{content.title}</strong>
        <span>{content.description}</span>
        <Link className="pos-primary-link" to="/pos/terminal">
          <span>{content.action}</span>
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
};

export default POSPanel;
