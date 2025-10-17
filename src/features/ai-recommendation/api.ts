import { apiJson } from '../../shared/api/fetcher';

// API 베이스 URL (AI 서버는 /v1 경로 사용)
const AI_BASE = '/v1';

// 장르 ID 맵핑 (TMDB 표준)
export const GENRE_MAP: { [key: string]: number } = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  'sci-fi': 878,
  thriller: 53,
  war: 10752,
  western: 37,
};

// 타입 정의
export type GenreKey = keyof typeof GENRE_MAP;

export interface SaveGenresRequest {
  userId: string;
  favoriteGenres: number[];
}

export interface SaveGenresResponse {
  userId: string;
  favoriteGenres: number[];
}

export interface PersonalRecommendationItem {
  movieId: number;
  title: string;
  posterPath?: string;
  score: number;
  reasons?: string[];
}

export interface PersonalRecommendationResponse {
  items: PersonalRecommendationItem[];
  meta: {
    partial: boolean;
    source: 'local' | 'fallback' | 'mixed';
    jobId?: string;
    jobIds?: string[];
    nextRefreshAfter?: number;
  };
}

export interface CandidateItem {
  id: number;
  title: string;
  genre_ids: number[];
  overview: string;
  poster_path?: string;
  popularity: number;
  vote_average: number;
  release_date: string;
}

export interface CandidatesResponse {
  items: CandidateItem[];
  meta: {
    partial: boolean;
    source: 'local' | 'fallback' | 'mixed';
    jobId?: string;
    jobIds?: string[];
    nextRefreshAfter?: number;
  };
}

export interface FeedbackRequest {
  userId: string;
  movieId: number;
  label: 0 | 1; // 0=negative, 1=positive
  source: 'like' | 'click' | 'watch' | 'skip';
}

export interface FeedbackResponse {
  ok: boolean;
}

export interface JobStatusResponse {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'not_found';
  updatedAt: number;
}

export interface PreviewRequest {
  favoriteGenres?: number[];
  likes?: number[];
  dislikes?: number[];
  size?: number;
}

export interface CommitRequest {
  userId: string;
  favoriteGenres?: number[];
  likes?: number[];
  dislikes?: number[];
}

export interface CommitResponse {
  ok: boolean;
  message?: string;
}

// API 함수들

/**
 * 선호 장르 저장
 */
export async function saveGenres(payload: SaveGenresRequest): Promise<SaveGenresResponse> {
  return apiJson(`${AI_BASE}/profile/genres`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

/**
 * 개인화 추천 조회 (핵심)
 */
export async function getPersonalRecommendation(
  userId: string,
  size = 20
): Promise<PersonalRecommendationResponse> {
  return apiJson(`${AI_BASE}/reco/personal?userId=${encodeURIComponent(userId)}&size=${size}`);
}

/**
 * 장르 기반 후보 조회
 */
export async function getCandidates(
  genres: number[],
  page = 1,
  size = 20
): Promise<CandidatesResponse> {
  const genresParam = genres.join(',');
  return apiJson(`${AI_BASE}/reco/candidates?genres=${genresParam}&page=${page}&size=${size}`);
}

/**
 * 피드백 전송
 */
export async function sendFeedback(payload: FeedbackRequest): Promise<FeedbackResponse> {
  return apiJson(`${AI_BASE}/reco/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

/**
 * 백그라운드 잡 상태 조회
 */
export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  return apiJson(`${AI_BASE}/reco/jobs/${jobId}`);
}

/**
 * 추천 미리보기 (저장 없이 즉시 추천)
 */
export async function previewRecommendations(payload: PreviewRequest): Promise<PersonalRecommendationResponse> {
  return apiJson(`${AI_BASE}/reco/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

/**
 * 선호 정보 일괄 커밋 (저장)
 */
export async function commitPreferences(payload: CommitRequest): Promise<CommitResponse> {
  return apiJson(`${AI_BASE}/reco/commit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
