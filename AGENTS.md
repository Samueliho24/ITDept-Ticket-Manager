# AGENTS.md

## Project

Ticket management system for the IT Department, Faculty of Dentistry, University of Zulia (LUZ).  
Backend: FastAPI + SQLAlchemy 2.0 + MariaDB/MySQL. Frontend: React 19 + Vite 8 + Ant Design 6 + SCSS.

## State — fully implemented modules

### Backend
- **9 models**: Users, Departments, Equipment, Tickets, TicketHistory, TicketRating, NotificationRead, AuditLog, Categories
- **Auth module done**: JWT login (HS256, bcrypt), RBAC dependencies (`get_current_user`, `get_current_active_user`, `get_current_admin`, `require_roles`, `RoleChecker`). Endpoint: `POST /api/v1/auth/login`
- **Equipment module done**: Full CRUD with RBAC (`RoleChecker`), transfer location, change status, decommission, paginated listing with filters (search, type, status), automatic `AuditLog` per mutation. Endpoints: `/api/v1/equipments/`
- **Tickets module done**: Full lifecycle (create, list, detail, assign, status change, resolve, cancel, rate, history). Automatic `TicketHistory` + `AuditLog` per mutation. Endpoints: `/api/v1/tickets/`
- **Users module done**: Admin CRUD (create, list, detail, update, toggle status, change password). Automatic `AuditLog`. Endpoints: `/api/v1/users/`
- **Departments module done**: Admin CRUD (create, update, delete with validation, list, detail). Automatic `AuditLog`. Endpoints: `/api/v1/departments/`
- **Notifications module done**: List user notifications (paginated), mark as read, stale alerts. Endpoints: `/api/v1/notifications/`
- **Audit logs module done**: Read-only paginated viewer with date range, user search, action filter. Endpoint: `GET /api/v1/admin/audit-logs`
- **Categories module done**: CRUD de categorías de tickets con auditoría. Endpoints: `/api/v1/categories/`
- **Metrics module done**: KPIs, estadísticas del dashboard, tendencias. Endpoint: `GET /api/v1/metrics/`
- **Public module done**: Reporte público de tickets (sin autenticación). Endpoints: `/api/v1/public/`

### Frontend — 3 complete role-based modules
- **Requestor**: Dashboard (report ticket modal + last tickets), History, Help
- **Technician**: Dashboard (KPI cards + dynamic list), EquipmentInventory (read-only), Workspace, History (assigned), Help
- **Admin**: Dashboard (Technician view), EquipmentInventory (full CRUD + transfer + decommission), TicketAssignment, UserManagement (CRUD + status toggle + password change), AuditLog (read-only filtered), Settings (department CRUD), History (global), Help
- **Common**: Login, HelpSupport, ProtectedRoute with RBAC
- **11 services**: api, authService, ticketService, equipmentService, userService, departmentService, auditService, notificationService, categoryService, metricsService, publicService
- **3 contexts**: AuthContext (login/logout/session), AppContext (Ant Design message/notification), ModalContext
- **Styles**: Modular `styles/` directory (`global.scss`, `_variables.scss`, `_reset.scss`, `_antd-overrides.scss`, `_shared.scss`) + Ant Design `ConfigProvider` theming (`#006699` primary, `#660099` accent)

### Other
- **No tests** yet.
- **All user-facing messages must be in Spanish** (code in English).

## Key conventions

- All entity IDs are **UUIDv4** — enforced in SQLAlchemy models via `default=lambda: str(uuid.uuid4())`.
- API prefix must be `/api/v1/` (used by all routers).
- Python package name is `BackEnd` (uppercase E) — `BackEnd` y `Backend` son el mismo directorio (Windows FS case-insensitive).
- DB driver is **pymysql** (pure Python, works with MariaDB/MySQL).
- Passwords hashed with **bcrypt** via `passlib[bcrypt]` (`hash_password` / `verify_password` in `core/security.py`).
- Every write endpoint (POST/PUT/PATCH/DELETE) must log to `AuditLog` (table `audit_logs`).
- Reusable auth dependencies in `BackEnd/app/core/security.py`: `get_current_user`, `get_current_active_user`, `get_current_admin`, `require_roles([...])`, `RoleChecker`.
- RBAC cascade: `admin` inherits `technician` which inherits `requestor`. Use `RoleChecker(["admin"])`, `RoleChecker(["admin","technician"])`, or `RoleChecker(["admin","technician","requestor"])`.
- Ticket status flow: `Abierto → Asignado → En Proceso ↔ Pendiente → Resuelto → Cerrado`. Cancel allowed from `Abierto`/`Asignado` → `Anulado`. Created as "Abierto", assign sets "Asignado", status PATCH allows "En Proceso"/"Pendiente", resolve POST sets "Resuelto".

