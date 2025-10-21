import React, { useState } from "react";
import "../styles/Roulette.css";

const Roulette = () => {
  const items = ["1등🎉", "2등🥈", "3등🥉", "꽝❌", "보너스🎁", "다시🔁"];
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const spin = () => {
    if (isSpinning) return; // 돌리는 중엔 또 안 돌게
    setIsSpinning(true);

    const extra = Math.floor(Math.random() * 360);
    const newRotation = rotation + 360 * 5 + extra;

    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const selectedIndex =
        Math.floor((360 - (newRotation % 360)) / (360 / items.length)) %
        items.length;
      alert(`결과는... ${items[selectedIndex]} !!! 🎊`);
    }, 4000);
  };

  return (
    <div className="roulette-container">
      <div className="pointer"></div>
      <div className="roulette" style={{ transform: `rotate(${rotation}deg)` }}>
        {items.map((item, i) => (
          <div
            key={i}
            className="slice"
            style={{
              transform: `rotate(${(360 / items.length) * i}deg) skewY(${
                90 - 360 / items.length
              }deg)`,
              background: `hsl(${i * 60}, 80%, 60%)`,
            }}
          >
            {item}
          </div>
        ))}
      </div>
      <button onClick={spin} disabled={isSpinning}>
        {isSpinning ? "돌리는 중..." : "돌려!"}
      </button>
    </div>
  );
};

export default Roulette;
