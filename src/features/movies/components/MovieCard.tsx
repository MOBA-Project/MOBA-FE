import React, { useEffect, useState } from "react";
import { Col } from "antd";
import { Link } from "react-router-dom";
import { IMAGE_BASE_URL } from "../../../config";
import {
  getCurrentUser,
  isMovieLiked,
  toggleLike,
} from "../../../shared/utils/userData";

type MovieSummary = {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  posterPath?: string;
  poster?: string;
};

type Props = {
  image?: string;
  movieID?: number;
  movieName?: string;
  movie?: MovieSummary;
  movieData?: MovieSummary;
};

function Movie({ image, movieID, movieName, movie, movieData }: Props) {
  const item = movie || movieData || null;
  const derivedId = movieID || item?.id;
  const derivedTitle = movieName || item?.title || item?.name;
  const derivedPoster =
    image || (item?.poster_path ? `${IMAGE_BASE_URL}w500${item.poster_path}` : "");

  const [user, setUser] = useState<{ id: string; nick: string } | null>(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const u = await getCurrentUser();
      if (mounted) setUser(u);
      if (mounted && u && derivedId) setLiked(isMovieLiked(u.id, derivedId));
    })();
    return () => {
      mounted = false;
    };
  }, [derivedId]);

  const onToggleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    const summary = (item || { id: derivedId, title: derivedTitle }) as MovieSummary;
    const res = toggleLike(user.id, summary as any);
    setLiked(res.liked);
  };

  return (
    <Col lg={6} md={8} xs={24}>
      <div style={{ position: "relative" }}>
        <Link to={`/movie/${derivedId}`}>
          {derivedPoster ? (
            <img
              style={{ width: "100%", height: "400px", objectFit: "cover" }}
              src={derivedPoster}
              alt={derivedTitle}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "400px",
                backgroundColor: "#e0e0e0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              이미지가 없습니다.
            </div>
          )}
          <button
            onClick={onToggleLike}
            aria-label="bookmark"
            title={liked ? "북마크 해제" : "북마크"}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "rgba(0,0,0,0.55)",
              color: liked ? "#ffd166" : "#fff",
              border: "none",
              borderRadius: 6,
              padding: "6px 8px",
              cursor: "pointer",
            }}
          >
            {liked ? "★" : "☆"}
          </button>
        </Link>
      </div>
    </Col>
  );
}

export default Movie;
