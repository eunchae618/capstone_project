import React, { useState, useEffect, useRef } from "react";
import "./Map.css";

const Map = () => {
  const [selectedCategory, setSelectedCategory] = useState("별점");
  const [sortOrder, setSortOrder] = useState("높은 순");
  const [searchQuery, setSearchQuery] = useState("");
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [places, setPlaces] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef(null);

  const categories = ["음식", "카페", "상점", "디저트"];

  // 한림대 좌표 (강원도 춘천시)
  const HALLYM_UNIV = {
    lat: 37.88607,
    lng: 127.73856,
  };

  // 네이버 지도 API 초기화
  useEffect(() => {
    const clientId = process.env.REACT_APP_NAVER_MAP_CLIENT_ID;

    if (!clientId) {
      console.error("네이버 지도 Client ID가 설정되지 않았습니다.");
      alert("네이버 지도 API 설정이 필요합니다. .env 파일을 확인해주세요.");
      return;
    }

    const initMap = () => {
      if (!mapRef.current) {
        console.error("지도 컨테이너를 찾을 수 없습니다.");
        return;
      }

      if (!window.naver || !window.naver.maps) {
        console.error("네이버 지도 API가 로드되지 않았습니다.");
        return;
      }

      try {
        // 지도 옵션 설정
        const mapOptions = {
          center: new window.naver.maps.LatLng(
            HALLYM_UNIV.lat,
            HALLYM_UNIV.lng
          ),
          zoom: 15,
        };

        // 지도 컨테이너 크기 확인
        const container = mapRef.current;
        console.log("지도 컨테이너:", container);
        console.log("지도 컨테이너 크기:", {
          width: container.offsetWidth,
          height: container.offsetHeight,
          clientWidth: container.clientWidth,
          clientHeight: container.clientHeight,
        });

        // 컨테이너 크기가 0이면 강제로 크기 설정
        if (container.offsetWidth === 0 || container.offsetHeight === 0) {
          console.warn(
            "지도 컨테이너 크기가 0입니다. 크기를 강제로 설정합니다."
          );
          container.style.width = "100%";
          container.style.height = "100%";
          container.style.minHeight = "400px";
        }

        // 지도 생성
        const map = new window.naver.maps.Map(container, mapOptions);
        setMap(map);

        console.log("✅ 지도 초기화 성공");
        console.log("지도 인스턴스:", map);
        console.log("지도 크기:", map.getSize());

        // 지도가 준비될 때까지 대기
        window.naver.maps.Event.addListener(map, "init", () => {
          console.log("✅ 지도 초기화 완료 (init 이벤트)");
          console.log("지도 크기 (init 후):", map.getSize());
        });

        // 지도 타일 로드 확인
        window.naver.maps.Event.addListener(map, "tilesloaded", () => {
          console.log("✅ 지도 타일 로드 완료");
          console.log("지도 타일 로드 후 크기:", map.getSize());
        });

        // 지도 크기 변경 감지
        window.naver.maps.Event.addListener(map, "resize", () => {
          console.log("지도 크기 변경됨:", map.getSize());
        });

        // 초기 검색은 제거 (Geocoder CORS 문제로 인해 사용자 검색 시에만 동작)
        // 사용자가 직접 검색할 때만 Geocoder를 사용하도록 함
      } catch (error) {
        console.error("지도 초기화 오류:", error);
        console.error("오류 상세:", error.message, error.stack);
        alert(
          `지도를 초기화하는 중 오류가 발생했습니다.\n\n오류: ${error.message}\n\nClient ID를 확인하고, 네이버 클라우드 플랫폼에서 서비스 환경 설정을 확인해주세요.`
        );
      }
    };

    // 이미 로드되어 있는지 확인
    if (window.naver && window.naver.maps) {
      initMap();
      return;
    }

    // 기존 스크립트가 있는지 확인 (신규/구버전 모두 확인)
    const existingScript = document.querySelector(
      'script[src*="oapi.map.naver.com"], script[src*="openapi.map.naver.com"]'
    );
    if (existingScript) {
      // 이미 로드된 경우 즉시 초기화 시도
      if (window.naver && window.naver.maps) {
        setTimeout(() => {
          initMap();
        }, 500);
      } else {
        existingScript.addEventListener("load", () => {
          setTimeout(() => {
            initMap();
          }, 500);
        });
      }
      return;
    }

    // 신규 Maps API 스크립트 로드
    const script = document.createElement("script");
    // 신규 Maps API 스크립트 URL
    // 참고: 신규 Maps API는 동일한 스크립트 URL을 사용합니다
    console.log("네이버 지도 API 스크립트 로드 시작, Client ID:", clientId);
    console.log("현재 URL:", window.location.href);
    console.log("Origin:", window.location.origin);

    // 신규 Maps API 스크립트 URL (ncpKeyId 파라미터 사용 - 공식 가이드 참고)
    // 참고: https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Getting-Started.html
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&submodules=geocoder`;
    script.type = "text/javascript";
    script.async = true;
    // 주의: crossOrigin 속성은 제거 (네이버 지도 API는 crossOrigin 없이 로드해야 함)

    script.onerror = (error) => {
      console.error("네이버 지도 API 스크립트 로드 실패:", error);
      console.error("사용된 Client ID:", clientId);
      alert(
        `네이버 지도 API를 불러오는 중 오류가 발생했습니다.\n\n확인 사항:\n1. 신규 Maps API용 Client ID가 올바른지 확인 (현재: ${clientId})\n2. 네이버 클라우드 플랫폼에서 Maps API 사용 권한 확인\n3. 서비스 환경에 http://localhost:3000 등록 확인\n4. 개발 서버 재시작 확인\n\n신규 Maps API 가이드: https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Getting-Started.html`
      );
    };

    // 스크립트 로드 완료 후 처리
    const checkNaverMaps = () => {
      let attempts = 0;
      const maxAttempts = 30; // 최대 3초 대기 (100ms * 30)

      const checkInterval = setInterval(() => {
        attempts++;

        // 상세한 로그 출력
        if (attempts === 1) {
          console.log("네이버 지도 API 로드 확인 시작...");
          console.log("window.naver:", window.naver);
          console.log("window.naver?.maps:", window.naver?.maps);
          console.log("window.naver?.maps?.Map:", window.naver?.maps?.Map);
        }

        if (window.naver && window.naver.maps && window.naver.maps.Map) {
          clearInterval(checkInterval);
          console.log("✅ 네이버 지도 신규 Maps API 로드 완료");
          console.log("Client ID:", clientId);
          initMap();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          console.error("❌ 네이버 지도 API 로드 타임아웃");
          console.error("현재 window.naver 상태:", window.naver);
          console.error("사용된 Client ID:", clientId);
          console.error("스크립트 URL:", script.src);

          // 인증 실패 원인 분석
          if (!window.naver) {
            console.error(
              "원인: window.naver가 정의되지 않음 - 스크립트 로드 실패 또는 인증 실패"
            );
          } else if (!window.naver.maps) {
            console.error(
              "원인: window.naver.maps가 정의되지 않음 - Maps API 초기화 실패"
            );
          } else if (!window.naver.maps.Map) {
            console.error(
              "원인: window.naver.maps.Map이 정의되지 않음 - Map 클래스 로드 실패"
            );
          }

          alert(
            `네이버 지도 API 인증에 실패했습니다.\n\n사용된 Client ID: ${clientId}\n\n확인 사항:\n1. 네이버 클라우드 플랫폼에서 신규 Maps API용 Client ID 발급 확인\n2. 서비스 환경에 http://localhost:3000 정확히 등록 확인\n3. Maps API 사용 권한 활성화 확인\n4. 개발 서버 재시작 확인\n5. 브라우저 콘솔에서 상세 오류 확인\n\n공지사항: https://www.ncloud.com/support/notice/all/1930\n가이드: https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Getting-Started.html`
          );
        }
      }, 100);
    };

    script.onload = () => {
      console.log(
        "네이버 지도 신규 Maps API 스크립트 로드 완료, 초기화 대기 중..."
      );
      checkNaverMaps();
    };

    // 스크립트를 head에 추가
    document.head.appendChild(script);

    // cleanup 함수
    return () => {
      // 컴포넌트 언마운트 시 마커 제거
      markers.forEach((marker) => marker.setMap(null));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 장소 검색 함수 (네이버 검색 API + Geocoder 사용)
  const searchPlaces = async (keyword, mapInstance) => {
    if (!keyword || !mapInstance) {
      console.error("검색 조건 불충족: keyword 또는 mapInstance가 없습니다.");
      return;
    }

    // 네이버 지도 API가 로드되었는지 확인
    if (!window.naver || !window.naver.maps) {
      console.error("네이버 지도 API가 로드되지 않았습니다.");
      return;
    }

    setIsSearching(true);

    // 기존 마커 제거
    markers.forEach((marker) => marker.setMap(null));
    setMarkers([]);
    setPlaces([]);

    // 검색어 정리
    let searchQuery = keyword.trim();

    // 검색어에 위치 정보가 없으면 추가
    if (
      !searchQuery.includes("춘천") &&
      !searchQuery.includes("강원") &&
      !searchQuery.includes("한림대")
    ) {
      searchQuery = `${searchQuery} 춘천시 한림대`;
    }

    console.log("검색 시작:", searchQuery);

    // 1. 백엔드 프록시를 통한 네이버 검색 API 호출 (키워드 검색)
    try {
      const { mapAPI } = await import("../utils/api");
      const searchQueryForAPI = searchQuery.trim();

      const data = await mapAPI.search(searchQueryForAPI, 10, 1);

      if (data.items && data.items.length > 0) {
        console.log("✅ 네이버 검색 API 결과:", data.items.length, "개");
        await handleSearchApiResults(data.items, mapInstance);
        setIsSearching(false);
        return;
      }
    } catch (error) {
      console.warn("네이버 검색 API 실패, Geocoder로 대체:", error.message);
    }

    // 2. 네이버 검색 API 실패 시 Geocoder로 주소 검색
    console.log("Geocoder 검색 시작:", searchQuery);

    // Geocoder 사용 (네이버 지도 JavaScript API v3)
    // 주의: Geocoder는 CORS 제한으로 클라이언트에서 직접 호출 시 오류 발생 가능
    // 신규 Maps API의 경우 서버 사이드 프록시를 통해 호출하거나,
    // 네이버 클라우드 플랫폼에서 CORS 설정이 필요할 수 있습니다

    // Service 존재 여부 확인
    if (!window.naver || !window.naver.maps) {
      console.error("네이버 지도 API가 로드되지 않았습니다.");
      alert(
        "네이버 지도 API가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요."
      );
      return;
    }

    if (!window.naver.maps.Service) {
      console.error("네이버 지도 Geocoder Service를 사용할 수 없습니다.");
      alert(
        "지도 검색 서비스를 사용할 수 없습니다.\n\n신규 Maps API로 전환이 필요할 수 있습니다.\n네이버 클라우드 플랫폼에서 신규 Maps API용 Client ID를 발급받아주세요."
      );
      return;
    }

    if (typeof window.naver.maps.Service.geocode !== "function") {
      console.error("Geocoder 함수를 사용할 수 없습니다.");
      alert("지도 검색 기능을 사용할 수 없습니다.");
      return;
    }

    try {
      // 네이버 지도 Geocoder 사용 (주소 검색)
      // 참고: Geocoder는 주소를 좌표로 변환하는 기능만 제공합니다
      // 키워드 검색(음식점, 카페 등)을 하려면 네이버 검색 API가 필요하며,
      // CORS 문제로 인해 백엔드 프록시를 통해 호출해야 합니다

      window.naver.maps.Service.geocode(
        {
          query: searchQuery,
        },
        (status, response) => {
          setIsSearching(false);

          // 오류 처리 개선
          try {
            // response가 유효한지 확인
            if (!response) {
              console.error("Geocoder 응답이 없습니다:", { status });
              alert(
                '검색 결과를 받을 수 없습니다.\n\n주소 형식으로 검색해주세요.\n예: "춘천시 한림대", "강원도 춘천시 한림대학교"'
              );
              return;
            }

            // ProgressEvent나 Event인 경우 (네트워크 오류)
            if (
              response instanceof ProgressEvent ||
              response instanceof Event
            ) {
              console.error("Geocoder 네트워크 오류:", { status, response });
              alert(
                "네트워크 오류가 발생했습니다.\n\n잠시 후 다시 시도해주세요."
              );
              return;
            }

            console.log("Geocoder 응답:", { status, response });

            // 상태 확인
            if (status === window.naver.maps.Service.Status.ERROR) {
              console.error("Geocoder 오류:", status);
              alert(
                '검색 중 오류가 발생했습니다.\n\n주소 형식으로 정확히 입력해주세요.\n예: "춘천시 한림대", "강원도 춘천시"'
              );
              return;
            }

            if (status !== window.naver.maps.Service.Status.OK) {
              console.error("Geocoder 상태 오류:", status);
              alert("검색에 실패했습니다.\n\n주소 형식으로 검색해주세요.");
              return;
            }

            // 결과 확인
            if (
              !response.result ||
              !response.result.items ||
              response.result.items.length === 0
            ) {
              console.log("검색 결과 없음");
              alert(
                '검색 결과가 없습니다.\n\n다른 주소로 검색해주세요.\n예: "춘천시 한림대", "강원도 춘천시"'
              );
              return;
            }

            console.log("✅ 검색 결과:", response.result.items.length, "개");
            handleGeocoderResults(response, mapInstance);
          } catch (parseError) {
            console.error("Geocoder 응답 처리 오류:", parseError);
            setIsSearching(false);
            alert(
              "검색 결과를 처리하는 중 오류가 발생했습니다.\n\n주소 형식으로 다시 검색해주세요."
            );
          }
        }
      );
    } catch (error) {
      console.error("Geocoder 호출 오류:", error);
      setIsSearching(false);
      alert(
        '검색 중 오류가 발생했습니다.\n\n주소 형식으로 검색해주세요.\n예: "춘천시 한림대", "강원도 춘천시"'
      );
    }
  };

  // 네이버 검색 API 결과 처리 함수
  const handleSearchApiResults = async (items, mapInstance) => {
    if (!window.naver || !window.naver.maps || !window.naver.maps.Service) {
      console.error("네이버 지도 API Service를 사용할 수 없습니다.");
      return;
    }

    const bounds = new window.naver.maps.LatLngBounds();
    const newMarkers = [];
    const newPlaces = [];
    let processedCount = 0;
    const totalItems = items.length;

    // 각 검색 결과의 주소를 좌표로 변환
    items.forEach((item, index) => {
      const address = item.address || item.roadAddress;
      if (!address) {
        processedCount++;
        if (processedCount === totalItems && newMarkers.length > 0) {
          mapInstance.fitBounds(bounds);
          setMarkers(newMarkers);
          setPlaces(newPlaces);
          console.log("✅ 검색 결과 표시 완료:", newMarkers.length, "개");
        }
        return;
      }

      window.naver.maps.Service.geocode(
        {
          query: address,
        },
        (status, geoResponse) => {
          processedCount++;

          if (
            status === window.naver.maps.Service.Status.OK &&
            geoResponse &&
            geoResponse.result &&
            geoResponse.result.items &&
            geoResponse.result.items.length > 0
          ) {
            const point = geoResponse.result.items[0].point;
            const position = new window.naver.maps.LatLng(point.y, point.x);
            bounds.extend(position);

            const marker = new window.naver.maps.Marker({
              position: position,
              map: mapInstance,
              title: item.title.replace(/<[^>]*>/g, ""),
            });

            const infoWindow = new window.naver.maps.InfoWindow({
              content: `
              <div style="padding: 12px; min-width: 200px; font-family: 'Gmarket Sans TTF', sans-serif;">
                <div style="font-weight: bold; margin-bottom: 6px; font-size: 15px; color: #002546;">${item.title.replace(
                  /<[^>]*>/g,
                  ""
                )}</div>
                <div style="font-size: 12px; color: #666; margin-bottom: 4px;">${item.address.replace(
                  /<[^>]*>/g,
                  ""
                )}</div>
                ${
                  item.category
                    ? `<div style="font-size: 11px; color: #999;">${item.category}</div>`
                    : ""
                }
                ${
                  item.telephone
                    ? `<div style="font-size: 11px; color: #999; margin-top: 4px;">📞 ${item.telephone}</div>`
                    : ""
                }
              </div>
            `,
            });

            window.naver.maps.Event.addListener(marker, "click", () => {
              markers.forEach((m) => {
                if (m.infoWindow) m.infoWindow.close();
              });
              infoWindow.open(mapInstance, marker);
            });

            marker.infoWindow = infoWindow;
            newMarkers.push(marker);
            newPlaces.push({
              id: index,
              name: item.title.replace(/<[^>]*>/g, ""),
              address: item.address.replace(/<[^>]*>/g, ""),
              phone: item.telephone || "",
              category: item.category || "",
              rating: (Math.random() * 2 + 3).toFixed(1),
              position: { lat: point.y, lng: point.x },
            });
          }

          // 모든 항목 처리 완료 시 지도 업데이트
          if (processedCount === totalItems) {
            if (newMarkers.length > 0) {
              mapInstance.fitBounds(bounds);
              setMarkers(newMarkers);
              setPlaces(newPlaces);
              console.log("✅ 검색 결과 표시 완료:", newMarkers.length, "개");
            } else {
              console.warn("좌표 변환 실패 - 주소를 확인할 수 없습니다.");
            }
          }
        }
      );
    });
  };

  // Geocoder 결과 처리 함수
  const handleGeocoderResults = (geoResponse, mapInstance) => {
    const bounds = new window.naver.maps.LatLngBounds();
    const newMarkers = [];
    const newPlaces = [];

    geoResponse.result.items.forEach((item, index) => {
      const position = new window.naver.maps.LatLng(item.point.y, item.point.x);
      bounds.extend(position);

      const marker = new window.naver.maps.Marker({
        position: position,
        map: mapInstance,
        title: item.address,
      });

      const infoWindow = new window.naver.maps.InfoWindow({
        content: `
          <div style="padding: 12px; min-width: 180px; font-family: 'Gmarket Sans TTF', sans-serif;">
            <div style="font-weight: bold; margin-bottom: 6px; font-size: 14px; color: #002546;">${
              item.address
            }</div>
            <div style="font-size: 12px; color: #666;">${
              item.roadAddress || item.address
            }</div>
          </div>
        `,
      });

      window.naver.maps.Event.addListener(marker, "click", () => {
        markers.forEach((m) => {
          if (m.infoWindow) m.infoWindow.close();
        });
        infoWindow.open(mapInstance, marker);
      });

      marker.infoWindow = infoWindow;
      newMarkers.push(marker);
      newPlaces.push({
        id: index,
        name: item.address,
        address: item.roadAddress || item.address,
        phone: "",
        category: "",
        rating: (Math.random() * 2 + 3).toFixed(1),
        position: { lat: item.point.y, lng: item.point.x },
      });
    });

    mapInstance.fitBounds(bounds);
    setMarkers(newMarkers);
    setPlaces(newPlaces);
  };

  // 검색 실행
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      return;
    }

    if (!map) {
      console.error("지도가 초기화되지 않았습니다.");
      return;
    }

    if (isSearching) {
      return; // 이미 검색 중이면 무시
    }

    searchPlaces(searchQuery, map);
  };

  // Enter 키로 검색
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 카테고리별 필터링 및 정렬
  const filteredAndSortedPlaces = () => {
    let filtered = [...places];

    // 카테고리 필터링
    if (selectedCategory !== "별점") {
      const categoryMap = {
        음식: ["음식점", "식당", "한식", "중식", "일식", "양식"],
        카페: ["카페", "커피"],
        상점: ["마트", "편의점", "상점"],
        디저트: ["디저트", "베이커리", "아이스크림"],
      };

      const keywords = categoryMap[selectedCategory] || [];
      filtered = filtered.filter((place) =>
        keywords.some((keyword) => place.category.includes(keyword))
      );
    }

    // 별점 정렬
    if (selectedCategory === "별점") {
      filtered.sort((a, b) => {
        if (sortOrder === "높은 순") {
          return parseFloat(b.rating) - parseFloat(a.rating);
        } else {
          return parseFloat(a.rating) - parseFloat(b.rating);
        }
      });
    }

    return filtered;
  };

  // 마커 클릭 시 해당 장소로 이동
  const handlePlaceClick = (place) => {
    if (map && window.naver) {
      const position = new window.naver.maps.LatLng(
        place.position.lat,
        place.position.lng
      );
      map.setCenter(position);
      map.setZoom(16);

      // 해당 마커의 인포윈도우 열기
      const marker = markers.find((m) => {
        const markerPos = m.getPosition();
        return (
          Math.abs(markerPos.lat() - place.position.lat) < 0.0001 &&
          Math.abs(markerPos.lng() - place.position.lng) < 0.0001
        );
      });

      if (marker && marker.infoWindow) {
        markers.forEach((m) => {
          if (m.infoWindow) m.infoWindow.close();
        });
        marker.infoWindow.open(map, marker);
      }
    }
  };

  return (
    <div className="map-page">
      <div className="map-container">
        <div className="map-content">
          <div className="map-area">
            <div
              ref={mapRef}
              className="naver-map"
              style={{ width: "100%", height: "100%" }}
            ></div>

            {/* 검색 UI 오버레이 - 왼쪽 위에 배치 */}
            <div className="search-top-overlay">
              <div className="search-box-top">
                <input
                  type="text"
                  placeholder="음식점, 카페 검색"
                  className="search-input-top"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isSearching}
                />
                {isSearching && (
                  <div className="search-loading-top">검색 중...</div>
                )}
                <button
                  className={`search-btn-top ${isSearching ? "searching" : ""}`}
                  onClick={handleSearch}
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <div className="spinner"></div>
                  ) : (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#040404"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* 카테고리 UI 오버레이 - 오른쪽에 배치 */}
            <div className="map-overlay">
              <div className="search-overlay">
                <div className="category-section">
                  <h3 className="category-title">카테고리 설정</h3>

                  {selectedCategory === "별점" && (
                    <div className="sort-section">
                      <div className="sort-label-wrapper">
                        <span className="sort-icon">⭐</span>
                        <span className="sort-label">별점 정렬</span>
                      </div>
                      <div className="sort-options">
                        <button
                          className={`sort-option ${
                            sortOrder === "높은 순" ? "active" : ""
                          }`}
                          onClick={() => setSortOrder("높은 순")}
                        >
                          <span className="sort-option-icon">↑</span>
                          높은 순
                        </button>
                        <button
                          className={`sort-option ${
                            sortOrder === "낮은 순" ? "active" : ""
                          }`}
                          onClick={() => setSortOrder("낮은 순")}
                        >
                          <span className="sort-option-icon">↓</span>
                          낮은 순
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="category-list">
                    <button
                      className={`category-item ${
                        selectedCategory === "별점" ? "active" : ""
                      }`}
                      onClick={() => setSelectedCategory("별점")}
                    >
                      <span className="category-icon">⭐</span>
                      <span>별점</span>
                    </button>
                    {categories.map((category) => {
                      const icons = {
                        음식: "🍽️",
                        카페: "☕",
                        상점: "🛒",
                        디저트: "🍰",
                      };
                      return (
                        <button
                          key={category}
                          className={`category-item ${
                            selectedCategory === category ? "active" : ""
                          }`}
                          onClick={() => setSelectedCategory(category)}
                        >
                          <span className="category-icon">
                            {icons[category] || "📍"}
                          </span>
                          <span>{category}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 검색 결과 목록 */}
                {filteredAndSortedPlaces().length > 0 && (
                  <div className="places-list">
                    <h4 className="places-title">검색 결과</h4>
                    <div className="places-items">
                      {filteredAndSortedPlaces().map((place) => (
                        <div
                          key={place.id}
                          className="place-item"
                          onClick={() => handlePlaceClick(place)}
                        >
                          <div className="place-name">{place.name}</div>
                          <div className="place-info">
                            <span className="place-rating">
                              ⭐ {place.rating}
                            </span>
                            <span className="place-address">
                              {place.address}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
