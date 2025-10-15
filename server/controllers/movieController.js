const axios = require("axios");

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY;

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

exports.getMovies = async (req, res) => {
  const { page = 1, genre } = req.query;
  const genreId = genre ? genresMap[genre.toLowerCase()] : null;

  try {
    const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        language: "ko-KR",
        page,
        with_genres: genreId || null,
        region: "KR",
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching data from TMDb:", error);
    res.status(500).json({ error: "Failed to fetch data from TMDb API" });
  }
};

exports.getMovieDetails = async (req, res) => {
  const movieId = req.params.id;
  try {
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: "ko-KR",
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching movie details from TMDb:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch movie details from TMDb API" });
  }
};

exports.getMovieVideos = async (req, res) => {
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
};

// Search movies by query
exports.searchMovies = async (req, res) => {
  const { query = "", page = 1 } = req.query;
  if (!query) return res.status(400).json({ error: "query is required" });
  try {
    // 1차: 한국어 우선 검색
    let response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        language: "ko-KR",
        query,
        page,
        include_adult: false,
        region: "KR",
      },
    });

    // 결과가 없을 경우 영어로 폴백
    if (!response.data?.results?.length) {
      response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          language: "en-US",
          query,
          page,
          include_adult: false,
        },
      });
    }
    res.json(response.data);
  } catch (error) {
    console.error("Error searching movies from TMDb:", error);
    res.status(500).json({ error: "Failed to search movies from TMDb API" });
  }
};
