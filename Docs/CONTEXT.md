# Documento Maestro del Sistema de Gestión de Tickets TIC - LUZ

> Este documento consolida toda la información del proyecto. Sirve como fuente única de verdad para desarrollo, arquitectura, reglas de negocio y diseño del sistema.

---

## 1. Visión General

- **Nombre:** Sistema de Gestión de Tickets TIC - LUZ
- **Entidad:** Departamento TIC, Facultad de Odontología, Universidad del Zulia (LUZ)
- **Propósito:** Automatizar el reporte, seguimiento y resolución de incidencias tecnológicas (hardware, software, redes), garantizando trazabilidad total y optimización de decisiones basada en datos.

### Problemática Actual
- Reporte manual y desorganizado de fallas
- Retrasos en tiempos de respuesta por falta de flujo definido
- Dificultad para asignar tareas eficientemente
- Inexistencia de historial centralizado de reparaciones
- Falta de métricas sobre equipos críticos o rendimiento técnico

---

## 2. Stack Tecnológico Estricto

| Componente | Tecnología | Justificación |
|---|---|---|
| **Backend** | FastAPI (Python 3.10+) + Pydantic v2 + SQLAlchemy 2.0 | APIs REST rápidas y modulares |
| **Base de Datos** | MariaDB/MySQL (driver pymysql, enfoque híbrido relacional + JSON) | Estabilidad, soporte JSON para especificaciones variables |
| **Frontend** | React 19 + JavaScript (.jsx) | Interfaces dinámicas. **Prohibido TypeScript (.tsx)** |
| **Build** | Vite 8 + @vitejs/plugin-react | Dev/build rápido |
| **UI** | Ant Design 6 + SCSS | Componentes maduros, estilos centralizados |
| **Auth** | JWT (HS256) + bcrypt (passlib[bcrypt]) + RBAC | Seguridad robusta por roles |
| **Iconos** | lucide-react (navegación) + Ant Design icons (acciones internas) | Criterio de separación de librerías |

---

## 3. Arquitectura y Reglas de Seguridad

### 3.1 Estructura del Backend

```
BackEnd/
  ├── __init__.py        # Re-exporta Base, engine, SessionLocal, getDb, modelos
  ├── .env               # DB credentials + SECRET (gitignored)
  ├── requirements.txt   # Dependencias Python
  └── app/
      ├── __init__.py    # Re-exporta modelos y core.db
      ├── main.py        # FastAPI app, CORS, routers, tabla creation
      ├── core/
      │   ├── db.py          # SQLAlchemy engine + session (pymysql)
      │   ├── security.py    # JWT, bcrypt, RBAC dependencies
      │   └── userDefault.py # Admin por defecto en primer arranque
      ├── models/        # 9 modelos ORM (Users, Departments, Equipment, Tickets, TicketHistory, TicketRating, NotificationRead, AuditLog, Categories)
      ├── schemas/       # 13 schemas Pydantic (validación entrada/salida)
      ├── services/      # 10 servicios (lógica de negocio + auditoría)
      └── routers/       # 10 routers (endpoints protegidos por dependencias FastAPI)
```

### 3.2 Reglas Críticas

1. **UUIDs nativos (v4):** Prohibido usar IDs enteros incrementales. Todos los `id` usan `default=lambda: str(uuid.uuid4())` para evitar enumeración.
2. **Prefijo API:** Todos los endpoints deben usar `/api/v1/`.
3. **Separación SoC:** `models/` (ORM) → `schemas/` (Pydantic) → `services/` (lógica + auditoría) → `routers/` (endpoints protegidos).
4. **Auditoría obligatoria:** Todo endpoint de escritura (POST/PUT/PATCH/DELETE) debe registrar automáticamente en `audit_logs`.
5. **Especificaciones técnicas:** Columna JSON en `equipment.technical_specifications`, mapeada como `Dict[str, Any]` en Pydantic.

### 3.3 Convenciones Globales

- Nombres de paquete Python: `BackEnd` (case-insensitive en Windows; `BackEnd` y `Backend` son el mismo directorio)
- Todos los mensajes visibles al usuario deben estar en **español** (código en inglés)
- `BackEnd/` y `Backend/` son el mismo directorio (Windows FS case-insensitive)

---

