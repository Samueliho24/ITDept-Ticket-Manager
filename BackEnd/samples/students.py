from ..schemas import schemas
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import controller, getDb

router = APIRouter()

@router.post("/")
def create(student: schemas.StudentCreate, db: Session = Depends(getDb)):
    return controller.createStudent(db, student)

@router.get("/")
def get_all(db: Session = Depends(getDb)):
    return controller.getStudents(db)

@router.get("/search")
def search(data: schemas.StudentSearch, db: Session = Depends(getDb)):
    return controller.getStudent(db, data)

@router.patch("/status")
def status_change(student: schemas.StudentStatusChange, db: Session = Depends(getDb)):
    return controller.statusChangeStudent(db, student)

