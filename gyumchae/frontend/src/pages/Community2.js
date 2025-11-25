import React from 'react';
import { Link } from 'react-router-dom';
import './Community2.css';

const Community2 = () => {
  const reviews = [
    {
      id: 1,
      text: '상하이파스타 매콤하고 맛있어요! 스테이크도 먹었는데 이 가격에 이렇게 맛있는 스테이크를 먹을 수 있어 좋았습니다:)',
      store: '상린',
      date: '2025.07.04'
    },
    {
      id: 2,
      text: '숙성고기 엄청 부드럽고 맛있어요!! 사장님도 엄청 친절하시고 서비스도 팍팍 주시고 남는게 있으시나요~? 숙주랑 고기랑 같이 특제소스에 찍어먹으면 진짜 너무 맛있습니당! 다음에 또 먹으러올게요!!',
      store: '동신냉삼집',
      date: '2025.01.21'
    },
    {
      id: 3,
      text: '마라탕 처음 입문한 곳 춘천에서 마라탕은 이집에서만 먹습니다. 항상 친절하시고 맛도 좋고 오래오래 해주세요~~ 국물 진국이라는 1단계만 먹는 남편과 2단계에 미친 저의 취향저격 맛집입니당',
      store: '향리원 마라탕',
      date: '2025.05.05'
    }
  ];

  return (
    <div className="community2-page">
      <div className="community2-container">
        <h1 className="community2-title">내가 작성한 리뷰</h1>

        <div className="reviews-grid">
          {reviews.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-quote">"</div>
              <p className="review-text">{review.text}</p>
              <div className="review-footer">
                <span className="review-store">{review.store}</span>
                <span className="review-date">{review.date}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="reviews-grid">
          {reviews.map(review => (
            <div key={`second-${review.id}`} className="review-card">
              <div className="review-quote">"</div>
              <p className="review-text">{review.text}</p>
              <div className="review-footer">
                <span className="review-store">{review.store}</span>
                <span className="review-date">{review.date}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="write-review-section">
          <Link to="/community/reviews/write" className="write-review-btn">
            리뷰 작성하러 가기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Community2;

