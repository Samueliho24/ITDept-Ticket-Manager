# Especificaciones Técnicas del Inventario Tecnológico (TIC - LUZ)

Este documento define de forma estricta los tipos de equipos del área tecnológica e infraestructura informática que procesa el sistema de la Facultad de Odontología de la Universidad del Zulia. Se excluyen en su totalidad equipos médicos, clínicos o sillones odontológicos.

## 1. Atributos Comunes (Estructura Base)
Todos los equipos guardados en la tabla `equipment` cuentan con:
- `id` (UUID)
- `inventory_code` (Código de inventario único / Código QR)
- `equipment_type` (Tipo: PC, Laptop, Impresora, Switch, Router, Otro)
- `brand` (Marca)
- `model` (Modelo)
- `technical_specifications` (JSON con especificaciones técnicas según tipo)
- `status` (Estado actual: Operativo, En Mantenimiento, Dañado, Desincorporado)
- `department_id` (UUID del departamento)
- `assigned_person` (Personal responsable del equipo)
- `entry_date` (Fecha de ingreso)
- `out_date` (Fecha de desincorporación, nullable)

---

## 2. Esquema del Campo Híbrido (JSON: technical_specifications)
Dependiendo del tipo de equipo informático seleccionado, la columna `technical_specifications` de tipo JSON en la base de datos almacenará y el frontend renderizará los siguientes pares clave-valor estructurados:

### A. Computadoras de Escritorio / Laptops
- `processor`: Procesador (ej. Intel Core i5-10400, AMD Ryzen 3 3200G)
- `ram`: Memoria RAM (ej. 8GB DDR4, 16GB DDR4)
- `storage`: Almacenamiento (ej. SSD 240GB, HDD 1TB)
- `os`: Sistema Operativo instalado (ej. Windows 10 Pro, Ubuntu 22.04 LTS)
- `graphics`: Tarjeta gráfica / Integrada (ej. Intel UHD Graphics, Nvidia GTX 1050)

### B. Impresoras / Escáneres
- `printer_type`: Tipo de tecnología (Laser, Inyección de Tinta, Térmica)
- `connection_type`: Conectividad (USB, Red Ethernet, Wi-Fi)
- `color_mode`: Soporte de color (Monocromática, Color)
- `toner_model`: Modelo de consumible/cartucho (ej. HP 105A, Canon G-2100)

### C. Dispositivos de Red (Switches, Routers, Access Points)
- `ports_count`: Número de puertos físicos (ej. 8, 16, 24, 48)
- `max_speed`: Velocidad máxima (ej. 10/100 Mbps, 1 Gbps Gigabit)
- `poe_support`: Soporte de alimentación Power over Ethernet (True / False)
- `device_type`: Subcategoría (Switch Capa 2, Router Core, Access Point Aula)

### D. Servidores (Data Center / Control de Estudios)
- `cpu_cores`: Cantidad de hilos/núcleos físicos (ej. 16 Cores Xeon)
- `ram_capacity`: Memoria RAM total (ej. 64GB ECC Server)
- `raid_config`: Configuración de discos (ej. RAID 1 Mirror, RAID 5)
- `power_supplies`: Fuentes de poder redundantes (ej. Simple, Doble Redundante)

### E. UPS / Reguladores de Voltaje
- `capacity_va`: Capacidad de potencia en Voltiamperios (ej. 750VA, 1500VA)
- `outlets_count`: Número de tomas de corriente protegidas (ej. 4, 6, 8)
- `battery_status`: Estado de la batería interna (Ok, Requiere Reemplazo)
