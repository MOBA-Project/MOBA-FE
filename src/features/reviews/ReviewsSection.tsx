import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AiFillStar, AiOutlineLike, AiOutlineDislike } from "react-icons/ai";
import {
  fetchReviewsByMovie,
  fetchMovieReviewStats,
  reactReview,
  fetchReviewRootComments,
  fetchReviewReplies,
  addReviewComment,
  updateReviewComment,
  deleteReviewComment,
  createReview,
  reactReviewComment,
} from "./api";
import "./ReviewsSection.css";

type User = { id: string; nick: string } | null;

const CommentBox: React.FC<{
  onSubmit: (text: string) => void;
  placeholder?: string;
  initial?: string;
  onCancel?: () => void;
}> = ({ onSubmit, placeholder, initial = "", onCancel }) => {
  const [text, setText] = useState(initial);
  return (
    <div className="commentBox">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        rows={3}
      />
      <div className="commentActions">
        <button
          onClick={() => {
            if (text.trim()) {
              onSubmit(text.trim());
              setText("");
            }
          }}
        >
          등록
        </button>
        {onCancel && (
          <button className="cancel" onClick={onCancel}>
            취소
          </button>
        )}
      </div>
    </div>
  );
};

const ReviewItem: React.FC<{
  review: any;
  user: User;
  focus?: boolean;
}> = ({ review, user, focus }) => {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggleExpanded = (rootId: string) =>
    setExpanded((prev) => ({ ...prev, [rootId]: !prev[rootId] }));
  const reviewRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (focus) {
      const el =
        reviewRef.current || document.getElementById(`review-${review._id}`);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      (el as HTMLElement).focus?.();
      el.classList.add("focus-highlight");
      setTimeout(() => el.classList.remove("focus-highlight"), 1500);
    }
  }, [focus, review?._id]);

  const { data: roots } = useQuery({
    queryKey: ["review", review._id, "comments", "root"],
    queryFn: () => fetchReviewRootComments(review._id, 1, 10, "recent"),
  });

  const addRoot = useMutation({
    mutationFn: (text: string) => addReviewComment(review._id, text),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["review", review._id, "comments", "root"],
      });
    },
  });

  const addReply = useMutation({
    mutationFn: ({ rootId, text }: { rootId: string; text: string }) =>
      addReviewComment(review._id, text, rootId),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({
        queryKey: ["review", review._id, "comments", vars.rootId],
      });
      qc.invalidateQueries({
        queryKey: ["review", review._id, "comments", "root"],
      });
    },
  });

  const editComment = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      updateReviewComment(review._id, id, text),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({
        queryKey: ["review", review._id, "comments", "root"],
      });
      qc.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          q.queryKey[0] === "review" &&
          q.queryKey[2] === "comments" &&
          q.queryKey[3] === vars.id,
      });
    },
  });

  const deleteCommentMut = useMutation({
    mutationFn: (id: string) => deleteReviewComment(review._id, id),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({
        queryKey: ["review", review._id, "comments", "root"],
      });
      qc.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          q.queryKey[0] === "review" &&
          q.queryKey[2] === "comments" &&
          q.queryKey[3] === id,
      });
    },
  });

  const likeReviewMut = useMutation({
    mutationFn: () => reactReview(review._id, "like"),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["movie", review.movieId, "reviews"] }),
  });

  const dislikeReviewMut = useMutation({
    mutationFn: () => reactReview(review._id, "dislike"),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["movie", review.movieId, "reviews"] }),
  });

  return (
    <div
      id={`review-${review._id}`}
      ref={reviewRef}
      tabIndex={-1}
      role="region"
      aria-label="리뷰"
      className="reviewItem"
    >
      <div className="reviewHeader">
        <div className="userAvatar">
          {String(review.userId).charAt(0).toUpperCase()}
        </div>
        <div className="reviewRating">
          <AiFillStar size={16} />
          {review.rating}
        </div>
        <div className="reviewDate">
          {new Date(review.createdAt).toLocaleString("ko-KR")}
        </div>
        <div className="reviewActions">
          <button
            className="actionBtn like"
            onClick={() =>
              user ? likeReviewMut.mutate() : alert("로그인이 필요합니다.")
            }
          >
            <AiOutlineLike size={16} />
            {review.likes || 0}
          </button>
          <button
            className="actionBtn dislike"
            onClick={() =>
              user ? dislikeReviewMut.mutate() : alert("로그인이 필요합니다.")
            }
          >
            <AiOutlineDislike size={16} />
            {review.dislikes || 0}
          </button>
        </div>
      </div>

      <div className="reviewContent">{review.content}</div>

      <div className="commentsSection">
        <CommentBox
          placeholder="댓글을 남겨보세요"
          onSubmit={(t) => {
            if (!user) return alert("로그인이 필요합니다.");
            addRoot.mutate(t);
          }}
        />
        <div style={{ marginTop: 16 }}>
          {(roots?.items || roots?.reviews || roots || []).map((root: any) => (
            <RootCommentView
              key={root.id}
              reviewId={review._id}
              user={user}
              root={root}
              expanded={!!expanded[root.id]}
              onToggle={() => toggleExpanded(root.id)}
              onReply={(text) => {
                if (!user) return alert("로그인이 필요합니다.");
                addReply.mutate({ rootId: root.id, text });
              }}
              onEdit={(id, text) => editComment.mutate({ id, text })}
              onDelete={(id) => {
                if (window.confirm("정말로 삭제하시겠습니까?"))
                  deleteCommentMut.mutate(id);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const RootCommentView: React.FC<{
  reviewId: string;
  user: User;
  root: any;
  expanded: boolean;
  onToggle: () => void;
  onReply: (text: string) => void;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}> = ({
  reviewId,
  user,
  root,
  expanded,
  onToggle,
  onReply,
  onEdit,
  onDelete,
}) => {
  const [editing, setEditing] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);

  const { data: replies } = useQuery({
    enabled: expanded,
    queryKey: ["review", reviewId, "comments", root.id],
    queryFn: () => fetchReviewReplies(reviewId, root.id, 1, 50, "recent"),
  });

  const likeCommentMut = useMutation({
    mutationFn: () => reactReviewComment(reviewId, root.id),
  });

  return (
    <div className="commentItem">
      <div className="commentHeader">
        <div className="commentAvatar">
          {String(root.userId).charAt(0).toUpperCase()}
        </div>
        <div className="commentUser">{root.userId}</div>
        <div className="commentDate">
          {new Date(root.createdAt).toLocaleString("ko-KR")}
        </div>
        <button
          className="commentLike"
          onClick={() =>
            user ? likeCommentMut.mutate() : alert("로그인이 필요합니다.")
          }
        >
          ★ {root.likesBy?.length || 0}
        </button>
      </div>

      {!editing ? (
        <div className="commentContent">{root.content}</div>
      ) : (
        <CommentBox
          initial={root.content}
          onSubmit={(t) => {
            onEdit(root.id, t);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      )}

      <div className="commentBtns">
        <button onClick={() => setReplyOpen((v) => !v)}>답글</button>
        <button onClick={onToggle}>
          {expanded ? "답글 숨기기" : `답글 ${root.repliesCount || 0}개 보기`}
        </button>
        <button onClick={() => setEditing(true)}>수정</button>
        <button onClick={() => onDelete(root.id)}>삭제</button>
      </div>

      {replyOpen && (
        <CommentBox
          placeholder="답글을 입력하세요"
          onSubmit={(t) => {
            onReply(t);
            setReplyOpen(false);
          }}
          onCancel={() => setReplyOpen(false)}
        />
      )}

      {expanded && (
        <div className="repliesContainer">
          {(replies?.items || []).map((rep: any) => (
            <ChildCommentView
              key={rep.id}
              reviewId={reviewId}
              user={user}
              c={rep}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ChildCommentView: React.FC<{
  reviewId: string;
  user: User;
  c: any;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}> = ({ reviewId, user, c, onEdit, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const likeCommentMut = useMutation({
    mutationFn: () => reactReviewComment(reviewId, c.id),
  });

  return (
    <div className="replyItem">
      <div className="commentHeader">
        <div className="replyAvatar">
          {String(c.userId).charAt(0).toUpperCase()}
        </div>
        <div className="commentUser">{c.userId}</div>
        <div className="commentDate">
          {new Date(c.createdAt).toLocaleString("ko-KR")}
        </div>
        <button
          className="commentLike"
          onClick={() =>
            user ? likeCommentMut.mutate() : alert("로그인이 필요합니다.")
          }
        >
          ★ {c.likesBy?.length || 0}
        </button>
      </div>

      {!editing ? (
        <div className="commentContent">{c.content}</div>
      ) : (
        <CommentBox
          initial={c.content}
          onSubmit={(t) => {
            onEdit(c.id, t);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      )}

      <div className="commentBtns">
        <button onClick={() => setEditing(true)}>수정</button>
        <button
          onClick={() => {
            if (window.confirm("정말로 삭제하시겠습니까?")) onDelete(c.id);
          }}
        >
          삭제
        </button>
      </div>
    </div>
  );
};

const CreateReviewBox: React.FC<{
  movieId: number;
  onCreated: () => void;
  user: User;
}> = ({ movieId, onCreated, user }) => {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const qc = useQueryClient();

  const mut = useMutation({
    mutationFn: () => createReview({ movieId, rating, content }),
    onSuccess: (created) => {
      setContent("");
      qc.setQueryData(["movie", movieId, "reviews"], (prev: any) => {
        if (!prev) return prev;
        if (Array.isArray(prev)) return [created, ...prev];
        if (Array.isArray(prev.reviews)) {
          const total = (prev.total || prev.reviews.length) + 1;
          return {
            ...prev,
            reviews: [created, ...prev.reviews],
            total,
            totalPages: Math.max(1, Math.ceil(total / (prev.limit || 10))),
          };
        }
        if (Array.isArray(prev.items)) {
          const total = (prev.total || prev.items.length) + 1;
          return {
            ...prev,
            items: [created, ...prev.items],
            total,
            totalPages: Math.max(1, Math.ceil(total / (prev.limit || 10))),
          };
        }
        return prev;
      });
      qc.invalidateQueries({ queryKey: ["movie", movieId, "reviewStats"] });
      onCreated();
    },
  });

  return (
    <div className="createReviewBox">
      <div className="ratingInput">
        <label>평점</label>
        <input
          type="number"
          min={1}
          max={5}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        />
        <AiFillStar size={20} color="#4a5fc1" />
      </div>
      <textarea
        className="reviewTextarea"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="리뷰를 작성하세요"
        rows={4}
      />
      <button
        className="submitButton"
        onClick={() => {
          if (!user) return alert("로그인이 필요합니다.");
          if (!content.trim()) return;
          mut.mutate();
        }}
      >
        리뷰 등록
      </button>
    </div>
  );
};

const ReviewsSection: React.FC<{
  movieId: number;
  user: User;
  focusReviewId?: string;
}> = ({ movieId, user, focusReviewId }) => {
  const qc = useQueryClient();
  const { data: stats } = useQuery({
    queryKey: ["movie", movieId, "reviewStats"],
    queryFn: () => fetchMovieReviewStats(movieId),
  });

  const { data: list } = useQuery({
    queryKey: ["movie", movieId, "reviews"],
    queryFn: () => fetchReviewsByMovie(movieId, 1, 10, { sort: "recent" }),
  });

  const items = useMemo(
    () => list?.reviews || list?.items || list || [],
    [list]
  );

  return (
    <div className="reviewsSection">
      <h3>리뷰</h3>

      <div className="reviewStats">
        <div className="statItem">
          <AiFillStar size={20} color="#4a5fc1" />
          <span>
            평균 <strong>{stats?.averageRating?.toFixed(1) || 0}</strong>
          </span>
        </div>
        <div className="statItem">
          <span>
            리뷰 <strong>{stats?.totalReviews || 0}</strong>개
          </span>
        </div>
      </div>

      <CreateReviewBox
        movieId={movieId}
        user={user}
        onCreated={() => {
          qc.invalidateQueries({ queryKey: ["movie", movieId, "reviews"] });
          qc.invalidateQueries({ queryKey: ["movie", movieId, "reviewStats"] });
        }}
      />

      <div>
        {items.map((rv: any) => (
          <ReviewItem
            key={rv._id}
            review={rv}
            user={user}
            focus={focusReviewId === rv._id}
          />
        ))}
      </div>
    </div>
  );
};

export default ReviewsSection;
