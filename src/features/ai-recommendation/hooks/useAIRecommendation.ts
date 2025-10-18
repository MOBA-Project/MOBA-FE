import { useQuery } from '@tanstack/react-query';
import { getCandidates, CandidatesResponse } from '../api';

/**
 * 장르 기반 후보 영화 조회 훅
 */
export function useCandidates(genres: number[], page = 1, size = 20) {
  return useQuery<CandidatesResponse>({
    queryKey: ['ai-candidates', genres, page, size],
    queryFn: () => getCandidates(genres, page, size),
    enabled: genres.length > 0,
    staleTime: 1000 * 60 * 5, // 5분
  });
}
