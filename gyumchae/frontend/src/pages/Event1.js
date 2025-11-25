import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Event1.css';

const Event1 = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // 인증 상태 확인
    const verified = localStorage.getItem('receiptVerified') === 'true';
    setIsVerified(verified);
  }, []);

  const prizes = [
    { id: 1, name: '1등', amount: '100,000' },
    { id: 2, name: '꽝', text: '다음 기회에' },
    { id: 3, name: '2등', amount: '50,000' },
    { id: 4, name: '꽝', text: '다음 기회에' },
    { id: 5, name: '3등', amount: '30,000' },
    { id: 6, name: '꽝', text: '다음 기회에' },
    { id: 7, name: '4등', text: '음료수 1캔' },
    { id: 8, name: '꽝', text: '다음 기회에' }
  ];

  const handleSpin = () => {
    if (isSpinning || !isVerified) return;
    
    setIsSpinning(true);
    const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
    
    setTimeout(() => {
      setResult(randomPrize);
      setIsSpinning(false);
      // 룰렛 사용 후 인증 상태 초기화 (한 번만 사용 가능)
      localStorage.removeItem('receiptVerified');
      localStorage.removeItem('receiptImage');
      setIsVerified(false);
    }, 3000);
  };

  return (
    <div className="event1-page">
      <div className="event1-container">
        <h1 className="event1-title">룰렛 돌리기</h1>
        {!isVerified && (
          <div className="verification-required">
            <div className="lock-icon">🔒</div>
            <p className="lock-message">영수증 인증이 필요합니다</p>
            <Link to="/event" className="verify-link-button">
              영수증 인증하러 가기
            </Link>
          </div>
        )}
        <div className={`roulette-section ${!isVerified ? 'locked' : ''}`}>
          <div className="roulette-wrapper">
            <div className={`roulette ${isSpinning ? 'spinning' : ''} ${!isVerified ? 'disabled' : ''}`}>
              {prizes.map((prize, index) => {
                const angle = (360 / prizes.length) * index;
                const sectorAngle = 360 / prizes.length;
                return (
                  <div
                    key={prize.id}
                    className={`roulette-item ${index % 2 === 0 ? 'even' : 'odd'}`}
                    style={{ 
                      transform: `rotate(${angle}deg)`,
                      clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((sectorAngle * Math.PI) / 180)}% ${50 - 50 * Math.sin((sectorAngle * Math.PI) / 180)}%)`
                    }}
                  >
                    <div className="prize-content" style={{ transform: `rotate(${sectorAngle / 2}deg)` }}>
                      <div className="prize-name">{prize.name}</div>
                      {prize.amount && <div className="prize-amount">{prize.amount}</div>}
                      {prize.text && <div className="prize-text">{prize.text}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="roulette-center">
              <button
                className="spin-button"
                onClick={handleSpin}
                disabled={isSpinning || !isVerified}
              >
                {isVerified ? 'START' : '🔒'}
              </button>
            </div>
          </div>
        </div>
        
        {result && (
          <div className="result-modal">
            <h2 className="result-title">축하합니다!</h2>
            <p className="result-text">
              {result.name} {result.amount || result.text}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Event1;

