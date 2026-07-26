import "./ReportsSkeleton.scss";

const ReportsSkeleton = () => (
  <section className="reports-skeleton" aria-label="Reports loading">
    {Array.from({ length: 6 }).map((_, index) => (
      <span key={index} style={{ "--card-index": index }} />
    ))}
  </section>
);

export default ReportsSkeleton;