## 4. Autenticación y Seguridad (JWT + bcrypt)

### 4.1 Login

`POST /api/v1/auth/login` — Acepta `username` y `password` (texto plano). Verifica contra bcrypt en `users.password`.

### 4.2 JWT

- **Algoritmo:** HS256
- **TTL:** 60 minutos (configurable, expiración estricta)
- **Payload:**
  ```json
  {
    "sub": "uuid-del-usuario",
    "username": "jperez",
    "role": "admin",
    "active": true,
    "exp": 1717000000
  }
  ```

### 4.3 Dependencias RBAC Reutilizables

Definidas en `BackEnd/app/core/security.py`:

| Dependencia | Uso |
|---|---|
| `get_current_user` | Extrae usuario del JWT |
| `get_current_active_user` | Verifica que la cuenta esté activa |
| `get_current_admin` | Fuerza rol admin |
| `require_roles([...])` | Fábrica de dependencias para roles específicos |
| `RoleChecker` | Clase para verificación de roles |

### 4.4 Jerarquía de Roles (Cascada)

`admin` hereda todo de `technician`, que hereda todo de `requestor`.

Uso típico:
- `RoleChecker(["admin"])` — solo admin
- `RoleChecker(["admin","technician"])` — admin y technician
- `RoleChecker(["admin","technician","requestor"])` — cualquier autenticado

---

## 5. Matriz RBAC (Roles y Permisos)

| Funcionalidad | Solicitante | Técnico | Administrador |
|---|---|---|---|
| Dashboard / Inicio | ✅ Propio | ✅ Técnico | ✅ Técnico |
| Reportar ticket | ✅ | ❌ | ❌ |
| Inventario (ver) | ❌ | ✅ | ✅ |
| Inventario (CRUD) | ❌ | ❌ | ✅ |
| Historial | ✅ Propio | ✅ Asignados | ✅ Global |
| Asignación tickets | ❌ | ❌ | ✅ |
| Usuarios (CRUD) | ❌ | ❌ | ✅ |
| Auditoría | ❌ | ❌ | ✅ |
| Configuración (Dptos) | ❌ | ❌ | ✅ |
| Ayuda | ✅ | ✅ | ✅ |

### Menú por Rol

- **Solicitante:** Inicio (dashboard + reportar), Historial (propio), Ayuda
- **Técnico:** Inicio (KPI cards + tabla dinámica), Inventario (solo lectura), Workspace, Historial (asignados), Ayuda
- **Administrador:** Inicio (dashboard técnico), Inventario (CRUD completo + transferir + desincorporar), Asignación, Usuarios, Auditoría, Configuración (departamentos), Historial (global), Ayuda

---

## 6. Reglas de Negocio

### 6.1 Equipos (Equipment)

| Operación | Rol mínimo | Descripción |
|---|---|---|
| Crear/Editar | admin | Especificaciones en JSON. `inventory_code` único |
| Trasladar | admin | Cambia `department_id` |
| Cambiar estado | technician | Ej: Operativo → Dañado durante revisión de ticket |
| Desincorporar | admin | Establece `out_date`, estado → "Desincorporado" |
| Listar (paginado) | technician | Filtros: search, equipment_type, status |
| Ver detalle | requestor | Escaneo QR o ID |

### 6.2 Tickets

#### Flujo de Estados

```
Abierto → Asignado → En Proceso ↔ Pendiente → Resuelto → Cerrado
   ↓          ↓
 Anulado    Anulado
```

- **Creación:** Cualquier autenticado crea un ticket vinculando equipo, descripción, departamento y área. Estado inicial: "Abierto"
- **Asignación:** Solo admin. Cambia `assigned_technician_id` y estado → "Asignado"
- **Atención:** Technician cambia a "En Proceso" o "Pendiente"
- **Resolución:** POST a `/tickets/{id}/resolve` con formulario técnico obligatorio (estado → "Resuelto")
- **Cancelación:** Requestor cancela tickets propios en "Abierto" o "Asignado" (estado → "Anulado")
- **Calificación:** Requestor califica (1-5 estrellas + comentario), una sola vez por ticket

#### Seguridad a nivel de fila
- Requestor solo ve tickets cuyo `requester_id` es su UUID
- Technician y admin ven lista global

