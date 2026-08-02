import ReportPageTemplate from "../../components/ReportPageTemplate/ReportPageTemplate";
import "./FinanceReports.scss";

const FinanceReports = ({ controller, reportType = "finance" }) => <ReportPageTemplate type={reportType} controller={controller} />;

export default FinanceReports;
