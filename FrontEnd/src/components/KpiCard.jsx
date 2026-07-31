import './KpiCard.scss';
import { Skeleton } from 'antd';

export default function KpiCard({ icon, value, label, trend, trendDirection, color, loading }) {
  return (
    <div className="kpi-analytics__card">
      <div className="kpi-analytics__header">
        <span className="kpi-analytics__label">{label}</span>
        <div className="kpi-analytics__icon" style={{ backgroundColor: `${color}1A` }}>
          {icon}
        </div>
      </div>
      <div className="kpi-analytics__body">
        {loading ? (
          <>
            <Skeleton.Input active style={{ width: 60, height: 32 }} size="small" />
            <Skeleton.Input active style={{ width: 90, height: 14, marginTop: 6 }} size="small" />
          </>
        ) : (
          <>
            <div className="kpi-analytics__value" style={{ color }}>{value}</div>
            {trend && (
              <div className={`kpi-analytics__trend ${trendDirection === 'up' ? 'trend-up' : 'trend-down'}`}>
                {trendDirection === 'up' ? '↑' : '↓'} {trend}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
