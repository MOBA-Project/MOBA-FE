import React, { useEffect, useState } from "react";
import "../Movies/Moviespage.css";
import Menu from "../../assets/components/Sidebar/Menu";
import Movie from "../../assets/components/Movie";
import { Row } from "antd";
import { IMAGE_BASE_URL } from "../../config";
import Dropdown from "../../assets/components/Dropdown/Drodown";

const Moviespage = () => {
  const [view, setView] = useState();
  const [Movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [genre, setGenre] = useState(""); // 현재 선택된 장르

  useEffect(() => {
    const genreParam = genre ? `&genre=${genre}` : "";
    fetch(`http://localhost:5001/movies?page=${page}${genreParam}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data.results);
        setMovies((prevMovies) => [...prevMovies, ...data.results]); // 기존 영화에 더해주는 방식으로 수정
      })
      .catch((error) => {
        console.error("Error fetching movies:", error);
      });
  }, [page, genre]);

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

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
        <Row gutter={[32, 32]}>
          {Movies && Movies.length > 0 ? (
            Movies.map((movie) => (
              <Movie
                key={movie.id}
                image={
                  movie.poster_path
                    ? `${IMAGE_BASE_URL}w500${movie.poster_path}`
                    : `https://via.placeholder.com/500x750?text=No+Image`
                }
                movieID={movie.id}
                movieName={movie.title}
              />
            ))
          ) : (
            <p>영화 목록을 불러오는 중...</p>
          )}
        </Row>
      </div>
      <div className="mpgBtnContainer">
        <button className="mpgBtn" onClick={handleNextPage}>
          더보기
        </button>
      </div>
    </div>
  );
};

export default Moviespage;
