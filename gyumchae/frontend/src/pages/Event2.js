import React, { useState, useRef } from "react";
import "./Event2.css";

const Event2 = () => {
  const [isScratched, setIsScratched] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const canvasRef = useRef(null);

  const handleScratch = (e) => {
    if (isScratched) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const x = e.clientX - canvas.getBoundingClientRect().left;
    const y = e.clientY - canvas.getBoundingClientRect().top;

    const ctx = canvas.getContext("2d");
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let scratchedPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) {
        scratchedPixels++;
      }
    }

    const scratchedPercent = (scratchedPixels / (pixels.length / 4)) * 100;

    if (scratchedPercent > 30) {
      setIsScratched(true);
      setRevealed(true);
    }
  };

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = 726;
    canvas.height = 417;

    // 배경 그리기
    ctx.fillStyle = "#002546";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 스크래치 레이어
    ctx.fillStyle = "#d9d9d9";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  React.useEffect(() => {
    initCanvas();
  }, []);

  return (
    <div className="event2-page">
      <div className="event2-container">
        <h1 className="event2-title">스크래치 이벤트</h1>
        <div className="scratch-section">
          <div className="scratch-wrapper">
            <canvas
              ref={canvasRef}
              className="scratch-canvas"
              onMouseMove={handleScratch}
              onTouchMove={(e) => {
                e.preventDefault();
                const touch = e.touches[0];
                handleScratch({
                  clientX: touch.clientX,
                  clientY: touch.clientY,
                });
              }}
            />
            {revealed && (
              <div className="scratch-content">
                <div className="scratch-line"></div>
                <p className="scratch-text">여기를 스크레치 하세요</p>
                <div className="scratch-line"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Event2;
