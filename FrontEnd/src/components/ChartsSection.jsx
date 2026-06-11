import './ChartsSection.scss';
import { Switch } from 'antd';
import ResolvedBarChart from './ResolvedBarChart';
import DepartmentDonutChart from './DepartmentDonutChart';

export default function ChartsSection({ resolvedByMonth, departmentBreakdown, loading, onToggleCancelled }) {
  return (
    <div className="charts-grid">
      <ResolvedBarChart data={resolvedByMonth} loading={loading} />
      <div className="chart-card">
        <div className="chart-header-row">
          <h3 className="chart-card__title chart-title">Áreas con Mayor Recurrencia de Fallas</h3>
          <div className="chart-toggle-row">
            <Switch size="small" onChange={(checked) => onToggleCancelled?.(checked)} />
            <span className="chart-toggle-label">Excluir anulados</span>
          </div>
        </div>
        <DepartmentDonutChart data={departmentBreakdown} loading={loading} />
      </div>
    </div>
  );
}
