from fastapi import APIRouter, Depends, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.database import get_db
from app.models import Post, PostCategory, Comment, PostLike, User
from app.schemas import PostCreate, PostResponse, CommentCreate, CommentResponse
from app.auth import get_current_user

router = APIRouter()

# 선택적 인증을 위한 헬퍼 함수
async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(HTTPBearer(auto_error=False)),
    db: Session = Depends(get_db)
) -> Optional[User]:
    if not credentials:
        return None
    try:
        token = credentials.credentials
        from jose import jwt
        import os
        from dotenv import load_dotenv
        load_dotenv()
        SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
        ALGORITHM = "HS256"
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username:
            user = db.query(User).filter(User.username == username).first()
            return user
    except Exception:
        pass
    return None

@router.get("/posts", response_model=List[PostResponse])
def get_posts(
    category: Optional[PostCategory] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    query = db.query(Post)
    if category and category != PostCategory.ALL:
        query = query.filter(Post.category == category)
    posts = query.order_by(Post.created_at.desc()).offset(skip).limit(limit).all()
    
    # 각 게시글의 좋아요 수 계산 및 사용자 좋아요 여부 확인
    result = []
    for post in posts:
        like_count = db.query(func.count(PostLike.id)).filter(PostLike.post_id == post.id).scalar() or 0
        is_liked = False
        if current_user:
            is_liked = db.query(PostLike).filter(
                PostLike.post_id == post.id,
                PostLike.user_id == current_user.id
            ).first() is not None
        
        post_dict = {
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "category": post.category,
            "author_id": post.author_id,
            "view_count": post.view_count,
            "like_count": like_count,
            "is_liked": is_liked,
            "created_at": post.created_at
        }
        result.append(post_dict)
    
    return result

@router.get("/posts/{post_id}", response_model=PostResponse)
def get_post(
    post_id: int, 
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="게시글이 존재하지 않습니다."
        )
    post.view_count += 1
    db.commit()
    
    # 좋아요 수 계산 및 사용자 좋아요 여부 확인
    like_count = db.query(func.count(PostLike.id)).filter(PostLike.post_id == post.id).scalar() or 0
    is_liked = False
    if current_user:
        is_liked = db.query(PostLike).filter(
            PostLike.post_id == post.id,
            PostLike.user_id == current_user.id
        ).first() is not None
    
    return {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "category": post.category,
        "author_id": post.author_id,
        "view_count": post.view_count,
        "like_count": like_count,
        "is_liked": is_liked,
        "created_at": post.created_at
    }

@router.post("/posts", response_model=PostResponse)
def create_post(
    post: PostCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if not post.title or not post.title.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="제목을 입력해주세요."
        )
    
    db_post = Post(
        title=post.title.strip(),
        content=post.content.strip() if post.content else None,
        category=post.category,
        author_id=current_user.id
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

@router.get("/posts/{post_id}/comments", response_model=List[CommentResponse])
def get_comments(post_id: int, db: Session = Depends(get_db)):
    comments = db.query(Comment).filter(Comment.post_id == post_id).order_by(Comment.created_at.asc()).all()
    return comments

@router.post("/posts/{post_id}/comments", response_model=CommentResponse)
def create_comment(
    post_id: int,
    comment: CommentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # 게시글 존재 확인
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="게시글이 존재하지 않습니다."
        )
    
    if not comment.content or not comment.content.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="댓글 내용을 입력해주세요."
        )
    
    db_comment = Comment(
        content=comment.content.strip(),
        post_id=post_id,
        author_id=current_user.id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

@router.post("/posts/{post_id}/like")
def toggle_like(
    post_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """게시글 좋아요 토글"""
    # 게시글 존재 확인
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="게시글이 존재하지 않습니다."
        )
    
    # 이미 좋아요를 눌렀는지 확인
    existing_like = db.query(PostLike).filter(
        PostLike.post_id == post_id,
        PostLike.user_id == current_user.id
    ).first()
    
    if existing_like:
        # 좋아요 취소
        db.delete(existing_like)
        db.commit()
        like_count = db.query(func.count(PostLike.id)).filter(PostLike.post_id == post_id).scalar() or 0
        return {"liked": False, "like_count": like_count}
    else:
        # 좋아요 추가
        new_like = PostLike(
            post_id=post_id,
            user_id=current_user.id
        )
        db.add(new_like)
        db.commit()
        like_count = db.query(func.count(PostLike.id)).filter(PostLike.post_id == post_id).scalar() or 0
        return {"liked": True, "like_count": like_count}

