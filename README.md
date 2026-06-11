# ITDept-Ticket-Manager

Sistema de gestión de tickets para el Departamento de TIC de la Facultad de Odontología de la Universidad del Zulia (LUZ).

## Stack

- **Backend:** FastAPI + SQLAlchemy 2.0 + MariaDB/MySQL (pymysql)
- **Frontend:** React 19 + Vite 8 + Ant Design 6 + SCSS
- **Auth:** JWT (HS256) + bcrypt + RBAC

## Inicio rápido

```bash
# Backend (desde raíz del proyecto, venv activado)
uvicorn BackEnd.app.main:app --reload --port 3006

# Frontend (desde Frontend/)
npm run dev
```

## Documentación

- `AGENTS.md` — Instrucciones para IA, estructura del proyecto y convenciones
- `Docs/CONTEXT.md` — Documentación maestra del sistema
- `Docs/API.md` — Contrato completo de la API
