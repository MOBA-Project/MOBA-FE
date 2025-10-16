const jwt = require("jsonwebtoken");

// In-memory stores (demo purpose)
let reviews = [];
let reviewComments = [];

// Helpers
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

function mapReview(r) {
  return {
    _id: r.id,
    userId: r.userId,
    movieId: r.movieId,
    rating: r.rating,
    content: r.content,
    likes: r.likesBy?.length || 0,
    dislikes: r.dislikesBy?.length || 0,
    likedBy: r.likesBy || [],
    dislikedBy: r.dislikesBy || [],
    tags: r.tags || [],
    isSpoiler: !!r.isSpoiler,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

// Ensure reply attaches to root comment (instagram-like)
function resolveRootParent(commentId) {
  let current = reviewComments.find((c) => c.id === commentId) || null;
  if (!current) return null;
  while (current && current.parentId) {
    current = reviewComments.find((c) => c.id === current.parentId) || null;
  }
  return current ? current.id : null;
}

// ===== Reviews =====
exports.createReview = (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "인증이 필요합니다." });
  const { movieId, rating, content, tags = [], isSpoiler = false } = req.body || {};
  if (!movieId || !rating || !content) return res.status(400).json({ message: "movieId, rating, content 필요" });

  // unique constraint: one review per (userId, movieId)
  const exists = reviews.find((r) => r.userId === userId && r.movieId === Number(movieId));
  if (exists) return res.status(409).json({ message: "이미 해당 영화에 리뷰가 존재합니다." });

  const now = new Date().toISOString();
  const review = {
    id: uid(),
    userId,
    movieId: Number(movieId),
    rating: Math.max(1, Math.min(5, Number(rating))),
    content: String(content),
    tags: Array.isArray(tags) ? tags.slice(0, 20) : [],
    isSpoiler: !!isSpoiler,
    likesBy: [],
    dislikesBy: [],
    createdAt: now,
    updatedAt: now,
  };
  reviews.unshift(review);
  return res.status(201).json(mapReview(review));
};

exports.getReviewsByMovie = (req, res) => {
  const movieId = Number(req.params.movieId);
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.max(1, Math.min(50, Number(req.query.limit || 10)));
  const sort = req.query.sort || "recent"; // recent|rating|helpful
  const ratingFilter = Number(req.query.ratingFilter || 0); // 0 or 1..5
  const hasSpoiler = req.query.hasSpoiler === "true" ? true : req.query.hasSpoiler === "false" ? false : undefined;

  let list = reviews.filter((r) => r.movieId === movieId);
  if (ratingFilter >= 1 && ratingFilter <= 5) list = list.filter((r) => r.rating === ratingFilter);
  if (typeof hasSpoiler === "boolean") list = list.filter((r) => r.isSpoiler === hasSpoiler);

  if (sort === "rating") list.sort((a, b) => b.rating - a.rating || new Date(b.createdAt) - new Date(a.createdAt));
  else if (sort === "helpful") list.sort((a, b) => (b.likesBy.length - b.dislikesBy.length) - (a.likesBy.length - a.dislikesBy.length) || new Date(b.createdAt) - new Date(a.createdAt));
  else list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total = list.length;
  const start = (page - 1) * limit;
  const items = list.slice(start, start + limit).map(mapReview);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return res.json({ reviews: items, total, page, totalPages });
};

exports.getMovieStats = (req, res) => {
  const movieId = Number(req.params.movieId);
  const list = reviews.filter((r) => r.movieId === movieId);
  const total = list.length;
  const avg = total ? Number((list.reduce((s, r) => s + r.rating, 0) / total).toFixed(2)) : 0;
  return res.json({ averageRating: avg, totalReviews: total });
};

exports.getMyReviews = (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "인증이 필요합니다." });
  const list = reviews
    .filter((r) => r.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(mapReview);
  return res.json(list);
};

exports.getReviewById = (req, res) => {
  const review = reviews.find((r) => r.id === req.params.reviewId);
  if (!review) return res.status(404).json({ message: "리뷰를 찾을 수 없습니다." });
  return res.json(mapReview(review));
};

exports.updateReview = (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "인증이 필요합니다." });
  const id = req.params.reviewId;
  const idx = reviews.findIndex((r) => r.id === id);
  if (idx === -1) return res.status(404).json({ message: "리뷰를 찾을 수 없습니다." });
  if (reviews[idx].userId !== userId) return res.status(403).json({ message: "수정 권한이 없습니다." });
  const { rating, content, tags, isSpoiler } = req.body || {};
  if (rating != null) reviews[idx].rating = Math.max(1, Math.min(5, Number(rating)));
  if (content != null) reviews[idx].content = String(content);
  if (tags != null && Array.isArray(tags)) reviews[idx].tags = tags.slice(0, 20);
  if (isSpoiler != null) reviews[idx].isSpoiler = !!isSpoiler;
  reviews[idx].updatedAt = new Date().toISOString();
  return res.json(mapReview(reviews[idx]));
};

exports.deleteReview = (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "인증이 필요합니다." });
  const id = req.params.reviewId;
  const idx = reviews.findIndex((r) => r.id === id);
  if (idx === -1) return res.status(404).json({ message: "리뷰를 찾을 수 없습니다." });
  if (reviews[idx].userId !== userId) return res.status(403).json({ message: "삭제 권한이 없습니다." });
  // remove comments under this review as well
  reviewComments = reviewComments.filter((c) => c.reviewId !== id);
  const removed = reviews.splice(idx, 1)[0];
  return res.json({ message: "리뷰가 삭제되었습니다.", id: removed.id });
};

