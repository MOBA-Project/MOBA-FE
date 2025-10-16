// Utilities to manage per-user likes and reviews in localStorage

const STORAGE_KEYS = {
  likes: (userId) => `likedMovies_${userId}`,
  reviews: (userId) => `reviews_${userId}`,
};

export async function getCurrentUser() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const res = await fetch("http://localhost:5001/users/protected", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      return { id: data.id, nick: data.nick };
    }
    // Fallback: decode token payload (no verification) to keep UX after server restart
    const parts = token.split('.')
    if (parts.length === 3) {
      try {
        const payload = JSON.parse(atob(parts[1]));
        if (payload && payload.id) return { id: payload.id, nick: payload.id };
      } catch {}
    }
    return null;
  } catch (e) {
    return null;
  }
}

export function getLikedMovies(userId) {
  if (!userId) return [];
  const raw = localStorage.getItem(STORAGE_KEYS.likes(userId));
  try {
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isMovieLiked(userId, movieId) {
  return getLikedMovies(userId).some((m) => m.id === movieId);
}

export function toggleLike(userId, movieSummary) {
  if (!userId || !movieSummary || !movieSummary.id) return { liked: false, list: [] };
  const list = getLikedMovies(userId);
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
  localStorage.setItem(STORAGE_KEYS.likes(userId), JSON.stringify(next));
  return { liked: !exists, list: next };
}

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
