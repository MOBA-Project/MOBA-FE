const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

// CORS 설정
app.use(cors());

// 요청에서 JSON 데이터를 파싱하기 위한 미들웨어
app.use(bodyParser.json());

// 가상 데이터베이스
let users = [];
const genresMap = {
  action: 28,
  animation: 16,
  comedy: 35,
  crime: 80,
  family: 10751,
  fantasy: 14,
  horror: 27,
  thriller: 53,
  romance: 10749,
  "sci-fi": 878,
};

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// 영화 데이터 API (페이지 + 장르별 영화 가져오기)
app.get("/movies", async (req, res) => {
  const { page = 1, genre } = req.query; // 클라이언트에서 page와 genre를 쿼리로 받음

  try {
    // 장르 ID 설정 (없으면 전체 영화)
    const genreId = genre ? genresMap[genre.toLowerCase()] : null;

    const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        language: "ko-KR",
        page: page,
        with_genres: genreId || null, // 장르가 있을 경우만 필터링
        region: "KR",
      },
    });

    res.json(response.data); // TMDb API에서 받은 데이터를 클라이언트에 전송
  } catch (error) {
    console.error("Error fetching data from TMDb:", error);
    res.status(500).json({ error: "Failed to fetch data from TMDb API" });
  }
});

// 영화 동영상 데이터 API
app.get("/movies/:id/videos", async (req, res) => {
  const movieId = req.params.id;
  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/movie/${movieId}/videos`,
      {
        params: {
          api_key: TMDB_API_KEY,
          language: "ko-KR",
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching movie videos from TMDb:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// 영화 상세 정보 API
app.get("/movies/:id", async (req, res) => {
  const movieId = req.params.id;
  try {
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: "ko-KR", // 한국어로 정보를 요청
      },
    });
    res.json(response.data); // 영화의 상세 정보를 클라이언트에 전달
  } catch (error) {
    console.error("Error fetching movie details from TMDb:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch movie details from TMDb API" });
  }
});

// 아이디 중복 체크 API
app.post("/check-id", (req, res) => {
  const { id } = req.body;
  const isDuplicate = users.some((user) => user.id === id);
  if (isDuplicate) {
    return res.status(409).json({ message: "이미 사용 중인 아이디입니다." });
  } else {
    return res.status(200).json({ message: "사용 가능한 아이디입니다." });
  }
});

// 회원가입 API
app.post("/signup", (req, res) => {
  const { id, pw, nick } = req.body;
  if (!id || !pw) {
    return res
      .status(400)
      .json({ message: "아이디와 비밀번호를 입력해주세요." });
  }

  // 새로운 유저 추가
  users.push({ id, pw, nick });
  res.status(201).json({ message: "회원가입이 완료되었습니다." });
});

// 로그인 API
app.post("/login", (req, res, next) => {
  const { id, pw } = req.body;

  if (!id || !pw) {
    return res
      .status(400)
      .json({ message: "아이디와 비밀번호를 입력해주세요." });
  }

  // 유저 확인
  const user = users.find((user) => user.id === id && user.pw === pw);
  if (user) {
    // JWT 발행
    const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ token });
  } else {
    // 인증 실패 시
    res
      .status(401)
      .json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });
  }
});

// 인증이 필요한 라우트 예시
app.get("/protected", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer 토큰 처리

  if (!token) {
    return res.status(403).json({ message: "토큰이 제공되지 않았습니다." });
  }

  // 토큰 검증
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "토큰이 유효하지 않습니다." });
    } else {
      // 유저 정보를 반환
      const user = users.find((user) => user.id === decoded.id);
      if (user) {
        return res.json({ message: "인증 성공", nick: user.nick, id: user.id });
      } else {
        return res.status(404).json({ message: "유저를 찾을 수 없습니다." });
      }
    }
  });
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
