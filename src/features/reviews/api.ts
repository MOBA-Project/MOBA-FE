const BASE_URL = 'http://localhost:5001';

function authHeaders() {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Reviews
export async function fetchReviewsByMovie(movieId: number, page = 1, limit = 10, options?: { sort?: 'recent'|'rating'|'helpful'; ratingFilter?: number; hasSpoiler?: boolean }) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (options?.sort) params.set('sort', options.sort);
  if (typeof options?.ratingFilter === 'number') params.set('ratingFilter', String(options.ratingFilter));
  if (typeof options?.hasSpoiler === 'boolean') params.set('hasSpoiler', String(options.hasSpoiler));
  const res = await fetch(`${BASE_URL}/reviews/movie/${movieId}?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return res.json();
}

export async function fetchMovieReviewStats(movieId: number) {
  const res = await fetch(`${BASE_URL}/reviews/movie/${movieId}/stats`);
  if (!res.ok) throw new Error('Failed to fetch review stats');
  return res.json();
}

export async function createReview(payload: { movieId: number; rating: number; content: string; tags?: string[]; isSpoiler?: boolean }) {
  const res = await fetch(`${BASE_URL}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function reactReview(reviewId: string, type: 'like'|'dislike') {
  const path = type === 'like' ? 'like' : 'dislike';
  const res = await fetch(`${BASE_URL}/reviews/${reviewId}/${path}`, {
    method: 'POST',
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error('Failed to react review');
  return res.json();
}

// Comments (instagram-style: replies attach to root)
export async function fetchReviewRootComments(reviewId: string, page = 1, limit = 10, sort: 'recent'|'likes' = 'recent') {
  const params = new URLSearchParams({ page: String(page), limit: String(limit), sort });
  const res = await fetch(`${BASE_URL}/reviews/${reviewId}/comments?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch comments');
  return res.json();
}

export async function fetchReviewReplies(reviewId: string, rootCommentId: string, page = 1, limit = 50, sort: 'recent'|'likes' = 'recent') {
  const params = new URLSearchParams({ parentId: rootCommentId, page: String(page), limit: String(limit), sort });
  const res = await fetch(`${BASE_URL}/reviews/${reviewId}/comments?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch replies');
  return res.json();
}

export async function addReviewComment(reviewId: string, content: string, parentCommentId?: string) {
  const res = await fetch(`${BASE_URL}/reviews/${reviewId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ content, parentCommentId: parentCommentId || null }),
  });
  if (!res.ok) throw new Error('Failed to add comment');
  return res.json();
}

export async function updateReviewComment(reviewId: string, commentId: string, content: string) {
  const res = await fetch(`${BASE_URL}/reviews/${reviewId}/comments/${commentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error('Failed to update comment');
  return res.json();
}

export async function deleteReviewComment(reviewId: string, commentId: string) {
  const res = await fetch(`${BASE_URL}/reviews/${reviewId}/comments/${commentId}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error('Failed to delete comment');
  return res.json();
}

export async function reactReviewComment(reviewId: string, commentId: string) {
  const res = await fetch(`${BASE_URL}/reviews/${reviewId}/comments/${commentId}/react`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: JSON.stringify({ type: 'like' }),
  });
  if (!res.ok) throw new Error('Failed to react comment');
  return res.json();
}

