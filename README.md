# GYEOMCHAE – 한림대 상권 통합 서비스

한림대학교 앞 상권 정보를 지도, 커뮤니티, 이벤트, AI 챗봇으로 제공하는 풀스택 웹 애플리케이션입니다.  
이 문서는 **처음 프로젝트를 clone 한 사람도 바로 실행할 수 있도록** Windows/macOS 기준으로 자세한 단계를 설명합니다.

---

## 1. 프로젝트 구성

```
capstone/
├── gyumchae/
│   ├── backend/         # FastAPI + SQLite 서버
│   └── frontend/        # React 18 SPA
├── cursor-talk-to-figma-mcp/ (실험용, 실행 불필요)
└── README.md            # 현재 문서
```

> 실사용 코드는 `gyumchae` 폴더 안에 있습니다. 아래 설명도 모두 `gyumchae` 기준입니다.

---

## 2. 선행 준비물

| 항목 | 권장 버전 | 비고 |
| --- | --- | --- |
| Git | 최신 | `git clone`용 |
| Node.js / npm | Node 18 이상 | 프론트엔드 |
| Python | 3.11.x | 백엔드 |
| SQLite | 기본 포함 | 별도 설치 필요 없음 |

*윈도우는 PowerShell, macOS는 기본 Terminal 사용을 권장합니다.*

---

## 3. 저장소 받기 (Windows / macOS 동일)

```bash
git clone https://github.com/<YOUR_ORG_OR_ID>/capstone.git
cd capstone/gyumchae
```

이후 모든 명령은 `capstone/gyumchae` 디렉토리 기준으로 수행합니다.

---

## 4. 백엔드 (FastAPI) 실행

### 4-1) 공통 경로 이동

```bash
cd backend
```

### 4-2) Windows
```powershell
# 가상환경 생성
py -3.11 -m venv venv

# PowerShell에서 활성화
.\venv\Scripts\Activate.ps1

# (실행 정책 오류 시) Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

# 의존성 설치
pip install --upgrade pip
pip install -r requirements.txt

# 서버 실행
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4-3) macOS
```bash
python3.11 -m venv venv
source venv/bin/activate

python -m pip install --upgrade pip
pip install -r requirements.txt

uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

> 서버가 정상적으로 뜨면 `http://localhost:8000/docs`에서 Swagger UI를 확인할 수 있습니다.  
> 종료는 터미널에서 `Ctrl + C`.

---

## 5. 프론트엔드 (React) 실행

### 5-1) 공통 경로 이동

새 터미널 창을 열어서 (백엔드 유지)

```bash
cd capstone/gyumchae/frontend
```

### 5-2) Windows
```powershell
npm install
npm start
```

### 5-3) macOS
```bash
npm install
npm start
```

> 기본 포트는 `http://localhost:3000`. 브라우저가 자동으로 열리지 않으면 직접 접속하세요.  
> 백엔드가 실행 중이어야 로그인/지도/이벤트 등 데이터 연동이 정상 동작합니다.

---

## 6. 환경 변수(.env) 설정 (선택)

백엔드에서 `gyumchae/backend/.env` 파일을 생성하면 민감 정보를 분리할 수 있습니다.

```env
SECRET_KEY=change-me
GOOGLE_API_KEY=발급받은-API-키
DATABASE_FILE=backend/gyeomchae.db
```

- `SECRET_KEY`: JWT 서명에 사용. 운영 시 반드시 변경.
- `GOOGLE_API_KEY`: AI Chat 기능에 필요 (Google AI Studio 무료 키 가능).
- `DATABASE_FILE`: 기본값은 `backend/gyeomchae.db`이며 없으면 자동 생성.


---

## 7. 주요 기능 한눈에 보기

| 영역 | 설명 |
| --- | --- |
| 홈/상권 소개 | 추천 매장, 스토어 캐러셀 |
| 지도(Map) | FastAPI → SQLite에 저장된 상점 좌표 표시 |
| 커뮤니티 | 게시글/댓글 CRUD, 카테고리 필터 |
| 이벤트 | 영수증 업로드 + 룰렛, 당첨 결과 모달 |
| AI Chat | AI 기반 매장 추천 (백엔드 `ai_chat` 라우터 사용) |
| 업체 신청 | 폼 제출 시 백엔드 applications API에 저장 |


---

## 8. 트러블슈팅

| 문제 | 확인 사항 |
| --- | --- |
| `ModuleNotFoundError` | 백엔드에서 가상환경이 활성화됐는지, `pip install -r requirements.txt` 했는지 확인 |
| 포트 점유(3000/8000) | 사용 중인 프로세스 종료 또는 포트 변경 (`set PORT=3001 && npm start`, `uvicorn ... --port 8001`) |
| 프론트에서 API 실패 | 백엔드가 실행 중인지, 콘솔 CORS 에러 여부 확인 |
| sqlite 락 오류 | `backend/gyeomchae.db` 삭제 후 서버 재실행 (데이터 초기화 주의) |


---

## 9. 함께 보면 좋은 스크립트

- 백엔드: `uvicorn main:app --reload` (기본)
- 프론트엔드: `npm start`, `npm run build`
- DB 확인: `sqlite3 backend/gyeomchae.db`


---

## 10. 문의

프로젝트 관련 질문은 커밋 작성자 또는 팀 리더에게 문의해 주세요.  
이 README는 꾸준히 최신 상태로 유지될 예정입니다.

행운을 빕니다! 🚀
