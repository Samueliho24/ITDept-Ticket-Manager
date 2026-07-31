import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Empty, Skeleton } from 'antd';

export default function ResolvedBarChart({ data, loading }) {
  if (loading) {
    return (
      <div className="chart-card">
        <h3 className="chart-card__title">Tickets Resueltos</h3>
        <div className="chart-skeleton">
          <Skeleton.Input active block style={{ height: 240 }} />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="chart-card">
        <h3 className="chart-card__title">Tickets Resueltos</h3>
        <Empty description="Sin datos" />
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3 className="chart-card__title">Tickets Resueltos</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 13, fill: '#6B7280' }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 13, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #E5E7EB',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
            formatter={(value) => [value, 'Resueltos']}
          />
          <Bar dataKey="count" fill="#006699" radius={[4, 4, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
