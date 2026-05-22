from .schemas import schemas
from sqlalchemy.orm import Session
from sqlalchemy import or_, cast, select, String
from . import models
from .core.db import SessionLocal
from fastapi import Depends
from decimal import Decimal

####Users
def createDefaultAdmin():
    with SessionLocal() as db:
        if not db.query(models.Users).filter(models.Users.username == "admin" and models.Users.password == "dfc3cd5c5b15dedddf723e0912204967c1ab04ae602d907d7505e4645fc3497e").first():
            db_user = models.Users(username="admin", password="dfc3cd5c5b15dedddf723e0912204967c1ab04ae602d907d7505e4645fc3497e", name="Administrador", identification="00000000")
            db.add(db_user)
            db.commit()

def loginUser(db: Session, user: schemas.UserLogin):
    db_user = db.query(models.Users).filter(models.Users.username == user.username, models.Users.password == user.password).first()
    if not db_user:
        return {"message": "Credenciales inválidas", "status": "error"}
    if db_user.status != "Activo":
        return {"message": "Usuario inactivo", "status": "error"}
    return {"message": "Inicio de sesión exitoso", "status": "success", "user": db_user}

def createUser(db: Session, user: schemas.UserCreate):
    db_user = models.Users(username=user.username,  password=user.password, name=user.name, identification=user.identification)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "Usuario creado exitosamente", "status": "success"}

def statusChangeUser(db: Session, user: schemas.UserStatusChange):
    db_user = db.query(models.Users).filter(models.Users.id == user.id).first()
    if not db_user:
        return {"message": "Usuario no encontrado", "status": "error"}
    db_user.status = user.status
    db.commit()
    return {"message": "Estado del usuario actualizado exitosamente", "status": "success"}

def getUser(db: Session, data: schemas.UserSearch):
    querydata = select(models.Users).where(or_(
        models.Users.username.ilike(f"%{data.data}%"), 
        models.Users.name.ilike(f"%{data.data}%"), 
        cast(models.Users.identification, String).ilike(f"%{data.data}%")
        ))
    query = db.execute(querydata)
    return query.scalars().all()

def getUsers(db: Session):
    return db.query(models.Users).all()

######

####Students
def createStudent(db: Session, student: schemas.StudentCreate):
    db_student = models.Students(name=student.name, lastname=student.lastname, identification=student.identification, phone=student.phone, email=student.email, address=student.address)
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return {"message": "Estudiante creado exitosamente", "status": "success"}

def statusChangeStudent(db: Session, student: schemas.StudentStatusChange):
    db_student = db.query(models.Students).filter(models.Students.id == student.id).first()
    if not db_student:
        return {"message": "Estudiante no encontrado", "status": "error"}
    db_student.status = student.status
    db.commit()
    return {"message": "Estado del estudiante actualizado exitosamente", "status": "success"}

def getStudent(db: Session, data: schemas.StudentSearch):
    querydata = select(models.Students).where(or_(
        models.Students.name.ilike(f"%{data.name}%"), 
        models.Students.lastname.ilike(f"%{data.lastname}%"), 
        cast(models.Students.identification, String).ilike(f"%{data.identification}%")
        ))
    query = db.execute(querydata)
    return query.scalars().all()

def getStudents(db: Session):
    return db.query(models.Students).all()

######

####Invoices
def createInvoice(db: Session, invoice: schemas.InvoiceCreate):
    db_invoice = models.Invoices(userId=invoice.userId, studentId=invoice.studentId, amount=invoice.amount, description=invoice.description)
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return {"message": "Factura creada exitosamente", "status": "success", "invoice": db_invoice}

def getInvoice(db: Session, data: schemas.InvoiceSearch):
    query = db.query(models.Invoices)
    if data.userId:
        query = query.filter(models.Invoices.userId == data.userId)
    if data.studentId:
        query = query.filter(models.Invoices.studentId == data.studentId)
    return query.all()

def getInvoices(db: Session):
    return db.query(models.Invoices).all()

######

####Payments
def createPayment(db: Session, payment: schemas.PaymentCreate):
    db_payment = models.Payments(invoiceId=payment.invoiceId, paymentMethod=payment.paymentMethod, exchangeRate=payment.exchangeRate, amountUsd=payment.amountUsd, amountBs=payment.amountBs, bankReference=payment.bankReference, note=payment.note)
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return {"message": "Pago registrado exitosamente", "status": "success"}

def getPayment(db: Session, data: schemas.PaymentSearch):
    query = db.query(models.Payments)
    if data.invoiceId:
        query = query.filter(models.Payments.invoiceId == data.invoiceId)
    return query.all()

def getPayments(db: Session):
    return db.query(models.Payments).all()

######

####Reports
######

####Change History
def createChangeHistory(db: Session, change: schemas.ChangeHistoryCreate):
    db_change = models.ChangeHistory(id=change.id)
    db.add(db_change)
    db.commit()
    db.refresh(db_change)
    return {"status": "success"}

def getChangeHistoryByUser(db: Session, userId: str):
    return db.query(models.ChangeHistory).filter(models.ChangeHistory.userId == userId).all()

def getChangeHistory(db: Session):
    return db.query(models.ChangeHistory).all()

######