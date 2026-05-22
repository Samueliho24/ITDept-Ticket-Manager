from ..schemas import schemas
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import controller, getDb

router = APIRouter()

@router.post("/", response_model=schemas.PaymentCreate)
def create_payment(payment: schemas.PaymentCreate, db: Session = Depends(getDb)):
    return controller.createPayment(db, payment)

@router.get("/search")
def search_payments(data: schemas.PaymentSearch, db: Session = Depends(getDb)):
    return controller.getPayment(db, data)

@router.get("/")
def get_all_payments(db: Session = Depends(getDb)):
    return controller.getPayments(db)