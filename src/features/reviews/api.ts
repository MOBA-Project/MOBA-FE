import { apiJson } from "shared/api/fetcher";

function authHeaders() {
  const token =
    typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Reviews
export async function fetchReviewsByMovie(
  movieId: number,
  page = 1,
  limit = 10,
  options?: {
    sort?: "recent" | "rating" | "helpful";
    ratingFilter?: number;
    hasSpoiler?: boolean;
  }
) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (options?.sort) params.set("sort", options.sort);
  if (typeof options?.ratingFilter === "number")
    params.set("ratingFilter", String(options.ratingFilter));
  if (typeof options?.hasSpoiler === "boolean")
    params.set("hasSpoiler", String(options.hasSpoiler));
  return apiJson(`/reviews/movie/${movieId}?${params.toString()}`);
}

export async function fetchMovieReviewStats(movieId: number) {
  return apiJson(`/reviews/movie/${movieId}/stats`);
}

export async function createReview(payload: {
  movieId: number;
  rating: number;
  content: string;
  tags?: string[];
  isSpoiler?: boolean;
}) {
  return apiJson(`/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
}

export async function reactReview(reviewId: string, type: "like" | "dislike") {
  const path = type === "like" ? "like" : "dislike";
  return apiJson(`/reviews/${reviewId}/${path}`, {
    method: "POST",
    headers: { ...authHeaders() },
  });
}

// Comments (instagram-style: replies attach to root)
export async function fetchReviewRootComments(
  reviewId: string,
  page = 1,
  limit = 10,
  sort: "recent" | "likes" = "recent"
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sort,
  });
  return apiJson(`/reviews/${reviewId}/comments?${params.toString()}`);
}

export async function fetchReviewReplies(
  reviewId: string,
  rootCommentId: string,
  page = 1,
  limit = 50,
  sort: "recent" | "likes" = "recent"
) {
  const params = new URLSearchParams({
    parentId: rootCommentId,
    page: String(page),
    limit: String(limit),
    sort,
  });
  return apiJson(`/reviews/${reviewId}/comments?${params.toString()}`);
}

export async function addReviewComment(
  reviewId: string,
  content: string,
  parentCommentId?: string
) {
  return apiJson(`/reviews/${reviewId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ content, parentCommentId: parentCommentId || null }),
  });
}

export async function updateReviewComment(
  reviewId: string,
  commentId: string,
  content: string
) {
  return apiJson(`/reviews/${reviewId}/comments/${commentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ content }),
  });
}

export async function deleteReviewComment(reviewId: string, commentId: string) {
  return apiJson(`/reviews/${reviewId}/comments/${commentId}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
}

export async function reactReviewComment(reviewId: string, commentId: string) {
  return apiJson(`/reviews/${reviewId}/comments/${commentId}/react`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: JSON.stringify({ type: "like" }),
  });
}

// Review update/delete + my reviews
export async function updateReview(
  reviewId: string,
  payload: { rating?: number; content?: string; tags?: string[]; isSpoiler?: boolean }
) {
  return apiJson(`/reviews/${reviewId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
}

export async function deleteReview(reviewId: string) {
  return apiJson(`/reviews/${reviewId}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
}

export async function fetchMyReviews() {
  return apiJson<any[]>(`/reviews/user/me`, {
    headers: { ...authHeaders() },
  });
}
