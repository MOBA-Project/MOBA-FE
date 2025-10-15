import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMovies, getMovieVideos } from 'features/movies/api/movies';

export function useMovies() {
  return useQuery({ queryKey: ['movies'], queryFn: getMovies, staleTime: 5 * 60 * 1000 });
}

export function useMovieVideos(movieId: number | undefined) {
  const enabled = typeof movieId === 'number';
  return useQuery({ queryKey: ['movieVideos', movieId], queryFn: () => getMovieVideos(movieId as number), enabled });
}

