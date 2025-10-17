import { apiJson } from '../../shared/api/fetcher';

export const fetchMovies = async (page: number, genre: string) => {
  const genreParam = genre ? `&genre=${encodeURIComponent(genre)}` : '';
  return apiJson(`/movies?page=${page}${genreParam}`);
};

export const fetchMovieDetail = async (id: string | number) => {
  return apiJson(`/movies/${id}`, { cache: 'no-store' as any });
};

export const searchMovies = async (query: string, page = 1) => {
  return apiJson(`/movies/search?query=${encodeURIComponent(query)}&page=${page}`);
};

export const fetchMovieCredits = async (id: string | number) => {
  return apiJson(`/movies/${id}/credits`); // { id, cast: [], crew: [] }
};

export const fetchSimilarMovies = async (id: string | number, page = 1) => {
  try {
    return await apiJson(`/movies/${id}/similar?page=${page}`);
  } catch (e: any) {
    if (e?.status === 404) return { page: 1, results: [], total_pages: 1, total_results: 0 } as any;
    throw e;
  }
};
