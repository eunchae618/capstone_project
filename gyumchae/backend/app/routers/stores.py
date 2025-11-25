from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Store
from app.schemas import StoreResponse

router = APIRouter()

@router.get("/", response_model=List[StoreResponse])
def get_stores(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    stores = db.query(Store).filter(Store.is_active == True).offset(skip).limit(limit).all()
    return stores

