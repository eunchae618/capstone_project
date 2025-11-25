from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_events():
    return {"message": "이벤트 목록"}

