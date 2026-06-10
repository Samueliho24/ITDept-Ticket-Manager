import { Switch } from 'antd';
import ResolvedBarChart from './ResolvedBarChart';
import DepartmentDonutChart from './DepartmentDonutChart';

export default function ChartsSection({ resolvedByMonth, departmentBreakdown, loading, onToggleCancelled }) {
  return (
    <div className="charts-grid">
      <ResolvedBarChart data={resolvedByMonth} loading={loading} />
      <div className="chart-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <h3 className="chart-card__title" style={{ margin: 0 }}>Áreas con Mayor Recurrencia de Fallas</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <Switch size="small" onChange={(checked) => onToggleCancelled?.(checked)} />
            <span style={{ color: '#64748B' }}>Excluir anulados</span>
          </div>
        </div>
        <DepartmentDonutChart data={departmentBreakdown} loading={loading} />
      </div>
    </div>
  );
}
