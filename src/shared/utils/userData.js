// Utilities to manage per-user likes and reviews in localStorage

const STORAGE_KEYS = {
  // For backward-compatibility, bookmarks reuse the previous likedMovies key
  bookmarks: (userId) => `likedMovies_${userId}`,
  likes: (userId) => `likedMovies_${userId}`,
  reviews: (userId) => `reviews_${userId}`,
};

let _userCache = null;
let _userCachedAt = 0;
let _userInflight = null;
const USER_TTL_MS = 60 * 1000; // 60s

export async function getCurrentUser() {
  try {
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (!token) { _userCache = null; _userCachedAt = 0; return null; }
    const now = Date.now();
    if (_userCache && now - _userCachedAt < USER_TTL_MS) return _userCache;
    if (_userInflight) return _userInflight;
    const { apiJson } = await import('../api/fetcher');
    _userInflight = (async () => {
      try {
        try {
          const data = await apiJson(`/auth/protected`, { headers: { Authorization: `Bearer ${token}` } });
          _userCache = { id: data.id, nick: data.nickname || data.nick };
        } catch {
          const data = await apiJson(`/users/protected`, { headers: { Authorization: `Bearer ${token}` } });
          _userCache = { id: data.id, nick: data.nickname || data.nick };
        }
        _userCachedAt = Date.now();
        return _userCache;
      } finally {
        _userInflight = null;
      }
    })();
    return await _userInflight;
  } catch (e) {
    _userInflight = null;
    return null;
  }
}

export function getBookmarks(userId) {
  if (!userId) return [];
  const raw = localStorage.getItem(STORAGE_KEYS.bookmarks(userId));
  try {
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isBookmarked(userId, movieId) {
  return getBookmarks(userId).some((m) => m.id === movieId);
}

export function toggleBookmark(userId, movieSummary) {
  if (!userId || !movieSummary || !movieSummary.id) return { liked: false, list: [] };
  const list = getBookmarks(userId);
  const exists = list.find((m) => m.id === movieSummary.id);
  let next;
  if (exists) {
    next = list.filter((m) => m.id !== movieSummary.id);
  } else {
    // Store minimal summary: id, title, poster_path
    const summary = {
      id: movieSummary.id,
      title: movieSummary.title || movieSummary.name || movieSummary.movieName,
      poster_path: movieSummary.poster_path || movieSummary.posterPath || movieSummary.poster,
    };
    next = [summary, ...list];
  }
  localStorage.setItem(STORAGE_KEYS.bookmarks(userId), JSON.stringify(next));
  return { liked: !exists, list: next };
}

export function clearBookmarks(userId) {
  if (!userId) return;
  localStorage.setItem(STORAGE_KEYS.bookmarks(userId), JSON.stringify([]));
}

// Backward-compatible aliases
export const getLikedMovies = getBookmarks;
export const isMovieLiked = isBookmarked;
export const toggleLike = toggleBookmark;

export function getReviews(userId) {
  if (!userId) return [];
  const raw = localStorage.getItem(STORAGE_KEYS.reviews(userId));
  try {
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addReview(userId, movieSummary, text, rating = 0) {
  if (!userId || !movieSummary || !text) return [];
  const next = [
    {
      movieId: movieSummary.id,
      text,
      rating: typeof rating === "number" ? Math.max(0, Math.min(5, Math.round(rating))) : 0,
      createdAt: new Date().toISOString(),
      movie: {
        id: movieSummary.id,
        title: movieSummary.title || movieSummary.name || movieSummary.movieName,
        poster_path: movieSummary.poster_path || movieSummary.posterPath || movieSummary.poster,
      },
    },
    ...getReviews(userId),
  ];
  localStorage.setItem(STORAGE_KEYS.reviews(userId), JSON.stringify(next));
  return next;
}

export function getReviewedMovies(userId) {
  const reviews = getReviews(userId);
  // unique by movieId, latest first
  const map = new Map();
  for (const r of reviews) {
    if (!map.has(r.movieId)) map.set(r.movieId, r.movie);
  }
  return Array.from(map.values());
}
