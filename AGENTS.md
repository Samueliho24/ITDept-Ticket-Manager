# AGENTS.md

## Project

Ticket management system for the IT Department, Faculty of Dentistry, University of Zulia (LUZ).  
Backend: FastAPI + SQLAlchemy 2.0 + MariaDB. Frontend: React 19 + Vite 8 + Ant Design 6 + SCSS.

## State — early development

- **Models are done** (`Backend/app/models/`): Users, Departments, Equipment, Tickets, TicketHistory, ChangeHistory
- **Business logic not yet written** for tickets — `samples/` contains an older invoice system that is NOT the current target. Do NOT build on `samples/`.
- **`schemas/` and `services/` are empty** — need to be populated with Pydantic schemas and business logic respectively.
- **`Backend/controller.py` does not exist** — the `Backend/app/__init__.py` import will fail until it is created.
- **Frontend is a skeleton** — `App.jsx` is empty, `pages/`, `components/`, `api/` dirs are empty.
- **No auth, no audit logging, no QR generation, no tests** yet.
- **The code must be in English, but the messages displayed to the user, as well as the code comments and external documentation for the user, must be in Spanish.

## Key conventions

- All entity IDs are **UUIDv4** (no auto-increment integers) — enforced in SQLAlchemy models via `default=lambda: str(uuid.uuid4())`.
- API prefix must be `/api/v1/` (current routers use `/api/` — this needs updating).
- Python package name is `BackEnd` (uppercase E) — import as `from BackEnd import ...`.
- DB is MariaDB via `mariadb+mariadbconnector://` — config in `Backend/.env`.
- Passwords should be hashed (currently stored as raw SHA-256 hex).
- Every write endpoint (POST/PATCH/DELETE) must log to `ChangeHistory` async.

## Commands

```sh
# Backend (from Backend/ directory, venv activated)
uvicorn BackEnd.app.main:app --reload --port 3006

# Frontend (from Frontend/ directory)
npm run dev       # Vite dev server
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

- Backend `.env` sets `PORT=3006` but `uvicorn` needs `--port` explicitly.
- Frontend dev server defaults to Vite port 5173.

## Project structure

```
Backend/
  app/
    main.py             # FastAPI app, CORS, table creation, router mounts
    core/db.py          # SQLAlchemy engine + session (MariaDB)
    models/             # ORM models (Tickets, Users, Departments, Equipment, ...)
    routers/            # Endpoints (thin, delegate to services)
    schemas/            # Pydantic v2 schemas (currently empty)
    services/           # Business logic (currently empty)
  samples/            # OLD invoice system code — do not build on this
  .env                # DB credentials + secret (gitignored)
  venv/               # Python venv

Frontend/
  src/
    main.jsx          # Entry point
    App.jsx           # Root component (empty)
    pages/            # Route pages (empty)
    components/       # Reusable components (empty)
    api/              # Axios/API client (empty)
  style.scss          # Global styles (empty)
  vite.config.js      # Vite + React plugin
```

## Dependencies

- **Backend** (installed in `Backend/venv/`): `fastapi`, `uvicorn`, `sqlalchemy`, `pydantic`, `python-dotenv`, `mariadb-connector` (needed via connector), `multipart`, `annotated-types`. No `requirements.txt` — manage via `pip freeze > requirements.txt`.
- **Frontend**: React 19, Ant Design 6, Axios, React Router 7, Lucide React, Sass. Dev: Vite 8, ESLint, `@vitejs/plugin-react`.

## Reference docs

- `Docs/Context_Master.md` — Master AI context (architecture, RBAC matrix, security rules).
- `Docs/Contexto_Proyecto_Tickets_TIC_LUZ_V4.md` — Detailed functional/non-functional requirements, use cases.
