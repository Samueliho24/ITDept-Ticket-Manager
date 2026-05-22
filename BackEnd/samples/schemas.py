from pydantic import BaseModel
from decimal import Decimal
from typing import Optional

####Users
class UserCreate(BaseModel):
    username: str
    password: str
    name: str
    identification: int

class UserLogin(BaseModel):
    username: str
    password: str

class UserStatusChange(BaseModel):
    id: str
    status: str

class UserSearch(BaseModel):
    data: Optional[str] = None
######

####Students
class StudentCreate(BaseModel):
    id: str
    name: str
    lastname: str
    identification: int
    phone: int
    email: str
    address: str

class StudentStatusChange(BaseModel):
    id: str
    status: str

class StudentSearch(BaseModel):
    data: Optional[str] = None
######

####Invoices
class InvoiceCreate(BaseModel):
    userId: str
    studentId: str
    amount: Decimal
    description: str

class InvoiceSearch(BaseModel):
    userId: Optional[str] = None
    studentId: Optional[str] = None

class InvoiceStatusChange(BaseModel):
    id: str
    status: str
######

####Payments
class PaymentCreate(BaseModel):
    invoiceId: str
    paymentMethod: str
    exchangeRate: Decimal
    amountUsd: Decimal
    amountBs: Decimal
    bankReference: Optional[str] = None
    note: Optional[str] = None

class PaymentSearch(BaseModel):
    invoiceId: Optional[str] = None
######

####Queries

######

####Reports

######

####Change History
class ChangeHistoryCreate(BaseModel):
    userId: str
    comment: str