#### Endpoints

| Método | Endpoint | Rol mínimo |
|---|---|---|
| POST | `/api/v1/tickets/` | requestor |
| GET | `/api/v1/tickets/` | requestor |
| GET | `/api/v1/tickets/{id}` | requestor |
| PATCH | `/api/v1/tickets/{id}/assign` | admin |
| PATCH | `/api/v1/tickets/{id}/status` | technician |
| POST | `/api/v1/tickets/{id}/resolve` | technician |
| PATCH | `/api/v1/tickets/{id}/cancel` | requestor |
| POST | `/api/v1/tickets/{id}/rate` | requestor |
| GET | `/api/v1/tickets/{id}/rating` | requestor |
| GET | `/api/v1/tickets/{id}/history` | requestor |

### 6.3 Usuarios (CRUD — solo admin)

| Operación | Descripción |
|---|---|
| Crear | UUID, bcrypt hash, activo por defecto |
| Editar | Solo campos: name, lastname, department_id, role |
| Activar/Desactivar | Cambia `active`. Cuenta inactiva no puede loguearse |
| Cambiar contraseña | Re-hashear con bcrypt |

### 6.4 Departamentos (CRUD — solo admin)

- Borrado lógico (`deleted_at`). Validar que no existan usuarios ni equipos asociados antes de eliminar.
- `code`: 3 letras, único.

### 6.5 Sistema Automático de Historial y Auditoría

Toda mutación en tablas core debe disparar:
1. **`history_tickets`**: Traza cronológica de cambios de estado del ticket (`previous_status`, `new_status`, `technical_comment`, `reason`)
2. **`audit_logs`**: Registro global de seguridad (`user_id`, `action`, `affected_table`, `record_id`, `details` JSON)

---

## 7. Estándar de Paginación

### Parámetros de Entrada (Query Params)

| Parámetro | Tipo | Default | Máximo |
|---|---|---|---|
| `limit` | int | 10 | 100 |
| `offset` | int | 0 | — |

### Envelope Pattern (Salida)

```json
{
  "total": 154,
  "limit": 10,
  "offset": 0,
  "items": [ ... ]
}
```

### Endpoints Paginados

| Endpoint | Filtros adicionales |
|---|---|
| `GET /api/v1/equipments/` | search, equipment_type, status |
| `GET /api/v1/tickets/` | status, category, date_from, date_to, search, equipment_id |
| `GET /api/v1/users/` | — |
| `GET /api/v1/departments/` | — |
| `GET /api/v1/admin/audit-logs` | start_date, end_date, username_query, action_filter |
| `GET /api/v1/notifications/` | unread_only |

### Audit Logs — Filtros adicionales

- `start_date` / `end_date` (ISO datetime)
- `username_query` (LIKE sobre username)
- `action_filter` (coincidencia exacta: CREATE_USER, RESOLVE_TICKET, etc.)

---

## 8. Arquitectura del Frontend

### 8.1 Estructura de Directorios