exports.likeReview = (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "인증이 필요합니다." });
  const id = req.params.reviewId;
  const r = reviews.find((x) => x.id === id);
  if (!r) return res.status(404).json({ message: "리뷰를 찾을 수 없습니다." });
  const liked = r.likesBy.includes(userId);
  // toggle like
  if (liked) r.likesBy = r.likesBy.filter((u) => u !== userId);
  else r.likesBy = [userId, ...r.likesBy];
  // ensure dislike removed when like added
  r.dislikesBy = r.dislikesBy.filter((u) => u !== userId);
  return res.json(mapReview(r));
};

exports.dislikeReview = (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "인증이 필요합니다." });
  const id = req.params.reviewId;
  const r = reviews.find((x) => x.id === id);
  if (!r) return res.status(404).json({ message: "리뷰를 찾을 수 없습니다." });
  const disliked = r.dislikesBy.includes(userId);
  if (disliked) r.dislikesBy = r.dislikesBy.filter((u) => u !== userId);
  else r.dislikesBy = [userId, ...r.dislikesBy];
  r.likesBy = r.likesBy.filter((u) => u !== userId);
  return res.json(mapReview(r));
};

exports.getReactionStatus = (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "인증이 필요합니다." });
  const id = req.params.reviewId;
  const r = reviews.find((x) => x.id === id);
  if (!r) return res.status(404).json({ message: "리뷰를 찾을 수 없습니다." });
  return res.json({ isLiked: r.likesBy.includes(userId), isDisliked: r.dislikesBy.includes(userId) });
};

// ===== Comments (instagram-style: only first-level replies) =====
exports.getComments = (req, res) => {
  const reviewId = req.params.reviewId;
  const parentId = req.query.parentId || null; // null for roots
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.max(1, Math.min(50, Number(req.query.limit || 10)));
  const sort = req.query.sort || "recent"; // recent|likes

  let list = reviewComments.filter((c) => c.reviewId === reviewId && (parentId ? c.parentId === parentId : c.parentId === null));
  if (sort === "likes") list.sort((a, b) => (b.likesBy.length - a.likesBy.length) || new Date(b.createdAt) - new Date(a.createdAt));
  else list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const total = list.length;
  const items = list.slice((page - 1) * limit, (page - 1) * limit + limit);

  // for each root comment, include repliesCount
  if (!parentId) {
    const ids = new Set(items.map((i) => i.id));
    const repliesCountByRoot = {};
    for (const c of reviewComments) {
      if (c.reviewId !== reviewId || c.parentId == null) continue;
      // reply attaches to root id (parentId is root id by rule)
      repliesCountByRoot[c.parentId] = (repliesCountByRoot[c.parentId] || 0) + 1;
    }
    // decorate
    return res.json({
      items: items.map((i) => ({ ...i, repliesCount: repliesCountByRoot[i.id] || 0 })),
      page,
      limit,
      total,
    });
  }
  return res.json({ items, page, limit, total });
};

exports.addComment = (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "인증이 필요합니다." });
  const reviewId = req.params.reviewId;
  const { content, isSpoiler = false, parentCommentId = null } = req.body || {};
  if (!content) return res.status(400).json({ message: "content 필요" });
  const now = new Date().toISOString();

  let parentId = null;
  if (parentCommentId) {
    const root = resolveRootParent(parentCommentId);
    if (root) parentId = root; // enforce first-level reply attached to root
  }

  const item = {
    id: uid(),
    reviewId,
    userId,
    content: String(content),
    isSpoiler: !!isSpoiler,
    parentId, // null for root, rootId for reply
    likesBy: [],
    createdAt: now,
    updatedAt: now,
  };
  reviewComments.unshift(item);
  return res.status(201).json(item);
};

exports.updateComment = (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "인증이 필요합니다." });
  const id = req.params.commentId;
  const idx = reviewComments.findIndex((c) => c.id === id);
  if (idx === -1) return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
  if (reviewComments[idx].userId !== userId) return res.status(403).json({ message: "수정 권한이 없습니다." });
  const { content, isSpoiler } = req.body || {};
  if (content != null) reviewComments[idx].content = String(content);
  if (isSpoiler != null) reviewComments[idx].isSpoiler = !!isSpoiler;
  reviewComments[idx].updatedAt = new Date().toISOString();
  return res.json(reviewComments[idx]);
};

exports.deleteComment = (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "인증이 필요합니다." });
  const id = req.params.commentId;
  const idx = reviewComments.findIndex((c) => c.id === id);
  if (idx === -1) return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
  if (reviewComments[idx].userId !== userId) return res.status(403).json({ message: "삭제 권한이 없습니다." });
  // remove target and its replies (by parentId)
  const rootId = reviewComments[idx].parentId ? reviewComments[idx].parentId : reviewComments[idx].id;
  const toRemove = new Set([id]);
  // Only one-level replies exist but handle safe removal of children of this id
  for (const c of reviewComments) {
    if (c.parentId === id) toRemove.add(c.id);
  }
  reviewComments = reviewComments.filter((c) => !toRemove.has(c.id));
  return res.json({ message: "댓글이 삭제되었습니다.", id });
};

exports.getCommentReactionStatus = (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "인증이 필요합니다." });
  const id = req.params.commentId;
  const c = reviewComments.find((x) => x.id === id);
  if (!c) return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
  return res.json({ liked: c.likesBy.includes(userId) });
};

exports.reactToComment = (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "인증이 필요합니다." });
  const id = req.params.commentId;
  const c = reviewComments.find((x) => x.id === id);
  if (!c) return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
  const liked = c.likesBy.includes(userId);
  c.likesBy = liked ? c.likesBy.filter((u) => u !== userId) : [userId, ...c.likesBy];
  return res.json(c);
};
