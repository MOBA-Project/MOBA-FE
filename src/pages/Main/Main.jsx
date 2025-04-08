import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "../Main/Main.css";
import Menu from "../../assets/components/Sidebar/Menu";

// 서버에서 가져올 영화 데이터 상태를 관리
const Main = () => {
  const swiperRef = useRef(null); // Swiper 인스턴스를 참조할 수 있도록 useRef 사용
  const [movies, setMovies] = useState([]); // 영화 데이터를 저장할 상태
  const [error, setError] = useState(null); // 오류 상태 추가
  const [backgroundVideo, setBackgroundVideo] = useState(null);

  const fetchMovieVideos = async (movieId) => {
    try {
      const response = await axios.get(
        `http://localhost:5001/movies/${movieId}/videos`
      );
      return response.data.results;
    } catch (error) {
      console.error("동영상을 가져오는 중 오류 발생:", error);
      throw new Error("동영상을 가져오는 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    // 서버에서 인기 영화 데이터를 가져오는 함수
    const fetchMovies = async () => {
      try {
        const response = await axios.get("http://localhost:5001/movies"); // 서버의 엔드포인트 호출
        if (Array.isArray(response.data.results)) {
          // 배열인 경우 최대 10개의 슬라이드만 저장
          const highRatedMovies = response.data.results.filter(
            (movie) => movie.vote_average >= 8
          );
          setMovies(highRatedMovies); // 필터링된 영화 데이터를 상태에 저장
          setMovies(response.data.results.slice(0, 10));
        } else {
          throw new Error("영화 데이터가 배열이 아닙니다.");
        }
      } catch (error) {
        console.error("영화 데이터를 가져오는 중 오류 발생:", error);
        setError("영화 데이터를 가져오는 중 오류가 발생했습니다."); // 오류 상태 업데이트
      }
    };

    fetchMovies(); // 데이터 가져오기 함수 호출
  }, []); // 컴포넌트가 처음 렌더링될 때만 호출됨

  const updateBackgroundVideo = async (index) => {
    const selectedMovie = movies[index];
    if (selectedMovie) {
      try {
        const videos = await fetchMovieVideos(selectedMovie.id);
        if (videos.length > 0) {
          // 첫 번째 동영상 선택 (예: YouTube 동영상)
          const video = videos.find((v) => v.site === "YouTube");
          if (video) {
            setBackgroundVideo(
              `https://www.youtube.com/embed/${video.key}?autoplay=1&controls=0&loop=1&playlist=${video.key}`
            );
          }
        }
      } catch (error) {
        console.error("동영상 데이터 가져오기 중 오류 발생:", error);
      }
    }
  };

  const handleSlideChange = (swiper) => {
    // 슬라이드 변경 시 동영상 업데이트
    const activeIndex = swiper.activeIndex;
    updateBackgroundVideo(activeIndex);
  };

  if (error) {
    return <div>{error}</div>; // 오류 메시지 표시
  }

  return (
    <>
      <Menu />
      <div className="backgroundVideo">
        {backgroundVideo && (
          <iframe
            src={backgroundVideo}
            style={{ border: "none" }}
            allow="autoplay; fullscreen"
            allowFullScreen
            title="Background Video"
          />
        )}
      </div>
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
            // 초기 슬라이드의 동영상을 설정합니다.
            updateBackgroundVideo(swiper.activeIndex);
          }}
          onSlideChange={handleSlideChange} // 슬라이드 변경 시 동영상 업데이트
        >
          {movies.map((movie, index) => (
            <SwiperSlide key={movie.id}>
              <img
                className="slideImg"
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} // TMDb에서 제공하는 포스터 이미지 URL
                alt={movie.title}
                style={{
                  cursor: "pointer",
                  width: "300px",
                  height: "300px",
                  objectFit: "cover",
                }}
                onClick={() => {
                  if (swiperRef.current) {
                    swiperRef.current.slideTo(index); // 슬라이드로 이동
                  }
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  );
};

export default Main;
