export const ticketStatusList = [
  { label: 'Abierto', value: 'Abierto' },
  { label: 'Asignado', value: 'Asignado' },
  { label: 'En Proceso', value: 'En Proceso' },
  { label: 'Pendiente', value: 'Pendiente' },
  { label: 'Resuelto', value: 'Resuelto' },
  { label: 'Anulado', value: 'Anulado' },
];

export const priorityList = [
  { label: 'Baja', value: 'Baja' },
  { label: 'Media', value: 'Media' },
  { label: 'Alta', value: 'Alta' },
  { label: 'Crítica', value: 'Crítica' },
];

export const categoryList = [
  { label: 'Hardware', value: 'Hardware' },
  { label: 'Software', value: 'Software' },
  { label: 'Redes', value: 'Redes' },
  { label: 'Telecomunicaciones', value: 'Telecomunicaciones' },
  { label: 'Otro', value: 'Otro' },
];

export const equipmentTypeList = [
  { label: 'PC', value: 'PC' },
  { label: 'Laptop', value: 'Laptop' },
  { label: 'Impresora', value: 'Impresora' },
  { label: 'Switch', value: 'Switch' },
  { label: 'Router', value: 'Router' },
  { label: 'UPS', value: 'UPS' },
  { label: 'Server', value: 'Server' },
  { label: 'Otro', value: 'Otro' },
];

export const equipmentStatusList = [
  { label: 'Operativo', value: 'Operativo' },
  { label: 'En Mantenimiento', value: 'En Mantenimiento' },
  { label: 'Dañado', value: 'Dañado' },
  { label: 'Desincorporado', value: 'Desincorporado' },
];

export function searchOnList(list, value) {
  return list.find((item) => item.value === value)?.label || value;
}
