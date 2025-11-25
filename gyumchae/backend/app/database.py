from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

# SQLite 데이터베이스 파일 경로
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE_FILE = os.getenv("DATABASE_FILE", os.path.join(BASE_DIR, "gyeomchae.db"))

# 절대 경로로 변환 (Windows 경로 문제 해결)
DATABASE_FILE = os.path.abspath(DATABASE_FILE)

# 디렉토리가 없으면 생성
db_dir = os.path.dirname(DATABASE_FILE)
if db_dir and not os.path.exists(db_dir):
    os.makedirs(db_dir, exist_ok=True)

# Windows 경로를 SQLite URL 형식으로 변환
# Windows: C:\path\to\file.db -> /C:/path/to/file.db 또는 sqlite:///C:\\path\\to\\file.db
if os.name == 'nt':  # Windows
    # Windows 경로를 정규화
    DATABASE_URL = f"sqlite:///{DATABASE_FILE.replace(os.sep, '/')}"
else:
    DATABASE_URL = f"sqlite:///{DATABASE_FILE}"

# SQLite는 check_same_thread=False 필요 (FastAPI에서 사용 시)
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

