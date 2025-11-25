from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models import PostCategory, StoreCategory

# 인증 스키마
class UserCreate(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# 게시판 스키마
class PostCreate(BaseModel):
    title: str
    content: Optional[str] = None
    category: PostCategory = PostCategory.ALL

class PostResponse(BaseModel):
    id: int
    title: str
    content: Optional[str] = None
    category: PostCategory
    author_id: int
    view_count: int
    like_count: Optional[int] = 0
    is_liked: Optional[bool] = False
    created_at: datetime

    class Config:
        from_attributes = True

# 음식점 스키마
class StoreCreate(BaseModel):
    name: str
    category: StoreCategory
    description: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class StoreResponse(BaseModel):
    id: int
    name: str
    category: StoreCategory
    description: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    rating: float
    view_count: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# 이벤트 스키마
class ReceiptCreate(BaseModel):
    store_id: int
    amount: Optional[int] = None

class ReceiptResponse(BaseModel):
    id: int
    user_id: int
    store_id: int
    image_url: str
    amount: Optional[int] = None
    verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

# AI 채팅 스키마
class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

# 댓글 스키마
class CommentCreate(BaseModel):
    content: str

class CommentResponse(BaseModel):
    id: int
    content: str
    post_id: int
    author_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# 업체 신청 스키마
class ApplicationCreate(BaseModel):
    name: str
    company_name: str
    tax_id: str
    phone_number: str
    email: str
    title: Optional[str] = None
    details: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    name: str
    company_name: str
    tax_id: str
    phone_number: str
    email: str
    title: Optional[str] = None
    details: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