## Commands

```sh
# Backend (from repo root, venv activated)
uvicorn BackEnd.app.main:app --reload --port 3006

# Frontend (from Frontend/ directory)
npm run dev       # Vite dev server (port 5173)
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

- Backend `.env` sets `PORT=3006` but `uvicorn` needs `--port` explicitly.
- Run from project root (`BackEnd/app/main.py`).

## Project structure

```
Backend/
  __init__.py           # Re-exports Base, getDb, models
  app/
    __init__.py         # Re-exports from core.db + models
    main.py             # FastAPI app, CORS, table creation, router mounts
    core/
      db.py             # SQLAlchemy engine + session (pymysql)
      security.py       # JWT, bcrypt, RBAC dependencies
      userDefault.py    # Creates default admin on first run
    models/
      __init__.py       # Re-exports all model classes
      users.py          # Users (UUID, name, lastname, username, bcrypt password, role, active)
      departments.py    # Departments (UUID, name, code, is_active, soft delete)
      equipment.py      # Equipment (UUID, inventory_code, type, brand, model, specs JSON, status, department_id)
      tickets.py        # Tickets (UUID, title, description, priority, status enum, category, FKs, rated)
      history_tickets.py # TicketHistory (ticket_id, previous/new status, technical_comment, reason)
      ticket_ratings.py  # TicketRating (ticket_id, user_id, rating 1-5, comment)
      notification_reads.py # NotificationRead (user_id, ticket_id, message, read_at)
      audit_log.py      # AuditLog (user_id, action, affected_table, record_id, details JSON)
      categories.py     # Categories (name, description, is_active)
    routers/
      auth.py           # POST /api/v1/auth/login
      users.py          # 6 endpoints: CRUD + status toggle + password change
      equipments.py     # 6 endpoints: create, update, transfer, status, list (paginated+filtered), detail
      tickets.py        # 9 endpoints: create, list (paginated+filtered), detail, assign, status, resolve, cancel, rate, rating, history
      department.py     # 5 endpoints: create, update, delete (with validation), list, detail
      audit.py          # 1 endpoint: GET list (paginated+filtered)
      notifications.py  # 3 endpoints: list (paginated), mark read, stale alerts
      categories.py     # CRUD de categorías de tickets
      metrics.py        # KPIs y estadísticas del dashboard
      public.py         # Reporte público de tickets (sin autenticación)
    schemas/
      auth.py           # LoginRequest, TokenResponse, TokenData
      user.py           # UserCreate/Update/StatusToggle/PasswordChange/Response
      equipment.py      # EquipmentCreate/Update/LocationUpdate/StatusUpdate/Response
      ticket.py         # TicketCreate/Assign/StatusUpdate/Resolve/Cancel/Response
      department.py     # DepartmentCreate/Update/Response
      history.py        # TicketHistoryResponse
      rating.py         # RateRequest/RatingResponse
      notification.py   # NotificationResponse/Paginated
      audit_log.py      # AuditLogResponse (includes user_full_name, user_username)
      pagination.py     # EquipmentPaginated, TicketPaginated, UserPaginated, DepartmentPaginated, AuditLogPaginated
      category.py       # CategoryCreate/Update/Response
      metrics.py        # KPIs, TechnicianStats, TicketTrend
      public_ticket.py  # PublicTicketCreate/Response
    services/
      auth_service.py       # authenticate_user, login_service + audit log
      user_service.py       # Full user CRUD + audit
      equipment_service.py  # Full equipment CRUD + transfer/status/decommission + audit
      ticket_service.py     # Full ticket lifecycle + TicketHistory + AuditLog
      department_service.py # Full department CRUD + audit
      audit_log_service.py  # Paginated read-only queries with filters
      notification_service.py # List/mark read/stale alerts
      category_service.py     # CRUD categorías + audit
      metrics_service.py      # KPIs, estadísticas del dashboard
      public_ticket_service.py # Reporte público de tickets
  .env                  # DB credentials + SECRET (gitignored)
  venv/                 # Python venv

