import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function MovieDetail() {
  const { movieID } = useParams(); // URL에서 movieID 가져오기
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMovieDetail = async () => {
    try {
      // 서버에서 영화 상세 정보를 가져오는 URL로 수정
      const response = await fetch(`http://localhost:5001/movies/${movieID}`, {
        cache: "no-store", // 캐시 무시
      });

      if (!response.ok) {
        throw new Error("영화 정보를 가져오는 데 실패했습니다.");
      }

      const data = await response.json();
      setMovie(data); // 영화 상세 정보 저장
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovieDetail();
  }, [movieID]); // movieID가 변경될 때마다 상세 정보를 다시 가져옴

  // 로딩 중이거나 영화 데이터가 없다면 '로딩 중...' 메시지를 표시
  if (loading) return <p>로딩 중...</p>;
  if (!movie) return <p>영화 정보를 불러오지 못했습니다.</p>;

  return (
    <div>
      <h2>{movie.title}</h2>
      <img
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
      />
      <p>{movie.overview}</p> {/* 영화 설명 */}
      <p>개봉일: {movie.release_date}</p> {/* 개봉일 */}
      <p>평점: {movie.vote_average}</p> {/* 평점 */}
    </div>
  );
}

export default MovieDetail;
