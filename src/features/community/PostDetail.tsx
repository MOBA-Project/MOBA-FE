import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AiFillStar, AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { BiArrowBack } from "react-icons/bi";
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

  if (loading) {
    return (
      <div className="postDetailContainer">
        <div className="loadingBox">
          <div className="spinner" />
          <p>불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="postDetailContainer">
        <div className="errorBox">
          <p>{error || "게시글이 없습니다."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="postDetailContainer">
      <div className="postDetailContent">
        <button className="backButton" onClick={() => navigate(-1)}>
          <BiArrowBack size={20} />
          <span>목록으로</span>
        </button>

        <div className="postCard">
          <div className="postHeader">
            {post.moviePoster && (
              <img
                src={`https://image.tmdb.org/t/p/w185${post.moviePoster}`}
                alt={post.movieTitle}
                className="moviePoster"
              />
            )}
            <div className="postHeaderInfo">
              <h1>{post.title}</h1>
              <div className="movieInfo">
                <span className="movieTitle">🎬 {post.movieTitle}</span>
                <span className="rating">
                  <AiFillStar size={16} />
                  {post.rating}
                </span>
              </div>
              <div className="postMeta">
                <span className="metaItem">{post.likes ?? 0} 좋아요</span>
                <span className="metaDivider">·</span>
                <span className="metaItem">{post.commentCount ?? 0} 댓글</span>
              </div>
              <button className="likeButton" onClick={onLike}>
                {post.likes > 0 ? (
                  <AiFillHeart size={20} color="#ff6b6b" />
                ) : (
                  <AiOutlineHeart size={20} />
                )}
                <span>좋아요</span>
              </button>
            </div>
          </div>

          <div className="postContent">{post.content}</div>
        </div>

        <div className="commentsSection">
          <h3>댓글 {comments.length}개</h3>

          <div className="commentInput">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="댓글을 입력하세요"
              rows={3}
            />
            <button disabled={submitting} onClick={onComment}>
              등록
            </button>
          </div>

          <div className="commentsList">
            {comments.length === 0 ? (
              <div className="emptyComments">첫 댓글을 남겨보세요! 💬</div>
            ) : (
              comments.map((c) => {
                const name =
                  typeof c?.author?.nickname === "string"
                    ? c.author.nickname
                    : typeof c?.userId === "object"
                    ? c.userId.nickname || c.userId.id || c.userId._id
                    : String(c.userId ?? "익명");
                return (
                  <div key={c._id} className="commentItem">
                    <div className="commentAvatar">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="commentBody">
                      <div className="commentAuthor">{name}</div>
                      <div className="commentText">{c.content}</div>

                      {Array.isArray(c.replies) && c.replies.length > 0 && (
                        <div className="repliesList">
                          {c.replies.map((r: any) => {
                            const rname =
                              typeof r?.author?.nickname === "string"
                                ? r.author.nickname
                                : typeof r?.userId === "object"
                                ? r.userId.nickname ||
                                  r.userId.id ||
                                  r.userId._id
                                : String(r.userId ?? "익명");
                            return (
                              <div key={r._id} className="replyItem">
                                <div className="replyAvatar">
                                  {rname.charAt(0).toUpperCase()}
                                </div>
                                <div className="replyBody">
                                  <div className="replyAuthor">{rname}</div>
                                  <div className="replyText">{r.content}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
