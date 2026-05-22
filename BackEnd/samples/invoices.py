from ..schemas import schemas
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import controller, getDb

router = APIRouter()

@router.post("/", response_model=schemas.InvoiceCreate)
def create_invoice(invoice: schemas.InvoiceCreate, db: Session = Depends(getDb)):
    return controller.createInvoice(db, invoice)

@router.get("/search")
def search_invoices(data: schemas.InvoiceSearch, db: Session = Depends(getDb)):
    return controller.getInvoice(db, data)

@router.get("/")
def get_all_invoices(db: Session = Depends(getDb)):
    return controller.getInvoices(db)
