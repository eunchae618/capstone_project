# GYEOMCHAE (겸채)

한림대 상권 맵 서비스 프로젝트

## 프로젝트 구조

```
gyumchae/
├── frontend/          # React 프론트엔드
└── backend/           # FastAPI 백엔드
```

## 사전 요구사항

### Frontend
- Node.js 16.x 이상
- npm 또는 yarn

### Backend
- Python 3.11 이상
- pip

## 설치 및 실행 방법

### 1. Backend 설정 및 실행

#### 1-1. 가상환경 생성 및 활성화

```bash
# backend 폴더로 이동
cd backend

# 가상환경 생성 (Windows)
python -m venv venv

# 가상환경 활성화 (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# 가상환경 활성화 (Windows CMD)
venv\Scripts\activate.bat

# 가상환경 활성화 (Mac/Linux)
source venv/bin/activate
```

#### 1-2. 의존성 설치

```bash
pip install -r requirements.txt
```

#### 1-3. 환경 변수 설정

`backend` 폴더에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 네이버 Maps API (지도 표시 + 검색용 - 같은 Client ID 사용)
NAVER_MAP_CLIENT_ID=your_naver_map_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret

# JWT 시크릿 키 (프로덕션에서는 반드시 변경)
SECRET_KEY=your-secret-key-change-in-production

# Gemini API 키 (AI 채팅용)
GEMINI_API_KEY=your_gemini_api_key

# 데이터베이스 파일 경로 (선택사항, 기본값: gyeomchae.db)
DATABASE_FILE=gyeomchae.db
```

**네이버 Maps API 키 발급 방법:**
1. [네이버 클라우드 플랫폼](https://www.ncloud.com/) 접속
2. 콘솔 > Application > 애플리케이션 등록
3. **Maps API** 선택 (지도 표시 + 검색 모두 사용 가능)
4. Client ID와 Client Secret 발급
5. 서비스 환경에 `http://localhost:3000` 등록

**Gemini API 키 발급 방법:**
1. [Google AI Studio](https://makersuite.google.com/app/apikey) 접속
2. "Create API Key" 클릭
3. API 키 복사하여 `.env` 파일에 `GEMINI_API_KEY`로 추가

#### 1-4. 서버 실행

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

서버가 정상적으로 실행되면 다음 주소에서 API 문서를 확인할 수 있습니다:
- API 문서: http://localhost:8000/docs
- 대체 문서: http://localhost:8000/redoc

### 2. Frontend 설정 및 실행

#### 2-1. 의존성 설치

```bash
# frontend 폴더로 이동
cd frontend

# npm으로 설치
npm install
```

#### 2-2. 환경 변수 설정

`frontend` 폴더에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 백엔드 API URL
REACT_APP_API_URL=http://localhost:8000

# 네이버 지도 API Client ID
REACT_APP_NAVER_MAP_CLIENT_ID=your_naver_map_client_id
```

**네이버 지도 API 키 발급 방법:**
1. [네이버 클라우드 플랫폼](https://www.ncloud.com/) 접속
2. 콘솔 > Application > 애플리케이션 등록
3. Maps API 선택
4. Client ID 발급
5. 서비스 환경에 `http://localhost:3000` 등록

#### 2-3. 개발 서버 실행

```bash
npm start
```

브라우저에서 http://localhost:3000 으로 자동으로 열립니다.

## 주요 기능

### 인증 시스템
- 회원가입 (`/signup`)
- 로그인 (`/login`)
- JWT 토큰 기반 인증
- 로그아웃

### 지도 검색
- 네이버 지도 API 연동
- 키워드 검색 (음식점, 카페 등)
- 주소 검색
- 마커 표시 및 정보창

### 커뮤니티
- 게시글 목록 조회
- 카테고리별 필터링
- 게시글 작성 (로그인 필요)
- 댓글 기능

### 이벤트
- 영수증 인증
- 룰렛 이벤트
- 스크래치 이벤트

## API 엔드포인트

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 현재 사용자 정보

### 커뮤니티
- `GET /api/community/posts` - 게시글 목록
- `GET /api/community/posts/{id}` - 게시글 상세
- `POST /api/community/posts` - 게시글 작성
- `GET /api/community/posts/{id}/comments` - 댓글 목록
- `POST /api/community/posts/{id}/comments` - 댓글 작성

### 지도 검색
- `GET /api/map/search?query={검색어}` - 장소 검색

## 데이터베이스

SQLite 데이터베이스를 사용합니다. `backend/gyeomchae.db` 파일이 자동으로 생성됩니다.

### 주요 테이블
- `users` - 사용자 정보
- `posts` - 게시글
- `comments` - 댓글
- `stores` - 가게 정보
- `receipts` - 영수증
- `event_results` - 이벤트 결과
- `applications` - 업체 신청

## 문제 해결

### Backend 오류

1. **가상환경 활성화 오류 (PowerShell)**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. **포트가 이미 사용 중인 경우**
   ```bash
   # 다른 포트 사용
   uvicorn main:app --reload --port 8001
   ```

3. **데이터베이스 오류**
   - `backend/gyeomchae.db` 파일 삭제 후 재실행

### Frontend 오류

1. **포트가 이미 사용 중인 경우**
   - `.env` 파일에 `PORT=3001` 추가

2. **API 연결 오류**
   - Backend가 실행 중인지 확인
   - `.env` 파일의 `REACT_APP_API_URL` 확인

3. **네이버 지도가 표시되지 않는 경우**
   - 네이버 클라우드 플랫폼에서 서비스 환경에 `http://localhost:3000` 등록 확인
   - Client ID가 Maps API용인지 확인

## 개발 팁

### Backend 개발
- FastAPI 자동 리로드: `--reload` 옵션 사용
- API 문서: http://localhost:8000/docs
- 데이터베이스 초기화: `main.py`에서 `Base.metadata.drop_all()` 주석 해제

### Frontend 개발
- Hot Reload: 파일 저장 시 자동 새로고침
- React DevTools: 브라우저 확장 프로그램 설치 권장

## 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다.

