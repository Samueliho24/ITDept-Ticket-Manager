from ..samples import invoices, payments, students
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.db import engine, Base
from .app.routers import users
from .controller import createDefaultAdmin

app = FastAPI(title="TIC Tickets API", description="Sistema de gestion de Tickets para el departamento de TIC", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Create tables
Base.metadata.create_all(bind=engine)

createDefaultAdmin()

app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(students.router, prefix="/api/students", tags=["Students"])
app.include_router(invoices.router, prefix="/api/invoices", tags=["Invoices"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])



@app.get("/")
def health_check():
    return {"message": "Welcome to the Petse Billing API!", "status": "Backend online", "version": "1.0.0"}