```
FrontEnd/src/
  ├── main.jsx              # Entry point: BrowserRouter + ConfigProvider + AuthProvider + AppProvider
  ├── App.jsx               # Renderiza AppRoutes
  ├── styles/               # SCSS modular (global.scss, _variables.scss, _reset.scss, _antd-overrides.scss)
  ├── constants/
  │   ├── lists.js          # Enums: status, priority, category, equipment types
  │   └── specsConfig.js    # Config de specs JSON por tipo de equipo
  ├── context/
  │   ├── AuthContext.jsx    # Login/logout, JWT decode, sesión persistente
  │   ├── AppContext.jsx     # Ant Design message/notification API
  │   └── ModalContext.jsx   # Estado global de modales
  ├── hooks/
  │   └── useDashboardMetrics.js
  ├── layout/
  │   ├── MainLayout.jsx    # Sidebar + Header + Outlet
  │   ├── Sidebar.jsx       # Navegación por roles (lucide-react)
  │   └── Header.jsx        # Top bar: título, avatar, rol, logout
  ├── routes/
  │   ├── index.jsx          # Definiciones de rutas con ProtectedRoute
  │   └── ProtectedRoute.jsx # Guard de autenticación + rol
  ├── components/            # Componentes compartidos
  │   ├── ChartsSection.jsx, KpiCard.jsx, KpiRow.jsx, MetricsHeader.jsx
  │   ├── ResolvedBarChart.jsx, DepartmentDonutChart.jsx
  │   └── TicketListView.jsx
  ├── services/              # 11 servicios API
  │   ├── api.js             # Axios instance + JWT interceptor + redirect 401
  │   ├── authService.js     # loginService, authMeService, refreshTokenService, logoutService
  │   ├── ticketService.js, equipmentService.js, userService.js
  │   ├── departmentService.js, auditService.js, notificationService.js
  │   ├── categoryService.js, metricsService.js, publicService.js
  └── pages/
      ├── common/Login.jsx, HelpSupport.jsx
      ├── public/PublicReport.jsx, PublicTicketView.jsx
      ├── requestor/Dashboard.jsx, History.jsx, modals/{TicketDetailModal, ReportTicketModal, CancelTicketModal}
      ├── technician/Dashboard.jsx, Workspace.jsx, EquipmentInventory.jsx, History.jsx, modals/{EquipmentDetailModal, InfoHistoryModal, ResolveTicketModal}
      └── admin/Dashboard.jsx, TicketAssignment.jsx, AuditLog.jsx,
          users/UserManagement.jsx + components/{UserFormModal, UserDeleteModal, UserStatusModal, UserPasswordModal}
          settings/Settings.jsx + components/{DepartmentFormModal, CategoryFormModal, DepartmentDeleteModal, CategoryDeleteModal, DepartmentStatusModal, CategoryStatusModal}
          modals/{AddAssetModal, EditAssetModal, TransferAssetModal, DecommissionAssetModal}
```

### 8.2 Servicios (11)

| Servicio | Funciones clave |
|---|---|
| `api.js` | Axios instance (`baseURL: '/api/v1'`), interceptor JWT, redirect 401 |
| `authService.js` | login, authMe, refreshToken, logout |
| `ticketService.js` | CRUD tickets + assign, resolve, cancel, rate, history |
| `equipmentService.js` | CRUD equipos + transfer, status, decommission |
| `userService.js` | CRUD usuarios + status toggle, password change |
| `departmentService.js` | CRUD departamentos |
| `auditService.js` | Listar audit logs (filtrado, paginado) |
| `notificationService.js` | Listar notificaciones, marcar leídas, stale alerts |
| `categoryService.js` | CRUD categorías |
| `metricsService.js` | KPIs, estadísticas dashboard |
| `publicService.js` | Reporte público de tickets |

### 8.3 Rutas

| Ruta | Componente | Roles |
|---|---|---|
| `/login` | Login | público |
| `/reportar` | PublicReport | público |
| `/reportar/:ticketNumber` | PublicTicketView | público |
| `/dashboard` | RoleDashboard (Admin/Technician/Requestor) | todos |
| `/workspace/:ticketId` | Workspace | admin, technician |
| `/equipment` | EquipmentInventory | admin, technician |
| `/history` | RoleHistory (Technician/Requestor) | todos |
| `/assign` | TicketAssignment | admin |
| `/users` | UserManagement | admin |
| `/audit` | AuditLog | admin |
| `/settings` | Settings | admin |
| `/help` | HelpSupport | todos |

---

## 9. Sistema de Diseño (UI/UX)

### 9.1 Paleta de Colores

| Variable | Color | Uso |
|---|---|---|
| `$color-bg` | `#E9EEF0` | Fondo del layout |
| `$color-primary` | `#006699` | Azul LUZ: cabeceras, botones, títulos |
| `$color-accent` | `#660099` | Morado Odontología: hover, focus, bordes activos |
| `$color-card-bg` | `#FFFFFF` | Tarjetas, tablas, modales |
| Éxito/Resuelto | `#1A8C06` | Verde |
| Advertencia/En Proceso | `#D0A021` | Amarillo/Oro |
| Peligro/Pendiente/Anulado | `#860404` | Rojo oscuro |

### 9.2 ConfigProvider (Ant Design)

```jsx
<ConfigProvider theme={{
  token: { colorPrimary: '#006699' },
  // hover/focus → #660099
}}>
```

### 9.3 Layout

