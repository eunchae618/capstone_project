from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.routers import auth, stores, community, events, ai_chat, applications, map
from app.database import engine, Base, DATABASE_FILE
import os

# 데이터베이스 테이블 생성
# DB 파일이 존재하지 않을 때만 테이블 생성
if not os.path.exists(DATABASE_FILE):
    print(f"데이터베이스 파일이 없습니다. 새로 생성합니다: {DATABASE_FILE}")
    Base.metadata.create_all(bind=engine)
else:
    print(f"기존 데이터베이스 파일을 사용합니다: {DATABASE_FILE}")
    # 기존 DB가 있으면 테이블이 없을 경우에만 생성 (스키마 변경 대응)
    Base.metadata.create_all(bind=engine)

# 데이터베이스 연결 테스트 (파일 생성 보장)
try:
    with engine.begin() as conn:
        conn.execute(text("SELECT 1"))
    print(f"✓ 데이터베이스 연결 성공")
    print(f"✓ 데이터베이스 파일 위치: {DATABASE_FILE}")
    if os.path.exists(DATABASE_FILE):
        file_size = os.path.getsize(DATABASE_FILE)
        print(f"✓ 파일 크기: {file_size} bytes")
    else:
        print(f"⚠ 파일이 아직 생성되지 않았습니다 (첫 쿼리 실행 시 생성됨)")
except Exception as e:
    print(f"✗ 데이터베이스 연결 오류: {e}")
    import traceback
    traceback.print_exc()

app = FastAPI(
    title="GYEOMCHAE API",
    description="한림대 상권 맵 API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(auth.router, prefix="/api/auth", tags=["인증"])
app.include_router(stores.router, prefix="/api/stores", tags=["음식점"])
app.include_router(community.router, prefix="/api/community", tags=["커뮤니티"])
app.include_router(events.router, prefix="/api/events", tags=["이벤트"])
app.include_router(ai_chat.router, prefix="/api/ai-chat", tags=["AI 채팅"])
app.include_router(applications.router, prefix="/api/applications", tags=["업체 신청"])
app.include_router(map.router, prefix="/api/map", tags=["지도 검색"])

@app.get("/")
async def root():
    return {"message": "GYEOMCHAE API"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

