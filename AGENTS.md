# AGENTS.md

## Project

Ticket management system for the IT Department, Faculty of Dentistry, University of Zulia (LUZ).  
Backend: FastAPI + SQLAlchemy 2.0 + MariaDB/MySQL. Frontend: React 19 + Vite 8 + Ant Design 6 + SCSS.

## State — early development

- **Models are done** (`Backend/app/models/`): Users, Departments, Equipment, Tickets, TicketHistory, ChangeHistory
- **Auth module done**: JWT login (HS256, bcrypt), RBAC dependencies (`get_current_user`, `get_current_active_user`, `get_current_admin`, `require_roles`). Endpoint: `POST /api/v1/auth/login`
- **`schemas/`** now has `auth.py`; **`services/`** now has `auth_service.py`
- **Business logic for tickets not yet written** — `samples/` contains an older invoice system that is NOT the current target. Do NOT build on `samples/`.
- **Frontend is a skeleton** — `App.jsx` is empty, `pages/`, `components/`, `api/` dirs are empty.
- **No tests** yet.
- **All user-facing messages must be in Spanish** (code in English).

## Key conventions

- All entity IDs are **UUIDv4** — enforced in SQLAlchemy models via `default=lambda: str(uuid.uuid4())`.
- API prefix must be `/api/v1/` (currently used by auth router; ticket routers need updating when created).
- Python package name is `BackEnd` (uppercase E) — a **symlink** at repo root points `BackEnd` → `Backend`.
- DB driver is **pymysql** (pure Python, works with MariaDB/MySQL).
- Passwords hashed with **bcrypt** via `passlib` (`hash_password` / `verify_password` in `core/security.py`).
- Every write endpoint (POST/PATCH/DELETE) must log to `ChangeHistory`.
- Reusable auth dependencies in `BackEnd/app/core/security.py`: `get_current_user`, `get_current_active_user`, `get_current_admin`, `require_roles([...])`.

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
- Run from project root (not `Backend/`) so the `BackEnd` symlink resolves correctly.

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
    models/
      __init__.py       # Re-exports all model classes
      users.py          # Users (UUID, bcrypt password, role, active)
      departments.py
      equipment.py
      tickets.py
      history_tickets.py
      change_history.py
    routers/
      auth.py           # POST /api/v1/auth/login
      users.py          # Empty placeholder (old controller removed)
    schemas/
      auth.py           # LoginRequest, TokenResponse, TokenData
    services/
      auth_service.py   # authenticate_user, login_service + audit log
  samples/              # OLD invoice system — do not build on this
  .env                  # DB credentials + SECRET (gitignored)
  venv/                 # Python venv

Frontend/
  src/
    main.jsx            # Entry point
    App.jsx             # Root component (empty)
    pages/              # Route pages (empty)
    components/         # Reusable components (empty)
    api/                # Axios/API client (empty)
  style.scss            # Global styles (empty)
  vite.config.js        # Vite + React plugin

BackEnd -> Backend      # Symlink for package name
```

## Dependencies

- **Backend** (installed in `Backend/venv/`): `fastapi`, `uvicorn`, `sqlalchemy`, `pydantic`, `python-dotenv`, `pymysql`, `passlib[bcrypt]`, `pyjwt`, `multipart`, `annotated-types`. No `requirements.txt` — manage via `pip freeze > requirements.txt`.
- **Frontend**: React 19, Ant Design 6, Axios, React Router 7, Lucide React, Sass. Dev: Vite 8, ESLint, `@vitejs/plugin-react`.

## Reference docs

- `Docs/Context_Master.md` — Master AI context (architecture, RBAC matrix, security rules).
- `Docs/CONTEXT_AUTH_JWT.md` — Auth module spec (JWT payload, expiry, algorithm).
- `Docs/Contexto_Proyecto_Tickets_TIC_LUZ_V4.md` — Detailed functional/non-functional requirements, use cases.
