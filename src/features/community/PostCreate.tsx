import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AiFillStar } from "react-icons/ai";
import { BiSearch } from "react-icons/bi";
import { createPost } from "./api";
import { searchMovies, fetchMovieDetail } from "../movies/api";
import "./PostCreate.css";

const PostCreate: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searching, setSearching] = useState(false);

  const doSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const d = await searchMovies(query, 1);
      setResults(d.results || []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const mid = params.get("movieId");
    if (!mid) return;
    (async () => {
      try {
        const mv = await fetchMovieDetail(mid);
        setSelected({
          id: mv.id,
          title: mv.title || mv.name,
          poster_path: mv.poster_path,
        });
      } catch {}
    })();
  }, [params]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const token =
      localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (!token) {
      return setError("로그인이 필요합니다. 먼저 로그인해주세요.");
    }
    if (!selected) return setError("영화를 선택하세요.");
    if (!title.trim() || !content.trim())
      return setError("제목/본문을 입력하세요.");

    setSubmitting(true);
    try {
      const p = await createPost({
        title: title.trim(),
        content: content.trim(),
        movieId: selected.id,
        movieTitle: selected.title || selected.name,
        moviePoster: selected.poster_path || null,
        rating: Math.max(1, Math.min(5, Number(rating))) || 5,
      });
      navigate(`/community/posts/${p._id}`);
    } catch (e: any) {
      setError(e?.message || "작성 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="postCreateContainer">
      <div className="postCreateContent">
        <form onSubmit={onSubmit} className="postCreateForm">
          <h2>감상문 작성</h2>
          {/* 영화 선택 */}
          <div className="formSection">
            <label className="formLabel">영화 선택 *</label>
            {!selected ? (
              <div className="movieSearch">
                <div className="searchBox">
                  <input
                    type="text"
                    className="searchInput"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="영화 제목을 검색하세요"
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), doSearch())
                    }
                  />
                  <button
                    type="button"
                    className="searchButton"
                    onClick={doSearch}
                    disabled={searching}
                  >
                    <BiSearch size={20} />
                  </button>
                </div>

                {results.length > 0 && (
                  <div className="searchResults">
                    {results.map((m) => (
                      <div
                        key={m.id}
                        className="movieResultItem"
                        onClick={() => setSelected(m)}
                      >
                        {m.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w92${m.poster_path}`}
                            alt={m.title || m.name}
                            className="resultPoster"
                          />
                        ) : (
                          <div className="resultPlaceholder">?</div>
                        )}
                        <div className="resultInfo">
                          <div className="resultTitle">{m.title || m.name}</div>
                          <div className="resultMeta">
                            {m.release_date?.substring(0, 4) || "N/A"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="selectedMovie">
                {selected.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${selected.poster_path}`}
                    alt={selected.title || selected.name}
                    className="selectedPoster"
                  />
                ) : (
                  <div className="selectedPlaceholder">?</div>
                )}
                <div className="selectedInfo">
                  <div className="selectedTitle">
                    {selected.title || selected.name}
                  </div>
                  <div className="selectedId">ID: {selected.id}</div>
                </div>
                <button
                  type="button"
                  className="changeButton"
                  onClick={() => {
                    setSelected(null);
                    setResults([]);
                  }}
                >
                  변경
                </button>
              </div>
            )}
          </div>

          {/* 제목 */}
          <div className="formSection">
            <label className="formLabel">제목 *</label>
            <input
              type="text"
              className="textInput"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="감상문 제목을 입력하세요"
              maxLength={100}
            />
          </div>

          {/* 평점 */}
          <div className="formSection">
            <label className="formLabel">평점 (1-5) *</label>
            <div className="ratingInput">
              <input
                type="number"
                min={1}
                max={5}
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              />
              <AiFillStar size={20} color="#4a5fc1" />
            </div>
          </div>

          {/* 본문 */}
          <div className="formSection">
            <label className="formLabel">본문 *</label>
            <textarea
              className="textArea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="영화에 대한 감상을 자유롭게 작성해주세요"
              rows={12}
            />
          </div>

          {error && <div className="errorMessage">{error}</div>}

          <div className="formActions">
            <button className="submitBtn" type="submit" disabled={submitting}>
              {submitting ? "작성 중..." : "작성 완료"}
            </button>
            <button
              className="cancelBtn"
              type="button"
              onClick={() => navigate(-1)}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostCreate;
