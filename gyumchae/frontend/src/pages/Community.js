import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { communityAPI, getToken } from '../utils/api';
import './Community.css';

const Community = () => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const categories = [
    { value: 'ALL', label: '전체' },
    { value: 'CAFE', label: '카페' },
    { value: 'RESTAURANT', label: '음식점' },
    { value: 'BAR', label: '술집' },
    { value: 'ETC', label: '기타' }
  ];

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const category = selectedCategory === 'ALL' ? null : selectedCategory;
      const data = await communityAPI.getPosts(category);
      setPosts(data || []);
    } catch (err) {
      setError(err.message || '게시글을 불러오는데 실패했습니다.');
      console.error('게시글 로드 오류:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const [showWriteModal, setShowWriteModal] = useState(false);
  const [writeTitle, setWriteTitle] = useState('');
  const [writeContent, setWriteContent] = useState('');
  const [writeCategory, setWriteCategory] = useState('ALL');
  const [writing, setWriting] = useState(false);

  const handleWriteClick = () => {
    if (!getToken()) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    setShowWriteModal(true);
  };

  const handleCloseModal = () => {
    setShowWriteModal(false);
    setWriteTitle('');
    setWriteContent('');
    setWriteCategory('ALL');
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!writeTitle.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    setWriting(true);
    try {
      await communityAPI.createPost(writeTitle, writeContent, writeCategory);
      handleCloseModal();
      loadPosts(); // 게시글 목록 새로고침
    } catch (error) {
      alert(error.message || '게시글 작성에 실패했습니다.');
    } finally {
      setWriting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\./g, '.').replace(/\s/g, '');
  };

  const getCategoryLabel = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  return (
    <div className="community-page">
      <div className="community-container">
        <div className="community-header">
          <h1 className="community-title">자유 게시판</h1>
          <p className="community-description">
            저녁 메뉴 추천, 카공하기 좋은 카페 추천 등<br />
            자유롭게 작성하여 사람들에게 공유하거나, 추천 받아보세요
          </p>
        </div>

        <div className="category-filter">
          {categories.map(category => (
            <button
              key={category.value}
              className={`category-btn ${selectedCategory === category.value ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.label}
            </button>
          ))}
          <button className="write-btn" onClick={handleWriteClick}>+</button>
        </div>

        {error && <div className="error-message">{error}</div>}
        
        {loading ? (
          <div className="loading-message">로딩 중...</div>
        ) : (
          <div className="posts-list">
            {posts.length === 0 ? (
              <div className="no-posts">게시글이 없습니다.</div>
            ) : (
              posts.map(post => (
                <div key={post.id} className="post-item" onClick={() => navigate(`/community/posts/${post.id}`)}>
                  <div className="post-header">
                    <h3 className="post-title">{post.title}</h3>
                  </div>
                  <div className="post-footer">
                    <span className="post-date">{formatDate(post.created_at)}</span>
                    <span className="post-divider">|</span>
                    <span className="post-category">{getCategoryLabel(post.category)}</span>
                    {post.like_count > 0 && (
                      <>
                        <span className="post-divider">|</span>
                        <span className="post-like-info">❤️ {post.like_count}</span>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="pagination">
          <button className="page-btn">
            <img src={`${process.env.PUBLIC_URL}/images/page.png`} alt="이전" />
          </button>
          <div className="page-numbers">
            <span className="page-number active">1</span>
            <span className="page-number">2</span>
            <span className="page-number">3</span>
            <span className="page-number">4</span>
            <span className="page-number">5</span>
          </div>
          <button className="page-btn">
            <img src={`${process.env.PUBLIC_URL}/images/page.png`} alt="다음" />
          </button>
        </div>
      </div>

      {/* 게시글 작성 모달 */}
      {showWriteModal && (
        <div className="write-modal-overlay" onClick={handleCloseModal}>
          <div className="write-modal" onClick={(e) => e.stopPropagation()}>
            <div className="write-modal-header">
              <h2 className="write-modal-title">게시글 작성</h2>
              <button className="write-modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmitPost} className="write-modal-form">
              <div className="write-form-group">
                <label className="write-form-label">카테고리</label>
                <select
                  className="write-form-select"
                  value={writeCategory}
                  onChange={(e) => setWriteCategory(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div className="write-form-group">
                <label className="write-form-label">제목</label>
                <input
                  type="text"
                  className="write-form-input"
                  value={writeTitle}
                  onChange={(e) => setWriteTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                  required
                />
              </div>
              <div className="write-form-group">
                <label className="write-form-label">내용</label>
                <textarea
                  className="write-form-textarea"
                  value={writeContent}
                  onChange={(e) => setWriteContent(e.target.value)}
                  placeholder="내용을 입력하세요"
                  rows={10}
                />
              </div>
              <div className="write-modal-actions">
                <button type="button" className="write-btn-cancel" onClick={handleCloseModal}>
                  취소
                </button>
                <button type="submit" className="write-btn-submit" disabled={writing}>
                  {writing ? '작성 중...' : '작성하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;

