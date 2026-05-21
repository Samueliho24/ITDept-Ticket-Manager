from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.db import engine, Base
from .routers.auth import router as auth_router
from .routers.users import router as users_router
from .routers.equipments import router as equipments_router
from .routers.tickets import router as tickets_router

app = FastAPI(
    title="TIC Tickets API",
    description="Sistema de gestión de Tickets para el departamento de TIC",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(users_router, prefix="/api/v1/users", tags=["Users"])
app.include_router(equipments_router, prefix="/api/v1/equipment", tags=["Equipment"])
app.include_router(tickets_router, prefix="/api/v1/tickets", tags=["Tickets"])


@app.get("/")
def health_check():
    return {"message": "TIC Tickets API", "status": "online", "version": "1.0.0"}
