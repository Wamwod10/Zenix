import "./ReportBarChart.scss";

const ReportBarChart = ({ data = [], valueFormatter = (value) => value, onBarClick, tone = "primary" }) => {
  if (!data.length) {
    return <p className="report-bar-chart__empty">Ma'lumot yo'q.</p>;
  }

  return (
    <div className={`report-bar-chart report-bar-chart--${tone}`}>
      {data.map((entry, index) => {
        const Component = onBarClick ? "button" : "article";

        return (
          <Component
            className="report-bar-chart__item"
            key={entry.key || entry.label || index}
            type={onBarClick ? "button" : undefined}
            onClick={onBarClick ? () => onBarClick(entry) : undefined}
          >
            <span>{entry.label}</span>
            <strong>{valueFormatter(entry.value)}</strong>
            <em>{Number(entry.value || 0).toLocaleString("uz-UZ")}</em>
          </Component>
        );
      })}
    </div>
  );
};

export default ReportBarChart;
