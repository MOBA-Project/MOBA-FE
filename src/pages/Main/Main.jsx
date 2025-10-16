import React, { useRef, useState, useEffect } from "react";
import { getMovies, getMovieVideos } from "features/movies/api/movies";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "../Main/Main.css";

const Main = () => {
  const swiperRef = useRef(null);
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);
  const [currentVideoKey, setCurrentVideoKey] = useState(null);
  const [muted, setMuted] = useState(true);
  const [videoMap, setVideoMap] = useState({});
  const [videoLoading, setVideoLoading] = useState(false);
  const iframeRef = useRef(null);
  const [playerReady, setPlayerReady] = useState(false);

  // YouTube iframe API command helper (postMessage)
  const sendYTCommand = (func, args = []) => {
    try {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentWindow) return;
      const msg = JSON.stringify({ event: "command", func, args });
      iframe.contentWindow.postMessage(msg, "*");
    } catch {}
  };

  // Listen for YouTube readiness messages
  useEffect(() => {
    const onMessage = (e) => {
      if (typeof e.data !== "string") return;
      let data;
      try {
        data = JSON.parse(e.data);
      } catch {
        return;
      }
      if (!data) return;
      if (data.event === "onReady") setPlayerReady(true);
      if (data.info && typeof data.info === "object") setPlayerReady(true);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // 🎬 비디오 데이터 캐시해서 가져오기
  const fetchMovieVideo = async (movieId) => {
    if (videoMap[movieId]) return videoMap[movieId];

    try {
      const results = await getMovieVideos(movieId);
      const video = results.find((v) => v.site === "YouTube");

      if (video) {
        setVideoMap((prev) => ({ ...prev, [movieId]: video }));
        return video;
      }
    } catch (error) {
      console.error("동영상을 가져오는 중 오류 발생:", error);
    }

    return null;
  };

  // 🎥 배경 비디오 설정
  const updateBackgroundVideo = async (index) => {
    const selectedMovie = movies[index];
    if (!selectedMovie) return;

    setVideoLoading(true);
    const video = await fetchMovieVideo(selectedMovie.id);
    if (video) {
      setCurrentVideoKey(video.key);
    } else {
      setVideoLoading(false);
    }
  };

  // ✅ 영화 데이터 가져오기
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await getMovies();

        if (Array.isArray(data.results)) {
          const filteredMovies = data.results
            .filter((movie) => movie.vote_average >= 7) // 평점 조건 완화
            .slice(0, 10); // 최대 10개
          setMovies(filteredMovies);
        } else {
          throw new Error("영화 데이터가 배열이 아닙니다.");
        }
      } catch (error) {
        console.error("영화 데이터를 가져오는 중 오류 발생:", error);
        setError("영화 데이터를 가져오는 중 오류가 발생했습니다.");
      }
    };

    fetchMovies();
  }, []);

  // ✅ 상위 3개 영화 비디오 미리 로딩
  useEffect(() => {
    const preload = async () => {
      // 모든 후보의 트레일러 키를 미리 가져와 캐시에 채워 둡니다.
      const ids = movies.slice(0, 12).map((m) => m.id);
      await Promise.allSettled(ids.map((id) => fetchMovieVideo(id)));
      // 가운데 슬라이드의 비디오로 초기화
      const center = Math.floor(movies.length / 2);
      updateBackgroundVideo(center);
    };

    if (movies.length > 0) preload();
  }, [movies]);

  const handleSlideChange = (swiper) => {
    updateBackgroundVideo(swiper.activeIndex);
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      <div className="backgroundVideo">
        {currentVideoKey && (
          <>
            <iframe
              ref={iframeRef}
              id="bg-youtube-player"
              src={`https://www.youtube.com/embed/${currentVideoKey}?autoplay=1&controls=0&loop=1&playlist=${currentVideoKey}&mute=${
                muted ? 1 : 0
              }&playsinline=1&rel=0&modestbranding=1&enablejsapi=1&origin=${encodeURIComponent(
                window.location.origin
              )}`}
              style={{ border: "none" }}
              loading="eager"
              allow="autoplay; fullscreen"
              allowFullScreen
              title="Background Video"
              onLoad={() => {
                setVideoLoading(false);
                // Sync mute state after load
                if (muted) {
                  sendYTCommand("mute");
                } else {
                  sendYTCommand("unMute");
                  sendYTCommand("setVolume", [100]);
                }
              }}
              onError={() => setVideoLoading(false)}
            />
            {videoLoading && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(0,0,0,0.25)",
                }}
              >
                <div style={{ color: "#fff" }}>Loading video…</div>
              </div>
            )}
          </>
        )}
      </div>
      {/* Always render control button outside of backgroundVideo to avoid stacking issues */}
      <button
        className="soundBtn"
        onClick={() => {
          setMuted((m) => {
            const next = !m;
            // Send command after a user gesture
            setTimeout(() => {
              if (next) {
                sendYTCommand("mute");
              } else {
                sendYTCommand("unMute");
                sendYTCommand("setVolume", [100]);
              }
            }, 0);
            return next;
          });
        }}
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          zIndex: 20,
          background: "rgba(0,0,0,0.5)",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          padding: "8px 12px",
          cursor: "pointer",
        }}
        aria-label={muted ? "소리 켜기" : "소리 끄기"}
        title={muted ? "소리 켜기" : "소리 끄기"}
      >
        {muted ? "🔇 음소거" : "🔊 소리 켜짐"}
      </button>
      <div className="swiperContainer">
        <Swiper
          effect={"coverflow"}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={5}
          spaceBetween={0}
          coverflowEffect={{
            rotate: 10,
            stretch: 0,
            depth: 300,
            modifier: 2,
            slideShadows: true,
          }}
          pagination={{ clickable: true }}
          loop={false}
          autoplay={{ delay: 20000, disableOnInteraction: false }}
          modules={[EffectCoverflow, Pagination, Autoplay]}
          className="mySwiper"
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            updateBackgroundVideo(swiper.activeIndex);
          }}
          onSlideChange={handleSlideChange}
        >
          {movies.map((movie, index) => (
            <SwiperSlide key={movie.id}>
              <img
                className="slideImg"
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                style={{
                  cursor: "pointer",
                  width: "300px",
                  height: "300px",
                  objectFit: "cover",
                }}
                onClick={() => {
                  if (swiperRef.current) {
                    swiperRef.current.slideTo(index);
                  }
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      {/** 초기 로드시 가운데 슬라이드로 이동 */}
      {movies && movies.length > 0 && (
        <InitCenterSlide
          moviesLength={movies.length}
          swiperRef={swiperRef}
          updateBackgroundVideo={updateBackgroundVideo}
        />
      )}
    </>
  );
};

// 헬퍼 컴포넌트: 초기 한번 가운데로 이동
const InitCenterSlide = ({
  moviesLength,
  swiperRef,
  updateBackgroundVideo,
}) => {
  useEffect(() => {
    const center = Math.floor(moviesLength / 2);
    if (swiperRef.current) {
      swiperRef.current.slideTo(center, 0);
      updateBackgroundVideo(center);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moviesLength]);
  return null;
};

export default Main;
