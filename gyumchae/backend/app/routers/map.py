from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# 네이버 검색 API 프록시
@router.get("/search")
async def search_places(
    query: str = Query(..., description="검색어 (예: 음식점, 카페, 상린)"),
    display: int = Query(10, ge=1, le=100, description="검색 결과 개수"),
    start: int = Query(1, ge=1, description="시작 위치")
):
    """
    네이버 검색 API를 통한 장소 검색 (CORS 우회 프록시)
    """
    # 네이버 검색 API는 Maps API와 별도이지만, 같은 Client ID 사용 가능
    # Maps API Client ID를 사용하거나, 별도 검색 API 키 사용 가능
    client_id = os.getenv("NAVER_MAP_CLIENT_ID") or os.getenv("NAVER_CLIENT_ID")
    client_secret = os.getenv("NAVER_CLIENT_SECRET")
    
    if not client_id or not client_secret:
        raise HTTPException(
            status_code=500,
            detail="네이버 API 키가 설정되지 않았습니다. NAVER_MAP_CLIENT_ID 또는 NAVER_CLIENT_ID를 환경 변수에 추가해주세요."
        )
    
    try:
        url = "https://openapi.naver.com/v1/search/local.json"
        params = {
            "query": query,
            "display": display,
            "start": start,
            "sort": "random"
        }
        headers = {
            "X-Naver-Client-Id": client_id,
            "X-Naver-Client-Secret": client_secret
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, headers=headers, timeout=10.0)
            response.raise_for_status()
            return response.json()
            
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"네이버 API 오류: {e.response.text}"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=500,
            detail=f"네트워크 오류: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"검색 중 오류가 발생했습니다: {str(e)}"
        )

