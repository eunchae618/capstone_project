import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { communityAPI, getToken } from '../utils/api';
import './PostDetail.css';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    loadPost();
    loadComments();
  }, [postId]);

  const loadPost = async () => {
    try {
      const data = await communityAPI.getPost(postId);
      setPost(data);
    } catch (error) {
      console.error('게시글 로드 오류:', error);
      alert('게시글을 불러올 수 없습니다.');
      navigate('/community');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const data = await communityAPI.getComments(postId);
      setComments(data || []);
    } catch (error) {
      console.error('댓글 로드 오류:', error);
    }
  };

  const handleLike = async () => {
    if (!getToken()) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    setLiking(true);
    try {
      const result = await communityAPI.toggleLike(postId);
      setPost(prev => ({
        ...prev,
        is_liked: result.liked,
        like_count: result.like_count
      }));
    } catch (error) {
      alert(error.message || '추천에 실패했습니다.');
    } finally {
      setLiking(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    if (!getToken()) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    setCommenting(true);
    try {
      await communityAPI.createComment(postId, commentText);
      setCommentText('');
      loadComments(); // 댓글 목록 새로고침
    } catch (error) {
      alert(error.message || '댓글 작성에 실패했습니다.');
    } finally {
      setCommenting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\./g, '.').replace(/\s/g, ' ');
  };

  const getCategoryLabel = (category) => {
    const categoryMap = {
      'ALL': '전체',
      'CAFE': '카페',
      'RESTAURANT': '음식점',
      'BAR': '술집',
      'ETC': '기타'
    };
    return categoryMap[category] || category;
  };

  if (loading) {
    return (
      <div className="post-detail-page">
        <div className="post-detail-container">
          <div className="loading-message">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="post-detail-page">
      <div className="post-detail-container">
        <button className="back-button" onClick={() => navigate('/community')}>
          ← 목록으로
        </button>

        <div className="post-detail">
          <div className="post-detail-header">
            <div className="post-detail-category">{getCategoryLabel(post.category)}</div>
            <h1 className="post-detail-title">{post.title}</h1>
            <div className="post-detail-meta">
              <span className="post-detail-date">{formatDate(post.created_at)}</span>
              <span className="post-detail-divider">|</span>
              <span className="post-detail-views">조회 {post.view_count}</span>
            </div>
          </div>

          <div className="post-detail-content">
            {post.content ? (
              <div className="post-content-text">
                {post.content.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < post.content.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <div className="post-content-text">내용이 없습니다.</div>
            )}
          </div>

          <div className="post-detail-actions">
            <button
              className={`like-button ${post.is_liked ? 'liked' : ''}`}
              onClick={handleLike}
              disabled={liking || !getToken()}
            >
              <span className="like-icon">{post.is_liked ? '❤️' : '🤍'}</span>
              <span className="like-count">{post.like_count || 0}</span>
            </button>
          </div>
        </div>

        <div className="comments-section">
          <h2 className="comments-title">댓글 ({comments.length})</h2>

          <form onSubmit={handleSubmitComment} className="comment-form">
            <textarea
              className="comment-input"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={getToken() ? "댓글을 입력하세요..." : "로그인이 필요합니다."}
              disabled={!getToken() || commenting}
              rows={3}
            />
            <button
              type="submit"
              className="comment-submit-btn"
              disabled={!getToken() || commenting || !commentText.trim()}
            >
              {commenting ? '작성 중...' : '댓글 작성'}
            </button>
          </form>

          <div className="comments-list">
            {comments.length === 0 ? (
              <div className="no-comments">댓글이 없습니다.</div>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-content">{comment.content}</div>
                  <div className="comment-meta">
                    <span className="comment-date">{formatDate(comment.created_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;

