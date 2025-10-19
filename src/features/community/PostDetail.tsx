import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addComment, getPost, listComments, toggleLike } from "./api";
import "./PostDetail.css";

const PostDetail: React.FC = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function run() {
      try {
        const p = await getPost(postId as string);
        if (!mounted) return;
        setPost(p);
        const list = await listComments(postId as string);
        if (!mounted) return;
        setComments(list);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "게시글을 불러오지 못했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (postId) run();
    return () => {
      mounted = false;
    };
  }, [postId]);

  const onLike = async () => {
    if (!post) return;
    try {
      const p = await toggleLike(post._id);
      setPost(p);
    } catch {}
  };

  const onComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await addComment({
        postId: postId as string,
        content: commentText.trim(),
      });
      setCommentText("");
      const list = await listComments(postId as string);
      setComments(list);
    } catch (e: any) {
      alert(e?.message || "댓글 작성 실패");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loadingState">불러오는 중…</div>;
  if (error || !post)
    return <div className="errorState">{error || "게시글이 없습니다."}</div>;

  return (
    <div className="postDetailContainer">
      <div className="postDetailContent">
        <button className="backButton" onClick={() => navigate(-1)}>
          ← 목록으로
        </button>

        <div className="postHeader">
          {post.moviePoster ? (
            <img
              src={`https://image.tmdb.org/t/p/w185${post.moviePoster}`}
              alt={post.movieTitle}
              className="postMoviePoster"
            />
          ) : (
            <div className="postPosterPlaceholder">🎬</div>
          )}
          <div className="postHeaderInfo">
            <h2 className="postTitle">{post.title}</h2>
            <div className="postMovieInfo">
              영화: {post.movieTitle}
              <span className="postRating">⭐ {post.rating}</span>
            </div>
            <div className="postStats">
              <span>❤ {post.likes ?? 0}</span>
              <span>💬 {post.commentCount ?? 0}</span>
            </div>
            <div className="postActions">
              <button className="likeButton" onClick={onLike}>
                ❤ 좋아요
              </button>
            </div>
          </div>
        </div>

        <div className="postContent">{post.content}</div>

        <div className="postDivider" />

        <div className="commentsSection">
          <h3 className="commentsTitle">댓글 {comments.length}</h3>
          <div className="commentInput">
            <input
              className="commentInputField"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="댓글을 입력하세요"
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onComment();
                }
              }}
            />
            <button
              className="commentSubmitButton"
              disabled={submitting}
              onClick={onComment}
            >
              등록
            </button>
          </div>

          <div className="commentsList">
            {comments.map((c) => {
              const name =
                typeof c?.author?.nickname === "string"
                  ? c.author.nickname
                  : typeof c?.userId === "object"
                  ? c.userId.nickname || c.userId.id || c.userId._id
                  : String(c.userId ?? "익명");
              return (
                <div key={c._id} className="commentItem">
                  <div className="commentAuthor">{name}</div>
                  <div className="commentContent">{c.content}</div>
                  {Array.isArray(c.replies) && c.replies.length > 0 && (
                    <div className="commentReplies">
                      {c.replies.map((r: any) => {
                        const rname =
                          typeof r?.author?.nickname === "string"
                            ? r.author.nickname
                            : typeof r?.userId === "object"
                            ? r.userId.nickname || r.userId.id || r.userId._id
                            : String(r.userId ?? "익명");
                        return (
                          <div key={r._id} className="replyItem">
                            <div className="replyAuthor">{rname}</div>
                            <div className="replyContent">{r.content}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            {comments.length === 0 && (
              <div className="emptyComments">첫 댓글을 남겨보세요 💭</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
