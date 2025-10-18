import React, { useEffect, useState } from "react";
import { Row } from "antd";
import Movie from "../movies/components/MovieCard";
import "./MyList.css";
import { fetchMovieDetail } from "../movies/api";
import * as bookmarksApi from "../../shared/api/bookmarks";
import { getBookmarks as lsGetBookmarks } from "../../shared/utils/userData";
import { getRecommendationHistory, RecommendationHistoryItem, GENRE_MAP } from "../ai-recommendation/api";

const MyList = () => {
  const [userId, setUserId] = useState<string>("");
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [reviewed, setReviewed] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"bookmarks" | "reviewed" | "recommended">(
    "bookmarks"
  );

  // 추천 이력 필터
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | '7d' | '30d' | 'all'>("all");
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { getCurrentUser } = await import('../../shared/utils/userData');
        const u = await getCurrentUser();
        if (!u?.id) return;
        setUserId(u.id);
        // Load bookmarks from backend; fallback to localStorage
        bookmarksApi
          .list({ page: 1, limit: 100 })
          .then((resp) => {
            const mapped = resp.items.map((b: any) => ({
              id: b.movieId,
              title: b.movieTitle,
              poster_path: b.moviePoster,
              to: `/movie/${b.movieId}`,
            }));
            setBookmarks(mapped);
          })
          .catch(() => {
            setBookmarks(lsGetBookmarks(u.id));
          });
        // Fetch my reviews from backend and hydrate with movie summaries
        import('../../shared/api/fetcher').then(({ apiJson }) =>
          apiJson(`/reviews/user/me`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
          })
        )
          .then(async (reviews: any[]) => {
            if (!Array.isArray(reviews)) return setReviewed([]);
            const hydrated = await Promise.all(
              reviews.map(async (rv) => {
                try {
                  const mv = await fetchMovieDetail(rv.movieId);
                  return {
                    id: mv.id,
                    title: mv.title || mv.name,
                    poster_path: mv.poster_path,
                    to: `/movie/${mv.id}?review=${encodeURIComponent(rv._id)}`,
                  };
                } catch {
                  return {
                    id: rv.movieId,
                    title: `영화 ${rv.movieId}`,
                    to: `/movie/${rv.movieId}?review=${encodeURIComponent(rv._id)}`,
                  };
                }
              })
            );
            setReviewed(hydrated);
          })
          .catch(() => setReviewed([]));
      } catch {}
    })();
  }, []);

  // 추천 이력 가져오기
  const fetchRecommendations = async () => {
    if (!userId) return;

    setIsLoadingRecommended(true);
    try {
      const filters: RecommendationHistoryFilters = {
        userId,
        limit: 100,
      };

      // 기간 필터 적용
      if (selectedPeriod !== "all") {
        filters.period = selectedPeriod;
      }

      // 장르 필터 적용
      if (selectedGenre !== null) {
        filters.genreId = selectedGenre;
      }

      const response = await getRecommendationHistory(filters);
      const mapped = response.items.map((item: RecommendationHistoryItem) => ({
        id: item.movieId,
        title: item.title,
        poster_path: item.posterPath,
        to: `/movie/${item.movieId}`,
        recommendedAt: item.recommendedAt,
        score: item.score,
        reasons: item.reasons,
      }));
      setRecommended(mapped);
    } catch (err) {
      console.error("추천 이력 조회 실패:", err);
      setRecommended([]);
    } finally {
      setIsLoadingRecommended(false);
    }
  };

  // 추천 탭 활성화 또는 필터 변경 시 데이터 로드
  useEffect(() => {
    if (activeTab === "recommended" && userId) {
      fetchRecommendations();
    }
  }, [activeTab, userId, selectedPeriod, selectedGenre]);

  const list =
    activeTab === "bookmarks" ? bookmarks :
    activeTab === "reviewed" ? reviewed :
    recommended;

  // 장르 옵션 생성
  const genreOptions = Object.entries(GENRE_MAP).map(([key, id]) => ({
    label: key.charAt(0).toUpperCase() + key.slice(1),
    value: id,
  }));

  return (
    <div className="mylistContainer">
      <div className="mylistContent">
        <div className="mylistHeader">
          <h2 style={{ margin: 0 }}>Mylist</h2>
        </div>
        <div className="tabs">
          <button
            className={activeTab === "bookmarks" ? "tab active" : "tab"}
            onClick={() => setActiveTab("bookmarks")}
          >
            북마크 ({bookmarks.length})
          </button>
          <button
            className={activeTab === "reviewed" ? "tab active" : "tab"}
            onClick={() => setActiveTab("reviewed")}
          >
            리뷰 ({reviewed.length})
          </button>
          <button
            className={activeTab === "recommended" ? "tab active" : "tab"}
            onClick={() => setActiveTab("recommended")}
          >
            추천 받은 영화 ({recommended.length})
          </button>
        </div>

        {/* 추천 영화 탭 필터 */}
        {activeTab === "recommended" && (
          <div className="filterBar">
            <div className="filterGroup">
              <label className="filterLabel">기간</label>
              <div className="filterButtons">
                <button
                  className={selectedPeriod === "all" ? "filterBtn active" : "filterBtn"}
                  onClick={() => setSelectedPeriod("all")}
                >
                  전체
                </button>
                <button
                  className={selectedPeriod === "today" ? "filterBtn active" : "filterBtn"}
                  onClick={() => setSelectedPeriod("today")}
                >
                  오늘
                </button>
                <button
                  className={selectedPeriod === "7d" ? "filterBtn active" : "filterBtn"}
                  onClick={() => setSelectedPeriod("7d")}
                >
                  최근 7일
                </button>
                <button
                  className={selectedPeriod === "30d" ? "filterBtn active" : "filterBtn"}
                  onClick={() => setSelectedPeriod("30d")}
                >
                  최근 30일
                </button>
              </div>
            </div>

            <div className="filterGroup">
              <label className="filterLabel">장르</label>
              <div className="filterButtons genreScroll">
                <button
                  className={selectedGenre === null ? "filterBtn active" : "filterBtn"}
                  onClick={() => setSelectedGenre(null)}
                >
                  전체
                </button>
                {genreOptions.map((genre) => (
                  <button
                    key={genre.value}
                    className={selectedGenre === genre.value ? "filterBtn active" : "filterBtn"}
                    onClick={() => setSelectedGenre(genre.value)}
                  >
                    {genre.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {isLoadingRecommended && activeTab === "recommended" ? (
          <div className="loading">추천 이력을 불러오는 중...</div>
        ) : (
          <Row gutter={[32, 32]}>
            {list.length === 0 ? (
              <div className="emptyBox">
                {activeTab === "recommended"
                  ? "아직 추천 받은 영화가 없어요. AI 추천을 받아보세요!"
                  : "비어있어요. 마음에 드는 영화를 추가해보세요."}
              </div>
            ) : (
              list.map((m) => <Movie key={m.id} movieData={m} to={m.to} />)
            )}
          </Row>
        )}
      </div>
    </div>
  );
};

export default MyList;
