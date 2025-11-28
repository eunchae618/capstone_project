import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const [selectedStoreIndex, setSelectedStoreIndex] = useState(0);
  const storesContainerRef = useRef(null);

  const stores = [
    { id: 1, name: "상린", image: "r1_img.jpeg" },
    { id: 2, name: "푸릉", image: "r2_img.jpeg" },
    { id: 3, name: "동신냉삼집", image: "r3_img.jpeg" },
    { id: 4, name: "따뜻한 한끼", image: "r4_img.jpeg" },
    { id: 5, name: "한림양장", image: "r5_img.jpeg" },
  ];

  // 카드들을 반복시켜서 무한 루프 효과
  const repeatedStores = [...stores, ...stores, ...stores];
  const baseIndex = stores.length; // 중간 세트의 시작 인덱스

  const handleStoreClick = (index) => {
    setSelectedStoreIndex(index);
  };

  const handlePrevStore = () => {
    const newIndex =
      selectedStoreIndex === 0 ? stores.length - 1 : selectedStoreIndex - 1;
    setSelectedStoreIndex(newIndex);
  };

  const handleNextStore = () => {
    const newIndex =
      selectedStoreIndex === stores.length - 1 ? 0 : selectedStoreIndex + 1;
    setSelectedStoreIndex(newIndex);
  };

  // 현재 선택된 카드의 실제 인덱스 (반복된 배열에서)
  const currentDisplayIndex = baseIndex + selectedStoreIndex;

  return (
    <div className="home">
      <div
        className="main-hero"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/images/hallym_map.png)`,
        }}
      >
        <div className="hero-background"></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="search-section">
            <div className="search-box">
              <p className="search-placeholder">
                관심있는 가게를 빠르게 확인해보세요.
              </p>
              <div
                className="search-icon"
                style={{
                  backgroundImage: `url(${process.env.PUBLIC_URL}/images/search.png)`,
                }}
              ></div>
            </div>
            <Link to="/ai-chat" className="ai-chat-button">
              AI Chat 사용하기
            </Link>
          </div>
          <h1 className="hero-title">CHOICE YOUR STORE</h1>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <span className="section-label">상권 소개</span>
          <h2 className="section-title">
            청춘의 열정이 살아 숨 쉬는 거리
            <br />
            한림대 앞 이야기
          </h2>
          <button className="more-button">가게 더보기</button>
        </div>

        <div className="stores-slider-container">
          <div className="stores-section" ref={storesContainerRef}>
            {repeatedStores.map((store, index) => {
              const relativeIndex = index % stores.length;
              const isCenter = index === currentDisplayIndex;
              const distanceFromCenter = Math.abs(index - currentDisplayIndex);

              // 가운데에서 좌우 2개씩만 보이도록
              if (distanceFromCenter > 2) {
                return null;
              }

              return (
                <div
                  key={`${store.id}-${index}`}
                  className={`store-card ${
                    isCenter ? "store-card-selected" : ""
                  } store-card-pos-${index - currentDisplayIndex}`}
                  onClick={() => handleStoreClick(relativeIndex)}
                  style={{
                    "--distance": distanceFromCenter,
                    "--position": index - currentDisplayIndex,
                  }}
                >
                  <img
                    src={`${process.env.PUBLIC_URL}/images/${store.image}`}
                    alt={store.name}
                    className="store-image"
                  />
                  <div className="store-name">{store.name}</div>
                </div>
              );
            })}
          </div>

          <div className="store-navigation">
            <button
              className="nav-arrow nav-arrow-left"
              onClick={handlePrevStore}
            >
              <img
                src={`${process.env.PUBLIC_URL}/images/page.png`}
                alt="이전 가게"
              />
            </button>
            <div className="store-indicator">
              {selectedStoreIndex + 1} / {stores.length}
            </div>
            <button
              className="nav-arrow nav-arrow-right"
              onClick={handleNextStore}
            >
              <img
                src={`${process.env.PUBLIC_URL}/images/page.png`}
                alt="다음 가게"
              />
            </button>
          </div>
        </div>
      </div>

      <div
        className="apply-section"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/images/hallym_img2.jpg)`,
        }}
      >
        <div className="apply-overlay"></div>
        <div className="apply-content">
          <div className="apply-text-section">
            <h2 className="apply-title">APPLY</h2>
            <p className="apply-subtitle">
              이 거리의 주인공은 바로 사장님입니다.
            </p>
            <p className="apply-description">
              가게 등록으로 함께 성장하는 상권의 일원이 되어주세요.
            </p>
          </div>
          <Link to="/apply" className="apply-button">
            APPLICATION FORM
          </Link>
        </div>
      </div>

      <footer className="footer">
        <p className="footer-text">
          문의사항 - 이메일 : 20222534@hallym.ac.kr | 전화번호 : 010-1234-5678
        </p>
      </footer>
    </div>
  );
};

export default Home;
