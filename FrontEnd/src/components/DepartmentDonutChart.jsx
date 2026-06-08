import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Spin, Empty } from 'antd';

const COLORS = ['#006699', '#D97706', '#1A8C06', '#860404', '#6B7280', '#8B5CF6'];

export default function DepartmentDonutChart({ data, loading }) {
  if (loading) {
    return (
      <div className="chart-card">
        <h3 className="chart-card__title">Áreas con Mayor Recurrencia de Fallas</h3>
        <div className="chart-card__loading"><Spin /></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="chart-card">
        <h3 className="chart-card__title">Áreas con Mayor Recurrencia de Fallas</h3>
        <Empty description="Sin datos" />
      </div>
    );
  }

  const renderLabel = ({ department, percentage }) =>
    `${department}: ${percentage}%`;

  return (
    <div className="chart-card">
      <h3 className="chart-card__title">Áreas con Mayor Recurrencia de Fallas</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="department"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            label={renderLabel}
            labelLine={{ stroke: '#D1D5DB', strokeWidth: 1 }}
          >
            {data.map((entry, index) => (
              <Cell key={entry.department} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name, props) => [`${value} tickets (${props.payload.percentage}%)`, props.payload.department]}
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #E5E7EB',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
