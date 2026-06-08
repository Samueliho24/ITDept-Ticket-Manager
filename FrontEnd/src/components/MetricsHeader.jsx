import { DatePicker, Button } from 'antd';
import { Download } from 'lucide-react';

const { RangePicker } = DatePicker;

export default function MetricsHeader({ dateRange, onDateChange, onExport }) {
  return (
    <div className="metrics-header">
      <div className="metrics-header__left">
        <h1 className="metrics-header__title">Panel de Métricas</h1>
        <span className="metrics-header__subtitle">Dashboard de Soporte Técnico</span>
      </div>
      <div className="metrics-header__right">
        <RangePicker
          value={dateRange}
          onChange={onDateChange}
          className="metrics-header__datepicker"
          placeholder={['Desde', 'Hasta']}
          format="DD/MM/YYYY"
        />
        <Button icon={<Download size={16} />} onClick={onExport}>
          Exportar Reporte
        </Button>
      </div>
    </div>
  );
}
