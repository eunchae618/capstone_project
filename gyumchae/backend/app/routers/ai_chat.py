from fastapi import APIRouter, HTTPException
from app.schemas import ChatMessage, ChatResponse
try:
    import google.generativeai as genai
except ImportError:
    genai = None
import os
import re
import json
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Gemini API 키 설정
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# 한림대 주변 음식점 JSON 파일 경로
RESTAURANTS_JSON_PATH = os.getenv("RESTAURANTS_JSON_PATH", "restaurants.json")

def load_restaurants_data():
    """한림대 주변 음식점 JSON 파일 로드"""
    try:
        # 현재 파일 기준으로 경로 계산
        current_file = Path(__file__)
        backend_dir = current_file.parent.parent  # app/routers -> app -> backend
        project_root = backend_dir.parent  # backend -> gyumchae
        
        # 여러 경로에서 시도 (절대 경로 사용)
        possible_paths = [
            Path(RESTAURANTS_JSON_PATH) if os.path.isabs(RESTAURANTS_JSON_PATH) else backend_dir / RESTAURANTS_JSON_PATH,  # 환경 변수로 지정된 경로
            backend_dir / "restaurants.json",  # backend/restaurants.json
            backend_dir / RESTAURANTS_JSON_PATH,  # backend/환경변수경로
            project_root / "restaurants.json",  # gyumchae/restaurants.json
            project_root / RESTAURANTS_JSON_PATH,  # gyumchae/환경변수경로
            Path.cwd() / "restaurants.json",  # 현재 작업 디렉토리
            Path.cwd() / "backend" / "restaurants.json",  # 현재작업디렉토리/backend/restaurants.json
        ]
        
        print(f"🔍 JSON 파일 검색 중... (현재 작업 디렉토리: {Path.cwd()})")
        for json_path in possible_paths:
            abs_path = json_path.resolve()
            print(f"  - 시도: {abs_path} (존재: {abs_path.exists()})")
            if abs_path.exists():
                with open(abs_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    print(f"✅ 음식점 데이터 로드 성공: {abs_path}")
                    return data
        
        print(f"⚠️ 음식점 JSON 파일을 찾을 수 없습니다. 다음 경로들을 확인했습니다:")
        for path in possible_paths:
            print(f"  - {path.resolve()}")
        print(f"⚠️ 기본 정보를 사용합니다. restaurants.json 파일을 backend 폴더에 생성해주세요.")
        return None
    except Exception as e:
        print(f"⚠️ 음식점 JSON 파일 로드 오류: {e}")
        import traceback
        traceback.print_exc()
        return None

def get_gemini_model():
    """Gemini 모델 초기화"""
    if not genai:
        raise HTTPException(
            status_code=500,
            detail="google-generativeai 패키지가 설치되지 않았습니다. pip install google-generativeai를 실행해주세요."
        )
    
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY가 설정되지 않았습니다. .env 파일에 GEMINI_API_KEY를 추가해주세요."
        )
    
    genai.configure(api_key=GEMINI_API_KEY)
    # 최신 Gemini 모델 사용 (2.5 버전 우선)
    model_candidates = [
        'gemini-2.5-flash',
        'gemini-2.5-pro',
        'gemini-2.0-flash-exp',
        'gemini-2.0-flash',
        'gemini-exp',
        'gemini-2.0-flash-thinking-exp',
    ]
    
    last_error = None
    for model_name in model_candidates:
        try:
            model = genai.GenerativeModel(model_name)
            print(f"✅ 사용 중인 모델: {model_name}")
            return model
        except Exception as e:
            last_error = e
            continue
    
    # 모든 후보 모델이 실패하면 사용 가능한 모델 목록 확인
    try:
        models = genai.list_models()
        available_models = [m.name for m in models if 'generateContent' in m.supported_generation_methods]
        if available_models:
            gemini_models = [m for m in available_models if 'gemini' in m.lower()]
            if gemini_models:
                model_name = gemini_models[0].split('/')[-1]
                print(f"✅ 자동 선택된 모델: {model_name}")
                return genai.GenerativeModel(model_name)
            else:
                model_name = available_models[0].split('/')[-1]
                print(f"✅ 자동 선택된 모델: {model_name}")
                return genai.GenerativeModel(model_name)
    except Exception as e:
        last_error = e
    
    raise HTTPException(
        status_code=500,
        detail=f"사용 가능한 Gemini 모델을 찾을 수 없습니다. 오류: {str(last_error)}"
    )

