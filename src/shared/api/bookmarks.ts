import apiClient from "shared/api/client";
// Fallbacks to localStorage for offline/dev resilience
// Note: importing JS module is allowed; TypeScript will infer any
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {
  getCurrentUser,
  getBookmarks as lsGet,
  toggleBookmark as lsToggle,
  isBookmarked as lsIsBookmarked,
} from "shared/utils/userData";

function auth() {
  const token =
    typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getStatus(movieId: number) {
  try {
    const res = await apiClient.get(`/bookmarks/status/${movieId}`, {
      headers: { ...auth() },
    });
    const d = res.data as any;
    // Support both { bookmarked, id } and { isBookmarked, bookmark }
    const bookmarked = typeof d?.bookmarked === 'boolean' ? d.bookmarked : !!d?.isBookmarked;
    const id = d?.id || d?._id || d?.bookmark?._id || d?.bookmark?.id || null;
    return { bookmarked, id } as { bookmarked: boolean; id: string | null };
  } catch {
    const u = await getCurrentUser();
    if (!u) return { bookmarked: false, id: null };
    return { bookmarked: !!lsIsBookmarked(u.id, movieId), id: null };
  }
}

export async function bulkStatus(movieIds: number[]) {
  if (!Array.isArray(movieIds) || movieIds.length === 0) return [] as { movieId: number; bookmarked: boolean; id: string | null }[];
  const uniq = Array.from(new Set(movieIds.filter((n) => Number.isFinite(n as any))));
  try {
    const res = await apiClient.get(`/bookmarks/status`, {
      params: { movieIds: uniq.join(',') },
      headers: { ...auth() },
    });
    const d = res.data as any;
    const items = Array.isArray(d?.items) ? d.items : [];
    return items as { movieId: number; bookmarked: boolean; id: string | null }[];
  } catch {
    const u = await getCurrentUser();
    if (!u) return uniq.map((id) => ({ movieId: id, bookmarked: false, id: null }));
    return uniq.map((id) => ({ movieId: id, bookmarked: !!lsIsBookmarked(u.id, id), id: null }));
  }
}

export async function create(item: {
  movieId: number;
  movieTitle: string;
  moviePoster?: string | null;
  movieReleaseDate?: string | null;
  tags?: string[];
  isWatched?: boolean;
}) {
  try {
    const res = await apiClient.post(`/bookmarks`, item, {
      headers: { ...auth() },
    });
    return res.data as any;
  } catch (err: any) {
    // If server says already exists, bubble up so caller can handle toggle semantics
    if (err?.response?.status === 409) throw err;
    const u = await getCurrentUser();
    if (!u) throw new Error("Not authenticated");
    lsToggle(u.id, {
      id: item.movieId,
      title: item.movieTitle,
      poster_path: item.moviePoster,
    });
    return { id: null, ok: true } as any;
  }
}

export async function remove(id: string) {
  try {
    const res = await apiClient.delete(`/bookmarks/${id}`, {
      headers: { ...auth() },
    });
    return res.data as { id: string; ok: boolean };
  } catch {
    // Fallback not possible with id only; prefer removeByMovieId
    return { id, ok: false };
  }
}

export async function list(params?: { page?: number; limit?: number }) {
  try {
    const res = await apiClient.get(`/bookmarks`, {
      params,
      headers: { ...auth() },
    });
    const d = res.data as any;
    const items = Array.isArray(d?.items) ? d.items : Array.isArray(d?.bookmarks) ? d.bookmarks : [];
    const page = typeof d?.page === 'number' ? d.page : 1;
    const limit = typeof d?.limit === 'number' ? d.limit : (params?.limit || 10);
    const total = typeof d?.total === 'number' ? d.total : (items.length || 0);
    return { items, page, limit, total } as { items: any[]; page: number; limit: number; total: number };
  } catch {
    const u = await getCurrentUser();
    if (!u)
      return { items: [], page: 1, limit: params?.limit || 100, total: 0 };
    const items = (lsGet(u.id) || []).map((m: any) => ({
      id: null,
      userId: u.id,
      movieId: m.id,
      movieTitle: m.title,
      moviePoster: m.poster_path,
      createdAt: null,
    }));
    return { items, page: 1, limit: items.length, total: items.length };
  }
}

// Helper: remove by movieId (fallback-friendly)
export async function removeByMovieId(
  movieId: number,
  summary?: { title?: string; poster_path?: string | null }
) {
  try {
    const st = await getStatus(movieId);
    if (st.id) return await remove(st.id);
  } catch {}
  const u = await getCurrentUser();
  if (!u) throw new Error("Not authenticated");
  lsToggle(u.id, {
    id: movieId,
    title: summary?.title || "",
    poster_path: summary?.poster_path,
  });
  return { id: null, ok: true } as any;
}

// High-level toggle to ensure consistent behavior across views
export async function toggle(movie: {
  id: number;
  title: string;
  poster_path?: string | null;
}) {
  const id = movie.id;
  let st: { bookmarked: boolean; id: string | null };
  try {
    st = await getStatus(id);
  } catch {
    st = { bookmarked: false, id: null } as any;
  }
  if (!st.bookmarked) {
    try {
      await create({
        movieId: id,
        movieTitle: movie.title,
        moviePoster: movie.poster_path || null,
      });
      return true;
    } catch (err: any) {
      // If already exists on server (409), treat this click as 'unbookmark'
      if (err?.response?.status === 409) {
        try {
          const latest = await getStatus(id);
          if (latest?.id) {
            await remove(latest.id);
          } else {
            // Fallback: pull list and match
            const s = await list({ page: 1, limit: 100 });
            const found = (s.items || []).find((b: any) => b.movieId === id);
            if (found?.id) await remove(found.id);
            else
              await removeByMovieId(id, {
                title: movie.title,
                poster_path: movie.poster_path,
              });
          }
          return false;
        } catch {
          await removeByMovieId(id, {
            title: movie.title,
            poster_path: movie.poster_path,
          });
          return false;
        }
      }
      throw err;
    }
  }
  if (st.id) await remove(st.id);
  else
    await removeByMovieId(id, {
      title: movie.title,
      poster_path: movie.poster_path,
    });
  return false;
}
