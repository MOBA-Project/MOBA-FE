import apiClient from "shared/api/client";
import type { MoviesResponse, MovieVideo } from "shared/types/movies";

export async function getMovies() {
  const res = await apiClient.get<MoviesResponse>("/movies");
  return res.data;
}

export async function getMovieVideos(movieId: number, language?: string) {
  const qs = language ? `?language=${encodeURIComponent(language)}` : "";
  const res = await apiClient.get<{ results: MovieVideo[] }>(
    `/movies/${movieId}/videos${qs}`
  );
  return res.data.results;
}
