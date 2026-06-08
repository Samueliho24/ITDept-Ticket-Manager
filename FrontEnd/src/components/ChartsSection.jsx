import ResolvedBarChart from './ResolvedBarChart';
import DepartmentDonutChart from './DepartmentDonutChart';

export default function ChartsSection({ resolvedByMonth, departmentBreakdown, loading }) {
  return (
    <div className="charts-grid">
      <ResolvedBarChart data={resolvedByMonth} loading={loading} />
      <DepartmentDonutChart data={departmentBreakdown} loading={loading} />
    </div>
  );
}
