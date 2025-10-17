import apiClient from "shared/api/client";
import type { MoviesResponse, MovieVideo } from "shared/types/movies";

export async function getMovies() {
  const res = await apiClient.get<MoviesResponse>("/movies");
  return res.data;
}

export async function getMovieVideos(movieId: number) {
  const res = await apiClient.get<{ results: MovieVideo[] }>(
    `/movies/${movieId}/videos`
  );
  return res.data.results;
}
