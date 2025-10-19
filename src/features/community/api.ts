import { apiJson } from 'shared/api/fetcher';

function authHeader() {
  try {
    const t = typeof localStorage !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('accessToken')) : null;
    return t ? { Authorization: `Bearer ${t}` } : {};
  } catch {
    return {};
  }
}

// Posts
export type Post = {
  _id: string;
  title: string;
  content: string;
  movieId: number;
  movieTitle: string;
  moviePoster?: string | null;
  rating: number;
  userId: string | { id?: string; _id?: string; nickname?: string } | null;
  author?: { id?: string; nickname?: string };
  likes?: number;
  likedBy?: string[];
  commentCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export async function listPosts(page = 1, limit = 10) {
  // Some servers return { items, total }, others may return { posts, total }
  const d = await apiJson<any>(`/posts?page=${page}&limit=${limit}`);
  const items: Post[] = Array.isArray(d?.items)
    ? d.items
    : Array.isArray(d?.posts)
      ? d.posts
      : Array.isArray(d)
        ? d
        : [];
  const total = typeof d?.total === 'number' ? d.total : items.length;
  return { items, total };
}

export async function getPost(id: string) {
  return apiJson<Post>(`/posts/${id}`);
}

export async function createPost(payload: { title: string; content: string; movieId: number; movieTitle: string; moviePoster?: string | null; rating: number; }) {
  return apiJson<Post>(`/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(payload),
  });
}

export async function toggleLike(postId: string) {
  return apiJson<Post>(`/posts/${postId}/like`, { method: 'POST' });
}

export async function updatePost(
  postId: string,
  payload: Partial<Pick<Post, 'title' | 'content' | 'rating'>>
) {
  return apiJson<Post>(`/posts/${postId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(payload),
  });
}

export async function deletePost(postId: string) {
  return apiJson<{ message: string }>(`/posts/${postId}`, {
    method: 'DELETE',
    headers: { ...authHeader() },
  });
}

// Comments
export type Comment = {
  _id: string;
  postId: string;
  userId: string;
  content: string;
  parentCommentId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  author?: { id?: string; nickname?: string };
  replies?: Comment[]; // for server that returns hierarchical
};

export async function listComments(postId: string) {
  // Server may return { comments } or hierarchical structure
  const d = await apiJson<any>(`/comments/post/${postId}`);
  if (Array.isArray(d)) return d as Comment[];
  if (Array.isArray(d?.comments)) return d.comments as Comment[];
  // normalize hierarchical { items: [...] }
  if (Array.isArray(d?.items)) return d.items as Comment[];
  return [] as Comment[];
}

export async function addComment(payload: { postId: string; content: string; parentCommentId?: string }) {
  return apiJson<Comment>(`/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function updateComment(id: string, content: string) {
  return apiJson<Comment>(`/comments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
}

export async function deleteComment(id: string) {
  return apiJson<{ message: string }>(`/comments/${id}`, { method: 'DELETE' });
}
