from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_applications():
    return {"message": "업체 신청 목록"}

