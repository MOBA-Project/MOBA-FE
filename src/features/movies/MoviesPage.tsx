import React, { useEffect, useState, useRef } from "react";
import "./MoviesPage.css";
import Menu from "../../shared/components/Sidebar/Menu";
import Movie from "./components/MovieCard";
import { Row } from "antd";
import { IMAGE_BASE_URL } from "../../config";
import Dropdown from "../../shared/components/Dropdown/Dropdown";
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchMovies, searchMovies } from './api';

const Moviespage = () => {
  const [view, setView] = useState<any>();
  const [Movies, setMovies] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [genre, setGenre] = useState<string>(""); // 현재 선택된 장르

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ['movies', genre],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchMovies(Number(pageParam), genre),
    placeholderData: (prev) => prev as any,
    getNextPageParam: (lastPage: any) => {
      // TMDB 응답: { page, total_pages }
      if (!lastPage) return undefined;
      const { page, total_pages } = lastPage;
      if (typeof page === 'number' && typeof total_pages === 'number' && page < total_pages) {
        return page + 1;
      }
      return undefined; // 더 이상 페이지 없음
    },
  });

  // 검색 상태
  const [query, setQuery] = useState<string>("");
  const {
    data: searchData,
    fetchNextPage: fetchNextSearch,
    isFetchingNextPage: isFetchingNextSearch,
    hasNextPage: hasNextSearch,
    isLoading: isLoadingSearch,
  } = useInfiniteQuery({
    queryKey: ['search-movies', query],
    enabled: query.trim().length > 0,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => searchMovies(query, Number(pageParam)),
    getNextPageParam: (lastPage: any) => {
      if (!lastPage) return undefined;
      const { page, total_pages } = lastPage;
      if (typeof page === 'number' && typeof total_pages === 'number' && page < total_pages) return page + 1;
      return undefined;
    }
  });

  const list = query.trim()
    ? (searchData?.pages || []).flatMap((p: any) => p.results || [])
    : (data?.pages || []).flatMap((p: any) => p.results || []);

  const handleNextPage = () => {
    fetchNextPage();
  };

  // 무한 스크롤 sentinel
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          if (query.trim()) {
            if (!isFetchingNextSearch && hasNextSearch) fetchNextSearch();
          } else {
            if (!isFetchingNextPage && hasNextPage) fetchNextPage();
          }
        }
      },
      { root: null, rootMargin: '300px', threshold: 0.01 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [query, isFetchingNextPage, hasNextPage, fetchNextPage, isFetchingNextSearch, hasNextSearch, fetchNextSearch]);

  const handleGenreClick = (selectedGenre) => {
    if (genre === selectedGenre) return;
    setMovies([]); // 장르가 바뀔 때 이전 데이터를 초기화
    setPage(1); // 페이지를 초기화
    setGenre(selectedGenre); // 클릭한 장르로 상태 업데이트
  };

  return (
    <div className="mpgContainer">
      <Menu />
      <div className="mpgTitle">
        <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom: 12 }}>
          <input
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
            placeholder="영화 제목 검색"
            style={{ padding:'8px 10px', flex:1, maxWidth:400 }}
            onKeyDown={(e)=>{ if(e.key==='Enter' && query.trim()){ /* trigger first page we rely on enabled */ } }}
          />
          {query && (<button onClick={()=>setQuery("")}>검색 지우기</button>)}
        </div>
        <div className="genreContainer">
          <ul>
            <li
              className={genre === "" ? "selectedGenre" : ""} // 선택된 장르에 클래스 적용
              onClick={() => handleGenreClick("")}
            >
              전체
            </li>
            <li
              className={genre === "action" ? "selectedGenre" : ""}
              onClick={() => handleGenreClick("action")}
            >
              액션
            </li>
            <li
              className={genre === "animation" ? "selectedGenre" : ""}
              onClick={() => handleGenreClick("animation")}
            >
              애니메이션
            </li>
            <li
              className={genre === "comedy" ? "selectedGenre" : ""}
              onClick={() => handleGenreClick("comedy")}
            >
              코미디
            </li>
            <li
              className={genre === "crime" ? "selectedGenre" : ""}
              onClick={() => handleGenreClick("crime")}
            >
              범죄
            </li>
            <li
              className={genre === "family" ? "selectedGenre" : ""}
              onClick={() => handleGenreClick("family")}
            >
              가족
            </li>
            <li
              className={genre === "fantasy" ? "selectedGenre" : ""}
              onClick={() => handleGenreClick("fantasy")}
            >
              판타지
            </li>
            <li
              className={genre === "horror" ? "selectedGenre" : ""}
              onClick={() => handleGenreClick("horror")}
            >
              공포
            </li>
            <li
              className={genre === "thriller" ? "selectedGenre" : ""}
              onClick={() => handleGenreClick("thriller")}
            >
              스릴러
            </li>
            <li
              className={genre === "romance" ? "selectedGenre" : ""}
              onClick={() => handleGenreClick("romance")}
            >
              로맨스
            </li>
            <li
              className={genre === "sci-fi" ? "selectedGenre" : ""}
              onClick={() => handleGenreClick("sci-fi")}
            >
              SF
            </li>
          </ul>
        </div>
        <hr />
        {(query.trim() ? isLoadingSearch : isLoading) && list.length === 0 ? (
          <div className="skeletonGrid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeletonCard" />
            ))}
          </div>
        ) : (
          <Row gutter={[32, 32]}>
            {list.map((movie: any) => (
              <Movie key={movie.id} movieData={movie} />
            ))}
          </Row>
        )}
      </div>
      {/* 무한 스크롤을 위한 센티넬 */}
      <div ref={sentinelRef} style={{ height: 1 }} />
    </div>
  );
};

export default Moviespage;
