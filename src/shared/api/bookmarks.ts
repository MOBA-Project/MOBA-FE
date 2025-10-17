import apiClient from 'shared/api/client';

function auth() {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getStatus(movieId: number) {
  const res = await apiClient.get(`/bookmarks/status/${movieId}`, { headers: { ...auth() } });
  return res.data as { bookmarked: boolean; id: string | null };
}

export async function create(item: { movieId: number; movieTitle: string; moviePoster?: string | null; movieReleaseDate?: string | null; tags?: string[]; isWatched?: boolean; }) {
  const res = await apiClient.post(`/bookmarks`, item, { headers: { ...auth() } });
  return res.data as any;
}

export async function remove(id: string) {
  const res = await apiClient.delete(`/bookmarks/${id}`, { headers: { ...auth() } });
  return res.data as { id: string; ok: boolean };
}

export async function list(params?: { page?: number; limit?: number }) {
  const res = await apiClient.get(`/bookmarks`, { params, headers: { ...auth() } });
  return res.data as { items: any[]; page: number; limit: number; total: number };
}

