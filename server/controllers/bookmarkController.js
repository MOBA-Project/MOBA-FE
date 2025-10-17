const jwt = require("jsonwebtoken");

let bookmarks = [];

function getUserIdFromToken(req) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    return decoded?.id || null;
  } catch {
    return null;
  }
}

function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// POST /bookmarks
exports.create = (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "인증이 필요합니다." });
  const { movieId, movieTitle, moviePoster, movieReleaseDate, tags = [], isWatched = false } = req.body || {};
  if (!movieId || !movieTitle) return res.status(400).json({ message: "movieId, movieTitle 필수" });
  const exists = bookmarks.find((b) => b.userId === userId && b.movieId === Number(movieId));
  if (exists) return res.status(409).json({ message: "이미 북마크에 존재합니다.", id: exists.id });
  const now = new Date().toISOString();
  const item = {
    id: uid(),
    userId,
    movieId: Number(movieId),
    movieTitle: String(movieTitle),
    moviePoster: moviePoster || null,
    movieReleaseDate: movieReleaseDate || null,
    tags: Array.isArray(tags) ? tags.slice(0, 20) : [],
    isWatched: !!isWatched,
    createdAt: now,
    updatedAt: now,
  };
  bookmarks.unshift(item);
  return res.status(201).json(item);
};

// GET /bookmarks
exports.findAll = (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "인증이 필요합니다." });
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.max(1, Math.min(100, Number(req.query.limit || 10)));
  const list = bookmarks.filter((b) => b.userId === userId);
  const total = list.length;
  const items = list.slice((page - 1) * limit, (page - 1) * limit + limit);
  return res.json({ items, page, limit, total });
};

// GET /bookmarks/watched
exports.watched = (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "인증이 필요합니다." });
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.max(1, Math.min(100, Number(req.query.limit || 10)));
  const list = bookmarks.filter((b) => b.userId === userId && b.isWatched);
  const total = list.length;
  const items = list.slice((page - 1) * limit, (page - 1) * limit + limit);
  return res.json({ items, page, limit, total });
};

// GET /bookmarks/tags
exports.tags = (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "인증이 필요합니다." });
  const set = new Set();
  for (const b of bookmarks) {
    if (b.userId !== userId || !Array.isArray(b.tags)) continue;
    for (const t of b.tags) set.add(String(t));
  }
  return res.json(Array.from(set.values()));
};

// GET /bookmarks/status/:movieId
exports.status = (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "인증이 필요합니다." });
  const movieId = Number(req.params.movieId);
  const found = bookmarks.find((b) => b.userId === userId && b.movieId === movieId);
  return res.json({ bookmarked: !!found, id: found ? found.id : null });
};

// GET /bookmarks/status?movieIds=1,2,3  (bulk)
exports.bulkStatus = (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "인증이 필요합니다." });
  const raw = String(req.query.movieIds || '').trim();
  if (!raw) return res.json({ items: [] });
  const ids = Array.from(new Set(raw.split(',').map((s) => Number(s)).filter((n) => Number.isFinite(n) && n > 0)));
  const items = ids.map((id) => {
    const found = bookmarks.find((b) => b.userId === userId && b.movieId === id);
    return { movieId: id, bookmarked: !!found, id: found ? found.id : null };
  });
  return res.json({ items });
};

// GET /bookmarks/:id
exports.findOne = (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "인증이 필요합니다." });
  const id = req.params.id;
  const item = bookmarks.find((b) => b.id === id && b.userId === userId);
  if (!item) return res.status(404).json({ message: "북마크를 찾을 수 없습니다." });
  return res.json(item);
};

// PUT /bookmarks/:id
exports.update = (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "인증이 필요합니다." });
  const id = req.params.id;
  const idx = bookmarks.findIndex((b) => b.id === id && b.userId === userId);
  if (idx === -1) return res.status(404).json({ message: "북마크를 찾을 수 없습니다." });
  const { tags, isWatched } = req.body || {};
  if (Array.isArray(tags)) bookmarks[idx].tags = tags.slice(0, 20);
  if (typeof isWatched === "boolean") bookmarks[idx].isWatched = isWatched;
  bookmarks[idx].updatedAt = new Date().toISOString();
  return res.json(bookmarks[idx]);
};

// DELETE /bookmarks/:id
exports.remove = (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "인증이 필요합니다." });
  const id = req.params.id;
  const idx = bookmarks.findIndex((b) => b.id === id && b.userId === userId);
  if (idx === -1) return res.status(404).json({ message: "북마크를 찾을 수 없습니다." });
  const removed = bookmarks.splice(idx, 1)[0];
  return res.json({ id: removed.id, ok: true });
};
