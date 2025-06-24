import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "../Main/Main.css";
import Menu from "../../assets/components/Sidebar/Menu";

const Main = () => {
  const swiperRef = useRef(null);
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);
  const [backgroundVideo, setBackgroundVideo] = useState(null);
  const [videoMap, setVideoMap] = useState({});

  // 🎬 비디오 데이터 캐시해서 가져오기
  const fetchMovieVideo = async (movieId) => {
    if (videoMap[movieId]) return videoMap[movieId];

    try {
      const response = await axios.get(
        `http://localhost:5001/movies/${movieId}/videos`
      );
      const video = response.data.results.find((v) => v.site === "YouTube");

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

    const video = await fetchMovieVideo(selectedMovie.id);
    if (video) {
      setBackgroundVideo(
        `https://www.youtube.com/embed/${video.key}?autoplay=1&controls=0&loop=1&playlist=${video.key}`
      );
    }
  };

  // ✅ 영화 데이터 가져오기
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get("http://localhost:5001/movies");

        if (Array.isArray(response.data.results)) {
          const filteredMovies = response.data.results
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
      for (let i = 0; i < Math.min(3, movies.length); i++) {
        await fetchMovieVideo(movies[i].id);
      }
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
    </>
  );
};

export default Main;
