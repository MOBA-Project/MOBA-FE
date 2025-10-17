import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPersonalRecommendation,
  saveGenres,
  sendFeedback,
  getCandidates,
  getJobStatus,
  SaveGenresRequest,
  FeedbackRequest,
} from '../api';

/**
 * 개인화 추천 조회 훅
 * partial=true 응답 시 자동 재조회 기능 포함
 */
export function usePersonalRecommendation(userId: string | null, size = 20) {
  const query = useQuery({
    queryKey: ['ai-recommendation', 'personal', userId, size],
    queryFn: () => getPersonalRecommendation(userId!, size),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2분
    refetchOnWindowFocus: false,
  });

  // partial 응답 처리: nextRefreshAfter 초 후 자동 재조회
  const shouldAutoRefresh = query.data?.meta.partial && query.data?.meta.nextRefreshAfter;

  return {
    ...query,
    isPartial: query.data?.meta.partial || false,
    nextRefreshAfter: query.data?.meta.nextRefreshAfter,
    shouldAutoRefresh,
  };
}

/**
 * 장르 기반 후보 조회 훅
 */
export function useCandidates(genreIds: number[], page = 1, size = 20) {
  return useQuery({
    queryKey: ['ai-recommendation', 'candidates', genreIds, page, size],
    queryFn: () => getCandidates(genreIds, page, size),
    enabled: genreIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5분
  });
}

/**
 * 선호 장르 저장 Mutation
 */
export function useSaveGenres() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaveGenresRequest) => saveGenres(payload),
    onSuccess: (data) => {
      // 장르 저장 후 개인 추천 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: ['ai-recommendation', 'personal', data.userId],
      });
    },
  });
}

/**
 * 피드백 전송 Mutation
 */
export function useSendFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FeedbackRequest) => sendFeedback(payload),
    onSuccess: (_, variables) => {
      // 피드백 후 개인 추천 쿼리 무효화 (즉시 반영)
      queryClient.invalidateQueries({
        queryKey: ['ai-recommendation', 'personal', variables.userId],
      });
    },
  });
}

/**
 * 백그라운드 잡 상태 조회 훅
 */
export function useJobStatus(jobId: string | null) {
  return useQuery({
    queryKey: ['ai-recommendation', 'job', jobId],
    queryFn: () => getJobStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // running/pending 상태일 때만 2초마다 폴링
      if (status === 'running' || status === 'pending') {
        return 2000;
      }
      return false;
    },
  });
}
