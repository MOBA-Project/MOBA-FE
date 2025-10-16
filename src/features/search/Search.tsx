import React, { useState } from "react";
import { Row } from "antd";
import Movie from "../movies/components/MovieCard";
import { useQuery } from "@tanstack/react-query";
import { searchMovies } from "../movies/api";

const Search = () => {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const { data, refetch, isFetching, isError } = useQuery({
    queryKey: ["search", query],
    enabled: false,
    queryFn: () => searchMovies(query, 1),
  });
  const doSearch = async () => {
    if (!query.trim()) return;
    await refetch();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") doSearch();
  };

  return (
    <div className="mpgContainer">
      <div className="mpgTitle" style={{ width: "70%", margin: "1rem auto" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="영화 제목을 검색하세요"
            style={{ flex: 1, padding: "10px 12px", fontSize: 16 }}
          />
          <button onClick={doSearch} style={{ padding: "10px 16px" }}>
            검색
          </button>
        </div>
        {isFetching && <p>검색 중...</p>}
        {isError && <p>검색 중 오류가 발생했습니다.</p>}
        <Row gutter={[32, 32]}>
          {(data?.results || []).map((movie: any) => (
            <Movie key={movie.id} movieData={movie} />
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Search;