Frontend/
  src/
    main.jsx            # Entry point (BrowserRouter, ConfigProvider theme, AuthProvider, AppProvider)
    App.jsx             # Root component — renders AppRoutes
    styles/             # Modular SCSS (global.scss, _variables.scss, _reset.scss, _antd-overrides.scss, _shared.scss)
    constants/
      lists.js          # Enums for status, priority, category, equipment types
      specsConfig.js    # JSON specs config per equipment type
    context/
      AuthContext.jsx   # Login/logout, JWT decode, session persistence
      AppContext.jsx    # Ant Design message/notification API
      ModalContext.jsx  # Global modal state management
    hooks/
      useDashboardMetrics.js  # Custom hook for dashboard data
    components/
      ChartsSection.jsx, KpiCard.jsx, KpiRow.jsx, MetricsHeader.jsx
      ResolvedBarChart.jsx, DepartmentDonutChart.jsx
      TicketListView.jsx
    layout/
      MainLayout.jsx   # Sidebar + Header + Outlet
      Sidebar.jsx      # Role-based nav sections (lucide-react icons)
      Header.jsx       # Top bar with title, user avatar, role label, logout
    routes/
      index.jsx         # Route definitions with ProtectedRoute
      ProtectedRoute.jsx # Auth + role guard wrapper
    pages/
      common/
        Login.jsx       # Login form
        HelpSupport.jsx # FAQ and system info
      public/
        PublicReport.jsx      # Reporte público (sin auth)
        PublicTicketView.jsx   # Consulta pública de ticket
      requestor/
        Dashboard.jsx    # Report button + last tickets
        History.jsx      # Own tickets full history
        modals/
          TicketDetailModal.jsx
          ReportTicketModal.jsx
          CancelTicketModal.jsx
      technician/
        Dashboard.jsx    # KPI cards + dynamic table
        EquipmentInventory.jsx # Read-only equipment view
        Workspace.jsx    # Ticket workspace
        History.jsx      # Assigned tickets
        modals/
          EquipmentDetailModal.jsx
          InfoHistoryModal.jsx
          ResolveTicketModal.jsx
      admin/
        Dashboard.jsx         # Technician-style dashboard for admin
        TicketAssignment.jsx  # Assign tickets to technicians
        AuditLog.jsx          # Read-only audit viewer
        users/
          UserManagement.jsx  # CRUD users
          components/         # UserFormModal, UserDeleteModal, UserStatusModal, UserPasswordModal
        settings/
          Settings.jsx        # Department & Category CRUD
          components/         # DepartmentFormModal, CategoryFormModal, DepartmentDeleteModal, CategoryDeleteModal, DepartmentStatusModal, CategoryStatusModal
        modals/
          AddAssetModal.jsx
          EditAssetModal.jsx
          TransferAssetModal.jsx
          DecommissionAssetModal.jsx
    services/
      api.js                # Axios instance (baseURL, JWT interceptor, 401 redirect)
      authService.js        # loginService, authMeService, refreshTokenService, logoutService
      ticketService.js      # All ticket API calls
      equipmentService.js   # All equipment API calls
      userService.js        # All user API calls
      departmentService.js  # All department API calls
      auditService.js       # Audit log API calls
      notificationService.js # Notification API calls
      categoryService.js    # Category CRUD API calls
      metricsService.js     # Dashboard KPIs & metrics API calls
      publicService.js      # Public ticket report API calls
  vite.config.js            # Vite + React plugin
  package.json              # antd, axios, lucide-react, react-router-dom, sass, vite

BackEnd/               # Mismo directorio que Backend (Windows case-insensitive)
```

## Dependencies

- **Backend** (installed in `Backend/venv/`): `fastapi`, `uvicorn`, `sqlalchemy`, `pydantic`, `python-dotenv`, `pymysql`, `passlib[bcrypt]`, `pyjwt`, `multipart`, `annotated-types`. Defined in `requirements.txt` (dev extras: `pytest`, `httpx`).
- **Frontend** (from `package.json`): `react`, `react-dom`, `antd`, `axios`, `lucide-react`, `react-router-dom`, `sass`. Dev: `vite`, `@vitejs/plugin-react`, `eslint`.

## Reference docs (consolidated)

- `Docs/CONTEXT.md` — Master system documentation (architecture, RBAC, business rules, JWT auth, pagination, frontend architecture, design system, DB schema).
- `Docs/API.md` — Full API contract for frontend-backend communication (all endpoints, request/response schemas, error codes).
- `Docs/ESPECIFICACIONES_INVENTARIO_TIC.md` — Equipment specs per type (JSON schema for technical_specifications field).
- `Docs/tic_luz_tickets.sql` — Database schema SQL (MariaDB).
