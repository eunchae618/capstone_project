import React, { useState, useEffect } from "react";
import "./Event.css";
import "./Event1.css";

const Event = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rouletteUsed, setRouletteUsed] = useState(false);

  const prizes = [
    { id: 1, name: "1등", amount: "100,000" },
    { id: 2, name: "꽝", text: "다음 기회에" },
    { id: 3, name: "2등", amount: "50,000" },
    { id: 4, name: "꽝", text: "다음 기회에" },
    { id: 5, name: "3등", amount: "30,000" },
    { id: 6, name: "꽝", text: "다음 기회에" },
    { id: 7, name: "4등", text: "음료수 1캔" },
    { id: 8, name: "꽝", text: "다음 기회에" },
  ];

  useEffect(() => {
    // 페이지 로드 시 상태 초기화 (새로고침 또는 다른 페이지에서 돌아올 때)
    setSelectedImage(null);
    setIsVerified(false);
    setRouletteUsed(false);
    setResult(null);
    setIsSpinning(false);
    // localStorage도 초기화
    localStorage.removeItem("receiptVerified");
    localStorage.removeItem("receiptImage");
    localStorage.removeItem("rouletteUsed");
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      // 인증 완료 처리
      localStorage.setItem("receiptVerified", "true");
      localStorage.setItem("receiptImage", imageUrl);
      setIsVerified(true);
      // 새로운 영수증으로 인증하면 룰렛을 다시 돌릴 수 있게 리셋
      setRouletteUsed(false);
      setResult(null);
      localStorage.removeItem("rouletteUsed");
    }
  };

  const handleSpin = () => {
    if (isSpinning || !isVerified || rouletteUsed) return;

    setIsSpinning(true);
    setResult(null); // 이전 결과 초기화

    // 랜덤으로 당첨 선택
    const selectedPrizeIndex = Math.floor(Math.random() * prizes.length);
    const randomPrize = prizes[selectedPrizeIndex];

    // 룰렛이 멈출 각도 계산 (화살표가 가리키는 위치 기준)
    // 화살표는 상단(0도)에 위치
    // 룰렛의 첫 번째 섹션이 상단에 있다고 가정
    // 각 섹션의 중심 각도 계산
    const sectorAngle = 360 / prizes.length;
    // 화살표가 섹션의 중심을 가리키도록 계산
    // 룰렛이 시계 방향으로 회전하므로, 목표 섹션의 중심이 화살표 아래로 오도록
    const targetSectorCenter =
      selectedPrizeIndex * sectorAngle + sectorAngle / 2;
    const targetAngle = 360 - targetSectorCenter;

    // 여러 바퀴 돌리기 (최소 5바퀴, 최대 8바퀴) + 목표 각도
    const baseRotations = 5 + Math.random() * 3; // 5~8바퀴
    const finalRotation = baseRotations * 360 + targetAngle;

    // 회전 시간을 5~6초로 설정 (더 긴장감 있게)
    const spinDuration = 5000 + Math.random() * 1000; // 5~6초

    // CSS 변수로 최종 회전 각도 전달
    const rouletteElement = document.querySelector(".roulette-svg");
    if (rouletteElement) {
      rouletteElement.style.setProperty(
        "--final-rotation",
        `${finalRotation}deg`
      );
      rouletteElement.style.setProperty("--spin-duration", `${spinDuration}ms`);
    }

    setTimeout(() => {
      setResult(randomPrize);
      setIsSpinning(false);
      // 룰렛 사용 완료 처리 (인증 상태는 유지)
      localStorage.setItem("rouletteUsed", "true");
      setRouletteUsed(true);
    }, spinDuration);
  };

  const canSpin = isVerified && !rouletteUsed;

  return (
    <div className="event-page">
      <div className="event-container">
        <h1 className="event-title">영수증 인증하기</h1>

        <div className="event-content">
          <div className="camera-section">
            <div className="upload-area">
              <div className="camera-box">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt="영수증"
                    className="receipt-image"
                  />
                ) : (
                  <div className="camera-placeholder">
                    <svg
                      className="upload-icon"
                      width="80"
                      height="80"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <p className="camera-text">영수증 이미지를 업로드하세요</p>
                    <p className="camera-subtext">
                      클릭하거나 드래그하여 파일을 선택
                    </p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="file-input"
                id="receipt-upload"
              />
              <label htmlFor="receipt-upload" className="upload-button">
                {selectedImage ? "다른 이미지 선택" : "이미지 선택하기"}
              </label>
              {isVerified && (
                <div className="verification-success">
                  <div className="success-icon">✓</div>
                  <p className="success-text">인증 완료</p>
                </div>
              )}
            </div>
          </div>

          <div className="roulette-section-inline">
            {!canSpin && (
              <div className="roulette-overlay">
                {!isVerified ? (
                  <>
                    <div className="overlay-icon">🔒</div>
                    <p className="overlay-message">
                      영수증 인증 후<br />
                      룰렛을 돌릴 수 있습니다
                    </p>
                  </>
                ) : (
                  <>
                    <div className="overlay-icon">✓</div>
                    <p className="overlay-message">
                      이미 룰렛을
                      <br />
                      돌리셨습니다
                    </p>
                  </>
                )}
              </div>
            )}
            <div className="roulette-wrapper-inline">
              {/* 화살표 포인터 */}
              <div className="roulette-pointer">
                <svg
                  width="40"
                  height="50"
                  viewBox="0 0 60 80"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M30 80 L0 20 L30 30 L60 20 Z"
                    fill="#FF4444"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <path
                    d="M30 30 L30 0"
                    stroke="#FF4444"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div
                className={`roulette-container ${!canSpin ? "disabled" : ""}`}
              >
                <svg
                  className={`roulette-svg ${isSpinning ? "spinning" : ""}`}
                  viewBox="0 0 400 400"
                >
                  <circle
                    cx="200"
                    cy="200"
                    r="200"
                    fill="#ffffff"
                    stroke="rgba(255, 255, 255, 0.9)"
                    strokeWidth="6"
                  />
                  {prizes.map((prize, index) => {
                    const angle = (360 / prizes.length) * index;
                    const sectorAngle = 360 / prizes.length;
                    const startAngle = ((angle - 90) * Math.PI) / 180;
                    const endAngle =
                      ((angle + sectorAngle - 90) * Math.PI) / 180;
                    const x1 = 200 + 200 * Math.cos(startAngle);
                    const y1 = 200 + 200 * Math.sin(startAngle);
                    const x2 = 200 + 200 * Math.cos(endAngle);
                    const y2 = 200 + 200 * Math.sin(endAngle);
                    const largeArc = sectorAngle > 180 ? 1 : 0;
                    const textAngle = angle + sectorAngle / 2;
                    const textRadius = 120;
                    const labelX =
                      200 +
                      textRadius * Math.cos(((textAngle - 90) * Math.PI) / 180);
                    const labelY =
                      200 +
                      textRadius * Math.sin(((textAngle - 90) * Math.PI) / 180);

                    return (
                      <g key={prize.id}>
                        <path
                          d={`M 200 200 L ${x1} ${y1} A 200 200 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          fill={index % 2 === 0 ? "#002546" : "#ffffff"}
                          stroke="rgba(0, 0, 0, 0.1)"
                          strokeWidth="1"
                        />
                        <text
                          x={labelX}
                          y={labelY - 6}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill={index % 2 === 0 ? "#ffffff" : "#002546"}
                          fontSize="18"
                          fontWeight="700"
                          fontFamily="Cafe24 Ssurround, sans-serif"
                          letterSpacing="0.5px"
                        >
                          {prize.name}
                        </text>
                        {(prize.amount || prize.text) && (
                          <text
                            x={labelX}
                            y={labelY + 16}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill={index % 2 === 0 ? "#ffffff" : "#002546"}
                            fontSize="12"
                            fontFamily="Gmarket Sans TTF, sans-serif"
                            letterSpacing="0.3px"
                          >
                            {prize.amount ? `₩${prize.amount}` : prize.text}
                          </text>
                        )}
                      </g>
                    );
                  })}
                  <circle
                    cx="200"
                    cy="200"
                    r="60"
                    fill="#d9d9d9"
                    stroke="rgba(255, 255, 255, 0.9)"
                    strokeWidth="3"
                  />
                  <circle cx="200" cy="200" r="50" fill="#ffffff" />
                </svg>
              </div>
              <div className="roulette-center">
                <button
                  className={`spin-button ${
                    canSpin ? "spin-button-start" : ""
                  }`}
                  onClick={handleSpin}
                  disabled={isSpinning || !canSpin}
                >
                  {canSpin ? "START" : rouletteUsed ? "완료" : "🔒"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {result && (
          <div className="result-modal">
            <div className="result-content">
              <div className="result-icon">🎉</div>
              <h2 className="result-title">축하합니다!</h2>
              <p className="result-text">
                {result.name} {result.amount || result.text}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Event;