- `.layout`: `100vh`, fondo `#E9EEF0`
- `.sidebar`: Fondo oscuro, colapso fluido, logo `80px` con fade text
- `.header`: Fondo blanco, `64px`, borde inferior sutil
- `.kpi-card`: `border-radius: 12px`, sombra, hover con borde de color
- `.tickets-custom-table`: Encabezados mayúsculas, hover filas `#F8FAFC`

---

## 10. Modelo de Datos (DBML — MariaDB)

```dbml
Table usuarios { // Modelo: Users
  id uuid [pk]
  name varchar(100)
  lastname varchar(100)
  username varchar(50) [unique, not null]
  password varchar(255)
  role varchar(20) [not null, note: 'admin, technician, requestor']
  department_id uuid [ref: > departamentos.id]
  active boolean [default: true]
  created_at timestamp [default: `now()`]
}

Table departamentos { // Modelo: Departments
  id uuid [pk]
  name varchar(100) [not null]
  code varchar(3) [unique, not null]
  is_active boolean [default: true]
  created_at timestamp [default: `now()`]
  deleted_at timestamp [null, note: 'Soft delete']
}

Table equipos { // Modelo: Equipment
  id uuid [pk]
  inventory_code varchar(100) [unique]
  equipment_type varchar(50)
  brand varchar(100)
  model varchar(100)
  technical_specifications json [note: 'RAM, CPU, Disco según tipo']
  sequence int [default: 0]
  status varchar(50) [default: 'Operativo']
  department_id uuid [ref: > departamentos.id]
  assigned_person varchar(200)
  entry_date timestamp [default: `now()`]
  out_date timestamp [null]
}

Table tickets {
  id uuid [pk]
  title varchar(255)
  description varchar(500)
  priority enum('Baja', 'Media', 'Alta', 'Crítica') [default: 'Media']
  status enum('Abierto','Asignado','En Proceso','Pendiente','Resuelto','Cerrado','Anulado') [default: 'Abierto']
  category varchar(100) [note: 'Hardware, Software, Redes, Telecomunicaciones, Otro']
  requester_id uuid [ref: > usuarios.id]
  assigned_technician_id uuid [null, ref: > usuarios.id]
  equipment_id uuid [null, ref: > equipos.id]
  department_id uuid [null, ref: > departamentos.id]
  rated boolean [default: false]
  daily_sequence int [default: 0]
  opened_at timestamp [default: `now()`]
  closed_at timestamp [null]
}

Table historial_tickets { // Modelo: TicketHistory (tabla: history_tickets)
  id uuid [pk]
  ticket_id uuid [ref: > tickets.id]
  previous_status varchar(50)
  new_status varchar(50)
  technical_comment varchar(500)
  technical_action varchar(100)
  reason varchar(255) [null]
  change_date timestamp [default: `now()`]
}

Table calificaciones_tickets { // Modelo: TicketRating (tabla: ticket_ratings)
  id uuid [pk]
  ticket_id uuid [unique, ref: > tickets.id]
  user_id uuid [ref: > usuarios.id]
  rating int [not null, note: '1-5 estrellas']
  comment varchar(500)
  created_at timestamp [default: `now()`]
}

Table notificaciones { // Modelo: NotificationRead (tabla: notification_reads)
  id uuid [pk]
  user_id uuid [ref: > usuarios.id]
  ticket_id uuid [ref: > tickets.id]
  message varchar(255)
  read_at timestamp [null]
  created_at timestamp [default: `now()`]
}

Table logs_auditoria { // Modelo: AuditLog (tabla: audit_logs)
  id uuid [pk]
  user_id uuid [ref: > usuarios.id]
  action varchar(100)
  affected_table varchar(50)
  record_id uuid
  details json [note: 'Valores anteriores y nuevos']
  timestamp timestamp [default: `now()`]
}

Table categorias { // Modelo: Categories
  id uuid [pk]
  name varchar(100) [unique]
  description varchar(255)
  is_active boolean [default: true]
  created_at timestamp [default: `now()`]
}

Ref: usuarios.department_id > departamentos.id
Ref: equipos.department_id > departamentos.id
Ref: tickets.department_id > departamentos.id
Ref: tickets.requester_id > usuarios.id
Ref: tickets.assigned_technician_id > usuarios.id
Ref: tickets.equipment_id > equipos.id
```
