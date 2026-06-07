export const SPECS_FIELDS = {
  PC: [
    { key: 'processor', label: 'Procesador', type: 'input' },
    { key: 'ram', label: 'Memoria RAM', type: 'input' },
    { key: 'storage', label: 'Almacenamiento', type: 'input' },
    { key: 'os', label: 'Sistema Operativo', type: 'input' },
    { key: 'graphics', label: 'Tarjeta Gráfica', type: 'input' },
  ],
  Laptop: [
    { key: 'processor', label: 'Procesador', type: 'input' },
    { key: 'ram', label: 'Memoria RAM', type: 'input' },
    { key: 'storage', label: 'Almacenamiento', type: 'input' },
    { key: 'os', label: 'Sistema Operativo', type: 'input' },
    { key: 'graphics', label: 'Tarjeta Gráfica', type: 'input' },
  ],
  Impresora: [
    { key: 'printer_type', label: 'Tipo de Tecnología', type: 'select', options: ['Inyección', 'Láser', 'Matriz', 'Térmica', 'Multifuncional'] },
    { key: 'connection_type', label: 'Conectividad', type: 'select', options: ['USB', 'Red', 'WiFi', 'Bluetooth'] },
    { key: 'color_mode', label: 'Soporte de Color', type: 'select', options: ['B/N', 'Color', 'B/N y Color'] },
    { key: 'toner_model', label: 'Modelo de Consumible', type: 'input' },
  ],
  Switch: [
    { key: 'ports_count', label: 'Puertos', type: 'number' },
    { key: 'max_speed', label: 'Velocidad Máxima', type: 'select', options: ['10/100 Mbps', 'Gigabit', '10GbE', '40GbE', '100GbE'] },
    { key: 'poe_support', label: 'PoE', type: 'select', options: ['Sí', 'No'] },
  ],
  Router: [
    { key: 'ports_count', label: 'Puertos', type: 'number' },
    { key: 'max_speed', label: 'Velocidad Máxima', type: 'select', options: ['10/100 Mbps', 'Gigabit', '10GbE', '40GbE', '100GbE'] },
    { key: 'poe_support', label: 'PoE', type: 'select', options: ['Sí', 'No'] },
  ],
  UPS: [
    { key: 'capacity_va', label: 'Capacidad (VA)', type: 'input' },
    { key: 'outlets_count', label: 'Tomas Protegidas', type: 'number' },
    { key: 'battery_status', label: 'Estado Batería', type: 'select', options: ['Óptimo', 'Regular', 'Por Reemplazar', 'Dañado'] },
  ],
  Server: [
    { key: 'device_type', label: 'Subcategoría', type: 'select', options: ['Rack', 'Torre', 'Blade'] },
    { key: 'cpu_cores', label: 'Núcleos/CPU', type: 'input' },
    { key: 'ram_capacity', label: 'RAM Total', type: 'input' },
    { key: 'raid_config', label: 'Configuración RAID', type: 'input' },
    { key: 'power_supplies', label: 'Fuentes de Poder', type: 'number' },
  ],
  Otro: [],
};