def build_system_prompt(restaurants_data=None):
    """시스템 프롬프트 생성 (JSON 데이터 포함)"""
    base_prompt = """당신은 강원도 춘천시 한림대학교 주변 맛집 전문 상담사입니다.

위치: 강원도 춘천시 한림대학교 주변 (춘천시 동면, 한림대학교 인근)

중요 규칙:
1. 모든 추천은 반드시 강원도 춘천시 한림대학교 주변 지역의 가게로만 제한합니다.
2. 아래 제공된 음식점 정보를 우선적으로 참고하여 추천하세요.
3. 음식점, 카페, 술집, 기타 가게 등 모든 종류의 가게를 추천할 수 있습니다.
4. 사용자가 특정 종류의 가게를 요청하면 (예: "카페 추천", "술집 추천", "치킨집 추천"), 제공된 정보에서 해당 종류의 한림대 주변 가게를 찾아 추천하세요.
5. 제공된 정보에 없는 가게는 추천하지 마세요. 정확한 정보가 없다면 솔직하게 말하세요.
6. 가게 이름, 위치, 특징, 메뉴, 가격대 등을 상세히 알려주세요.
7. 친절하고 상세하게 답변하며, 이모지를 적절히 사용하여 답변을 더 친근하게 만들어주세요.
8. 답변은 일반 텍스트로만 작성하세요. Markdown 문법(**, #, -, 등)을 사용하지 마세요.
9. 줄바꿈은 자연스럽게 하고, 특수 기호나 포맷팅 없이 자연스러운 대화체로 작성해주세요.
10. 사용자가 다른 지역의 가게를 물어봐도, 한림대 주변 가게로 대체해서 추천합니다."""
    
    # JSON 데이터가 있으면 추가
    if restaurants_data:
        restaurants_info = json.dumps(restaurants_data, ensure_ascii=False, indent=2)
        base_prompt += f"""

=== 한림대 주변 음식점 정보 ===
{restaurants_info}
=== 위 정보를 참고하여 추천해주세요 ===
"""
    else:
        base_prompt += """

참고: 음식점 정보 파일이 로드되지 않았습니다. 기본 정보만 사용합니다.
"""
    
    return base_prompt


@router.post("/", response_model=ChatResponse)
async def chat(message: ChatMessage):
    """
    Gemini API를 사용한 AI 채팅
    한림대 주변 상권 추천에 특화된 응답 제공 (JSON 파일 참고)
    """
    try:
        model = get_gemini_model()
        
        # JSON 파일에서 음식점 데이터 로드
        restaurants_data = load_restaurants_data()
        
        # 시스템 프롬프트 생성 (JSON 데이터 포함)
        system_prompt = build_system_prompt(restaurants_data)
        
        # 사용자 메시지 처리 - 추천 요청 문구 자동 추가
        user_message = message.message.strip()
        
        # 사용자 메시지가 추천 요청 형태가 아니면 자동으로 추가
        recommendation_keywords = ['추천', '추천해', '추천해줘', '추천해주', '어떤', '뭐', '뭐가', '뭐 먹', '어디', '가게', '맛집']
        has_recommendation_request = any(keyword in user_message for keyword in recommendation_keywords)
        
        # 질문 형태가 아니거나 추천 요청이 없으면 자동으로 추가
        if not user_message.endswith('?') and not user_message.endswith('요') and not user_message.endswith('어') and not has_recommendation_request:
            user_message = f"{user_message} 어떤거 추천해줄수있어?"
        elif not has_recommendation_request and ('?' in user_message or '어디' in user_message or '뭐' in user_message):
            # 질문 형태지만 추천 요청이 명확하지 않으면 보강
            if '어떤' not in user_message and '추천' not in user_message:
                user_message = f"{user_message} 한림대 주변에서 추천해줄 수 있어?"
        
        # 사용자 메시지에 시스템 프롬프트 추가
        full_prompt = f"{system_prompt}\n\n사용자: {user_message}\n\n상담사:"
        
        # Gemini API 호출
        response = model.generate_content(
            full_prompt,
            generation_config={
                'temperature': 0.7,
                'top_p': 0.8,
                'top_k': 40,
            }
        )
        
        # 응답 텍스트 추출 및 Markdown 제거
        if response and response.text:
            # Markdown 문법 제거
            cleaned_text = response.text
            # **bold** 제거
            cleaned_text = re.sub(r'\*\*(.*?)\*\*', r'\1', cleaned_text)
            # *italic* 제거
            cleaned_text = re.sub(r'\*(.*?)\*', r'\1', cleaned_text)
            # # 헤더 제거
            cleaned_text = re.sub(r'^#+\s+', '', cleaned_text, flags=re.MULTILINE)
            # - 리스트 제거
            cleaned_text = re.sub(r'^-\s+', '', cleaned_text, flags=re.MULTILINE)
            # `코드` 제거
            cleaned_text = re.sub(r'`([^`]+)`', r'\1', cleaned_text)
            # 링크 [text](url) 제거
            cleaned_text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', cleaned_text)
            # 여러 공백 정리
            cleaned_text = re.sub(r'\n{3,}', '\n\n', cleaned_text)
            
            return ChatResponse(response=cleaned_text)
        else:
            raise HTTPException(
                status_code=500,
                detail="AI 응답을 생성할 수 없습니다."
            )
            
    except HTTPException:
        # HTTPException은 그대로 전달
        raise
    except Exception as e:
        import traceback
        error_detail = str(e)
        print(f"AI 채팅 오류 상세: {error_detail}")
        print(f"트레이스백: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"AI 채팅 중 오류가 발생했습니다: {error_detail}"
        )

