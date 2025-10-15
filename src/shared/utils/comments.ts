export type CommentItem = {
  id: string;
  movieId: number;
  userId: string;
  userNick: string;
  parentId: string | null;
  text: string;
  likes: string[]; // userIds
  createdAt: string;
  updatedAt?: string;
};

const key = (movieId: number) => `comments_${movieId}`;

const load = (movieId: number): CommentItem[] => {
  try { return JSON.parse(localStorage.getItem(key(movieId)) || '[]'); } catch { return []; }
};
const save = (movieId: number, list: CommentItem[]) => {
  localStorage.setItem(key(movieId), JSON.stringify(list));
};

const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2,8)}`;

export const getComments = (movieId: number): CommentItem[] => {
  return load(movieId)
    .sort((a,b)=> (b.likes?.length||0) - (a.likes?.length||0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const addComment = (movieId: number, user: { id:string; nick:string }, text: string, parentId: string | null = null) => {
  const list = load(movieId);
  const item: CommentItem = {
    id: uid(), movieId, userId: user.id, userNick: user.nick,
    parentId, text, likes: [], createdAt: new Date().toISOString()
  };
  const next = [item, ...list];
  save(movieId, next);
  return next;
};

export const updateComment = (movieId: number, id: string, text: string) => {
  const list = load(movieId).map(c => c.id === id ? { ...c, text, updatedAt: new Date().toISOString() } : c);
  save(movieId, list);
  return list;
};

export const deleteComment = (movieId: number, id: string) => {
  // 자식 대댓글도 함께 제거
  const list = load(movieId);
  const idsToRemove = new Set([id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const c of list) {
      if (c.parentId && idsToRemove.has(c.parentId) && !idsToRemove.has(c.id)) {
        idsToRemove.add(c.id); changed = true;
      }
    }
  }
  const next = list.filter(c => !idsToRemove.has(c.id));
  save(movieId, next);
  return next;
};

export const toggleLikeComment = (movieId: number, id: string, userId: string) => {
  const list = load(movieId).map(c => {
    if (c.id !== id) return c;
    const liked = c.likes.includes(userId);
    return { ...c, likes: liked ? c.likes.filter(u=>u!==userId) : [userId, ...c.likes] };
  });
  save(movieId, list);
  return list;
};

