import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { IMAGE_BASE_URL } from "../../config";
import { getCurrentUser, isMovieLiked, toggleLike } from "../../shared/utils/userData";
import CommentsThread from './components/CommentsThread';
import { useQuery } from '@tanstack/react-query';
import { fetchMovieDetail } from './api';

function MovieDetail() {
  const { movieID } = useParams<{ movieID: string }>();
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; nick: string } | null>(null);
  const [liked, setLiked] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);

  const { data: movieData, isLoading } = useQuery({
    queryKey: ['movie', movieID],
    queryFn: () => fetchMovieDetail(movieID as string),
  });
  useEffect(() => { setMovie(movieData); setLoading(isLoading); }, [movieData, isLoading]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const u = await getCurrentUser();
      if (!mounted) return;
      setUser(u);
      if (u && movieID) setLiked(isMovieLiked(u.id, Number(movieID)));
    })();
    return () => {
      mounted = false;
    };
  }, [movieID]);

  // 로딩 중이거나 영화 데이터가 없다면 '로딩 중...' 메시지를 표시
  if (loading) return <p>로딩 중...</p>;
  if (!movie) return <p>영화 정보를 불러오지 못했습니다.</p>;

  const onToggleLike = () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    const res = toggleLike(user.id, movie);
    setLiked(res.liked);
  };

  // 기존 리뷰 등록 로직은 댓글 기능으로 대체

  return (
    <div style={{ width: "70%", margin: "1rem auto" }}>
      <h2 style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {movie.title}
        <button onClick={onToggleLike} style={{ padding: "6px 10px" }}>
          {liked ? "★ 북마크 해제" : "☆ 북마크"}
        </button>
      </h2>
      <img
        src={`${IMAGE_BASE_URL}w500${movie.poster_path}`}
        alt={movie.title}
        style={{ maxWidth: 300, borderRadius: 4 }}
      />
      <div style={{ marginTop: 16 }}>
        <p>{movie.overview}</p>
        <p>개봉일: {movie.release_date}</p>
        <p>평점: {movie.vote_average}</p>
      </div>

      <hr style={{ margin: "24px 0" }} />
      <CommentsThread movieId={Number(movieID)} user={user} />
    </div>
  );
}

export default MovieDetail;
