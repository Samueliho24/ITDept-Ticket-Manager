import { Spin } from 'antd';

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
          <Spin size="small" />
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
